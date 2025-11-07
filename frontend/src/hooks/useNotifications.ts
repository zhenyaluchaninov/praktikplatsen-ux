import { useCallback, useEffect, useState } from 'react';

export interface NotificationPayload {
  title: string;
  message: string;
}

export const useNotifications = () => {
  const [notification, setNotification] = useState<NotificationPayload | null>(null);

  const showNotification = useCallback((title: string, message: string) => {
    setNotification({ title, message });
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timer = setTimeout(() => {
      setNotification(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification]);

  return {
    notification,
    showNotification,
    clearNotification,
  };
};

