import { useCallback, useEffect, useMemo, useState } from 'react';

import placementsData from '../data/placements.json';
import type { Placement } from '../types/placement';
import { useFavorites } from './useFavorites';
import { useNotifications } from './useNotifications';

const APPLICATION_LIMIT = 10;

const placementsFromJson = placementsData as Placement[];

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
  const [placements, setPlacements] = useState<Placement[]>([]);

  useEffect(() => {
    setPlacements(placementsFromJson);
  }, []);

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
  const resultsLabel = `Showing ${placements.length} placements`;

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
    resultsLabel,
    favoritesCount: favorites.length,
    applicationsCount: applications.length,
    applyButtonLabel,
    applyButtonDisabled,
    canApplyMore,
  };
};
