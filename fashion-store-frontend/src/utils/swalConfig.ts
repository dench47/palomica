import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const getCustomIcon = (iconType: string) => {
    switch(iconType) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        default: return '💡';
    }
};

// Базовые настройки в стиле сайта (кремовая палитра)
export const swalConfig = {
    // Общие настройки
    general: {
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            htmlContainer: 'swal-custom-html',
            confirmButton: 'btn-fs btn-fs-primary btn-fs-md',
            cancelButton: 'btn-fs btn-fs-outline btn-fs-md',
            actions: 'swal-custom-actions',
            icon: 'swal-custom-icon',
            closeButton: 'swal-custom-close'
        },
        buttonsStyling: false,
        background: 'var(--cream-bg)',
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
    }
};

// Экспортируем готовые функции
export const showCartNotification = (title: string, html: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    return MySwal.fire({
        title: `<div style="font-family: 'Playfair Display', serif; font-weight: 300; color: var(--accent-brown)">
                  ${getCustomIcon(icon)} ${title}
                </div>`,
        html,
        ...swalConfig.general,
        showConfirmButton: true,
        confirmButtonText: 'OK',
        width: '500px',
        showCloseButton: true
    });
};

export const showProductNotification = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    return MySwal.fire({
        title: `<div style="font-family: 'Playfair Display', serif; font-weight: 300; color: var(--accent-brown)">${title}</div>`,
        html: `<div style="font-family: 'Cormorant Garamond', serif; color: var(--text-medium); font-size: 0.95rem; line-height: 1.5">${text}</div>`,
        icon,
        ...swalConfig.general,
        showConfirmButton: true,
        confirmButtonText: 'Продолжить',
        width: '450px'
    });
};

export const showOrderNotification = (title: string, text: string) => {
    return MySwal.fire({
        title: `<div style="font-family: 'Playfair Display', serif; font-weight: 300; font-size: 1.5rem; color: var(--accent-brown)">${title}</div>`,
        html: `<div style="font-family: 'Cormorant Garamond', serif; color: var(--text-medium); line-height: 1.6; padding: 0 1rem">${text}</div>`,
        icon: 'success',
        ...swalConfig.general,
        showConfirmButton: true,
        confirmButtonText: 'Понятно',
        width: '550px',
        padding: '2rem'
    });
};

// Для конфликтов в корзине
export const showCartConflict = (productName: string, availableQuantity: number, wasRemoved: boolean) => {
    const title = wasRemoved ? 'Товар закончился' : 'Количество изменилось';
    const html = wasRemoved
        ? `<div style="font-family: 'Cormorant Garamond', serif; color: var(--text-medium); line-height: 1.6">
              <p><strong>"${productName}"</strong> был куплен другим клиентом и удалён из вашей корзины.</p>
          </div>`
        : `<div style="font-family: 'Cormorant Garamond', serif; color: var(--text-medium); line-height: 1.6">
              <p><strong>"${productName}"</strong> доступно только ${availableQuantity} шт. (было зарезервировано другими клиентами).</p>
          </div>`;

    return MySwal.fire({
        title: `<div style="font-family: 'Playfair Display', serif; font-weight: 300; color: ${wasRemoved ? '#dc3545' : '#ffc107'}">${title}</div>`,
        html,
        icon: wasRemoved ? 'error' : 'warning',
        ...swalConfig.general,
        width: '500px',
        showConfirmButton: true,
        confirmButtonText: 'Понятно',
        confirmButtonColor: wasRemoved ? '#dc3545' : '#ffc107'
    });
};

// Для модального окна выбора оформления заказа
export const showCheckoutChoiceModal = (onGuestClick: () => void, onLoginClick: () => void) => {
    return MySwal.fire({
        title: '<div style="font-family: \'Playfair Display\', serif; font-weight: 300; font-size: 1.5rem; color: var(--accent-brown)">Как оформить заказ?</div>',
        html: `
            <div style="font-family: 'Cormorant Garamond', serif; color: var(--text-medium); line-height: 1.6; padding: 0 1rem">
                <p class="mb-4">Выберите способ оформления заказа:</p>
                
                <div class="button-group">
                    <button id="guest-checkout" 
                        class="btn-fs btn-fs-primary btn-fs-lg btn-fs-block mb-3"
                        style="font-family: 'Cormorant Garamond', serif">
                        ПРОДОЛЖИТЬ БЕЗ РЕГИСТРАЦИИ
                    </button>
                    <p class="small text-muted mb-4">
                        Быстрое оформление. Вам нужно будет указать только имя, телефон и email
                    </p>
                    
                    <button id="login-checkout" 
                        class="btn-fs btn-fs-outline btn-fs-lg btn-fs-block"
                        style="font-family: 'Cormorant Garamond', serif">
                        ВОЙТИ И ОФОРМИТЬ
                    </button>
                    <p class="small text-muted mt-2">
                        Для зарегистрированных пользователей. Данные подставятся автоматически
                    </p>
                </div>
            </div>
        `,
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title mb-4',
            htmlContainer: 'swal-custom-html p-0',
            actions: 'd-none'
        },
        buttonsStyling: false,
        background: 'var(--cream-bg)',
        width: '500px',
        padding: '2rem',
        showConfirmButton: false,
        showCloseButton: true,
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        },
        didOpen: () => {
            document.getElementById('guest-checkout')?.addEventListener('click', onGuestClick);
            document.getElementById('login-checkout')?.addEventListener('click', onLoginClick);
        },
        willClose: () => {
            document.getElementById('guest-checkout')?.removeEventListener('click', onGuestClick);
            document.getElementById('login-checkout')?.removeEventListener('click', onLoginClick);
        }
    });
};

// Для модалки входа
export const showLoginModal = (onGuestConfirm: () => void) => {
    return MySwal.fire({
        title: '<div style="font-family: \'Playfair Display\', serif; font-weight: 300; color: var(--accent-brown)">Вход в аккаунт</div>',
        html: `
            <div style="font-family: 'Cormorant Garamond', serif; color: var(--text-medium); padding: 0 1rem">
                <p class="mb-4">Функция входа будет реализована в ближайшее время.</p>
                <p class="small text-muted">А пока вы можете оформить заказ без регистрации.</p>
            </div>
        `,
        icon: 'info',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title mb-4',
            htmlContainer: 'swal-custom-html',
            confirmButton: 'btn-fs btn-fs-primary btn-fs-md',
            cancelButton: 'btn-fs btn-fs-outline btn-fs-md',
            actions: 'swal-custom-actions'
        },
        buttonsStyling: false,
        background: 'var(--cream-bg)',
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'Оформить как гость',
        cancelButtonText: 'Отмена',
        width: '450px',
        padding: '2rem'
    }).then((result) => {
        if (result.isConfirmed && onGuestConfirm) {
            onGuestConfirm();
        }
    });
};

export default MySwal;