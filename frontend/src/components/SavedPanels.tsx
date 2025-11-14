import type { KeyboardEvent } from 'react';

import type { Placement } from '../types/placement';
import { LogoImage } from './LogoImage';
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
  activeTab: 'wishlist' | 'applications';
  wishlistCount: number;
  applicationsCount: number;
  wishlistPlacements: Placement[];
  appliedPlacements: Placement[];
  selectedWishlist: number[];
  onTabChange: (tab: 'wishlist' | 'applications') => void;
  onToggleWishlistSelection: (id: number) => void;
  onSelectAllWishlist: () => void;
  onDeselectAllWishlist: () => void;
  onRemoveWishlist: (id: number) => void;
  onApplyToSelected: () => void;
  onWithdrawApplication: (id: number) => void;
  onShowInfo: (id: number) => void;
  applyButtonLabel: string;
  applyButtonDisabled: boolean;
  homeRequirement: HomeRequirementState;
  showTabs?: boolean;
  heading?: string;
  showMobileHeading?: boolean;
  mobileMode?: boolean;
};

const EmptyWishlistState = () => (
  <div className="empty-state">
    <div className="empty-state-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </div>
    <p>No wishlist yet</p>
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
    <p style={{ fontSize: '12px', marginTop: '8px' }}>Select wishlist placements and click &quot;Apply to Selected&quot;</p>
  </div>
);

export const SavedPanels = ({
  activeTab,
  wishlistCount,
  applicationsCount,
  wishlistPlacements,
  appliedPlacements,
  selectedWishlist,
  onTabChange,
  onToggleWishlistSelection,
  onSelectAllWishlist,
  onDeselectAllWishlist,
  onRemoveWishlist,
  onApplyToSelected,
  onWithdrawApplication,
  onShowInfo,
  applyButtonLabel,
  applyButtonDisabled,
  homeRequirement,
  showTabs = true,
  heading,
  showMobileHeading = true,
  mobileMode = false,
}: SavedPanelsProps) => {
  const wishlistEmpty = wishlistPlacements.length === 0;
  const applicationsEmpty = appliedPlacements.length === 0;
  const applyButtonTooltip = applyButtonDisabled && homeRequirement.blocking ? homeRequirement.tooltip : undefined;
  const bannerClasses = ['home-requirement-banner', homeRequirement.ready ? 'met' : ''].filter(Boolean).join(' ');

  const activeHeading = heading ?? (activeTab === 'wishlist' ? 'Wishlist' : 'Applied');
  const activeHeadingCount = activeTab === 'wishlist' ? wishlistCount : applicationsCount;

  const panelClassName = ['saved-panels', mobileMode ? 'saved-panels--mobile' : ''].filter(Boolean).join(' ');
  const wishlistTabDisplay = activeTab === 'wishlist' ? (mobileMode ? 'block' : 'flex') : 'none';
  const applicationsTabDisplay = activeTab === 'applications' ? (mobileMode ? 'block' : 'flex') : 'none';

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
  const submitSection = mobileMode ? (
    <div className="saved-panels__mobile-submit">{submitButtonWithTooltip}</div>
  ) : (
    <div className="saved-panel__footer">{submitButtonWithTooltip}</div>
  );

  return (
    <div className={panelClassName}>
      {showTabs ? (
        <div className="sidebar-tabs">
          <button type="button" className={`tab ${activeTab === 'wishlist' ? 'active' : ''}`} onClick={() => onTabChange('wishlist')}>
            Wishlist
            <span className="tab-count" id="wishlistCount">
              {wishlistCount}
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

      <div id="wishlistTab" className="tab-content" style={{ display: wishlistTabDisplay }}>
        <div className="saved-panel__header">
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
                onClick={onSelectAllWishlist}
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
                onClick={onDeselectAllWishlist}
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
        </div>

        <div className="saved-panel__scroll">
          <div className="saved-list" id="wishlistList">
            {wishlistEmpty ? (
              <EmptyWishlistState />
            ) : (
              wishlistPlacements.map((placement) => {
                const isSelected = selectedWishlist.includes(placement.id);
                const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onShowInfo(placement.id);
                  }
                };
                return (
                  <div
                    className={`saved-item saved-card saved-card--wishlist ${isSelected ? 'selected' : ''}`}
                    key={placement.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onShowInfo(placement.id)}
                    onKeyDown={handleCardKeyDown}
                  >
                    <div className="saved-card__main">
                      <div className="saved-card__logo company-logo company-logo--compact">
                        <LogoImage placement={placement} />
                      </div>
                      <div className="saved-card__info">
                        <div className="saved-card__title">{placement.title}</div>
                        <div className="saved-card__meta">
                          <span className="saved-card__company">{placement.company}</span>
                          {placement.homeArea && <span className="saved-card__chip">Your Area</span>}
                        </div>
                      </div>
                    </div>
                    <div className="saved-card__footer saved-card__footer--wishlist">
                      <button
                        type="button"
                        className={`saved-card__primary-btn ${isSelected ? 'is-selected' : ''}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onToggleWishlistSelection(placement.id);
                        }}
                        aria-pressed={isSelected}
                      >
                        {isSelected ? (
                          <>
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Selected
                          </>
                        ) : (
                          'Select'
                        )}
                      </button>
                      <div className="saved-card__secondary">
                        <button
                          type="button"
                          className="saved-card__icon-btn danger"
                          title="Remove from wishlist"
                          onClick={(event) => {
                            event.stopPropagation();
                            onRemoveWishlist(placement.id);
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {submitSection}
      </div>

      <div id="applicationsTab" className="tab-content" style={{ display: applicationsTabDisplay }}>
        {!applicationsEmpty && (
          <div className="saved-panel__header">
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
          </div>
        )}
        <div className="saved-panel__scroll">
          <div className="saved-list" id="applicationsList">
            {applicationsEmpty ? (
              <EmptyApplicationsState />
            ) : (
              appliedPlacements.map((placement) => {
                const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onShowInfo(placement.id);
                  }
                };
                return (
                  <div
                    className="saved-item saved-card saved-card--applied"
                    key={placement.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onShowInfo(placement.id)}
                    onKeyDown={handleCardKeyDown}
                  >
                    <div className="saved-card__main">
                      <div className="saved-card__logo company-logo company-logo--compact">
                        <LogoImage placement={placement} />
                    </div>
                    <div className="saved-card__info">
                      <div className="saved-card__title">{placement.title}</div>
                      <div className="saved-card__meta">
                        <span className="saved-card__company">{placement.company}</span>
                        {placement.homeArea && <span className="saved-card__chip">Your Area</span>}
                      </div>
                    </div>
                  </div>
                    <div className="saved-card__footer saved-card__footer--applied">
                      <button
                        type="button"
                        className="saved-card__pill danger"
                        onClick={(event) => {
                          event.stopPropagation();
                          onWithdrawApplication(placement.id);
                        }}
                        title="Withdraw application"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
