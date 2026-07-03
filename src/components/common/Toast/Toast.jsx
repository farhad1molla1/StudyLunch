import toast from 'react-hot-toast';

export const showSuccess = (message) => {
  toast.success(message, {
    style: { borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' },
  });
};

export const showError = (message) => {
  toast.error(message, {
    style: { borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' },
  });
};

export const showInfo = (message) => {
  toast(message, {
    icon: 'ℹ️',
    style: { borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', color: 'var(--color-text-primary)' },
  });
};