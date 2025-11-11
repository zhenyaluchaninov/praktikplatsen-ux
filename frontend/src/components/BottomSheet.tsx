import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';

import type { SavedPanelsProps } from './SavedPanels';
import { SavedPanels } from './SavedPanels';

type BottomSheetProps = SavedPanelsProps & {
  enabled: boolean;
};

type SheetStyle = CSSProperties & {
  '--sheet-drag-offset'?: string;
};

const GRAB_ZONE_EXTENSION_TOP = 50;
const GRAB_ZONE_EXTENSION_BOTTOM = 440;
const DRAG_ACTIVATION_THRESHOLD = 8;
const MAX_DRAG_OFFSET = 640;

export const BottomSheet = ({ enabled, ...savedPanelsProps }: BottomSheetProps) => {
  const [expanded, setExpanded] = useState(false);
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [trackedPointerId, setTrackedPointerId] = useState<number | null>(null);
  const dragStartYRef = useRef<number | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const dragCandidateRef = useRef<{
    pointerId: number;
    startY: number;
    hasStarted: boolean;
  } | null>(null);

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove('sheet-open');
      setExpanded(false);
      return;
    }
    document.body.classList.toggle('sheet-open', expanded);
    return () => {
      document.body.classList.remove('sheet-open');
    };
  }, [expanded, enabled]);

  const finishDrag = useCallback(
    (clientY: number | null) => {
      if (dragStartYRef.current === null || clientY === null) {
        dragStartYRef.current = null;
        setDragDelta(0);
        setIsDragging(false);
        return;
      }
      const delta = clientY - dragStartYRef.current;
      if (delta < -60) {
        setExpanded(true);
      } else if (delta > 60) {
        setExpanded(false);
      }
      dragStartYRef.current = null;
      setDragDelta(0);
      setIsDragging(false);
    },
    [],
  );

  const beginDrag = useCallback((clientY: number) => {
    dragStartYRef.current = clientY;
    setDragDelta(0);
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (trackedPointerId === null) {
      return;
    }
    const handleMove = (event: PointerEvent) => {
      if (event.pointerId !== trackedPointerId) {
        return;
      }
      const candidate = dragCandidateRef.current;
      if (!candidate) {
        return;
      }
      if (!candidate.hasStarted) {
        const delta = event.clientY - candidate.startY;
        if (Math.abs(delta) >= DRAG_ACTIVATION_THRESHOLD) {
          candidate.hasStarted = true;
          beginDrag(candidate.startY);
        } else {
          return;
        }
      }
      if (dragStartYRef.current === null) {
        return;
      }
      setDragDelta(event.clientY - dragStartYRef.current);
    };
    const handleEnd = (event: PointerEvent) => {
      if (event.pointerId !== trackedPointerId) {
        return;
      }
      const candidate = dragCandidateRef.current;
      dragCandidateRef.current = null;
      setTrackedPointerId(null);
      if (candidate?.hasStarted) {
        finishDrag(event.clientY);
      }
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
    };
  }, [beginDrag, finishDrag, trackedPointerId]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled || trackedPointerId !== null || !headerRef.current) {
      return;
    }
    const { top, bottom } = headerRef.current.getBoundingClientRect();
    const grabZoneTop = top - GRAB_ZONE_EXTENSION_TOP;
    const grabZoneBottom = bottom + GRAB_ZONE_EXTENSION_BOTTOM;
    if (event.clientY < grabZoneTop || event.clientY > grabZoneBottom) {
      return;
    }
    dragCandidateRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      hasStarted: false,
    };
    setTrackedPointerId(event.pointerId);
  };

  const handlePointerClick = () => {
    if (isDragging) {
      return;
    }
    setExpanded((prev) => !prev);
  };

  if (!enabled) {
    return null;
  }

  const dragOffsetLimit = MAX_DRAG_OFFSET;
  const dragOffset = Math.max(Math.min(dragDelta, dragOffsetLimit), -dragOffsetLimit);
  const sheetStyle: SheetStyle = { '--sheet-drag-offset': `${dragOffset}px` };
  const sheetClassName = `bottom-sheet ${expanded ? 'expanded' : 'collapsed'}${isDragging ? ' dragging' : ''}`;

  return (
    <>
      <div className={`bottom-sheet-backdrop ${expanded ? 'visible' : ''}`} onClick={() => setExpanded(false)} aria-hidden="true" />
      <div className={sheetClassName} style={sheetStyle} onPointerDown={handlePointerDown}>
        <div
          className="bottom-sheet__header"
          ref={headerRef}
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          onClick={handlePointerClick}
          onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && handlePointerClick()}
        >
          <div className="bottom-sheet__grip" aria-hidden="true" />
          <span className="sr-only">
            Favorites {savedPanelsProps.favoritesCount}, applied {savedPanelsProps.applicationsCount}. Tap to open saved placements panel.
          </span>
        </div>
        <div className="bottom-sheet__content">
          <SavedPanels {...savedPanelsProps} />
        </div>
      </div>
    </>
  );
};
