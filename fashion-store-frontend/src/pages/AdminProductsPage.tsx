import {useState, useEffect} from 'react';
import {Plus, Edit, Trash2, Search, Filter, List} from 'lucide-react';
import FileUploadComponent from '../components/admin/FileUploadComponent';
import Swal from 'sweetalert2';
import CategoryManagerModal from '../components/admin/CategoryManagerModal';

interface S3UploadedFile {
    originalName: string;
    url: string;
    size: number;
}

interface S3UploadResponse {
    success: boolean;
    uploadedFiles: S3UploadedFile[];
    totalUploaded: number;
    totalFailed: number;
    errors: string[];
    message?: string;
}

interface Category {
    id: number;
    name: string;
    description?: string;
    displayOrder: number;
    isActive: boolean;
    subcategories?: Subcategory[];
}

interface Subcategory {
    id: number;
    name: string;
    categoryId: number;
    categoryName?: string;
    displayOrder: number;
    isActive: boolean;
}

// Обновленный интерфейс Product с вариантами
interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;        // Название для отображения
    subcategory?: string;    // Название для отображения
    categoryId: number;      // ID для формы
    subcategoryId?: number;  // ID для формы
    color?: string;
    material?: string;
    careInstructions?: string;
    additionalImages?: string[];
    variants: ProductVariant[]; // Варианты товара (размеры с количеством)
}

interface ProductVariant {
    id?: number;
    size: string;
    availableQuantity: number;
    reservedQuantity?: number;
}

const AdminProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [refreshCategoriesTrigger, setRefreshCategoriesTrigger] = useState(0);

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

    // Вычисляем общее количество товара по всем вариантам
    const getTotalAvailableQuantity = (variants: ProductVariant[]): number => {
        return variants.reduce((sum, variant) => sum + variant.availableQuantity, 0);
    };

    // Вычисляем общее зарезервированное количество
    const getTotalReservedQuantity = (variants: ProductVariant[]): number => {
        return variants.reduce((sum, variant) => sum + (variant.reservedQuantity || 0), 0);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{minHeight: '300px'}}>
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
                    <h2 className="fw-light mb-1" style={{fontFamily: "'Playfair Display', serif"}}>
                        Управление товарами
                    </h2>
                    <p className="text-muted small mb-0">
                        Всего товаров: {products.length}
                    </p>
                </div>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-dark rounded-0 d-flex align-items-center"
                        onClick={() => setShowCategoryManager(true)}
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '0.9rem',
                            letterSpacing: '0.05em'
                        }}
                    >
                        <List size={18} className="me-2"/>
                        КАТЕГОРИИ
                    </button>

                    <button
                        className="btn btn-dark rounded-0 d-flex align-items-center"
                        onClick={() => setShowModal(true)}
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '0.9rem',
                            letterSpacing: '0.05em'
                        }}
                    >
                        <Plus size={18} className="me-2"/>
                        ДОБАВИТЬ ТОВАР
                    </button>
                </div>
            </div>

            <div className="card rounded-0 border-1 mb-4">
                <div className="card-body">
                    <div className="row align-items-center">
                        <div className="col-md-6 mb-3 mb-md-0">
                            <div className="input-group">
                                <span className="input-group-text bg-transparent border-end-0 rounded-0">
                                    <Search size={18}/>
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
                                    <Filter size={16} className="me-2"/>
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
                            <th className="border-0 small text-muted fw-normal" style={{width: '50px'}}>ID</th>
                            <th className="border-0 small text-muted fw-normal">Товар</th>
                            <th className="border-0 small text-muted fw-normal">Категория</th>
                            <th className="border-0 small text-muted fw-normal text-end">Цена</th>
                            <th className="border-0 small text-muted fw-normal text-center">Наличие</th>
                            <th className="border-0 small text-muted fw-normal text-end">Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredProducts.map((product) => {
                            const totalAvailable = getTotalAvailableQuantity(product.variants);
                            const totalReserved = getTotalReservedQuantity(product.variants);
                            const variantsCount = product.variants.length;

                            return (
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
                                                <div className="fw-medium"
                                                     style={{fontFamily: "'Cormorant Garamond', serif"}}>
                                                    {product.name}
                                                </div>
                                                <div className="small text-muted">
                                                    {product.description.substring(0, 50)}...
                                                </div>
                                                <div className="small text-muted mt-1">
                                                    Вариантов: {variantsCount}
                                                    {product.variants.length > 0 && (
                                                        <span className="ms-2">
                                                        ({product.variants.map(v => v.size).join(', ')})
                                                    </span>
                                                    )}
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
                                            <span
                                                className={`badge rounded-0 ${totalAvailable > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                {totalAvailable} шт.
                                            </span>
                                            {totalReserved > 0 && (
                                                <div className="small text-muted mt-1">
                                                    Резерв: {totalReserved}
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
                                                <Edit size={14}/>
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm rounded-0"
                                                onClick={() => handleDelete(product.id)}
                                                title="Удалить"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-5">
                            <div className="mb-3" style={{fontSize: '2rem', opacity: 0.1}}>📦</div>
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
                    refreshCategoriesTrigger={refreshCategoriesTrigger}
                />
            )}

            {/* МОДАЛКА ДЛЯ УПРАВЛЕНИЯ КАТЕГОРИЯМИ */}
            {showCategoryManager && (
                <CategoryManagerModal
                    onClose={() => setShowCategoryManager(false)}
                    onSave={() => {
                        setRefreshCategoriesTrigger(prev => prev + 1);
                        setShowCategoryManager(false);
                        fetchProducts();
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
    refreshCategoriesTrigger: number;
}

const ProductModal = ({product, onClose, onSave, refreshCategoriesTrigger}: ProductModalProps) => {
    const isEditing = !!product;
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || 0,
        imageUrl: product?.imageUrl || '',
        categoryId: product?.categoryId || 0,
        subcategoryId: product?.subcategoryId || 0,
        color: product?.color || '',
        material: product?.material || '',
        careInstructions: product?.careInstructions || ''
    });

    // Варианты товара
    const [variants, setVariants] = useState<ProductVariant[]>(() => {
        if (product?.variants && product.variants.length > 0) {
            return product.variants;
        }
        // По умолчанию один вариант "ONE SIZE" с количеством 0
        return [{ size: 'ONE SIZE', availableQuantity: 0 }];
    });

    // Временное поле для добавления нового варианта
    const [newVariant, setNewVariant] = useState({
        size: '',
        availableQuantity: 0
    });

    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // ВСЕ изображения товара (старые + новые превью)
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

    // Временные файлы (выбраны, но ещё не загружены на S3)
    const [tempFiles, setTempFiles] = useState<File[]>([]);
    const [tempFilePreviews, setTempFilePreviews] = useState<string[]>([]);

    // Фото для удаления (только при редактировании существующего товара)
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

    // Загрузка категорий при монтировании и при изменении триггера
    useEffect(() => {
        fetchCategories();
    }, [refreshCategoriesTrigger]);

    // Загрузка подкатегорий при выборе категории
    useEffect(() => {
        if (formData.categoryId) {
            fetchSubcategories(formData.categoryId);
        } else {
            setSubcategories([]);
        }
    }, [formData.categoryId]);

    // Очистка превью при размонтировании
    useEffect(() => {
        return () => {
            tempFilePreviews.forEach(preview => {
                URL.revokeObjectURL(preview);
            });
        };
    }, [tempFilePreviews]);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const token = localStorage.getItem('admin_token');
            const response = await fetch('/api/admin/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCategories(data);

                if (product?.categoryId && !formData.categoryId) {
                    setFormData(prev => ({...prev, categoryId: product.categoryId}));
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchSubcategories = async (categoryId: number) => {
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch(`/api/admin/categories/${categoryId}/subcategories`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSubcategories(data);

                if (product?.subcategoryId && !formData.subcategoryId) {
                    setFormData(prev => ({...prev, subcategoryId: product.subcategoryId || 0}));
                }
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            setSubcategories([]);
        }
    };

    // Обработка выбора файлов
    const handleFilesSelected = (files: File[]) => {
        setTempFiles(files);

        // Создаем превью для новых файлов
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setTempFilePreviews(newPreviews);

        // Добавляем превью в общий список изображений (в конце)
        setAllImages(prev => [...prev, ...newPreviews]);
    };

    // Переместить фото влево/вправо
    const handleMoveImage = (index: number, direction: 'left' | 'right') => {
        if ((direction === 'left' && index === 0) ||
            (direction === 'right' && index === allImages.length - 1)) {
            return;
        }

        const newImages = [...allImages];
        const newIndex = direction === 'left' ? index - 1 : index + 1;
        [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
        setAllImages(newImages);
    };

    // Сделать фото основным
    const handleMakeMainImage = (index: number) => {
        if (index === 0) return;

        const newImages = [...allImages];
        const [imageToMove] = newImages.splice(index, 1);
        newImages.unshift(imageToMove);
        setAllImages(newImages);
    };

    // Удалить фото
    const handleRemoveImage = (index: number) => {
        const imageToDelete = allImages[index];

        // Проверяем, является ли это превью временного файла
        const tempFileIndex = tempFilePreviews.indexOf(imageToDelete);
        if (tempFileIndex !== -1) {
            // Это превью временного файла
            URL.revokeObjectURL(imageToDelete);

            const newTempFiles = [...tempFiles];
            const newTempPreviews = [...tempFilePreviews];

            newTempFiles.splice(tempFileIndex, 1);
            newTempPreviews.splice(tempFileIndex, 1);

            setTempFiles(newTempFiles);
            setTempFilePreviews(newTempPreviews);
        } else if (isEditing) {
            // Это существующее фото товара - добавляем в список для удаления
            setImagesToDelete(prev => [...prev, imageToDelete]);
        }

        // Убираем фото из массива
        setAllImages(prev => prev.filter((_, i) => i !== index));
    };

    // Загрузка файлов на S3
    const uploadFilesToS3 = async (files: File[]): Promise<string[]> => {
        if (files.length === 0) return [];

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        formData.append('folder', 'products');

        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch('/api/admin/s3/files/upload-multiple', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            const data: S3UploadResponse = await response.json();
            if (response.ok && data.success) {
                return data.uploadedFiles.map(file => file.url);
            } else {
                throw new Error(data.message || 'Ошибка загрузки файлов');
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            throw error;
        }
    };

    // Управление вариантами
    const handleAddVariant = () => {
        if (!newVariant.size.trim()) {
            Swal.fire({
                title: 'Ошибка',
                text: 'Введите размер варианта',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Проверяем, нет ли уже такого размера
        if (variants.some(v => v.size.toLowerCase() === newVariant.size.toLowerCase())) {
            Swal.fire({
                title: 'Ошибка',
                text: 'Вариант с таким размером уже существует',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        setVariants(prev => [...prev, { ...newVariant }]);
        setNewVariant({ size: '', availableQuantity: 0 });
    };

    const handleRemoveVariant = (index: number) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const handleVariantChange = (index: number, field: keyof ProductVariant, value: string | number) => {
        if (field === 'availableQuantity') {
            const numValue = typeof value === 'string' ? parseInt(value) || 0 : value;
            if (isNaN(numValue)) return;

            setVariants(prev => prev.map((variant, i) =>
                i === index ? { ...variant, [field]: numValue } : variant
            ));
        } else {
            setVariants(prev => prev.map((variant, i) =>
                i === index ? { ...variant, [field]: value } : variant
            ));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // 1. Загружаем временные файлы на S3
            let uploadedUrls: string[] = [];
            if (tempFiles.length > 0) {
                uploadedUrls = await uploadFilesToS3(tempFiles);
            }

            // 2. Собираем все URL изображений
            const allImageUrls: string[] = [];
            allImages.forEach(img => {
                const tempIndex = tempFilePreviews.indexOf(img);
                if (tempIndex !== -1 && uploadedUrls[tempIndex]) {
                    allImageUrls.push(uploadedUrls[tempIndex]);
                } else {
                    allImageUrls.push(img);
                }
            });

            // 3. Формируем данные для сохранения
            const mainImage = allImageUrls.length > 0 ? allImageUrls[0] : '';
            const additional = allImageUrls.length > 1 ? allImageUrls.slice(1) : [];

            interface SubmitData {
                name: string;
                description: string;
                price: number;
                imageUrl: string;
                categoryId: number;
                subcategoryId: number;
                color: string;
                material: string;
                careInstructions: string;
                additionalImages: string[];
                deletedImages: string[];
                variants: Array<{
                    size: string;
                    availableQuantity: number;
                    reservedQuantity: number;
                }>;
            }

            const submitData: SubmitData  = {
                name: formData.name,
                description: formData.description,
                price: formData.price || 0,
                imageUrl: mainImage,
                categoryId: formData.categoryId || 0,
                subcategoryId: formData.subcategoryId || 0,
                color: formData.color || '',
                material: formData.material || '',
                careInstructions: formData.careInstructions || '',
                additionalImages: additional,
                deletedImages: isEditing ? imagesToDelete : [],
                variants: variants.map(v => ({
                    size: v.size,
                    availableQuantity: v.availableQuantity,
                    reservedQuantity: v.reservedQuantity || 0
                }))
            };

            // 4. Сохраняем товар
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
        if (field === 'price') {
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

    // Обработка закрытия модального окна
    const handleClose = () => {
        tempFilePreviews.forEach(preview => {
            URL.revokeObjectURL(preview);
        });

        onClose();
    };

    return (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content rounded-0 border-1">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-light" style={{fontFamily: "'Playfair Display', serif"}}>
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
                                            onFilesSelected={handleFilesSelected}
                                            multiple={true}
                                            maxFiles={10}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    {/* Категория */}
                                    <div className="mb-3">
                                        <label className="form-label small text-muted">Категория *</label>
                                        {loadingCategories ? (
                                            <div className="d-flex align-items-center">
                                                <div className="spinner-border spinner-border-sm me-2"></div>
                                                <small>Загрузка категорий...</small>
                                            </div>
                                        ) : (
                                            <select
                                                className="form-select rounded-0"
                                                value={formData.categoryId || ''}
                                                onChange={(e) => {
                                                    const categoryId = parseInt(e.target.value);
                                                    handleChange('categoryId', categoryId);
                                                    handleChange('subcategoryId', 0);
                                                }}
                                                required
                                            >
                                                <option value="">Выберите категорию</option>
                                                {categories.map(category => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    {/* Подкатегория */}
                                    <div className="mb-3">
                                        <label className="form-label small text-muted">Подкатегория</label>
                                        <select
                                            className="form-select rounded-0"
                                            value={formData.subcategoryId || ''}
                                            onChange={(e) => handleChange('subcategoryId', parseInt(e.target.value))}
                                            disabled={!formData.categoryId || subcategories.length === 0}
                                        >
                                            <option value="">
                                                {!formData.categoryId
                                                    ? 'Сначала выберите категорию'
                                                    : subcategories.length === 0
                                                        ? 'Нет подкатегорий'
                                                        : 'Выберите подкатегорию'}
                                            </option>
                                            {subcategories.map(subcat => (
                                                <option key={subcat.id} value={subcat.id}>
                                                    {subcat.name}
                                                </option>
                                            ))}
                                        </select>
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
                                            <label className="form-label small text-muted">Материал</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-0"
                                                value={formData.material}
                                                onChange={(e) => handleChange('material', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label small text-muted">Уход</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-0"
                                            value={formData.careInstructions}
                                            onChange={(e) => handleChange('careInstructions', e.target.value)}
                                            placeholder="Рекомендации по уходу"
                                        />
                                    </div>

                                    {/* Секция вариантов товара */}
                                    <div className="mb-3 border-top pt-3">
                                        <label className="form-label small text-muted">
                                            Варианты товара (размеры и количество)
                                        </label>

                                        <div className="mb-3">
                                            <div className="row g-2 mb-3">
                                                <div className="col-6">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm rounded-0"
                                                        placeholder="Размер (например: S, M, L, 42)"
                                                        value={newVariant.size}
                                                        onChange={(e) => setNewVariant(prev => ({...prev, size: e.target.value}))}
                                                    />
                                                </div>
                                                <div className="col-4">
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm rounded-0"
                                                        placeholder="Количество"
                                                        min="0"
                                                        value={newVariant.availableQuantity}
                                                        onChange={(e) => setNewVariant(prev => ({...prev, availableQuantity: parseInt(e.target.value) || 0}))}
                                                    />
                                                </div>
                                                <div className="col-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-dark btn-sm rounded-0 w-100"
                                                        onClick={handleAddVariant}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {variants.length > 0 && (
                                            <div className="border rounded p-2 mb-3">
                                                <div className="small text-muted mb-2">Текущие варианты:</div>
                                                {variants.map((variant, index) => (
                                                    <div key={index} className="d-flex align-items-center mb-2">
                                                        <div className="me-2 flex-grow-1">
                                                            <div className="row g-2">
                                                                <div className="col-6">
                                                                    <input
                                                                        type="text"
                                                                        className="form-control form-control-sm rounded-0"
                                                                        value={variant.size}
                                                                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="col-4">
                                                                    <input
                                                                        type="number"
                                                                        className="form-control form-control-sm rounded-0"
                                                                        min="0"
                                                                        value={variant.availableQuantity}
                                                                        onChange={(e) => handleVariantChange(index, 'availableQuantity', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm rounded-0 ms-2"
                                                            onClick={() => handleRemoveVariant(index)}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                                <div className="mt-2 pt-2 border-top small text-muted">
                                                    Всего доступно: {variants.reduce((sum, v) => sum + v.availableQuantity, 0)} шт.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Галерея фотографий */}
                            {allImages.length > 0 && (
                                <div className="mt-4 pt-3 border-top">
                                    <h6 className="mb-3">
                                        Фотографии товара ({allImages.length})
                                        {allImages.length > 0 && (
                                            <span className="ms-2 small text-muted">
                                                • Первое фото — основное
                                            </span>
                                        )}
                                    </h6>
                                    <div className="row g-3">
                                        {allImages.map((img, index) => (
                                            <div key={index} className="col-4 col-md-3">
                                                <div className="card border-0 position-relative shadow-sm">
                                                    <div className="position-relative">
                                                        <img
                                                            src={img}
                                                            alt={`Фото ${index + 1}`}
                                                            className="card-img-top"
                                                            style={{
                                                                height: '150px',
                                                                objectFit: 'cover',
                                                                border: index === 0 ? '3px solid #28a745' : '1px solid #dee2e6'
                                                            }}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                                                            }}
                                                        />

                                                        {index !== 0 && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-success btn-sm position-absolute top-0 end-0 m-1"
                                                                onClick={() => handleMakeMainImage(index)}
                                                                title="Сделать основным"
                                                                style={{
                                                                    width: '30px',
                                                                    height: '30px',
                                                                    padding: '0',
                                                                    borderRadius: '50%',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    zIndex: 10
                                                                }}
                                                            >
                                                                <span
                                                                    style={{fontSize: '16px', lineHeight: '1'}}>☆</span>
                                                            </button>
                                                        )}

                                                        {index === 0 && (
                                                            <div className="position-absolute top-0 start-0 m-1">
                                                                <span className="badge bg-success">Основное</span>
                                                            </div>
                                                        )}

                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm position-absolute bottom-0 end-0 m-1"
                                                            onClick={() => handleRemoveImage(index)}
                                                            title="Удалить"
                                                            style={{
                                                                width: '30px',
                                                                height: '30px',
                                                                padding: '0',
                                                                borderRadius: '50%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                zIndex: 10
                                                            }}
                                                        >
                                                            <span style={{fontSize: '16px', lineHeight: '1'}}>✕</span>
                                                        </button>
                                                    </div>

                                                    <div className="card-body p-2">
                                                        <div
                                                            className="d-flex justify-content-between align-items-center mb-1">
                                                            <small className="text-muted">
                                                                Фото {index + 1}
                                                            </small>
                                                            <small className="text-muted">
                                                                {index === 0 ? 'Основное' : 'Дополнительное'}
                                                            </small>
                                                        </div>

                                                        {index > 0 && (
                                                            <div className="d-flex justify-content-center gap-1 mt-1">
                                                                {index > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-secondary btn-sm"
                                                                        onClick={() => handleMoveImage(index, 'left')}
                                                                        title="Сдвинуть влево"
                                                                        style={{
                                                                            width: '28px',
                                                                            height: '28px',
                                                                            padding: '0',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}
                                                                    >
                                                                        <span style={{fontSize: '12px'}}>←</span>
                                                                    </button>
                                                                )}

                                                                {index < allImages.length - 1 && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-secondary btn-sm"
                                                                        onClick={() => handleMoveImage(index, 'right')}
                                                                        title="Сдвинуть вправо"
                                                                        style={{
                                                                            width: '28px',
                                                                            height: '28px',
                                                                            padding: '0',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}
                                                                    >
                                                                        <span style={{fontSize: '12px'}}>→</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-3 pt-2 border-top">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="d-flex align-items-center mb-2">
                                                    <div className="me-2" style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        border: '3px solid #28a745'
                                                    }}></div>
                                                    <small className="text-muted">Зелёная рамка — основное фото</small>
                                                </div>
                                                <div className="d-flex align-items-center mb-2">
                                                    <button className="btn btn-success btn-sm me-2" disabled
                                                            style={{width: '24px', height: '24px', padding: '0'}}>☆
                                                    </button>
                                                    <small className="text-muted">Сделать фото основным</small>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="d-flex align-items-center mb-2">
                                                    <button className="btn btn-outline-secondary btn-sm me-2" disabled
                                                            style={{width: '24px', height: '24px', padding: '0'}}>←
                                                    </button>
                                                    <small className="text-muted">Изменить порядок фото</small>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <button className="btn btn-danger btn-sm me-2" disabled
                                                            style={{width: '24px', height: '24px', padding: '0'}}>✕
                                                    </button>
                                                    <small className="text-muted">Удалить фото из товара</small>
                                                </div>
                                            </div>
                                        </div>
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
                                disabled={saving || allImages.length === 0 || !formData.categoryId || variants.length === 0}
                                title={
                                    allImages.length === 0 ? "Добавьте хотя бы одно фото" :
                                        !formData.categoryId ? "Выберите категорию" :
                                            variants.length === 0 ? "Добавьте хотя бы один вариант" : ""
                                }
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