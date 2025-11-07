import type { Placement } from '../types/placement';

interface RightSidebarProps {
  activeTab: 'favorites' | 'applications';
  favoritesCount: number;
  applicationsCount: number;
  favoritePlacements: Placement[];
  appliedPlacements: Placement[];
  selectedFavorites: number[];
  onTabChange: (tab: 'favorites' | 'applications') => void;
  onToggleFavoriteSelection: (id: number) => void;
  onSelectAllFavorites: () => void;
  onDeselectAllFavorites: () => void;
  onRemoveFavorite: (id: number) => void;
  onApplyToSelected: () => void;
  onWithdrawApplication: (id: number) => void;
  applyButtonLabel: string;
  applyButtonDisabled: boolean;
}

const EmptyFavoriteState = () => (
  <div className="empty-state">
    <div className="empty-state-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </div>
    <p>No favorites yet</p>
    <p style={{ fontSize: '12px', marginTop: '8px' }}>Click the heart icon on placements to save them here</p>
  </div>
);

const EmptyApplicationsState = () => (
  <div className="empty-state">
    <div className="empty-state-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    </div>
    <p>No applications yet</p>
    <p style={{ fontSize: '12px', marginTop: '8px' }}>Select favorites and click "Apply to Selected"</p>
  </div>
);

export const RightSidebar = ({
  activeTab,
  favoritesCount,
  applicationsCount,
  favoritePlacements,
  appliedPlacements,
  selectedFavorites,
  onTabChange,
  onToggleFavoriteSelection,
  onSelectAllFavorites,
  onDeselectAllFavorites,
  onRemoveFavorite,
  onApplyToSelected,
  onWithdrawApplication,
  applyButtonLabel,
  applyButtonDisabled,
}: RightSidebarProps) => {
  const favoritesEmpty = favoritePlacements.length === 0;
  const applicationsEmpty = appliedPlacements.length === 0;

  return (
    <aside className="right-sidebar">
      <div className="sidebar-card">
        <div className="sidebar-tabs">
          <button
            type="button"
            className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => onTabChange('favorites')}
          >
            Favorites
            <span className="tab-count" id="favoritesCount">
              {favoritesCount}
            </span>
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => onTabChange('applications')}
          >
            Applied
            <span className="tab-count" id="applicationsCount">
              {applicationsCount}
            </span>
          </button>
        </div>

        <div id="favoritesTab" className="tab-content" style={{ display: activeTab === 'favorites' ? 'block' : 'none' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <span style={{ fontSize: '13px', color: '#666', fontWeight: 600 }}>Select placements to apply:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={onSelectAllFavorites}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FF9933',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={onDeselectAllFavorites}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="saved-list" id="favoritesList">
            {favoritesEmpty ? (
              <EmptyFavoriteState />
            ) : (
              favoritePlacements.map((placement) => {
                const isSelected = selectedFavorites.includes(placement.id);
                return (
                  <div
                    key={placement.id}
                    className={`saved-item ${isSelected ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      className="saved-item-checkbox"
                      id={`fav-${placement.id}`}
                      checked={isSelected}
                      onChange={() => onToggleFavoriteSelection(placement.id)}
                    />
                    <label htmlFor={`fav-${placement.id}`} className="saved-item-info" style={{ cursor: 'pointer' }}>
                      <div className="saved-item-title">{placement.title}</div>
                      <div className="saved-item-company">{placement.company}</div>
                    </label>
                    <div className="saved-item-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        title="Remove from favorites"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRemoveFavorite(placement.id);
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <button
            type="button"
            className="btn-submit-all"
            id="applyAllBtn"
            onClick={onApplyToSelected}
            disabled={applyButtonDisabled}
          >
            {applyButtonLabel}
          </button>
        </div>

        <div
          id="applicationsTab"
          className="tab-content"
          style={{ display: activeTab === 'applications' ? 'block' : 'none' }}
        >
          <div className="saved-list" id="applicationsList">
            {applicationsEmpty ? (
              <EmptyApplicationsState />
            ) : (
              appliedPlacements.map((placement) => (
                <div className="saved-item" key={placement.id}>
                  <div className="saved-item-info">
                    <div className="saved-item-title">{placement.title}</div>
                    <div className="saved-item-company">{placement.company}</div>
                  </div>
                  <div className="saved-item-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      title="Withdraw application"
                      onClick={(event) => {
                        event.stopPropagation();
                        onWithdrawApplication(placement.id);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              background: '#E8F5E9',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#2E7D32',
            }}
          >
            ℹ️ Your applications are being reviewed. You'll be notified of any updates.
          </div>
        </div>
      </div>
    </aside>
  );
};
