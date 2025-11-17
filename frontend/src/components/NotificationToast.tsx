import type { NotificationVariant } from '../hooks/useNotifications';

interface NotificationToastProps {
  title: string;
  message: string;
  onClose: () => void;
  visible: boolean;
  variant: NotificationVariant;
}

const ICON_STYLES: Record<NotificationVariant, { stroke: string }> = {
  success: { stroke: '#4CAF50' },
  info: { stroke: '#2F80ED' },
  warning: { stroke: '#FFB347' },
  error: { stroke: '#FF4D4F' },
};

const renderIcon = (variant: NotificationVariant) => {
  const stroke = ICON_STYLES[variant].stroke;
  switch (variant) {
    case 'error':
      return (
        <>
          <path d="M7.5 2.5h9l5 5v9l-5 5h-9l-5-5v-9z" stroke={stroke} />
          <line x1="9" y1="9" x2="15" y2="15" stroke={stroke} />
          <line x1="15" y1="9" x2="9" y2="15" stroke={stroke} />
        </>
      );
    case 'info':
      return (
        <>
          <circle cx="12" cy="12" r="9" stroke={stroke} />
          <line x1="12" y1="10" x2="12" y2="16" stroke={stroke} />
          <circle cx="12" cy="7" r="1" fill={stroke} />
        </>
      );
    case 'warning':
      return (
        <>
          <path d="M12 3l9 16H3z" stroke={stroke} />
          <line x1="12" y1="10" x2="12" y2="14" stroke={stroke} />
          <circle cx="12" cy="17" r="1" fill={stroke} />
        </>
      );
    case 'success':
    default:
      return <polyline points="20 6 9 17 4 12" stroke={stroke} />;
  }
};

export const NotificationToast = ({ title, message, onClose, visible, variant }: NotificationToastProps) => (
  <div
    className={`notification-toast${visible ? '' : ' notification-toast--hidden'}`}
    role="status"
    onClick={onClose}
  >
    <div className="notification-icon">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {renderIcon(variant)}
      </svg>
    </div>
    <div className="notification-content">
      <div className="notification-title">{title}</div>
      <div className="notification-message">{message}</div>
    </div>
  </div>
);
