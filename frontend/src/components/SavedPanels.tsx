import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

import type { Placement } from '../types/placement';
import { LogoImage } from './LogoImage';
import { Tooltip } from './Tooltip';

export type HomeRequirementState = {
  text: string;
  tooltip: string;
  ready: boolean;
};

export type SavedPanelsProps = {
  activeTab: 'added' | 'applications';
  addedCount: number;
  applicationsCount: number;
  addedPlacements: Placement[];
  appliedPlacements: Placement[];
  onTabChange: (tab: 'added' | 'applications') => void;
  onRemoveAdded: (id: number) => void;
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

const EmptyAddedState = () => (
  <div className="empty-state">
    <div className="empty-state-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
    </div>
    <p>Nothing added yet</p>
    <p style={{ fontSize: '12px', marginTop: '8px' }}>Use the Add button on placements to collect them here</p>
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
    <p style={{ fontSize: '12px', marginTop: '8px' }}>Add placements and click &quot;Apply to Added&quot; when ready</p>
  </div>
);

export const SavedPanels = ({
  activeTab,
  addedCount,
  applicationsCount,
  addedPlacements,
  appliedPlacements,
  onTabChange,
  onRemoveAdded,
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
  const [requirementBannerVisible, setRequirementBannerVisible] = useState(!homeRequirement.ready);
  const [failedApplyAttempts, setFailedApplyAttempts] = useState(0);
  const [highlightActive, setHighlightActive] = useState(false);
  const highlightTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const shakeMotion = { x: [0, -8, 8, -4, 4, 0], rotate: [0, -2, 2, -1, 1, 0], scale: 1.02 };

  // Jump arc and spin are controlled separately so they can be tuned independently
  const jumpMotion = {
    x: 0,
    y: [0, -140, -155, 0, -30, 0],
    scaleX: [1, 1.03, 1.02, 1],
    scaleY: [1, 0.9, 0.96, 1],
  };

  const spinMotion = { rotate: [90, 370, 360] };

  const jumpTransition = {
    y: {
      duration: 0.8,
      ease: ['easeOut', 'linear', 'easeIn', 'easeOut', 'easeIn'],
      times: [0, 0.22, 0.48, 0.78, 0.9, 1],
    },
    scaleX: { duration: 0.3, ease: ['easeOut', 'linear', 'easeIn'], times: [0, 0.25, 0.5, 1] },
    scaleY: { duration: 0.3, ease: ['easeOut', 'linear', 'easeIn'], times: [0, 0.25, 0.5, 1] },
  };

  const spinTransition = { rotate: { duration: 0.8, ease: 'easeOut', times: [0, 0.5, 1] } };

  useEffect(() => {
    if (!homeRequirement.ready) {
      setRequirementBannerVisible(true);
      return;
    }
    const timeout = window.setTimeout(() => {
      setRequirementBannerVisible(false);
    }, 1000);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [homeRequirement.ready]);

  useEffect(() => {
    if (homeRequirement.ready) {
      setFailedApplyAttempts(0);
      setHighlightActive(false);
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }
    }
  }, [homeRequirement.ready]);

  useEffect(
    () => () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    },
    [],
  );

  const addedEmpty = addedPlacements.length === 0;
  const applicationsEmpty = appliedPlacements.length === 0;
  const attentionLevel = failedApplyAttempts === 0 ? 0 : failedApplyAttempts % 2 === 1 ? 1 : 2;
  const bannerClasses = [
    'home-requirement-banner',
    homeRequirement.ready ? 'met' : '',
    attentionLevel === 1 && highlightActive ? 'home-requirement-banner--highlight' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const bannerButtonSpacing = mobileMode ? -15 : -15; 
  const bannerContentPadding = mobileMode ? '8px 12px' : '8px 16px';

  const triggerBannerAttention = useCallback(() => {
    setRequirementBannerVisible(true);
    setFailedApplyAttempts((prev) => {
      const next = prev + 1;
      if (next % 2 === 1) {
        if (highlightTimeoutRef.current) {
          window.clearTimeout(highlightTimeoutRef.current);
        }
        setHighlightActive(true);
        highlightTimeoutRef.current = window.setTimeout(() => {
          setHighlightActive(false);
          highlightTimeoutRef.current = null;
        }, 800);
      }
      return next;
    });
  }, []);

  const handleApplyClick = useCallback(() => {
    if (!homeRequirement.ready) {
      triggerBannerAttention();
      return;
    }
    onApplyToSelected();
  }, [homeRequirement.ready, onApplyToSelected, triggerBannerAttention]);

  const activeHeading = heading ?? (activeTab === 'added' ? 'Added' : 'Applied');
  const activeHeadingCount = activeTab === 'added' ? addedCount : applicationsCount;

  const panelClassName = ['saved-panels', mobileMode ? 'saved-panels--mobile' : ''].filter(Boolean).join(' ');
  const addedTabDisplay = activeTab === 'added' ? (mobileMode ? 'block' : 'flex') : 'none';
  const applicationsTabDisplay = activeTab === 'applications' ? (mobileMode ? 'block' : 'flex') : 'none';
  const buttonStateClass =
    applyButtonDisabled || !homeRequirement.ready ? 'btn-submit-all--neutral' : 'btn-submit-all--ready';
  const buttonClasses = ['btn-submit-all', buttonStateClass].filter(Boolean).join(' ');

  const submitButton = (
    <button
      type="button"
      className={buttonClasses}
      id="applyAllBtn"
      onClick={handleApplyClick}
      aria-disabled={applyButtonDisabled}
      disabled={applyButtonDisabled}
    >
      {applyButtonLabel}
    </button>
  );

  const requirementBanner = !requirementBannerVisible ? null : (
    <div
      className="saved-panel__apply-banner"
      style={{
        marginBottom: `${bannerButtonSpacing}px`,
      }}
    >
      <Tooltip content={homeRequirement.tooltip}>
        <motion.div
          key={failedApplyAttempts}
          className={bannerClasses}
          style={{ overflow: 'visible', padding: bannerContentPadding }}
          initial={false}
          animate={
            attentionLevel === 0
              ? { x: 0, y: 0, rotate: 0, scale: 1, scaleX: 1, scaleY: 1 }
              : attentionLevel === 1
                ? shakeMotion
                : { ...jumpMotion, ...spinMotion }
          }
          transition={
            attentionLevel === 1
              ? { duration: 0.6, ease: 'easeInOut' }
              : attentionLevel === 2
                ? { ...jumpTransition, ...spinTransition }
                : { duration: 0.3 }
          }
        >
          <span className="home-requirement-banner-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </span>
          <span className="home-requirement-text">{homeRequirement.text}</span>
        </motion.div>
      </Tooltip>
    </div>
  );

  const submitContent = (
    <>
      {requirementBanner}
      {submitButton}
    </>
  );

  const desktopSubmitWrapperStyle = {
    overflow: 'visible',
    padding: '0 14px',
  };
  const submitSection = mobileMode ? (
    <div className="saved-panels__mobile-submit">
      {submitContent}
    </div>
  ) : (
    <div className="saved-panel__footer" style={desktopSubmitWrapperStyle}>
      {submitContent}
    </div>
  );

  return (
    <div className={panelClassName}>
      {showTabs ? (
        <div className="sidebar-tabs">
          <button type="button" className={`tab ${activeTab === 'added' ? 'active' : ''}`} onClick={() => onTabChange('added')}>
            Added
            <span className="tab-count" id="addedCount">
              {addedCount}
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

      <div id="addedTab" className="tab-content" style={{ display: addedTabDisplay }}>
        <div className="saved-panel__scroll">
          <div className="saved-list" id="addedList">
            {addedEmpty ? (
              <EmptyAddedState />
            ) : (
              addedPlacements.map((placement) => {
                const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onShowInfo(placement.id);
                  }
                };
                return (
                  <div
                    className="saved-item saved-card saved-card--added"
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
                          {placement.homeArea && (
                            <>
                              <span className="saved-card__chip">Your area</span>
                              <span className="saved-card__meta-dot" aria-hidden="true"></span>
                            </>
                          )}
                          <span className="saved-card__company">{placement.company}</span>
                        </div>
                      </div>
                    </div>
                    <div className="saved-card__footer saved-card__footer--applied">
                      <button
                        type="button"
                        className="saved-card__pill danger"
                        title="Remove from Added list"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRemoveAdded(placement.id);
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Remove
                      </button>
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
                          {placement.homeArea && (
                            <>
                              <span className="saved-card__chip">Your area</span>
                              <span className="saved-card__meta-dot" aria-hidden="true"></span>
                            </>
                          )}
                          <span className="saved-card__company">{placement.company}</span>
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

