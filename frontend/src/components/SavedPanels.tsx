import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { AnimatePresence, easeInOut, motion, type Transition } from 'framer-motion';

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
  activeTab: 'added' | 'applications';
  addedCount: number;
  applicationsCount: number;
  addedPlacements: Placement[];
  appliedPlacements: Placement[];
  selectedAdded: number[];
  onTabChange: (tab: 'added' | 'applications') => void;
  onToggleAddedSelection: (id: number) => void;
  onSelectAllAdded: () => void;
  onDeselectAllAdded: () => void;
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

type HintPositions = {
  start: { x: number; y: number };
  end: { x: number; y: number };
};

const HINT_AXIS_OFFSET_X = -50;
const HINT_START_OFFSET_FROM_BOTTOM = 40;
const HINT_END_OFFSET_FROM_TOP = 60;
const BANNER_PULSE_DELAY = 200;

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
    <p style={{ fontSize: '12px', marginTop: '8px' }}>Select added placements and click &quot;Apply to Selected&quot;</p>
  </div>
);

export const SavedPanels = ({
  activeTab,
  addedCount,
  applicationsCount,
  addedPlacements,
  appliedPlacements,
  selectedAdded,
  onTabChange,
  onToggleAddedSelection,
  onSelectAllAdded,
  onDeselectAllAdded,
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
  const panelRef = useRef<HTMLDivElement | null>(null);
  const requirementHintTimeoutRef = useRef<number | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [hintPositions, setHintPositions] = useState<HintPositions | null>(null);
  const [hintKey, setHintKey] = useState(0);
  const bannerPulseTimeoutRef = useRef<number | null>(null);
  const [bannerKey, setBannerKey] = useState(0);
  const requirementHintActive = hintVisible;

  const addedEmpty = addedPlacements.length === 0;
  const applicationsEmpty = appliedPlacements.length === 0;
  const bannerClasses = ['home-requirement-banner', homeRequirement.ready ? 'met' : ''].filter(Boolean).join(' ');
  const shouldPulseBanner = bannerKey > 0 && hintVisible;
  const bannerAnimation = shouldPulseBanner ? { y: [0, -4, 0] } : { y: 0 };
  const bannerTransition: Transition = { duration: 0.6, repeat: 1, ease: easeInOut };

  const triggerRequirementHint = useCallback(() => {
    if (!panelRef.current) {
      return;
    }
    const rect = panelRef.current.getBoundingClientRect();
    const axisX = rect.width / 2 + HINT_AXIS_OFFSET_X;
    const startY = rect.height - HINT_START_OFFSET_FROM_BOTTOM;
    const endY = HINT_END_OFFSET_FROM_TOP;
    const clampedStartY = Math.max(0, Math.min(rect.height, startY));
    const clampedEndY = Math.max(0, Math.min(rect.height, endY));

    const positions: HintPositions = {
      start: { x: axisX, y: clampedStartY },
      end: { x: axisX, y: clampedEndY },
    };

    if (requirementHintTimeoutRef.current) {
      window.clearTimeout(requirementHintTimeoutRef.current);
      requirementHintTimeoutRef.current = null;
    }
    if (bannerPulseTimeoutRef.current) {
      window.clearTimeout(bannerPulseTimeoutRef.current);
      bannerPulseTimeoutRef.current = null;
    }

    setHintPositions(positions);
    setHintVisible(true);
    setHintKey((prev) => prev + 1);
    setBannerKey(0);

    requirementHintTimeoutRef.current = window.setTimeout(() => {
      setHintVisible(false);
      requirementHintTimeoutRef.current = null;
    }, 3000);

    bannerPulseTimeoutRef.current = window.setTimeout(() => {
      setBannerKey((prev) => prev + 1);
      bannerPulseTimeoutRef.current = null;
    }, BANNER_PULSE_DELAY);
  }, []);

  useEffect(
    () => () => {
      if (requirementHintTimeoutRef.current) {
        window.clearTimeout(requirementHintTimeoutRef.current);
        requirementHintTimeoutRef.current = null;
      }
      if (bannerPulseTimeoutRef.current) {
        window.clearTimeout(bannerPulseTimeoutRef.current);
        bannerPulseTimeoutRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    if (!homeRequirement.blocking) {
      if (requirementHintTimeoutRef.current) {
        window.clearTimeout(requirementHintTimeoutRef.current);
        requirementHintTimeoutRef.current = null;
      }
      if (bannerPulseTimeoutRef.current) {
        window.clearTimeout(bannerPulseTimeoutRef.current);
        bannerPulseTimeoutRef.current = null;
      }
      setHintVisible(false);
    }
  }, [homeRequirement.blocking]);

  const handleApplyClick = useCallback(() => {
    if (homeRequirement.blocking) {
      triggerRequirementHint();
      return;
    }
    onApplyToSelected();
  }, [homeRequirement.blocking, onApplyToSelected, triggerRequirementHint]);

  const activeHeading = heading ?? (activeTab === 'added' ? 'Added' : 'Applied');
  const activeHeadingCount = activeTab === 'added' ? addedCount : applicationsCount;

  const panelClassName = ['saved-panels', mobileMode ? 'saved-panels--mobile' : ''].filter(Boolean).join(' ');
  const addedTabDisplay = activeTab === 'added' ? (mobileMode ? 'block' : 'flex') : 'none';
  const applicationsTabDisplay = activeTab === 'applications' ? (mobileMode ? 'block' : 'flex') : 'none';
  const buttonStateClass =
    applyButtonDisabled || !homeRequirement.ready ? 'btn-submit-all--neutral' : 'btn-submit-all--ready';
  const buttonClasses = ['btn-submit-all', buttonStateClass, requirementHintActive ? 'btn-submit-all--attention' : '']
    .filter(Boolean)
    .join(' ');

  const submitButton = (
    <button
      key={hintKey}
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

  const submitButtonWithTooltip = submitButton;
  const submitSection = mobileMode ? (
    <div className="saved-panels__mobile-submit">{submitButtonWithTooltip}</div>
  ) : (
    <div className="saved-panel__footer">{submitButtonWithTooltip}</div>
  );

  return (
    <div className={panelClassName} ref={panelRef}>
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
        <div className="saved-panel__header">
          <Tooltip content={homeRequirement.tooltip}>
            <motion.div
              key={bannerKey}
              className={bannerClasses}
              animate={bannerAnimation}
              transition={bannerTransition}
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

          <div
            className="saved-controls"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px',
              paddingBottom: '8px',
              marginBottom: '12px',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <span style={{ fontSize: '13px', color: '#666', fontWeight: 600 }}>Select placements to apply:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={onSelectAllAdded}
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
                onClick={onDeselectAllAdded}
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
        </div>

        <div className="saved-panel__scroll">
          <div className="saved-list" id="addedList">
            {addedEmpty ? (
              <EmptyAddedState />
            ) : (
              addedPlacements.map((placement) => {
                const isSelected = selectedAdded.includes(placement.id);
                const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onShowInfo(placement.id);
                  }
                };
                return (
                  <div
                    className={`saved-item saved-card saved-card--added ${isSelected ? 'selected' : ''}`}
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
                    <div className="saved-card__footer saved-card__footer--added">
                      <button
                        type="button"
                        className={`saved-card__primary-btn ${isSelected ? 'is-selected' : ''}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onToggleAddedSelection(placement.id);
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
      <AnimatePresence>
        {hintVisible && hintPositions ? (
          <motion.div
            key={hintKey}
            className="home-requirement-callout"
            initial={{
              left: hintPositions.start.x,
              top: hintPositions.start.y,
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              left: hintPositions.end.x,
              top: hintPositions.end.y,
              opacity: 1,
              scale: 1,
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.55, ease: easeInOut }}
          >
            <div className="home-requirement-callout-bubble">
              <span className="home-requirement-callout__label">Read this first!</span>
            </div>
            <div className="home-requirement-callout__arrow" aria-hidden="true"></div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
