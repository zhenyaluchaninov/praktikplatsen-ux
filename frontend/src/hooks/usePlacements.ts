import { useCallback, useMemo, useState } from 'react';

import type { Placement } from '../types/placement';
import { useFavorites } from './useFavorites';
import { useNotifications } from './useNotifications';

const APPLICATION_LIMIT = 10;

const placementsData: Placement[] = [
  {
    id: 1,
    title: 'Barista & Customer Service',
    company: 'Espresso House',
    logo: 'EH',
    location: 'Angered, Göteborg',
    spots: 2,
    totalSpots: 2,
    distance: '0.8 km',
    industry: 'cafe',
    homeArea: true,
    isNew: true,
    isGroup: false,
  },
  {
    id: 2,
    title: 'Elderly Care Assistant',
    company: 'Angered Care Center',
    logo: 'AC',
    location: 'Angered, Göteborg',
    spots: 1,
    totalSpots: 3,
    distance: '1.2 km',
    industry: 'healthcare',
    homeArea: true,
    isNew: false,
    isGroup: true,
  },
  {
    id: 3,
    title: 'Retail Sales & Inventory',
    company: 'H&M Angered',
    logo: 'HM',
    location: 'Angered, Göteborg',
    spots: 1,
    totalSpots: 2,
    distance: '0.5 km',
    industry: 'retail',
    homeArea: true,
    isNew: false,
    isGroup: false,
  },
  {
    id: 4,
    title: 'Junior Web Developer',
    company: 'Digital Dreams AB',
    logo: 'DD',
    location: 'Västra Hisingen, Göteborg',
    spots: 2,
    totalSpots: 2,
    distance: '3.4 km',
    industry: 'tech',
    homeArea: false,
    isNew: true,
    isGroup: false,
  },
  {
    id: 5,
    title: 'Kitchen & Food Prep',
    company: 'Max Burgers',
    logo: 'MB',
    location: 'Angered, Göteborg',
    spots: 3,
    totalSpots: 4,
    distance: '1.8 km',
    industry: 'cafe',
    homeArea: true,
    isNew: false,
    isGroup: true,
  },
  {
    id: 6,
    title: 'Pharmacy Assistant',
    company: 'Apoteket Hjärtat',
    logo: 'AH',
    location: 'Lundby, Göteborg',
    spots: 1,
    totalSpots: 1,
    distance: '4.2 km',
    industry: 'healthcare',
    homeArea: false,
    isNew: false,
    isGroup: false,
  },
  {
    id: 7,
    title: 'Social Media Intern',
    company: 'Creative Studio',
    logo: 'CS',
    location: 'Angered, Göteborg',
    spots: 2,
    totalSpots: 2,
    distance: '0.9 km',
    industry: 'media',
    homeArea: true,
    isNew: true,
    isGroup: false,
  },
  {
    id: 8,
    title: 'Warehouse & Logistics',
    company: 'PostNord',
    logo: 'PN',
    location: 'Angered, Göteborg',
    spots: 4,
    totalSpots: 5,
    distance: '1.5 km',
    industry: 'retail',
    homeArea: true,
    isNew: false,
    isGroup: true,
  },
];

const INITIAL_FAVORITES = [1, 3, 4, 7, 8];
const INITIAL_APPLICATIONS = [2, 5, 6];

