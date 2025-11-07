import type { ChangeEvent, MouseEvent } from 'react';

import type { SortOption } from '../hooks/usePlacements';
import type { Placement } from '../types/placement';

interface PlacementsGridProps {
  placements: Placement[];
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  onShowDetails: (id: number) => void;
  resultsLabel: string;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

export const PlacementsGrid = ({
  placements,
  favorites,
  onToggleFavorite,
  onShowDetails,
  resultsLabel,
  sortOption,
  onSortChange,
}: PlacementsGridProps) => {
  const handleCardClick = (id: number) => (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    onShowDetails(id);
  };

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onSortChange(event.target.value as SortOption);
  };

  return (
    <main className="cards-section">
      <div className="results-header">
        <div className="results-count" id="resultsCount">
          {resultsLabel}
        </div>
        <select className="sort-dropdown" value={sortOption} onChange={handleSortChange}>
          <option value="recommended">Recommended</option>
          <option value="newest">Newest First</option>
          <option value="available">Most Available</option>
          <option value="alphabetical">Alphabetical (A–Z)</option>
          <option value="homeArea">Home Area First</option>
        </select>
      </div>

      <div className="cards-grid" id="cardsGrid">
        {placements.map((placement) => {
          const isFavorited = favorites.includes(placement.id);
          return (
            <div className="placement-card" key={placement.id} onClick={handleCardClick(placement.id)}>
              <div className="card-header">
                <div className="company-logo">{placement.logo}</div>
                <div className="card-content">
                  <div className="card-title">{placement.title}</div>
                  <div className="card-company">{placement.company}</div>
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
                  <div className="meta-item">
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
                    Your area
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
