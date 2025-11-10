import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type TooltipProps = {
  content?: string;
  children: React.ReactNode;
};

export const Tooltip = ({ content, children }: TooltipProps) => {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const updatePosition = () => {
    if (!triggerRef.current) {
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({
      top: rect.top,
      left: rect.left + rect.width / 2,
    });
  };

  const show = () => {
    if (!content) {
      return;
    }
    updatePosition();
    setOpen(true);
  };

  const hide = () => {
    clearHideTimeout();
    setOpen(false);
  };

  const scheduleHide = () => {
    clearHideTimeout();
    hideTimeoutRef.current = window.setTimeout(() => setOpen(false), 1500);
  };

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleWindowChange = () => {
      updatePosition();
    };
    window.addEventListener('scroll', handleWindowChange, true);
    window.addEventListener('resize', handleWindowChange);
    return () => {
      window.removeEventListener('scroll', handleWindowChange, true);
      window.removeEventListener('resize', handleWindowChange);
    };
  }, [open]);

  useEffect(
    () => () => {
      clearHideTimeout();
    },
    [],
  );

  return (
    <>
      <span
        className="tooltip-wrapper"
        ref={triggerRef}
        onMouseEnter={() => {
          clearHideTimeout();
          show();
        }}
        onMouseLeave={hide}
        onFocus={() => {
          clearHideTimeout();
          show();
        }}
        onBlur={hide}
        onTouchStart={() => {
          show();
          scheduleHide();
        }}
      >
        {children}
      </span>
      {open && content
        ? createPortal(
            <div className="tooltip-floating" role="status" aria-live="polite" style={{ top: position.top - 12, left: position.left }}>
              {content}
            </div>,
            document.body,
          )
        : null}
    </>
  );
};