export const usePlacements = () => {
  const {
    favorites,
    selectedFavorites,
    toggleFavorite: toggleFavoriteState,
    toggleFavoriteSelection,
    selectAllFavorites,
    deselectAllFavorites,
    removeFavorite: removeFavoriteState,
    removeFavorites,
  } = useFavorites(INITIAL_FAVORITES);

  const { notification, showNotification, clearNotification } = useNotifications();

  const [applications, setApplications] = useState<number[]>(INITIAL_APPLICATIONS);
  const [activeTab, setActiveTab] = useState<'favorites' | 'applications'>('favorites');
  const [modalPlacementId, setModalPlacementId] = useState<number | null>(null);

  const placements = placementsData;

  const placementsById = useMemo(() => {
    const map = new Map<number, Placement>();
    placements.forEach((placement) => map.set(placement.id, placement));
    return map;
  }, [placements]);

  const favoritePlacements = useMemo(
    () =>
      favorites
        .map((id) => placementsById.get(id))
        .filter((placement): placement is Placement => Boolean(placement)),
    [favorites, placementsById],
  );

  const appliedPlacements = useMemo(
    () =>
      applications
        .map((id) => placementsById.get(id))
        .filter((placement): placement is Placement => Boolean(placement)),
    [applications, placementsById],
  );

  const toggleFavorite = useCallback(
    (id: number) => {
      const isCurrentlyFavorite = favorites.includes(id);
      toggleFavoriteState(id);
      showNotification(
        isCurrentlyFavorite ? 'Removed from favorites' : 'Added to favorites',
        isCurrentlyFavorite ? '' : 'Check the box to select it for application',
      );
    },
    [favorites, toggleFavoriteState, showNotification],
  );

  const removeFavorite = useCallback(
    (id: number) => {
      if (!favorites.includes(id)) {
        return;
      }
      removeFavoriteState(id);
      showNotification('Removed from favorites', '');
    },
    [favorites, removeFavoriteState, showNotification],
  );

  const openModal = useCallback((id: number) => {
    setModalPlacementId(id);
  }, []);

  const closeModal = useCallback(() => {
    setModalPlacementId(null);
  }, []);

  const applyToPlacement = useCallback(
    (id: number) => {
      setApplications((prev) => {
        if (prev.length >= APPLICATION_LIMIT) {
          showNotification('Application limit reached', 'You can only apply to 10 placements');
          return prev;
        }
        if (prev.includes(id)) {
          return prev;
        }

        removeFavorites([id]);
        showNotification('Application submitted!', 'You will be notified when reviewed');
        return [...prev, id];
      });
    },
    [removeFavorites, showNotification],
  );

  const applyToSelected = useCallback(() => {
    setApplications((prev) => {
      if (prev.length >= APPLICATION_LIMIT) {
        showNotification('Application limit reached', 'You can only apply to 10 placements');
        return prev;
      }

      if (selectedFavorites.length === 0) {
        showNotification('No favorites selected', 'Check the boxes to select favorites');
        return prev;
      }

      const remainingSlots = APPLICATION_LIMIT - prev.length;
      const toApply = selectedFavorites.filter((id) => !prev.includes(id)).slice(0, remainingSlots);

      if (toApply.length === 0) {
        showNotification('No favorites selected', 'Check the boxes to select favorites');
        return prev;
      }

      removeFavorites(toApply);
      showNotification(`Applied to ${toApply.length} placements!`, 'Check "Applied" tab to see them');
      return [...prev, ...toApply];
    });
  }, [removeFavorites, selectedFavorites, showNotification]);

  const withdrawApplication = useCallback(
    (id: number) => {
      if (!window.confirm('Are you sure you want to withdraw this application?')) {
        return;
      }

      setApplications((prev) => {
        if (!prev.includes(id)) {
          return prev;
        }
        showNotification('Application withdrawn', 'You can apply again if needed');
        return prev.filter((appId) => appId !== id);
      });
    },
    [showNotification],
  );

  const modalPlacement = modalPlacementId ? placementsById.get(modalPlacementId) ?? null : null;

  const progressCount = `${applications.length}/${APPLICATION_LIMIT}`;
  const progressPercentage = Math.min(100, (applications.length / APPLICATION_LIMIT) * 100);

  const canApplyMore = applications.length < APPLICATION_LIMIT;
  const applyButtonLabel = `Apply to Selected (${selectedFavorites.length})`;
  const applyButtonDisabled = selectedFavorites.length === 0 || !canApplyMore;

  return {
    placements,
    favorites,
    favoritePlacements,
    applications,
    appliedPlacements,
    selectedFavorites,
    activeTab,
    setActiveTab,
    notification,
    clearNotification,
    toggleFavorite,
    toggleFavoriteSelection,
    selectAllFavorites,
    deselectAllFavorites,
    removeFavorite,
    applyToPlacement,
    applyToSelected,
    withdrawApplication,
    modalPlacement,
    openModal,
    closeModal,
    progress: {
      count: progressCount,
      percentage: progressPercentage,
      week: 'Week: 34-37, 2025',
      requirement: 'Minimum 3 in your home municipality met (3/3)',
    },
    resultsLabel: 'Showing 54 placements',
    favoritesCount: favorites.length,
    applicationsCount: applications.length,
    applyButtonLabel,
    applyButtonDisabled,
    canApplyMore,
  };
};
