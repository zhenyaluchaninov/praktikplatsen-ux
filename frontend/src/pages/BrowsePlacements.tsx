import { Header } from '../components/Header';
import { ProgressBar } from '../components/ProgressBar';
import { FiltersSidebar } from '../components/FiltersSidebar';
import { PlacementsGrid } from '../components/PlacementsGrid';
import { RightSidebar } from '../components/RightSidebar';
import { NotificationToast } from '../components/NotificationToast';
import { ModalPlacementDetails } from '../components/ModalPlacementDetails';
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
    filterGroups,
    searchValue,
    onSearchChange,
    onToggleFilter,
    onClearFilters,
    sortOption,
    onSortChange,
  } = usePlacements();

  const handleNotificationsClick = () => {
    window.alert('Notifications panel would open here');
  };

  return (
    <>
      <Header onNotificationsClick={handleNotificationsClick} />
      <ProgressBar
        countText={progress.count}
        percentage={progress.percentage}
        weekLabel={progress.week}
        requirementText={progress.requirement}
      />
      <div className="main-container">
        <FiltersSidebar
          groups={filterGroups}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onToggleFilter={onToggleFilter}
          onClearFilters={onClearFilters}
        />
        <PlacementsGrid
          placements={placements}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onShowDetails={openModal}
          resultsLabel={resultsLabel}
          sortOption={sortOption}
          onSortChange={onSortChange}
        />
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
        />
      </div>
      {notification && (
        <NotificationToast title={notification.title} message={notification.message} onClose={clearNotification} />
      )}
      {modalPlacement && <ModalPlacementDetails placement={modalPlacement} onClose={closeModal} />}
    </>
  );
};

export default BrowsePlacements;
