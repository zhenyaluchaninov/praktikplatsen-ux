import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';

import type { SortOption } from '../hooks/usePlacements';
import type { Placement } from '../types/placement';

const SORT_OPTION_LABELS: Record<SortOption, string> = {
  recommended: 'Recommended',
  newest: 'Newest First',
  available: 'Most Available',
  alphabetical: 'Alphabetical (A-Z)',
  homeArea: 'Home Area First',
};

const SORT_OPTIONS: SortOption[] = ['recommended', 'newest', 'available', 'alphabetical', 'homeArea'];

interface PlacementsGridProps {
  placements: Placement[];
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  onShowDetails: (id: number) => void;
  resultsLabel: string;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  searchValue: string;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightMatch = (text: string, query: string): ReactNode => {
  const trimmed = query.trim();
  if (!trimmed) {
    return text;
  }

  const regex = new RegExp(`(${escapeRegExp(trimmed)})`, 'ig');
  const parts = text.split(regex);

  if (parts.length === 1) {
    return text;
  }

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark key={`${part}-${index}`} className="search-highlight">
        {part}
      </mark>
    ) : (
      part
    ),
  );
};

export const PlacementsGrid = ({
  placements,
  favorites,
  onToggleFavorite,
  onShowDetails,
  resultsLabel,
  sortOption,
  onSortChange,
  searchValue,
}: PlacementsGridProps) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (id: number) => (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    onShowDetails(id);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!sortRef.current?.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSortSelect = (value: SortOption) => {
    onSortChange(value);
    setIsSortOpen(false);
  };

  return (
    <main className="cards-section">
      <div className="results-header">
        <div className="results-count" id="resultsCount">
          {resultsLabel}
        </div>
        <div className="sort-control" ref={sortRef}>
          <button
            type="button"
            className={`sort-trigger ${isSortOpen ? 'open' : ''}`}
            onClick={() => setIsSortOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isSortOpen}
          >
            <span className="sort-trigger-text">Sort by {SORT_OPTION_LABELS[sortOption] ?? 'Recommended'}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          {isSortOpen && (
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
      </div>

      <div className="cards-grid" id="cardsGrid">
        {placements.map((placement) => {
          const isFavorited = favorites.includes(placement.id);
          return (
            <div className="placement-card" key={placement.id} onClick={handleCardClick(placement.id)}>
              <div className="card-header">
                <div className="company-logo">{placement.logo}</div>
                <div className="card-content">
                  <div className="card-title">{highlightMatch(placement.title, searchValue)}</div>
                  <div className="card-company">{highlightMatch(placement.company, searchValue)}</div>
                </div>
                <div className="card-actions">
                  <button
                    type="button"
                    className={`icon-btn ${isFavorited ? 'favorited' : ''}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleFavorite(placement.id);
                    }}
                    title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg
                      className="heart-icon"
                      viewBox="0 0 24 24"
                      fill={isFavorited ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="card-meta">
                <div className="meta-item">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {placement.location}
                </div>
                <div className="meta-item">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  {placement.spots}/{placement.totalSpots} spots
                </div>
                {placement.homeArea && (
                  <div className="meta-item home-area">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span>Your area</span>
                  </div>
                )}
              </div>
              <div className="card-footer">
                <button
                  type="button"
                  className="btn-details"
                  onClick={(event) => {
                    event.stopPropagation();
                    onShowDetails(placement.id);
                  }}
                >
                  <svg
                    style={{
                      width: '14px',
                      height: '14px',
                      display: 'inline-block',
                      verticalAlign: 'middle',
                      marginRight: '4px',
                    }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="loading-more" id="loadingMore" style={{ display: 'none' }}>
        Loading more placements...
      </div>
    </main>
  );
};
