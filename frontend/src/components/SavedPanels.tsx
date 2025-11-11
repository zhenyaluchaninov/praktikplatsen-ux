import type { Placement } from '../types/placement';
import { Tooltip } from './Tooltip';

export type HomeRequirementState = {
  met: boolean;
  text: string;
  tooltip: string;
  display: string;
  blocking: boolean;
  ready: boolean;
};

export type SavedPanelsProps = {
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
  homeRequirement: HomeRequirementState;
  showTabs?: boolean;
  heading?: string;
  showMobileHeading?: boolean;
  mobileMode?: boolean;
};

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
    <p style={{ fontSize: '12px', marginTop: '8px' }}>Select favorites and click &quot;Apply to Selected&quot;</p>
  </div>
);

export const SavedPanels = ({
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
  homeRequirement,
  showTabs = true,
  heading,
  showMobileHeading = true,
  mobileMode = false,
}: SavedPanelsProps) => {
  const favoritesEmpty = favoritePlacements.length === 0;
  const applicationsEmpty = appliedPlacements.length === 0;
  const applyButtonTooltip = applyButtonDisabled && homeRequirement.blocking ? homeRequirement.tooltip : undefined;
  const bannerClasses = ['home-requirement-banner', homeRequirement.ready ? 'met' : ''].filter(Boolean).join(' ');

  const activeHeading = heading ?? (activeTab === 'favorites' ? 'Wishlist' : 'Applied');
  const activeHeadingCount = activeTab === 'favorites' ? favoritesCount : applicationsCount;

  const panelClassName = ['saved-panels', mobileMode ? 'saved-panels--mobile' : ''].filter(Boolean).join(' ');

  const submitButton = (
    <button
      type="button"
      className="btn-submit-all"
      id="applyAllBtn"
      onClick={onApplyToSelected}
      disabled={applyButtonDisabled}
    >
      {applyButtonLabel}
    </button>
  );

  const submitButtonWithTooltip = <Tooltip content={applyButtonTooltip}>{submitButton}</Tooltip>;
  const submitSection = mobileMode ? <div className="saved-panels__mobile-submit">{submitButtonWithTooltip}</div> : submitButtonWithTooltip;

  return (
    <div className={panelClassName}>
      {showTabs ? (
        <div className="sidebar-tabs">
          <button type="button" className={`tab ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => onTabChange('favorites')}>
            Favorites
            <span className="tab-count" id="favoritesCount">
              {favoritesCount}
            </span>
          </button>
          <button type="button" className={`tab ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => onTabChange('applications')}>
            Applied
            <span className="tab-count" id="applicationsCount">
              {applicationsCount}
            </span>
          </button>
        </div>
      ) : showMobileHeading ? (
        <div className="saved-panels__mobile-heading">
          <div className="saved-panels__mobile-heading-text">
            <span className="saved-panels__mobile-eyebrow">Saved</span>
            <h2 className="saved-panels__mobile-title">{activeHeading}</h2>
          </div>
          <span className="saved-panels__mobile-count">{activeHeadingCount}</span>
        </div>
      ) : null}

      <div id="favoritesTab" className="tab-content" style={{ display: activeTab === 'favorites' ? 'block' : 'none' }}>
        <div
          className="saved-controls"
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

        <Tooltip content={homeRequirement.tooltip}>
          <div className={bannerClasses}>
            <span className="home-requirement-banner-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </span>
            <span className="home-requirement-text">{homeRequirement.text}</span>
          </div>
        </Tooltip>

        <div className="saved-list" id="favoritesList">
          {favoritesEmpty ? (
            <EmptyFavoriteState />
          ) : (
            favoritePlacements.map((placement) => {
              const isSelected = selectedFavorites.includes(placement.id);
              return (
                <div className={`saved-item ${isSelected ? 'selected' : ''}`} key={placement.id}>
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

        {submitSection}
      </div>

      <div id="applicationsTab" className="tab-content" style={{ display: activeTab === 'applications' ? 'block' : 'none' }}>
        {!applicationsEmpty && (
          <div className="applications-info">
            <span className="applications-info-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </span>
            <div>Your applications are being reviewed. You'll be notified via email as soon as there are updates.</div>
          </div>
        )}
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
      </div>
    </div>
  );
};
