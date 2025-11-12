interface NotificationToastProps {
  title: string;
  message: string;
  onClose: () => void;
  visible: boolean;
}

export const NotificationToast = ({ title, message, onClose, visible }: NotificationToastProps) => (
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
        stroke="#4CAF50"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    <div className="notification-content">
      <div className="notification-title">{title}</div>
      <div className="notification-message">{message}</div>
    </div>
  </div>
);
