// src/utils/swalConfig.ts
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

// Базовые настройки в стиле вашего сайта
export const swalConfig = {
    // Общие настройки
    general: {
        customClass: {
            popup: 'rounded-0 border-0',
            title: 'fw-light mb-3',
            htmlContainer: 'text-muted',
            confirmButton: 'btn btn-dark rounded-0 px-4 py-2',
            cancelButton: 'btn btn-outline-dark rounded-0 px-4 py-2',
            actions: 'mt-4',
            icon: 'mb-3'
        },
        buttonsStyling: false,
        background: '#f8f9fa',
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
        title: `<div style="font-family: 'Playfair Display', serif; font-weight: 300">
                  ${getCustomIcon(icon)} ${title}
                </div>`,
        html,
        ...swalConfig.general,
        showConfirmButton: true,
        confirmButtonText: 'OK',
        confirmButtonColor: '#000',
        width: '520px',
        showCloseButton: true
    });
};

export const showProductNotification = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    return MySwal.fire({
        title: `<div style="font-family: 'Cormorant Garamond', serif; font-weight: 300">${title}</div>`,
        html: `<div style="color: #666; font-size: 0.95rem">${text}</div>`,
        icon,
        ...swalConfig.general,
        showConfirmButton: true,
        confirmButtonText: 'Продолжить',
        confirmButtonColor: '#000',
        width: '450px'
    });
};

export const showOrderNotification = (title: string, text: string) => {
    return MySwal.fire({
        title: `<div style="font-family: 'Playfair Display', serif; font-weight: 300; font-size: 1.5rem">${title}</div>`,
        html: `<div style="font-family: 'Cormorant Garamond', serif; color: #666; line-height: 1.6">${text}</div>`,
        icon: 'success',
        ...swalConfig.general,
        showConfirmButton: true,
        confirmButtonText: 'Понятно',
        confirmButtonColor: '#000',
        width: '550px'
    });
};

// Для конфликтов в корзине (когда другой клиент купил товар)
export const showCartConflict = (productName: string, availableQuantity: number, wasRemoved: boolean) => {
    const title = wasRemoved ? 'Товар закончился' : 'Количество изменилось';
    const html = wasRemoved
        ? `<div style="font-family: 'Cormorant Garamond', serif; color: #666; line-height: 1.6">
              <p>"${productName}" был куплен другим клиентом и удалён из вашей корзины.</p>
          </div>`
        : `<div style="font-family: 'Cormorant Garamond', serif; color: #666; line-height: 1.6">
              <p>"${productName}" доступно только ${availableQuantity} шт. (было зарезервировано другими клиентами).</p>
          </div>`;

    return MySwal.fire({
        title: `<div style="font-family: 'Playfair Display', serif; font-weight: 300; color: ${wasRemoved ? '#dc3545' : '#ffc107'}">${title}</div>`,
        html,
        icon: wasRemoved ? 'error' : 'warning',
        ...swalConfig.general,
        width: '520px',
        showConfirmButton: true,
        confirmButtonText: 'Понятно',
        confirmButtonColor: wasRemoved ? '#dc3545' : '#ffc107'
    });
};

// Для модального окна выбора оформления заказа (используется в CartPage)
export const showCheckoutChoiceModal = (onGuestClick: () => void, onLoginClick: () => void) => {
    return MySwal.fire({
        title: '<div style="font-family: \'Playfair Display\', serif; font-weight: 300; font-size: 1.5rem">Как оформить заказ?</div>',
        html: `
            <div style="font-family: 'Cormorant Garamond', serif; color: #666; line-height: 1.6">
                <p class="mb-4">Выберите способ оформления заказа:</p>
                
                <div class="mb-4">
                    <button id="guest-checkout" 
                        class="btn btn-dark rounded-0 w-100 py-3 fw-light mb-3"
                        style="letter-spacing: 0.1em; font-size: 0.9rem; font-family: 'Cormorant Garamond', serif">
                        ПРОДОЛЖИТЬ БЕЗ РЕГИСТРАЦИИ
                    </button>
                    <p class="small text-muted mb-4">
                        Быстрое оформление. Вам нужно будет указать только имя, телефон и email
                    </p>
                </div>
                
                <div>
                    <button id="login-checkout" 
                        class="btn btn-outline-dark rounded-0 w-100 py-3 fw-light"
                        style="letter-spacing: 0.1em; font-size: 0.9rem; font-family: 'Cormorant Garamond', serif">
                        ВОЙТИ И ОФОРМИТЬ
                    </button>
                    <p class="small text-muted">
                        Для зарегистрированных пользователей. Данные подставятся автоматически
                    </p>
                </div>
            </div>
        `,
        customClass: {
            popup: 'rounded-0 border-0',
            title: 'fw-light mb-3',
            htmlContainer: 'text-muted p-0',
            actions: 'd-none'
        },
        buttonsStyling: false,
        background: '#f8f9fa',
        width: '500px',
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
        title: '<div style="font-family: \'Playfair Display\', serif; font-weight: 300">Вход в аккаунт</div>',
        html: `
            <div style="font-family: 'Cormorant Garamond', serif; color: #666">
                <p class="mb-4">Функция входа будет реализована в ближайшее время.</p>
                <p class="small text-muted">А пока вы можете оформить заказ без регистрации.</p>
            </div>
        `,
        icon: 'info',
        customClass: {
            popup: 'rounded-0 border-0',
            title: 'fw-light mb-3',
            htmlContainer: 'text-muted',
            confirmButton: 'btn btn-dark rounded-0 px-4 py-2',
            cancelButton: 'btn btn-outline-dark rounded-0 px-4 py-2'
        },
        buttonsStyling: false,
        background: '#f8f9fa',
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'Оформить как гость',
        cancelButtonText: 'Отмена',
        width: '450px'
    }).then((result) => {
        if (result.isConfirmed && onGuestConfirm) {
            onGuestConfirm();
        }
    });
};

export default MySwal;