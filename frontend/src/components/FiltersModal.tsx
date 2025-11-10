import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';

import type { FiltersContentProps } from './FiltersContent';
import { FiltersContent } from './FiltersContent';

type FiltersModalProps = FiltersContentProps & {
  open: boolean;
  onClose: () => void;
};

type PanelStyle = CSSProperties & {
  '--filters-panel-top'?: string;
};

const readCssVar = (name: string, fallback: number) => {
  const value = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isNaN(value) ? fallback : value;
};

const readSnapSettings = () => ({
  topGap: readCssVar('--filters-top-gap', 140),
  bottomGap: readCssVar('--filters-bottom-gap', 0),
  closeDelta: readCssVar('--filters-close-delta', 80),
});

export const FiltersModal = ({ open, onClose, ...contentProps }: FiltersModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<number | null>(null);
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [snap, setSnap] = useState<'top' | 'bottom'>('bottom');
  const [{ top, bottom }, setSnapPositions] = useState({ top: 140, bottom: 360 });
  const [closeDelta, setCloseDelta] = useState(80);

  const clamp = useCallback(
    (value: number) => Math.max(top, Math.min(bottom, value)),
    [top, bottom],
  );

  const targetTop = snap === 'top' ? top : bottom;
  const currentTop = clamp(targetTop + (isDragging ? dragDelta : 0));

  useEffect(() => {
    if (!open) {
      return;
    }
    document.body.classList.add('modal-open');
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !panelRef.current) {
      return;
    }
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current.focus();
    return () => previouslyFocused?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSnap('bottom');
      setDragDelta(0);
      setIsDragging(false);
      return;
    }
    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    const updatePositions = () => {
      const { topGap, bottomGap, closeDelta: delta } = readSnapSettings();
      setCloseDelta(delta);
      const minTop = Math.max(topGap, 16);
      const bottomPosition = window.innerHeight - bottomGap;
      setSnapPositions({ top: minTop, bottom: bottomPosition });
    };

    updatePositions();
    const resizeObserver =
      'ResizeObserver' in window
        ? new ResizeObserver(() => {
            updatePositions();
          })
        : null;
    resizeObserver?.observe(panel);
    window.addEventListener('resize', updatePositions);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updatePositions);
    };
  }, [open]);

  const finishDrag = useCallback(
    (clientY: number | null) => {
      if (dragStartRef.current === null || clientY === null) {
        dragStartRef.current = null;
        setDragDelta(0);
        setIsDragging(false);
        return;
      }
      const delta = clientY - dragStartRef.current;
      const startTop = snap === 'top' ? top : bottom;
      const rawNextTop = startTop + delta;
      const nextTop = clamp(rawNextTop);

      if (snap === 'bottom' && rawNextTop >= bottom + closeDelta) {
        onClose();
      } else {
        const distanceToTop = Math.abs(nextTop - top);
        const distanceToBottom = Math.abs(nextTop - bottom);
        setSnap(distanceToTop <= distanceToBottom ? 'top' : 'bottom');
      }

      dragStartRef.current = null;
      setDragDelta(0);
      setIsDragging(false);
    },
    [bottom, clamp, closeDelta, onClose, snap, top],
  );

  useEffect(() => {
    if (!isDragging) {
      return;
    }
    const handleMove = (event: PointerEvent) => {
      if (dragStartRef.current === null) {
        return;
      }
      setDragDelta(event.clientY - dragStartRef.current);
    };
    const handleEnd = (event: PointerEvent) => {
      finishDrag(event.clientY);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
    };
  }, [finishDrag, isDragging]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragStartRef.current = event.clientY;
    setDragDelta(0);
    setIsDragging(true);
  };

  const handleHandleClick = () => {
    if (isDragging) {
      return;
    }
    setSnap((prev) => (prev === 'top' ? 'bottom' : 'top'));
  };

  if (!open) {
    return null;
  }

  const panelClasses = ['filters-modal__panel', snap === 'top' ? 'filters-modal__panel--expanded' : '']
    .filter(Boolean)
    .join(' ');
  const panelHeight = panelRef.current?.offsetHeight ?? 0;
  const panelStyle: PanelStyle = {
    '--filters-panel-top': `${currentTop - panelHeight}px`,
  };

  return createPortal(
    <div className="filters-modal" role="dialog" aria-modal="true" aria-label="Filters">
      <button type="button" className="filters-modal__scrim" onClick={onClose} aria-label="Close filters" />
      <div className={panelClasses} ref={panelRef} tabIndex={-1} style={panelStyle}>
        <div
          className="filters-modal__handle"
          aria-hidden="true"
          role="button"
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onClick={handleHandleClick}
          onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ' ? handleHandleClick() : undefined)}
        />
        <div className="filters-modal__body">
          <FiltersContent {...contentProps} />
        </div>
      </div>
    </div>,
    document.body,
  );
};
