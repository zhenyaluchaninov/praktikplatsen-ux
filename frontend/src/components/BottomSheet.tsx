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

export const BottomSheet = ({ enabled, ...savedPanelsProps }: BottomSheetProps) => {
  const [expanded, setExpanded] = useState(false);
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef<number | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!isDragging) {
      return;
    }
    const handleMove = (event: PointerEvent) => {
      if (dragStartYRef.current === null) {
        return;
      }
      setDragDelta(event.clientY - dragStartYRef.current);
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

  const beginDrag = useCallback((clientY: number) => {
    dragStartYRef.current = clientY;
    setDragDelta(0);
    setIsDragging(true);
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled) {
      return;
    }
    event.preventDefault();
    beginDrag(event.clientY);
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

  const dragOffset = Math.max(Math.min(dragDelta, 320), -320);
  const sheetStyle: SheetStyle = { '--sheet-drag-offset': `${dragOffset}px` };

  return (
    <>
      <div className={`bottom-sheet-backdrop ${expanded ? 'visible' : ''}`} onClick={() => setExpanded(false)} aria-hidden="true" />
      <div className={`bottom-sheet ${expanded ? 'expanded' : 'collapsed'}`} style={sheetStyle}>
        <div
          className="bottom-sheet__header"
          ref={headerRef}
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          onClick={handlePointerClick}
          onPointerDown={handlePointerDown}
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
