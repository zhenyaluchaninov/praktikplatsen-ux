import { useCallback, useEffect, useRef, useState } from 'react';

export interface NotificationPayload {
  id: number;
  title: string;
  message: string;
}

const DISPLAY_DURATION = 3000;
const FADE_DURATION = 200;

export const useNotifications = () => {
  const [notification, setNotification] = useState<NotificationPayload | null>(null);
  const [exitingNotification, setExitingNotification] = useState<NotificationPayload | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const clearExitTimer = useCallback(() => {
    if (exitTimerRef.current) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  const showNotification = useCallback(
    (title: string, message: string) => {
      const nextNotification: NotificationPayload = {
        id: Date.now(),
        title,
        message,
      };

      setNotification((prev) => {
        if (prev) {
          setExitingNotification(prev);
        }
        return nextNotification;
      });
      setIsVisible(true);
    },
    [],
  );

  const clearNotification = useCallback(() => {
    setIsVisible(false);
    if (!notification) {
      setExitingNotification(null);
    }
  }, [notification]);

  useEffect(() => {
    if (!isVisible || !notification) {
      clearHideTimer();
      return;
    }

    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, DISPLAY_DURATION);

    return clearHideTimer;
  }, [clearHideTimer, isVisible, notification]);

  useEffect(() => {
    if (isVisible || !notification) {
      return;
    }

    setExitingNotification(notification);
    setNotification(null);
  }, [isVisible, notification]);

  useEffect(() => {
    if (!exitingNotification) {
      clearExitTimer();
      return;
    }

    clearExitTimer();
    exitTimerRef.current = window.setTimeout(() => {
      setExitingNotification(null);
    }, FADE_DURATION);

    return clearExitTimer;
  }, [clearExitTimer, exitingNotification]);

  useEffect(
    () => () => {
      clearHideTimer();
      clearExitTimer();
    },
    [clearExitTimer, clearHideTimer],
  );

  return {
    notification,
    exitingNotification,
    isNotificationVisible: isVisible,
    showNotification,
    clearNotification,
  };
};
