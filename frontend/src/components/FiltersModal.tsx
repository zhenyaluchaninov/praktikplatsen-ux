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
  '--filters-drag-offset'?: string;
};

export const FiltersModal = ({ open, onClose, ...contentProps }: FiltersModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.body.classList.add('modal-open');
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
    return () => {
      previouslyFocused?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setExpanded(false);
      setDragDelta(0);
      dragStartRef.current = null;
      setIsDragging(false);
    }
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
      if (delta > 60) {
        onClose();
      } else if (delta < -60) {
        setExpanded(true);
      } else if (Math.abs(delta) < 20 && !expanded) {
        setExpanded(true);
      }
      dragStartRef.current = null;
      setDragDelta(0);
      setIsDragging(false);
    },
    [expanded, onClose],
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
    setExpanded((prev) => !prev);
  };

  if (!open) {
    return null;
  }

  const dragOffset = Math.max(Math.min(dragDelta, 240), -240);
  const panelClasses = ['filters-modal__panel', expanded ? 'filters-modal__panel--expanded' : '']
    .filter(Boolean)
    .join(' ');
  const panelStyle: PanelStyle = { '--filters-drag-offset': `${dragOffset}px` };

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
