import React, { useState, useRef } from 'react';
import Swal from 'sweetalert2';

interface FileUploadProps {
    folder: string;
    onFilesUploaded: (fileUrls: string[]) => void;
    multiple?: boolean;
    maxFiles?: number;
}

interface UploadedFile {
    originalName: string;
    url: string;
    size: number;
}

const FileUploadComponent: React.FC<FileUploadProps> = ({
                                                            folder,
                                                            onFilesUploaded,
                                                            multiple = true,
                                                            maxFiles = 10
                                                        }) => {
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const fileArray = Array.from(files);

        // Проверка максимального количества файлов
        if (selectedFiles.length + fileArray.length > maxFiles) {
            Swal.fire({
                icon: 'warning',
                title: 'Слишком много файлов',
                text: `Максимальное количество файлов: ${maxFiles}`
            });
            return;
        }

        // Проверка размера файлов
        const maxSize = 10 * 1024 * 1024; // 10MB
        const validFiles = fileArray.filter(file => {
            if (file.size > maxSize) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Файл слишком большой',
                    text: `Файл "${file.name}" превышает 10MB`
                });
                return false;
            }
            return true;
        });

        setSelectedFiles(prev => [...prev, ...validFiles]);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Нет файлов для загрузки'
            });
            return;
        }

        setUploading(true);
        const formData = new FormData();

        // Добавляем файлы
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        // Добавляем папку
        formData.append('folder', folder);

        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch('/api/admin/s3/files/upload-multiple', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const newUploadedFiles: UploadedFile[] = data.uploadedFiles;
                const urls = newUploadedFiles.map(file => file.url);

                // Добавляем к уже загруженным
                setUploadedFiles(prev => [...prev, ...newUploadedFiles]);

                // Передаем URLs родительскому компоненту
                onFilesUploaded(urls);

                // Оповещение об успехе
                Swal.fire({
                    icon: 'success',
                    title: 'Файлы загружены',
                    text: `Успешно загружено ${newUploadedFiles.length} файлов`
                });

                // Очищаем выбранные файлы
                setSelectedFiles([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }

                // Если были ошибки
                if (data.errors && data.errors.length > 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Некоторые файлы не загружены',
                        html: data.errors.join('<br>')
                    });
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка загрузки',
                    text: data.message || 'Не удалось загрузить файлы'
                });
            }
        } catch (error) {
            console.error('Upload error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Ошибка',
                text: 'Не удалось загрузить файлы'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveSelectedFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveUploadedFile = async (fileUrl: string, index: number) => {
        try {
            const result = await Swal.fire({
                title: 'Удаление файла',
                text: 'Вы уверены, что хотите удалить этот файл?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Удалить',
                cancelButtonText: 'Отмена'
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem('admin_token');
                const response = await fetch(`/api/admin/s3/files/delete?url=${encodeURIComponent(fileUrl)}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                if (response.ok) {
                    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                    Swal.fire({
                        icon: 'success',
                        title: 'Файл удален'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Ошибка',
                        text: 'Не удалось удалить файл'
                    });
                }
            }
        } catch (error) {
            console.error('Delete error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Ошибка',
                text: 'Не удалось удалить файл'
            });
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="file-upload-component">
            {/* Поле выбора файлов */}
            <div className="mb-3">
                <label className="form-label">Загрузка фотографий в папку: <strong>{folder}</strong></label>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="form-control rounded-0"
                    onChange={handleFileSelect}
                    accept="image/*"
                    multiple={multiple}
                    disabled={uploading}
                />
                <div className="form-text">
                    Поддерживаемые форматы: JPG, JPEG, PNG, GIF, WebP. Максимальный размер: 10MB
                </div>
            </div>

            {/* Выбранные файлы */}
            {selectedFiles.length > 0 && (
                <div className="mb-3">
                    <h6>Файлы для загрузки ({selectedFiles.length}):</h6>
                    <div className="list-group">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <span className="badge bg-secondary me-2">{index + 1}</span>
                                    {file.name}
                                    <span className="text-muted ms-2">
                                        ({formatFileSize(file.size)})
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleRemoveSelectedFile(index)}
                                    disabled={uploading}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Кнопка загрузки */}
            <button
                type="button"
                className="btn btn-dark rounded-0 mb-3"
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0}
            >
                {uploading ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Загрузка...
                    </>
                ) : (
                    `Загрузить ${selectedFiles.length} файл(ов)`
                )}
            </button>

            {/* Загруженные файлы */}
            {uploadedFiles.length > 0 && (
                <div className="mt-4">
                    <h6>Загруженные файлы ({uploadedFiles.length}):</h6>
                    <div className="row">
                        {uploadedFiles.map((file, index) => (
                            <div key={index} className="col-md-3 mb-3">
                                <div className="card">
                                    <img
                                        src={file.url}
                                        alt={file.originalName}
                                        className="card-img-top"
                                        style={{ height: '150px', objectFit: 'cover' }}
                                    />
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <small className="text-muted">
                                                {formatFileSize(file.size)}
                                            </small>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleRemoveUploadedFile(file.url, index)}
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUploadComponent;