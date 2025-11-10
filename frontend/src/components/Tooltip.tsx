import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type TooltipProps = {
  content?: string;
  children: React.ReactNode;
};

export const Tooltip = ({ content, children }: TooltipProps) => {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, height: 0 });
  const [placement, setPlacement] = useState<'above' | 'below'>('above');

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const getReferenceRect = () => {
    if (!triggerRef.current) {
      return null;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    if (rect.width > 0 || rect.height > 0) {
      return rect;
    }
    const fallback = triggerRef.current.firstElementChild as HTMLElement | null;
    return fallback?.getBoundingClientRect() ?? rect;
  };

  const updatePosition = () => {
    const rect = getReferenceRect();
    if (!rect) {
      return;
    }
    setPosition({
      top: rect.top,
      left: rect.left + rect.width / 2,
      height: rect.height,
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

  useEffect(() => {
    if (!open || !tooltipRef.current) {
      return;
    }
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const spaceAbove = position.top;
    const spaceBelow = window.innerHeight - (position.top + position.height);
    const needsBelow = spaceAbove < tooltipRect.height + 12 && spaceBelow > spaceAbove;
    setPlacement(needsBelow ? 'below' : 'above');
  }, [open, position]);

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
            <div
              ref={tooltipRef}
              className="tooltip-floating"
              role="status"
              aria-live="polite"
              style={
                placement === 'above'
                  ? { top: position.top - 8, left: position.left, transform: 'translate(-50%, -100%)' }
                  : { top: position.top + position.height + 8, left: position.left, transform: 'translate(-50%, 0)' }
              }
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </>
  );
};
