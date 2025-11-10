import { useEffect, useRef, useState } from 'react';

import type { SortOption } from '../hooks/usePlacements';

export const SORT_OPTION_LABELS: Record<SortOption, string> = {
  recommended: 'Recommended',
  newest: 'Newest First',
  available: 'Most Available',
  alphabetical: 'Alphabetical (A-Z)',
  homeArea: 'Home Area First',
};

const SORT_OPTIONS: SortOption[] = ['recommended', 'newest', 'available', 'alphabetical', 'homeArea'];

type SortControlProps = {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  triggerLabel?: string;
  className?: string;
};

export const SortControl = ({ sortOption, onSortChange, triggerLabel = 'Sort by', className }: SortControlProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSortSelect = (value: SortOption) => {
    onSortChange(value);
    setIsOpen(false);
  };

  return (
    <div className={`sort-control ${className ?? ''}`.trim()} ref={containerRef}>
      <button
        type="button"
        className={`sort-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="sort-trigger-text">
          {triggerLabel} {SORT_OPTION_LABELS[sortOption] ?? SORT_OPTION_LABELS.recommended}
        </span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      {isOpen && (
        <div className="sort-menu" role="listbox">
          {SORT_OPTIONS.map((option) => (
            <button
              type="button"
              key={option}
              className={`sort-option ${sortOption === option ? 'active' : ''}`}
              onClick={() => handleSortSelect(option)}
              role="option"
              aria-selected={sortOption === option}
            >
              <span className="sort-option-indicator" aria-hidden="true">
                <span className="sort-option-indicator-dot" />
              </span>
              <span className="sort-option-label">{SORT_OPTION_LABELS[option]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
