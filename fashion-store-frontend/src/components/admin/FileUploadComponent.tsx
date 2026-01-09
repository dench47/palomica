import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import Swal from 'sweetalert2';

interface FileUploadProps {
    folder: string;
    onFilesSelected: (files: File[]) => void; // Изменил на onFilesSelected
    multiple?: boolean;
    maxFiles?: number;
}

const FileUploadComponent: React.FC<FileUploadProps> = ({
                                                            folder,
                                                            onFilesSelected,
                                                            multiple = true,
                                                            maxFiles = 10
                                                        }) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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

        const newFiles = [...selectedFiles, ...validFiles];
        setSelectedFiles(newFiles);
        onFilesSelected(newFiles); // Передаём файлы родителю
    };

    const handleRemoveSelectedFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        onFilesSelected(newFiles); // Обновляем в родителе
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="file-upload-component">
            {/* Скрытый input */}
            <input
                ref={fileInputRef}
                type="file"
                className="d-none"
                onChange={handleFileSelect}
                accept="image/*"
                multiple={multiple}
                id={`file-upload-${folder}`}
            />

            {/* Кнопка для выбора файлов */}
            <label
                htmlFor={`file-upload-${folder}`}
                className="btn btn-outline-dark rounded-0 w-100"
            >
                <div className="d-flex align-items-center justify-content-center">
                    <Upload size={18} className="me-2" />
                    <span>Выбрать файлы</span>
                </div>
            </label>

            {/* Список выбранных файлов */}
            {selectedFiles.length > 0 && (
                <div className="mt-3">
                    <div className="list-group">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="list-group-item d-flex justify-content-between align-items-center py-2">
                                <div>
                                    <small>{file.name}</small>
                                    <small className="text-muted ms-2">
                                        ({formatFileSize(file.size)})
                                    </small>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleRemoveSelectedFile(index)}
                                    title="Убрать из списка"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUploadComponent;