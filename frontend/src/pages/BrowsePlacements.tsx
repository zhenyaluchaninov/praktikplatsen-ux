import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CompletionModal } from '../components/CompletionModal';
import { FiltersContent } from '../components/FiltersContent';
import { FiltersSidebar } from '../components/FiltersSidebar';
import { Header } from '../components/Header';
import { MobileViewBar, type MobileView } from '../components/MobileViewBar';
import { ModalPlacementDetails } from '../components/ModalPlacementDetails';
import { NotificationToast } from '../components/NotificationToast';
import { PlacementsGrid } from '../components/PlacementsGrid';
import { ProgressBar } from '../components/ProgressBar';
import { RightSidebar } from '../components/RightSidebar';
import { SavedPanels } from '../components/SavedPanels';
import { usePlacements } from '../hooks/usePlacements';

type MobileExploreMode = 'list' | 'search' | 'filters';

const BrowsePlacements = () => {
  const {
    placements,
    wishlist,
    wishlistOnly,
    added,
    applications,
    addedPlacements,
    selectedAdded,
    appliedPlacements,
    activeTab,
    setActiveTab,
    notification,
    exitingNotification,
    notificationVisible,
    clearNotification,
    toggleWishlist,
    toggleWishlistOnly,
    toggleAdded,
    toggleAddedSelection,
    selectAllAdded,
    deselectAllAdded,
    removeAdded,
    applyToSelected,
    withdrawApplication,
    modalPlacement,
    openModal,
    closeModal,
    completionModalVisible,
    closeCompletionModal,
    progress,
    resultsLabel,
    wishlistCount,
    addedCount,
    applicationsCount,
    applyButtonLabel,
    applyButtonDisabled,
    homeRequirement,
    filterGroups,
    searchValue,
    onSearchChange,
    onToggleFilter,
    onClearFilters,
    sortOption,
    onSortChange,
  } = usePlacements();

  const [isMobile, setIsMobile] = useState(false);
  const [mobileExploreMode, setMobileExploreMode] = useState<MobileExploreMode>('list');
  const [mobileView, setMobileView] = useState<MobileView>('explore');
  const headerRef = useRef<HTMLElement | null>(null);
  const stickyStackRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const isMobileExplore = isMobile && mobileView === 'explore';

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateMatch = () => setIsMobile(mediaQuery.matches);
    updateMatch();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateMatch);
      return () => mediaQuery.removeEventListener('change', updateMatch);
    }
    mediaQuery.addListener(updateMatch);
    return () => mediaQuery.removeListener(updateMatch);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      document.documentElement.style.setProperty('--header-offset', '0px');
      return;
    }
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }
    const handleScroll = () => {
      const headerHeight = headerRef.current?.offsetHeight ?? 0;
      const offset = headerHeight > 0 ? Math.min(container.scrollTop, headerHeight) : 0;
      document.documentElement.style.setProperty('--header-offset', `${offset}px`);
    };
    handleScroll();
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  useEffect(() => {
    const updateMeasurements = () => {
      const measuredHeader = headerRef.current?.offsetHeight ?? 0;
      if (measuredHeader > 0) {
        document.documentElement.style.setProperty('--header-height', `${measuredHeader}px`);
      }
      const stackHeight = stickyStackRef.current?.offsetHeight ?? 0;
      if (stackHeight > 0) {
        document.documentElement.style.setProperty('--sticky-stack-offset', `${stackHeight}px`);
      }
    };
    updateMeasurements();
    window.addEventListener('resize', updateMeasurements);
    return () => window.removeEventListener('resize', updateMeasurements);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobileExplore) {
      searchInputRef.current?.blur();
      setMobileExploreMode('list');
    }
  }, [isMobileExplore]);

  const activeFiltersCount = useMemo(
    () =>
      filterGroups.reduce(
        (count, group) => count + group.options.reduce((groupCount, option) => groupCount + (option.checked ? 1 : 0), 0),
        0,
      ) + (wishlistOnly ? 1 : 0),
    [filterGroups, wishlistOnly],
  );

  const enterMobileSearch = () => {
    if (!isMobileExplore) {
      return;
    }
    setMobileExploreMode('search');
  };

  const exitMobileSearch = () => {
    setMobileExploreMode('list');
  };

  const openMobileFilters = () => {
    if (!isMobileExplore) {
      return;
    }
    searchInputRef.current?.blur();
    setMobileExploreMode('filters');
  };

  const closeMobileFilters = () => {
    searchInputRef.current?.blur();
    exitMobileSearch();
  };

  const handleSearchFocus = () => {
    enterMobileSearch();
  };

  const handleSearchBlur = () => {
    requestAnimationFrame(() => {
      if (document.activeElement !== searchInputRef.current) {
        exitMobileSearch();
      }
    });
  };

  const handleSearchCancel = () => {
    onSearchChange('');
    searchInputRef.current?.blur();
    exitMobileSearch();
  };

  const handleMobileViewChange = useCallback(
    (view: MobileView) => {
      setMobileView(view);
      if (!isMobile) {
        return;
      }
      if (view === 'added' && activeTab !== 'added') {
        setActiveTab('added');
      } else if (view === 'applied' && activeTab !== 'applications') {
        setActiveTab('applications');
      }
    },
    [activeTab, isMobile, setActiveTab],
  );

  useEffect(() => {
    if (!isMobile && mobileView !== 'explore') {
      setMobileView('explore');
    }
  }, [isMobile, mobileView]);

  const showMobileSearchPanel = isMobileExplore && mobileExploreMode !== 'filters';
  const showMobileFiltersPanel = isMobileExplore && mobileExploreMode === 'filters';
  const showPlacementsGrid = !isMobile || (isMobileExplore && mobileExploreMode !== 'filters');
  const isSearchMode = isMobileExplore && mobileExploreMode === 'search';

  return (
    <>
      <div className="app-scroll" ref={scrollContainerRef}>
        <div className="sticky-stack" ref={stickyStackRef}>
          <Header ref={headerRef} />
          <div className="sticky-panels">
            <ProgressBar
              countText={progress.count}
              percentage={progress.percentage}
              weekLabel={progress.week}
              complete={progress.complete}
            />
            {showMobileSearchPanel && (
              <div className={`mobile-search-panel ${isSearchMode ? 'mobile-search-panel--focused' : ''}`}>
                <div className="mobile-search-panel__field">
                  <span className="mobile-search-panel__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="7" />
                      <line x1="16.65" y1="16.65" x2="21" y2="21" />
                    </svg>
                  </span>
                  <input
                    ref={searchInputRef}
                    type="search"
                    className="mobile-search-panel__input"
                    placeholder="Search placements"
                    aria-label="Search placements"
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    enterKeyHint="search"
                  />
                  {isSearchMode && (
                    <button type="button" className="mobile-search-panel__cancel" onClick={handleSearchCancel} aria-label="Exit search">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="6" y1="6" x2="18" y2="18" />
                        <line x1="6" y1="18" x2="18" y2="6" />
                      </svg>
                    </button>
                  )}
                </div>
                {!isSearchMode && (
                  <button type="button" className="mobile-search-panel__filters" onClick={openMobileFilters}>
                    <span className="mobile-search-panel__filter-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 6h16" />
                        <path d="M7 12h10" />
                        <path d="M10 18h4" />
                      </svg>
                    </span>
                    <span className="mobile-search-panel__filter-label">Filters</span>
                    {activeFiltersCount > 0 && <span className="mobile-search-panel__badge">{activeFiltersCount}</span>}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="main-container">
          {!isMobile && (
            <FiltersSidebar
              groups={filterGroups}
              searchValue={searchValue}
              onSearchChange={onSearchChange}
              onToggleFilter={onToggleFilter}
              onClearFilters={onClearFilters}
              wishlistOnly={wishlistOnly}
              wishlistCount={wishlistCount}
              onToggleWishlistOnly={toggleWishlistOnly}
            />
          )}
          {showPlacementsGrid && (
            <PlacementsGrid
              placements={placements}
              wishlist={wishlist}
              added={added}
              applications={applications}
              onToggleWishlist={toggleWishlist}
              onToggleAdded={toggleAdded}
              onShowDetails={openModal}
              resultsLabel={resultsLabel}
              sortOption={sortOption}
              onSortChange={onSortChange}
              searchValue={searchValue}
            />
          )}
          {showMobileFiltersPanel && (
            <section className="mobile-filters-panel" aria-label="Filters">
              <header className="mobile-filters-panel__header">
                <div className="mobile-filters-panel__title">
                  Filters
                  {activeFiltersCount > 0 && <span className="mobile-filters-panel__count">{activeFiltersCount}</span>}
                </div>
                <div className="mobile-filters-panel__actions">
                  <button
                    type="button"
                    className="mobile-filters-panel__clear"
                    onClick={onClearFilters}
                    disabled={activeFiltersCount === 0 && searchValue.trim().length === 0}
                  >
                    Clear
                  </button>
                  <button type="button" className="mobile-filters-panel__close" onClick={closeMobileFilters} aria-label="Close filters">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="6" y1="18" x2="18" y2="6" />
                    </svg>
                  </button>
                </div>
              </header>
              <div className="mobile-filters-panel__content">
                <FiltersContent
                  groups={filterGroups}
                  searchValue={searchValue}
                  onSearchChange={onSearchChange}
                  onToggleFilter={onToggleFilter}
                  onClearFilters={onClearFilters}
                  wishlistOnly={wishlistOnly}
                  wishlistCount={wishlistCount}
                  onToggleWishlistOnly={toggleWishlistOnly}
                  showHeader={false}
                  showSearchInput={false}
                />
              </div>
            </section>
          )}
          {isMobile && mobileView !== 'explore' && (
            <section
              className={`mobile-saved-panels mobile-saved-panels--${mobileView}`}
              aria-label={mobileView === 'added' ? 'Added' : 'Applied'}
            >
              <SavedPanels
                activeTab={activeTab}
                addedCount={addedCount}
                applicationsCount={applicationsCount}
                addedPlacements={addedPlacements}
                appliedPlacements={appliedPlacements}
                selectedAdded={selectedAdded}
                onTabChange={setActiveTab}
                onToggleAddedSelection={toggleAddedSelection}
                onSelectAllAdded={selectAllAdded}
                onDeselectAllAdded={deselectAllAdded}
                onRemoveAdded={removeAdded}
                onApplyToSelected={applyToSelected}
                onWithdrawApplication={withdrawApplication}
                onShowInfo={openModal}
                applyButtonLabel={applyButtonLabel}
                applyButtonDisabled={applyButtonDisabled}
                homeRequirement={homeRequirement}
                showTabs={false}
                showMobileHeading={false}
                mobileMode
              />
            </section>
          )}
          {!isMobile && (
            <RightSidebar
              activeTab={activeTab}
              addedCount={addedCount}
              applicationsCount={applicationsCount}
              addedPlacements={addedPlacements}
              appliedPlacements={appliedPlacements}
              selectedAdded={selectedAdded}
              onTabChange={setActiveTab}
              onToggleAddedSelection={toggleAddedSelection}
              onSelectAllAdded={selectAllAdded}
              onDeselectAllAdded={deselectAllAdded}
              onRemoveAdded={removeAdded}
              onApplyToSelected={applyToSelected}
              onWithdrawApplication={withdrawApplication}
              onShowInfo={openModal}
              applyButtonLabel={applyButtonLabel}
              applyButtonDisabled={applyButtonDisabled}
              homeRequirement={homeRequirement}
            />
          )}
        </div>

        {exitingNotification && (
          <NotificationToast
            key={`exiting-${exitingNotification.id}`}
            title={exitingNotification.title}
            message={exitingNotification.message}
            onClose={clearNotification}
            visible={false}
          />
        )}
        {notification && (
          <NotificationToast
            key={notification.id}
            title={notification.title}
            message={notification.message}
            onClose={clearNotification}
            visible={notificationVisible}
          />
        )}
        {completionModalVisible && <CompletionModal onClose={closeCompletionModal} />}
        {modalPlacement && <ModalPlacementDetails placement={modalPlacement} onClose={closeModal} />}
      </div>
      {isMobile && (
        <MobileViewBar
          activeView={mobileView}
          onChange={handleMobileViewChange}
          counts={{
            explore: placements.length,
            added: addedCount,
            applied: applicationsCount,
          }}
        />
      )}
    </>
  );
};

export default BrowsePlacements;
