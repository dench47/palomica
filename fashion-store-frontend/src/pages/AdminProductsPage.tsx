import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import FileUploadComponent from '../components/admin/FileUploadComponent';
import Swal from 'sweetalert2';


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

    const handleDelete = async (id: number) => {
        try {
            const productName = products.find(p => p.id === id)?.name || 'этот товар';

            const result = await Swal.fire({
                title: 'Удаление товара',
                html: `Вы уверены, что хотите удалить товар "<strong>${productName}</strong>"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Да, удалить',
                cancelButtonText: 'Отмена',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                reverseButtons: true,
                customClass: {
                    confirmButton: 'btn btn-danger',
                    cancelButton: 'btn btn-secondary'
                },
                buttonsStyling: false
            });

            if (result.isConfirmed) {
                const token = localStorage.getItem('admin_token');
                const response = await fetch(`/api/admin/products/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    setProducts(products.filter(p => p.id !== id));

                    await Swal.fire({
                        title: 'Удалено!',
                        text: 'Товар успешно удален',
                        icon: 'success',
                        confirmButtonColor: '#28a745',
                        timer: 2000,
                        timerProgressBar: true
                    });
                } else {
                    if (response.status === 403) {
                        await Swal.fire({
                            title: 'Ошибка доступа',
                            text: 'Недостаточно прав для удаления товара',
                            icon: 'error',
                            confirmButtonColor: '#dc3545'
                        });
                    } else {
                        throw new Error('Ошибка удаления');
                    }
                }
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            await Swal.fire({
                title: 'Ошибка!',
                text: 'Не удалось удалить товар',
                icon: 'error',
                confirmButtonColor: '#dc3545'
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
        careInstructions: product?.careInstructions || '',
        additionalImages: product?.additionalImages || []
    });
    const [saving, setSaving] = useState(false);
    const [additionalImages, setAdditionalImages] = useState<string[]>(product?.additionalImages || []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const submitData = {
                ...formData,
                availableQuantity: formData.availableQuantity || 0,
                price: formData.price || 0,
                reservedQuantity: formData.reservedQuantity || 0,
                additionalImages: additionalImages
            };

            console.log('Submitting product data:', submitData);

            const token = localStorage.getItem('admin_token');
            console.log('Current token:', token ? token.substring(0, 20) + '...' : 'MISSING');

            const url = isEditing
                ? `/api/admin/products/${product.id}`
                : '/api/admin/products';

            const method = isEditing ? 'PUT' : 'POST';

            console.log('Making request to:', url, 'with method:', method);

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submitData),
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (response.status === 403) {
                console.error('Access forbidden - token might be invalid');
                alert('Доступ запрещен. Попробуйте войти заново.');
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

            const result = await response.json();
            console.log('Save successful:', result);

            alert('Товар успешно сохранен!');
            onSave();
            onClose();

        } catch (error) {
            console.error('Error saving product:', error);
            alert('Ошибка сохранения: ' + error);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: string, value: string | number | string[]) => {
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

    const handleFilesUploaded = (fileUrls: string[]) => {
        if (fileUrls.length > 0) {
            // Первое изображение - основное
            handleChange('imageUrl', fileUrls[0]);

            // Остальные - дополнительные (сохраняем с 1 индекса)
            if (fileUrls.length > 1) {
                const newAdditional = [...additionalImages, ...fileUrls.slice(1)];
                setAdditionalImages(newAdditional);
            }
        }
    };

    const handleRemoveAdditionalImage = (index: number) => {
        const newAdditional = [...additionalImages];
        newAdditional.splice(index, 1);
        setAdditionalImages(newAdditional);
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content rounded-0 border-1">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {isEditing ? 'Редактировать товар' : 'Добавить товар'}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
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

                                    <div className="mb-3">
                                        <label className="form-label small text-muted">Фотографии товара *</label>

                                        <input
                                            type="text"
                                            className="form-control rounded-0 mb-2"
                                            value={formData.imageUrl}
                                            onChange={(e) => handleChange('imageUrl', e.target.value)}
                                            placeholder="URL основного изображения или загрузите ниже"
                                            required
                                        />

                                        <FileUploadComponent
                                            folder="products"
                                            onFilesUploaded={handleFilesUploaded}
                                            multiple={true}
                                            maxFiles={10}
                                        />

                                        {formData.imageUrl && formData.imageUrl.startsWith('http') && (
                                            <div className="mt-2">
                                                <small className="text-muted">Основное изображение:</small>
                                                <div className="mt-1 position-relative d-inline-block">
                                                    <img
                                                        src={formData.imageUrl}
                                                        alt="Предпросмотр"
                                                        className="img-thumbnail"
                                                        style={{width: '100px', height: '100px', objectFit: 'cover'}}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
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

                                    {additionalImages.length > 0 && (
                                        <div className="mb-3">
                                            <label className="form-label small text-muted">Дополнительные изображения ({additionalImages.length})</label>
                                            <div className="d-flex flex-wrap gap-2">
                                                {additionalImages.map((img, index) => (
                                                    <div key={index} className="position-relative">
                                                        <img
                                                            src={img}
                                                            alt={`Дополнительное ${index + 1}`}
                                                            className="img-thumbnail"
                                                            style={{width: '60px', height: '60px', objectFit: 'cover'}}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger position-absolute top-0 end-0"
                                                            style={{padding: '0.1rem', fontSize: '0.7rem'}}
                                                            onClick={() => handleRemoveAdditionalImage(index)}
                                                            title="Удалить"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer border-0">
                            <button
                                type="button"
                                className="btn btn-outline-dark rounded-0"
                                onClick={onClose}
                                disabled={saving}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="btn btn-dark rounded-0"
                                disabled={saving}
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