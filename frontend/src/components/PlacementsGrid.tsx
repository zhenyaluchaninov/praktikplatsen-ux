import type { ReactNode } from 'react';

import type { SortOption } from '../hooks/usePlacements';
import type { Placement } from '../types/placement';
import { LogoImage } from './LogoImage';
import { SortControl } from './SortControl';

interface PlacementsGridProps {
  placements: Placement[];
  wishlist: number[];
  onToggleWishlist: (id: number) => void;
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
  wishlist,
  onToggleWishlist,
  onShowDetails,
  resultsLabel,
  sortOption,
  onSortChange,
  searchValue,
}: PlacementsGridProps) => {
  return (
    <main className="cards-section">
      <div className="results-header">
        <p className="results-label" aria-hidden="true">
          {resultsLabel}
        </p>
        <SortControl sortOption={sortOption} onSortChange={onSortChange} triggerLabel="Sort" />
        <span className="sr-only" role="status" aria-live="polite" id="resultsCount">
          {resultsLabel}
        </span>
      </div>

      <div className="cards-grid" id="cardsGrid">
        {placements.map((placement) => {
          const isWishlisted = wishlist.includes(placement.id);
          return (
            <div className="placement-card" key={placement.id}>
              <div className="card-header">
                <div className="company-logo">
                  <LogoImage placement={placement} />
                </div>
                <div className="card-content">
                  <div className="card-title">{highlightMatch(placement.title, searchValue)}</div>
                  <div className="card-company">{highlightMatch(placement.company, searchValue)}</div>
                </div>
                <div className="card-actions">
                  <button
                    type="button"
                    className={`icon-btn ${isWishlisted ? 'wishlisted' : ''}`}
                    onClick={() => onToggleWishlist(placement.id)}
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <svg
                      className="heart-icon"
                      viewBox="0 0 24 24"
                      fill={isWishlisted ? 'currentColor' : 'none'}
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
                <button type="button" className="btn-details" onClick={() => onShowDetails(placement.id)}>
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
                  Info
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

