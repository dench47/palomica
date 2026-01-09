import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import Swal from 'sweetalert2';

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
    description?: string;
    categoryId: number;
    categoryName?: string;
    displayOrder: number;
    isActive: boolean;
}

interface CategoryManagerModalProps {
    onClose: () => void;
    onSave: () => void;
}

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ onClose, onSave }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'categories' | 'subcategories'>('categories');

    // Режимы редактирования
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);

    // Новые элементы (ВРЕМЕННЫЕ - не сохраняются пока не нажмёшь "Сохранить изменения")
    const [newCategory, setNewCategory] = useState({ name: '', description: '', displayOrder: 0 });
    const [newSubcategory, setNewSubcategory] = useState({
        name: '',
        description: '',
        categoryId: 0,
        displayOrder: 0
    });

    // Выбранная категория для подкатегорий
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    // Загрузка данных
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('admin_token');

            // Загружаем категории
            const categoriesResponse = await fetch('/api/admin/categories/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (categoriesResponse.ok) {
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData);

                // Если есть категории, выбираем первую для подкатегорий
                if (categoriesData.length > 0 && !selectedCategoryId) {
                    setSelectedCategoryId(categoriesData[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            Swal.fire({
                title: 'Ошибка',
                text: 'Не удалось загрузить данные',
                icon: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Получить подкатегории для выбранной категории
    const getSubcategoriesForSelectedCategory = () => {
        if (!selectedCategoryId) return [];

        const category = categories.find(c => c.id === selectedCategoryId);
        return category?.subcategories || [];
    };

    // ========== ОБРАБОТКА КАТЕГОРИЙ ==========

    const handleCreateCategory = () => {
        if (!newCategory.name.trim()) {
            Swal.fire({
                title: 'Ошибка',
                text: 'Введите название категории',
                icon: 'warning'
            });
            return;
        }

        // Добавляем временную категорию в состояние
        const tempCategory: Category = {
            id: -Date.now(), // Временный отрицательный ID
            name: newCategory.name,
            description: newCategory.description,
            displayOrder: newCategory.displayOrder,
            isActive: true,
            subcategories: []
        };

        setCategories(prev => [...prev, tempCategory]);
        setNewCategory({ name: '', description: '', displayOrder: 0 });

        Swal.fire({
            title: 'Добавлено',
            text: 'Категория будет создана после сохранения',
            icon: 'info',
            timer: 1500
        });
    };

    const handleUpdateCategory = () => {
        if (!editingCategory) return;

        // Обновляем категорию в состоянии
        setCategories(prev => prev.map(c =>
            c.id === editingCategory.id ? { ...editingCategory } : c
        ));
        setEditingCategory(null);

        Swal.fire({
            title: 'Обновлено',
            text: 'Изменения будут сохранены',
            icon: 'info',
            timer: 1500
        });
    };

    const handleDeleteCategory = async (id: number) => {
        const category = categories.find(c => c.id === id);

        const result = await Swal.fire({
            title: 'Удалить категорию?',
            html: `Вы уверены, что хотите удалить категорию "<strong>${category?.name}</strong>"?<br>
              Все подкатегории также будут удалены.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Да, удалить',
            cancelButtonText: 'Отмена',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('admin_token');
                const response = await fetch(`/api/admin/categories/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    // Удаляем из состояния фронтенда
                    setCategories(prev => prev.filter(c => c.id !== id));

                    Swal.fire({
                        title: 'Удалено!',
                        text: 'Категория полностью удалена',
                        icon: 'success',
                        timer: 1500
                    });
                } else {
                    const error = await response.json();
                    Swal.fire({
                        title: 'Ошибка',
                        text: error.message || 'Не удалось удалить категорию',
                        icon: 'error'
                    });
                }
            } catch (error) {
                console.error('Error deleting category:', error);
                Swal.fire({
                    title: 'Ошибка',
                    text: 'Не удалось удалить категорию',
                    icon: 'error'
                });
            }
        }
    };
    // ========== ОБРАБОТКА ПОДКАТЕГОРИЙ ==========

    const handleCreateSubcategory = () => {
        if (!newSubcategory.name.trim() || !newSubcategory.categoryId) {
            Swal.fire({
                title: 'Ошибка',
                text: 'Заполните все обязательные поля',
                icon: 'warning'
            });
            return;
        }

        // Добавляем временную подкатегорию в состояние
        const tempSubcategory: Subcategory = {
            id: -Date.now(), // Временный отрицательный ID
            name: newSubcategory.name,
            description: newSubcategory.description,
            categoryId: newSubcategory.categoryId,
            displayOrder: newSubcategory.displayOrder,
            isActive: true
        };

        // Обновляем категорию с новой подкатегорией
        setCategories(prev => prev.map(category => {
            if (category.id === newSubcategory.categoryId) {
                const updatedSubcategories = [
                    ...(category.subcategories || []),
                    tempSubcategory
                ];
                return { ...category, subcategories: updatedSubcategories };
            }
            return category;
        }));

        setNewSubcategory({ name: '', description: '', categoryId: selectedCategoryId || 0, displayOrder: 0 });

        Swal.fire({
            title: 'Добавлено',
            text: 'Подкатегория будет создана после сохранения',
            icon: 'info',
            timer: 1500
        });
    };

    const handleUpdateSubcategory = () => {
        if (!editingSubcategory) return;

        // Обновляем подкатегорию в состоянии
        setCategories(prev => prev.map(category => {
            if (category.subcategories) {
                const updatedSubcategories = category.subcategories.map(sc =>
                    sc.id === editingSubcategory.id ? editingSubcategory : sc
                );
                return { ...category, subcategories: updatedSubcategories };
            }
            return category;
        }));

        setEditingSubcategory(null);

        Swal.fire({
            title: 'Обновлено',
            text: 'Изменения будут сохранены',
            icon: 'info',
            timer: 1500
        });
    };

    const handleDeleteSubcategory = async (id: number) => {
        const subcategory = getSubcategoriesForSelectedCategory().find(sc => sc.id === id);

        const result = await Swal.fire({
            title: 'Удалить подкатегорию?',
            html: `Вы уверены, что хотите удалить подкатегорию "<strong>${subcategory?.name}</strong>"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Да, удалить',
            cancelButtonText: 'Отмена',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('admin_token');
                const response = await fetch(`/api/admin/categories/subcategories/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    // Удаляем подкатегорию из состояния
                    setCategories(prev => prev.map(category => {
                        if (category.subcategories) {
                            const updatedSubcategories = category.subcategories.filter(sc => sc.id !== id);
                            return { ...category, subcategories: updatedSubcategories };
                        }
                        return category;
                    }));

                    Swal.fire({
                        title: 'Удалено!',
                        text: 'Подкатегория полностью удалена',
                        icon: 'success',
                        timer: 1500
                    });
                } else {
                    const error = await response.json();
                    Swal.fire({
                        title: 'Ошибка',
                        text: error.message || 'Не удалось удалить подкатегорию',
                        icon: 'error'
                    });
                }
            } catch (error) {
                console.error('Error deleting subcategory:', error);
                Swal.fire({
                    title: 'Ошибка',
                    text: 'Не удалось удалить подкатегорию',
                    icon: 'error'
                });
            }
        }
    };

    // Изменить порядок категорий
    const handleMoveCategoryOrder = (id: number, direction: 'up' | 'down') => {
        setCategories(prev => {
            const sorted = [...prev].sort((a, b) => a.displayOrder - b.displayOrder);
            const index = sorted.findIndex(c => c.id === id);

            if ((direction === 'up' && index === 0) ||
                (direction === 'down' && index === sorted.length - 1)) {
                return prev;
            }

            const newIndex = direction === 'up' ? index - 1 : index + 1;

            // Меняем местами displayOrder
            const tempOrder = sorted[index].displayOrder;
            sorted[index].displayOrder = sorted[newIndex].displayOrder;
            sorted[newIndex].displayOrder = tempOrder;

            return sorted;
        });
    };

    // ========== СОХРАНЕНИЕ ВСЕХ ИЗМЕНЕНИЙ ==========

    const saveAllChanges = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            let hasError = false;

            // Копируем категории для работы
            let updatedCategories = [...categories];

            // 1. Создаём новые категории (с отрицательными ID) и получаем их настоящие ID
            for (const category of updatedCategories.filter(c => c.id < 0)) {
                try {
                    const response = await fetch('/api/admin/categories', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            name: category.name,
                            description: category.description,
                            displayOrder: category.displayOrder,
                            isActive: category.isActive
                        })
                    });

                    if (response.ok) {
                        const createdCategory = await response.json();

                        // НАЙДИ старый ID категории
                        const oldCategoryId = category.id;
                        const newCategoryId = createdCategory.id;

                        // ОБНОВИ категорию в updatedCategories с новым ID
                        updatedCategories = updatedCategories.map(c =>
                            c.id === oldCategoryId ? { ...createdCategory, subcategories: c.subcategories } : c
                        );

                        // ОБНОВИ ВСЕ подкатегории, которые ссылались на старый ID
                        updatedCategories = updatedCategories.map(cat => {
                            if (cat.subcategories) {
                                const updatedSubcategories = cat.subcategories.map(sub => {
                                    if (sub.categoryId === oldCategoryId) {
                                        return { ...sub, categoryId: newCategoryId };
                                    }
                                    return sub;
                                });
                                return { ...cat, subcategories: updatedSubcategories };
                            }
                            return cat;
                        });

                    } else {
                        hasError = true;
                        const error = await response.json();
                        console.error(`Error creating category ${category.name}:`, error);
                    }
                } catch (error) {
                    hasError = true;
                    console.error(`Error creating category ${category.name}:`, error);
                }
            }

            // 2. Обновляем состояние с новыми ID категорий
            setCategories(updatedCategories);

            // 3. Обновляем существующие категории (с положительными ID)
            for (const category of updatedCategories.filter(c => c.id > 0)) {
                try {
                    const response = await fetch(`/api/admin/categories/${category.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            name: category.name,
                            description: category.description,
                            displayOrder: category.displayOrder,
                            isActive: category.isActive
                        })
                    });

                    if (!response.ok) {
                        hasError = true;
                        const error = await response.json();
                        console.error(`Error updating category ${category.id}:`, error);
                    }
                } catch (error) {
                    hasError = true;
                    console.error(`Error updating category ${category.id}:`, error);
                }
            }

            // 4. Теперь сохраняем подкатегории с ПРАВИЛЬНЫМИ categoryId
            for (const category of updatedCategories) {
                if (category.subcategories && category.subcategories.length > 0) {
                    for (const subcategory of category.subcategories) {
                        try {
                            // Если это новая подкатегория (отрицательный ID)
                            if (subcategory.id < 0) {
                                const response = await fetch('/api/admin/categories/subcategories', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        name: subcategory.name,
                                        description: subcategory.description,
                                        categoryId: category.id, // ТЕПЕРЬ ПРАВИЛЬНЫЙ ID!
                                        displayOrder: subcategory.displayOrder,
                                        isActive: subcategory.isActive
                                    })
                                });

                                if (!response.ok) {
                                    hasError = true;
                                    const error = await response.json();
                                    console.error(`Error creating subcategory ${subcategory.name}:`, error);
                                }
                            } else {
                                // Если это существующая подкатегория
                                const response = await fetch(`/api/admin/categories/subcategories/${subcategory.id}`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        name: subcategory.name,
                                        description: subcategory.description,
                                        categoryId: subcategory.categoryId,
                                        displayOrder: subcategory.displayOrder,
                                        isActive: subcategory.isActive
                                    })
                                });

                                if (!response.ok) {
                                    hasError = true;
                                    const error = await response.json();
                                    console.error(`Error updating subcategory ${subcategory.id}:`, error);
                                }
                            }
                        } catch (error) {
                            hasError = true;
                            console.error(`Error processing subcategory ${subcategory.name}:`, error);
                        }
                    }
                }
            }

            // 5. Удаляем подкатегории, которые были удалены
            // (Для этого нужно отслеживать, какие подкатегории были удалены)

            if (hasError) {
                Swal.fire({
                    title: 'Частичная ошибка',
                    text: 'Не все изменения удалось сохранить',
                    icon: 'warning'
                });
                // Всё равно вызываем onSave, чтобы обновить список в родительском компоненте
                onSave();
            } else {
                Swal.fire({
                    title: 'Успешно!',
                    text: 'Все изменения сохранены',
                    icon: 'success',
                    timer: 1500
                });
                onSave();
            }
        } catch (error) {
            console.error('Error saving all changes:', error);
            Swal.fire({
                title: 'Ошибка',
                text: 'Не удалось сохранить изменения',
                icon: 'error'
            });
        }
    };

    if (loading) {
        return (
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content rounded-0 border-1">
                        <div className="modal-body text-center py-5">
                            <div className="spinner-border text-dark" role="status">
                                <span className="visually-hidden">Загрузка...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl modal-dialog-centered">
                <div className="modal-content rounded-0 border-1">
                    <div className="modal-header border-0">
                        <h5 className="modal-title fw-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Управление категориями и подкатегориями
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        {/* Табы */}
                        <ul className="nav nav-tabs mb-4">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('categories')}
                                >
                                    Категории
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'subcategories' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('subcategories')}
                                >
                                    Подкатегории
                                </button>
                            </li>
                        </ul>

                        {/* Вкладка Категории */}
                        {activeTab === 'categories' && (
                            <div>
                                <div className="card mb-4">
                                    <div className="card-header bg-light">
                                        <h6 className="mb-0">Добавить новую категорию</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-5">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Название категории *"
                                                    value={newCategory.name}
                                                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                                                />
                                            </div>
                                            <div className="col-md-5">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Описание"
                                                    value={newCategory.description}
                                                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <button
                                                    className="btn btn-dark w-100"
                                                    onClick={handleCreateCategory}
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Список категорий */}
                                <div className="card">
                                    <div className="card-header bg-light">
                                        <h6 className="mb-0">Все категории</h6>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="list-group list-group-flush">
                                            {categories
                                                .sort((a, b) => a.displayOrder - b.displayOrder)
                                                .map((category) => (
                                                    <div key={category.id} className="list-group-item">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div className="d-flex align-items-center">
                                                                <div className="me-3">
                                                                    <button
                                                                        className="btn btn-sm btn-outline-secondary me-1"
                                                                        onClick={() => handleMoveCategoryOrder(category.id, 'up')}
                                                                        title="Поднять выше"
                                                                    >
                                                                        <ChevronUp size={14} />
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm btn-outline-secondary"
                                                                        onClick={() => handleMoveCategoryOrder(category.id, 'down')}
                                                                        title="Опустить ниже"
                                                                    >
                                                                        <ChevronDown size={14} />
                                                                    </button>
                                                                </div>

                                                                {editingCategory?.id === category.id ? (
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control form-control-sm"
                                                                            value={editingCategory.name}
                                                                            onChange={(e) => setEditingCategory({
                                                                                ...editingCategory,
                                                                                name: e.target.value
                                                                            })}
                                                                        />
                                                                        <button
                                                                            className="btn btn-sm btn-success"
                                                                            onClick={handleUpdateCategory}
                                                                        >
                                                                            <Save size={14} />
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-secondary"
                                                                            onClick={() => setEditingCategory(null)}
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <span className="fw-medium me-2">
                                                                            {category.name}
                                                                        </span>
                                                                        {category.description && (
                                                                            <small className="text-muted">
                                                                                ({category.description})
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="btn-group">
                                                                <button
                                                                    className="btn btn-sm btn-outline-dark"
                                                                    onClick={() => setEditingCategory(category)}
                                                                    title="Редактировать"
                                                                >
                                                                    <Edit size={14} />
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => handleDeleteCategory(category.id)}
                                                                    title="Удалить"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Вкладка Подкатегории */}
                        {activeTab === 'subcategories' && (
                            <div>
                                <div className="card mb-4">
                                    <div className="card-header bg-light">
                                        <h6 className="mb-0">Добавить новую подкатегорию</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-4">
                                                <select
                                                    className="form-control"
                                                    value={selectedCategoryId || ''}
                                                    onChange={(e) => setSelectedCategoryId(parseInt(e.target.value))}
                                                >
                                                    <option value="">Выберите категорию</option>
                                                    {categories
                                                        .filter(c => c.isActive)
                                                        .map(category => (
                                                            <option key={category.id} value={category.id}>
                                                                {category.name}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="row g-3">
                                            <div className="col-md-5">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Название подкатегории *"
                                                    value={newSubcategory.name}
                                                    onChange={(e) => setNewSubcategory({
                                                        ...newSubcategory,
                                                        name: e.target.value,
                                                        categoryId: selectedCategoryId || 0
                                                    })}
                                                    disabled={!selectedCategoryId}
                                                />
                                            </div>
                                            <div className="col-md-5">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Описание"
                                                    value={newSubcategory.description}
                                                    onChange={(e) => setNewSubcategory({
                                                        ...newSubcategory,
                                                        description: e.target.value,
                                                        categoryId: selectedCategoryId || 0
                                                    })}
                                                    disabled={!selectedCategoryId}
                                                />
                                            </div>
                                            <div className="col-md-2">
                                                <button
                                                    className="btn btn-dark w-100"
                                                    onClick={handleCreateSubcategory}
                                                    disabled={!selectedCategoryId}
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Список подкатегорий */}
                                {selectedCategoryId ? (
                                    <div className="card">
                                        <div className="card-header bg-light">
                                            <h6 className="mb-0">
                                                Подкатегории для: {categories.find(c => c.id === selectedCategoryId)?.name}
                                            </h6>
                                        </div>
                                        <div className="card-body p-0">
                                            <div className="list-group list-group-flush">
                                                {getSubcategoriesForSelectedCategory()
                                                    .sort((a, b) => a.displayOrder - b.displayOrder)
                                                    .map((subcategory) => (
                                                        <div key={subcategory.id} className="list-group-item">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                {editingSubcategory?.id === subcategory.id ? (
                                                                    <div className="d-flex align-items-center gap-2 w-100">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control form-control-sm"
                                                                            value={editingSubcategory.name}
                                                                            onChange={(e) => setEditingSubcategory({
                                                                                ...editingSubcategory,
                                                                                name: e.target.value
                                                                            })}
                                                                        />
                                                                        <select
                                                                            className="form-select form-select-sm"
                                                                            value={editingSubcategory.categoryId}
                                                                            onChange={(e) => setEditingSubcategory({
                                                                                ...editingSubcategory,
                                                                                categoryId: parseInt(e.target.value)
                                                                            })}
                                                                        >
                                                                            {categories.map(cat => (
                                                                                <option key={cat.id} value={cat.id}>
                                                                                    {cat.name}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                        <button
                                                                            className="btn btn-sm btn-success"
                                                                            onClick={handleUpdateSubcategory}
                                                                        >
                                                                            <Save size={14} />
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-secondary"
                                                                            onClick={() => setEditingSubcategory(null)}
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div>
                                                                            <span className="fw-medium me-2">
                                                                                {subcategory.name}
                                                                            </span>
                                                                            {subcategory.description && (
                                                                                <small className="text-muted">
                                                                                    ({subcategory.description})
                                                                                </small>
                                                                            )}
                                                                        </div>

                                                                        <div className="btn-group">
                                                                            <button
                                                                                className="btn btn-sm btn-outline-dark"
                                                                                onClick={() => setEditingSubcategory(subcategory)}
                                                                                title="Редактировать"
                                                                            >
                                                                                <Edit size={14} />
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-sm btn-outline-danger"
                                                                                onClick={() => handleDeleteSubcategory(subcategory.id)}
                                                                                title="Удалить"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}

                                                {getSubcategoriesForSelectedCategory().length === 0 && (
                                                    <div className="list-group-item text-center text-muted py-4">
                                                        Нет подкатегорий для выбранной категории
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="alert alert-info">
                                        Выберите категорию для просмотра подкатегорий
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer border-0">
                        <button
                            type="button"
                            className="btn btn-outline-dark rounded-0"
                            onClick={onClose}
                        >
                            Закрыть
                        </button>
                        <button
                            type="button"
                            className="btn btn-dark rounded-0"
                            onClick={saveAllChanges}
                        >
                            Сохранить изменения
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryManagerModal;