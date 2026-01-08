import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import FileUploadComponent from '../components/admin/FileUploadComponent';
import Swal from 'sweetalert2';
import { s3Service } from '../services/api';


interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    subcategory?: string;
    availableQuantity: number;
    reservedQuantity: number;
    color?: string;
    size?: string;
    material?: string;
    careInstructions?: string;
    additionalImages?: string[];
}

const AdminProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('admin_token');

            const response = await fetch('/api/admin/products', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_logged_in');
                    window.location.href = '/admin/login';
                    return;
                }
                throw new Error('Ошибка загрузки');
            }

            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

// Обновляем handleDelete
    const handleDelete = async (id: number) => {
        try {
            const product = products.find(p => p.id === id);

            const result = await Swal.fire({
                title: 'Удаление товара',
                html: `Вы уверены, что хотите удалить товар "<strong>${product?.name}</strong>"?<br>
                  <small class="text-muted">Все фотографии товара также будут удалены из хранилища</small>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Да, удалить',
                cancelButtonText: 'Отмена',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d'
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem('admin_token');
                const response = await fetch(`/api/admin/products/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    setProducts(products.filter(p => p.id !== id));

                    await Swal.fire({
                        title: 'Удалено!',
                        html: `Товар успешно удален<br>
                          <small class="text-muted">Удалено фотографий: ${data.imagesDeleted || 0}</small>`,
                        icon: 'success',
                        confirmButtonColor: '#28a745',
                        timer: 2000
                    });
                } else {
                    throw new Error(data.message || 'Ошибка удаления');
                }
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            await Swal.fire({
                title: 'Ошибка!',
                text: 'Не удалось удалить товар',
                icon: 'error'
            });
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <div className="spinner-border text-dark" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-light mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Управление товарами
                    </h2>
                    <p className="text-muted small mb-0">
                        Всего товаров: {products.length}
                    </p>
                </div>

                <button
                    className="btn btn-dark rounded-0 d-flex align-items-center"
                    onClick={() => setShowModal(true)}
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '0.9rem',
                        letterSpacing: '0.05em'
                    }}
                >
                    <Plus size={18} className="me-2" />
                    ДОБАВИТЬ ТОВАР
                </button>
            </div>

            <div className="card rounded-0 border-1 mb-4">
                <div className="card-body">
                    <div className="row align-items-center">
                        <div className="col-md-6 mb-3 mb-md-0">
                            <div className="input-group">
                                <span className="input-group-text bg-transparent border-end-0 rounded-0">
                                    <Search size={18} />
                                </span>
                                <input
                                    type="text"
                                    className="form-control rounded-0 border-start-0"
                                    placeholder="Поиск по названию, описанию, категории..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-dark rounded-0 d-flex align-items-center">
                                    <Filter size={16} className="me-2" />
                                    Фильтры
                                </button>
                                <button
                                    className="btn btn-outline-dark rounded-0"
                                    onClick={fetchProducts}
                                >
                                    Обновить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card rounded-0 border-1">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead>
                        <tr>
                            <th className="border-0 small text-muted fw-normal" style={{ width: '50px' }}>ID</th>
                            <th className="border-0 small text-muted fw-normal">Товар</th>
                            <th className="border-0 small text-muted fw-normal">Категория</th>
                            <th className="border-0 small text-muted fw-normal text-end">Цена</th>
                            <th className="border-0 small text-muted fw-normal text-center">Наличие</th>
                            <th className="border-0 small text-muted fw-normal text-end">Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="align-middle">
                                <td className="small text-muted">#{product.id}</td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <div
                                            className="me-3 flex-shrink-0"
                                            style={{
                                                width: '50px',
                                                height: '50px',
                                                backgroundImage: `url(${product.imageUrl})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                backgroundColor: '#f8f9fa'
                                            }}
                                        ></div>
                                        <div>
                                            <div className="fw-medium" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                                {product.name}
                                            </div>
                                            <div className="small text-muted">
                                                {product.description.substring(0, 50)}...
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                            <span className="badge bg-light text-dark rounded-0 me-1">
                                                {product.category}
                                            </span>
                                        {product.subcategory && (
                                            <span className="badge bg-light text-dark rounded-0">
                                                    {product.subcategory}
                                                </span>
                                        )}
                                    </div>
                                </td>
                                <td className="text-end">
                                    {formatPrice(product.price)}
                                </td>
                                <td className="text-center">
                                    <div>
                                            <span className={`badge rounded-0 ${product.availableQuantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                {product.availableQuantity} шт.
                                            </span>
                                        {product.reservedQuantity > 0 && (
                                            <div className="small text-muted mt-1">
                                                Резерв: {product.reservedQuantity}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="text-end">
                                    <div className="d-flex justify-content-end gap-2">
                                        <button
                                            className="btn btn-outline-dark btn-sm rounded-0"
                                            onClick={() => {
                                                setEditingProduct(product);
                                                setShowModal(true);
                                            }}
                                            title="Редактировать"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            className="btn btn-outline-danger btn-sm rounded-0"
                                            onClick={() => handleDelete(product.id)}
                                            title="Удалить"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-5">
                            <div className="mb-3" style={{ fontSize: '2rem', opacity: 0.1 }}>📦</div>
                            <p className="text-muted">Товары не найдены</p>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <ProductModal
                    product={editingProduct}
                    onClose={() => {
                        setShowModal(false);
                        setEditingProduct(null);
                    }}
                    onSave={() => {
                        fetchProducts();
                        setShowModal(false);
                        setEditingProduct(null);
                    }}
                />
            )}
        </div>
    );
};

interface ProductModalProps {
    product: Product | null;
    onClose: () => void;
    onSave: () => void;
}

const ProductModal = ({ product, onClose, onSave }: ProductModalProps) => {
    const isEditing = !!product;
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || 0,
        imageUrl: product?.imageUrl || '',
        category: product?.category || 'одежда',
        subcategory: product?.subcategory || '',
        availableQuantity: product?.availableQuantity || 0,
        reservedQuantity: product?.reservedQuantity || 0,
        color: product?.color || '',
        size: product?.size || '',
        material: product?.material || '',
        careInstructions: product?.careInstructions || ''
    });
    const [saving, setSaving] = useState(false);

    // Все текущие изображения товара
    const [allImages, setAllImages] = useState<string[]>(() => {
        if (product) {
            const images = [product.imageUrl];
            if (product.additionalImages && product.additionalImages.length > 0) {
                images.push(...product.additionalImages);
            }
            return images;
        }
        return [];
    });

    // Временные фото (загружены в текущей сессии)
    const [tempImages, setTempImages] = useState<string[]>([]);

    // Фото для удаления (только при редактировании существующего товара)
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Основное изображение
            const mainImage = allImages.length > 0 ? allImages[0] : '';
            const additional = allImages.length > 1 ? allImages.slice(1) : [];

            const submitData = {
                ...formData,
                imageUrl: mainImage,
                additionalImages: additional,
                availableQuantity: formData.availableQuantity || 0,
                price: formData.price || 0,
                reservedQuantity: formData.reservedQuantity || 0,
                deletedImages: isEditing ? imagesToDelete : [] // Только при редактировании
            };

            const token = localStorage.getItem('admin_token');
            const url = isEditing
                ? `/api/admin/products/${product.id}`
                : '/api/admin/products';

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submitData),
            });

            if (response.status === 403) {
                await Swal.fire({
                    title: 'Доступ запрещен',
                    text: 'Токен недействителен. Попробуйте войти заново.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_logged_in');
                window.location.href = '/admin/login';
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            // Успешное сохранение
            await Swal.fire({
                title: 'Успешно!',
                text: 'Товар сохранен',
                icon: 'success',
                confirmButtonText: 'OK',
                timer: 2000,
                timerProgressBar: true
            });

            onSave();
            onClose();

        } catch (error) {
            console.error('Error saving product:', error);
            await Swal.fire({
                title: 'Ошибка сохранения',
                text: error instanceof Error ? error.message : 'Неизвестная ошибка',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: string, value: string | number) => {
        if (['price', 'availableQuantity', 'reservedQuantity'].includes(field)) {
            if (typeof value === 'string') {
                value = value === '' ? 0 : parseFloat(value);
                if (isNaN(value)) value = 0;
            }
        }

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Функция загрузки новых фото
    const handleFilesUploaded = (fileUrls: string[]) => {
        if (fileUrls.length > 0) {
            setAllImages(prev => [...prev, ...fileUrls]);
            setTempImages(prev => [...prev, ...fileUrls]);
        }
    };

    // Удалить фото - БЕЗ ДИАЛОГА
    const handleRemoveImage = (index: number) => {
        const imageToDelete = allImages[index];

        // Если это временное фото (только что загруженное)
        if (tempImages.includes(imageToDelete)) {
            // Удаляем из временных и сразу из S3
            setTempImages(prev => prev.filter(img => img !== imageToDelete));
            s3Service.deleteFile(imageToDelete).catch(err => {
                console.error('Failed to delete temp image:', err);
            });
        } else if (isEditing) {
            // Если редактируем существующий товар - добавляем в список для удаления
            setImagesToDelete(prev => [...prev, imageToDelete]);
        }

        // Убираем фото из массива
        setAllImages(prev => prev.filter((_, i) => i !== index));
    };

    // Сделать фото основным
    const handleMakeMainImage = (index: number) => {
        if (index === 0) return;

        const newImages = [...allImages];
        const [imageToMove] = newImages.splice(index, 1);
        newImages.unshift(imageToMove);
        setAllImages(newImages);
    };

    // Обработка закрытия модального окна
    const handleClose = () => {
        // Если есть незакрепленные временные фото - удаляем их из S3 молча
        if (tempImages.length > 0) {
            tempImages.forEach(imgUrl => {
                s3Service.deleteFile(imgUrl).catch(err => {
                    console.error('Failed to delete temp image on cancel:', err);
                });
            });
        }
        onClose();
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content rounded-0 border-1">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {isEditing ? 'Редактировать товар' : 'Добавить товар'}
                        </h5>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label small text-muted">Название *</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-0"
                                            value={formData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label small text-muted">Описание</label>
                                        <textarea
                                            className="form-control rounded-0"
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label small text-muted">Цена (₽) *</label>
                                        <input
                                            type="number"
                                            className="form-control rounded-0"
                                            value={formData.price}
                                            onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>

                                    {/* Секция фотографий */}
                                    <div className="mb-3">
                                        <label className="form-label small text-muted">
                                            Фотографии товара
                                        </label>

                                        <FileUploadComponent
                                            folder="products"
                                            onFilesUploaded={handleFilesUploaded}
                                            multiple={true}
                                            maxFiles={10}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="form-label small text-muted">Категория *</label>
                                            <select
                                                className="form-select rounded-0"
                                                value={formData.category}
                                                onChange={(e) => handleChange('category', e.target.value)}
                                                required
                                            >
                                                <option value="одежда">Одежда</option>
                                                <option value="сумки">Сумки</option>
                                                <option value="аксессуары">Аксессуары</option>
                                                <option value="обувь">Обувь</option>
                                            </select>
                                        </div>

                                        <div className="col-6 mb-3">
                                            <label className="form-label small text-muted">Подкатегория</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-0"
                                                value={formData.subcategory}
                                                onChange={(e) => handleChange('subcategory', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="form-label small text-muted">Цвет</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-0"
                                                value={formData.color}
                                                onChange={(e) => handleChange('color', e.target.value)}
                                            />
                                        </div>

                                        <div className="col-6 mb-3">
                                            <label className="form-label small text-muted">Размер</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-0"
                                                value={formData.size}
                                                onChange={(e) => handleChange('size', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label small text-muted">Материал</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-0"
                                            value={formData.material}
                                            onChange={(e) => handleChange('material', e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label small text-muted">Количество на складе *</label>
                                        <input
                                            type="number"
                                            className="form-control rounded-0"
                                            value={formData.availableQuantity || 0}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '') {
                                                    handleChange('availableQuantity', 0);
                                                } else {
                                                    const numValue = parseInt(value);
                                                    if (!isNaN(numValue)) {
                                                        handleChange('availableQuantity', numValue);
                                                    }
                                                }
                                            }}
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Галерея фотографий - ПРОСТАЯ ВЕРСИЯ */}
                            {allImages.length > 0 && (
                                <div className="mt-4 pt-3 border-top">
                                    <h6 className="mb-3">
                                        Фотографии товара ({allImages.length})
                                    </h6>
                                    <div className="row g-3">
                                        {allImages.map((img, index) => (
                                            <div key={index} className="col-4 col-md-3">
                                                <div className="card border position-relative">
                                                    <img
                                                        src={img}
                                                        alt={`Фото ${index + 1}`}
                                                        className="card-img-top"
                                                        style={{
                                                            height: '150px',
                                                            objectFit: 'cover'
                                                        }}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                                                        }}
                                                    />
                                                    <div className="card-body p-2">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <small className="badge bg-secondary">
                                                                {index === 0 ? 'Основное' : `Фото ${index + 1}`}
                                                            </small>
                                                            <div className="btn-group btn-group-sm">
                                                                {index !== 0 && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-secondary btn-sm"
                                                                        onClick={() => handleMakeMainImage(index)}
                                                                        title="Сделать основным"
                                                                    >
                                                                        ☆
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger btn-sm"
                                                                    onClick={() => handleRemoveImage(index)}
                                                                    title="Удалить"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-muted small">
                                        <div>• Первое фото - основное изображение товара</div>
                                        <div>• Используйте ☆ чтобы сделать фото основным</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer border-0">
                            <button
                                type="button"
                                className="btn btn-outline-dark rounded-0"
                                onClick={handleClose}
                                disabled={saving}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="btn btn-dark rounded-0"
                                disabled={saving || allImages.length === 0}
                                title={allImages.length === 0 ? "Добавьте хотя бы одно фото" : ""}
                            >
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Сохранение...
                                    </>
                                ) : (
                                    isEditing ? 'Сохранить' : 'Создать'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminProductsPage;