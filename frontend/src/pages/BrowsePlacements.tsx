import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { FiltersModal } from '../components/FiltersModal';
import { FiltersSidebar } from '../components/FiltersSidebar';
import { Header } from '../components/Header';
import { MobileViewBar, type MobileView } from '../components/MobileViewBar';
import { ModalPlacementDetails } from '../components/ModalPlacementDetails';
import { NotificationToast } from '../components/NotificationToast';
import { PlacementsGrid } from '../components/PlacementsGrid';
import { ProgressBar } from '../components/ProgressBar';
import { RightSidebar } from '../components/RightSidebar';
import { SavedPanels } from '../components/SavedPanels';
import { SortControl } from '../components/SortControl';
import { usePlacements } from '../hooks/usePlacements';

const BrowsePlacements = () => {
  const {
    placements,
    favorites,
    favoritePlacements,
    selectedFavorites,
    appliedPlacements,
    activeTab,
    setActiveTab,
    notification,
    clearNotification,
    toggleFavorite,
    toggleFavoriteSelection,
    selectAllFavorites,
    deselectAllFavorites,
    removeFavorite,
    applyToSelected,
    withdrawApplication,
    modalPlacement,
    openModal,
    closeModal,
    progress,
    resultsLabel,
    favoritesCount,
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>('explore');
  const headerRef = useRef<HTMLElement | null>(null);
  const stickyStackRef = useRef<HTMLDivElement | null>(null);

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
    const threshold = 40;
    if (!isMobile) {
      setHeaderHidden(false);
      return;
    }
    const handleScroll = () => {
      const shouldHide = window.scrollY > threshold;
      setHeaderHidden(shouldHide);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  useEffect(() => {
    const collapsed = isMobile && headerHidden;
    document.body.classList.toggle('header-collapsed', collapsed);
    return () => {
      document.body.classList.remove('header-collapsed');
    };
  }, [headerHidden, isMobile]);

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
  }, [isMobile, headerHidden]);

  const activeFiltersCount = useMemo(
    () =>
      filterGroups.reduce(
        (count, group) => count + group.options.reduce((groupCount, option) => groupCount + (option.checked ? 1 : 0), 0),
        0,
      ),
    [filterGroups],
  );

  const openFilters = () => setFiltersOpen(true);
  const closeFilters = () => setFiltersOpen(false);
  const handleMobileViewChange = useCallback(
    (view: MobileView) => {
      setMobileView(view);
      if (!isMobile) {
        return;
      }
      if (view === 'wishlist' && activeTab !== 'favorites') {
        setActiveTab('favorites');
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

  return (
    <>
      <div className="sticky-stack" ref={stickyStackRef}>
        <Header ref={headerRef} />
        <div className="sticky-panels">
          <ProgressBar
            countText={progress.count}
            percentage={progress.percentage}
            weekLabel={progress.week}
          />
          {isMobile && mobileView === 'explore' && (
            <div className="mobile-toolbar">
              <button type="button" className="mobile-toolbar__filter" onClick={openFilters}>
                <span className="mobile-toolbar__filter-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 6h16" />
                    <path d="M7 12h10" />
                    <path d="M10 18h4" />
                  </svg>
                </span>
                <span className="mobile-toolbar__filter-label">Filters</span>
                {activeFiltersCount > 0 && <span className="mobile-toolbar__badge">{activeFiltersCount}</span>}
              </button>
              <SortControl sortOption={sortOption} onSortChange={onSortChange} triggerLabel="Sort" className="mobile-toolbar__sort" />
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
          />
        )}
        {(!isMobile || mobileView === 'explore') && (
          <PlacementsGrid
            placements={placements}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onShowDetails={openModal}
            resultsLabel={resultsLabel}
            sortOption={sortOption}
            onSortChange={onSortChange}
            searchValue={searchValue}
          />
        )}
        {isMobile && mobileView !== 'explore' && (
          <section
            className={`mobile-saved-panels mobile-saved-panels--${mobileView}`}
            aria-label={mobileView === 'wishlist' ? 'Wishlist' : 'Applied'}
          >
            <SavedPanels
              activeTab={activeTab}
              favoritesCount={favoritesCount}
              applicationsCount={applicationsCount}
              favoritePlacements={favoritePlacements}
              appliedPlacements={appliedPlacements}
              selectedFavorites={selectedFavorites}
              onTabChange={setActiveTab}
              onToggleFavoriteSelection={toggleFavoriteSelection}
              onSelectAllFavorites={selectAllFavorites}
              onDeselectAllFavorites={deselectAllFavorites}
              onRemoveFavorite={removeFavorite}
              onApplyToSelected={applyToSelected}
              onWithdrawApplication={withdrawApplication}
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
            favoritesCount={favoritesCount}
            applicationsCount={applicationsCount}
            favoritePlacements={favoritePlacements}
            appliedPlacements={appliedPlacements}
            selectedFavorites={selectedFavorites}
            onTabChange={setActiveTab}
            onToggleFavoriteSelection={toggleFavoriteSelection}
            onSelectAllFavorites={selectAllFavorites}
            onDeselectAllFavorites={deselectAllFavorites}
            onRemoveFavorite={removeFavorite}
            onApplyToSelected={applyToSelected}
            onWithdrawApplication={withdrawApplication}
            applyButtonLabel={applyButtonLabel}
            applyButtonDisabled={applyButtonDisabled}
            homeRequirement={homeRequirement}
          />
        )}
      </div>
      {notification && (
        <NotificationToast title={notification.title} message={notification.message} onClose={clearNotification} />
      )}
      {modalPlacement && <ModalPlacementDetails placement={modalPlacement} onClose={closeModal} />}
      <FiltersModal
        open={filtersOpen}
        onClose={closeFilters}
        groups={filterGroups}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onToggleFilter={onToggleFilter}
        onClearFilters={onClearFilters}
      />
      {isMobile && (
        <MobileViewBar
          activeView={mobileView}
          onChange={handleMobileViewChange}
          counts={{
            explore: placements.length,
            wishlist: favoritesCount,
            applied: applicationsCount,
          }}
        />
      )}
    </>
  );
};

export default BrowsePlacements;
