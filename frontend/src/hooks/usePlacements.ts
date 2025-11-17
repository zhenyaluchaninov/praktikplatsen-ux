import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import placementsData from '../data/placements.json';
import type { Placement } from '../types/placement';
import { useAdded } from './useAdded';
import { useNotifications } from './useNotifications';

const APPLICATION_LIMIT = 10;
const HOME_AREA_REQUIREMENT = 3;
const HOME_REQUIREMENT_TOOLTIP =
  'You must apply for at least 3 placements in your own area before applying elsewhere. This ensures local students get priority for local placements.';

export type SortOption = 'recommended' | 'newest' | 'available' | 'alphabetical' | 'homeArea';
export type FilterGroupId = 'industry' | 'area' | 'type' | 'availability';

type FiltersState = Record<FilterGroupId, Set<string>>;

type FilterGroupOption = {
  id: string;
  label: string;
  count: number;
  checked: boolean;
};

type FilterGroupView = {
  id: FilterGroupId;
  label: string;
  options: FilterGroupOption[];
};

const placementsFromJson = placementsData as Placement[];

const INITIAL_ADDED: number[] = [];
const INITIAL_APPLICATIONS: number[] = [];

const FILTER_GROUPS: FilterGroupId[] = ['industry', 'area', 'type', 'availability'];
const HOME_AREA_NAME = 'Angered';
const HOME_AREA_FILTER_LABEL = 'Your area';

const INDUSTRY_LABELS: Record<string, string> = {
  cafe: 'Cafe & Restaurants',
  retail: 'Retail & Fashion',
  tech: 'Tech & IT',
  healthcare: 'Healthcare',
  media: 'Media & Design',
  construction: 'Construction & Maintenance',
  education: 'Education',
  transport: 'Transport & Logistics',
};

const TYPE_FILTERS = [
  { id: 'isNew', label: 'New This Week', match: (placement: Placement) => placement.isNew },
  { id: 'isGroup', label: 'Group PRAO', match: (placement: Placement) => placement.isGroup },
];

const getRemainingSpots = (placement: Placement) => Math.max(placement.totalSpots - placement.spots, 0);

const AVAILABILITY_FILTERS = [
  { id: 'available', label: 'Spots Available', match: (placement: Placement) => getRemainingSpots(placement) > 0 },
];

const createEmptyFilters = (): FiltersState => ({
  industry: new Set<string>(),
  area: new Set<string>(),
  type: new Set<string>(),
  availability: new Set<string>(),
});

const normalizeText = (value: string) => value.trim().toLowerCase();

const matchesSearch = (placement: Placement, query: string) => {
  if (!query) {
    return true;
  }
  const normalized = normalizeText(query);
  return placement.title.toLowerCase().includes(normalized) || placement.company.toLowerCase().includes(normalized);
};

const optionMatchesPlacement = (placement: Placement, groupId: FilterGroupId, optionId: string) => {
  switch (groupId) {
    case 'industry':
      return placement.industry === optionId;
    case 'area':
      return placement.area === optionId;
    case 'type':
      if (optionId === 'isNew') {
        return placement.isNew;
      }
      if (optionId === 'isGroup') {
        return placement.isGroup;
      }
      return false;
    case 'availability':
      if (optionId === 'available') {
        return getRemainingSpots(placement) > 0;
      }
      return false;
    default:
      return true;
  }
};

const placementMatchesFilters = (placement: Placement, filters: FiltersState) =>
  FILTER_GROUPS.every((groupId) => {
    const selections = filters[groupId];
    if (!selections || selections.size === 0) {
      return true;
    }
    return Array.from(selections).some((optionId) => optionMatchesPlacement(placement, groupId, optionId));
  });

const placementMatchesFiltersExcluding = (
  placement: Placement,
  filters: FiltersState,
  excludedGroup: FilterGroupId,
) =>
  FILTER_GROUPS.every((groupId) => {
    if (groupId === excludedGroup) {
      return true;
    }
    const selections = filters[groupId];
    if (!selections || selections.size === 0) {
      return true;
    }
    return Array.from(selections).some((optionId) => optionMatchesPlacement(placement, groupId, optionId));
  });

const formatLabel = (value: string) =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const sortPlacements = (placements: Placement[], sortOption: SortOption) => {
  const copy = [...placements];
  const compareByRemaining = (a: Placement, b: Placement) => getRemainingSpots(b) - getRemainingSpots(a);

  switch (sortOption) {
    case 'newest':
      copy.sort((a, b) => {
        const newDiff = Number(b.isNew) - Number(a.isNew);
        if (newDiff !== 0) {
          return newDiff;
        }
        return b.id - a.id;
      });
      break;
    case 'available':
      copy.sort((a, b) => {
        const availabilityDiff = compareByRemaining(a, b);
        if (availabilityDiff !== 0) {
          return availabilityDiff;
        }
        return a.distance - b.distance;
      });
      break;
    case 'alphabetical':
      copy.sort((a, b) => a.company.localeCompare(b.company, 'en'));
      break;
    case 'homeArea':
      copy.sort((a, b) => {
        const homeDiff = Number(b.homeArea) - Number(a.homeArea);
        if (homeDiff !== 0) {
          return homeDiff;
        }
        return a.distance - b.distance;
      });
      break;
    case 'recommended':
    default:
      copy.sort((a, b) => {
        const homeDiff = Number(b.homeArea) - Number(a.homeArea);
        if (homeDiff !== 0) {
          return homeDiff;
        }
        const newDiff = Number(b.isNew) - Number(a.isNew);
        if (newDiff !== 0) {
          return newDiff;
        }
        const availabilityDiff = compareByRemaining(a, b);
        if (availabilityDiff !== 0) {
          return availabilityDiff;
        }
        return a.distance - b.distance;
      });
      break;
  }

  return copy;
};

export const usePlacements = () => {
  const {
    added,
    selectedAdded,
    toggleAddedItem: toggleAddedState,
    toggleAddedSelection,
    selectAllAdded,
    deselectAllAdded,
    removeAddedItem: removeAddedState,
    removeAddedItems,
    ensureAddedItem,
  } = useAdded(INITIAL_ADDED);

  const { notification, exitingNotification, isNotificationVisible, showNotification, clearNotification } = useNotifications();

  const [applications, setApplications] = useState<number[]>(INITIAL_APPLICATIONS);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'added' | 'applications'>('added');
  const [modalPlacementId, setModalPlacementId] = useState<number | null>(null);
  const [allPlacements, setAllPlacements] = useState<Placement[]>([]);
  const [filters, setFilters] = useState<FiltersState>(() => createEmptyFilters());
  const [searchValue, setSearchValue] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('recommended');
  const [isCompletionModalVisible, setCompletionModalVisible] = useState(false);
  const lastApplicationCountRef = useRef(applications.length);

  useEffect(() => {
    setAllPlacements(placementsFromJson);
  }, []);

  useEffect(() => {
    const previousCount = lastApplicationCountRef.current;
    if (applications.length === APPLICATION_LIMIT && previousCount < APPLICATION_LIMIT) {
      setCompletionModalVisible(true);
    }
    lastApplicationCountRef.current = applications.length;
  }, [applications.length]);

  const placementsById = useMemo(() => {
    const map = new Map<number, Placement>();
    allPlacements.forEach((placement) => map.set(placement.id, placement));
    return map;
  }, [allPlacements]);

  const industryValues = useMemo(() => {
    const values = Array.from(new Set(allPlacements.map((placement) => placement.industry)));
    return values.sort((a, b) => {
      const labelA = INDUSTRY_LABELS[a] ?? formatLabel(a);
      const labelB = INDUSTRY_LABELS[b] ?? formatLabel(b);
      return labelA.localeCompare(labelB, 'en');
    });
  }, [allPlacements]);

  const areaValues = useMemo(() => {
    const values = Array.from(new Set(allPlacements.map((placement) => placement.area)));
    return values.sort((a, b) => a.localeCompare(b, 'en'));
  }, [allPlacements]);

  const typeFilterOptions = useMemo(
    () => TYPE_FILTERS.filter((option) => allPlacements.some((placement) => option.match(placement))),
    [allPlacements],
  );

  const availabilityFilterOptions = useMemo(
    () => AVAILABILITY_FILTERS.filter((option) => allPlacements.some((placement) => option.match(placement))),
    [allPlacements],
  );

  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist]);

  const sourcePlacements = useMemo(
    () => (wishlistOnly ? allPlacements.filter((placement) => wishlistSet.has(placement.id)) : allPlacements),
    [allPlacements, wishlistOnly, wishlistSet],
  );

  const placementsMatchingSearch = useMemo(
    () => sourcePlacements.filter((placement) => matchesSearch(placement, searchValue)),
    [sourcePlacements, searchValue],
  );

  const placementsMatchingPerGroup = useMemo<Record<FilterGroupId, Placement[]>>(
    () => ({
      industry: placementsMatchingSearch.filter((placement) =>
        placementMatchesFiltersExcluding(placement, filters, 'industry'),
      ),
      area: placementsMatchingSearch.filter((placement) =>
        placementMatchesFiltersExcluding(placement, filters, 'area'),
      ),
      type: placementsMatchingSearch.filter((placement) =>
        placementMatchesFiltersExcluding(placement, filters, 'type'),
      ),
      availability: placementsMatchingSearch.filter((placement) =>
        placementMatchesFiltersExcluding(placement, filters, 'availability'),
      ),
    }),
    [placementsMatchingSearch, filters],
  );

  const filteredPlacements = useMemo(
    () => placementsMatchingSearch.filter((placement) => placementMatchesFilters(placement, filters)),
    [placementsMatchingSearch, filters],
  );

  const sortedPlacements = useMemo(
    () => sortPlacements(filteredPlacements, sortOption),
    [filteredPlacements, sortOption],
  );

  const industryCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    placementsMatchingPerGroup.industry.forEach((placement) => {
      counts.set(placement.industry, (counts.get(placement.industry) ?? 0) + 1);
    });
    return counts;
  }, [placementsMatchingPerGroup]);

  const areaCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    placementsMatchingPerGroup.area.forEach((placement) => {
      counts.set(placement.area, (counts.get(placement.area) ?? 0) + 1);
    });
    return counts;
  }, [placementsMatchingPerGroup]);

  const filterGroups = useMemo<FilterGroupView[]>(() => {
    if (allPlacements.length === 0) {
      return [];
    }

    const groups: FilterGroupView[] = [];

    if (industryValues.length > 0) {
      groups.push({
        id: 'industry',
        label: 'Industry',
        options: industryValues.map((industry) => ({
          id: industry,
          label: INDUSTRY_LABELS[industry] ?? formatLabel(industry),
          count: industryCountMap.get(industry) ?? 0,
          checked: filters.industry.has(industry),
        })),
      });
    }

    if (areaValues.length > 0) {
      groups.push({
        id: 'area',
        label: 'Area',
        options: areaValues.map((area) => ({
          id: area,
          label: area === HOME_AREA_NAME ? HOME_AREA_FILTER_LABEL : area,
          count: areaCountMap.get(area) ?? 0,
          checked: filters.area.has(area),
        })),
      });
    }

    if (typeFilterOptions.length > 0) {
      groups.push({
        id: 'type',
        label: 'Type',
        options: typeFilterOptions.map((option) => ({
          id: option.id,
          label: option.label,
          count: placementsMatchingPerGroup.type.filter((placement) => option.match(placement)).length,
          checked: filters.type.has(option.id),
        })),
      });
    }

    if (availabilityFilterOptions.length > 0) {
      groups.push({
        id: 'availability',
        label: 'Availability',
        options: availabilityFilterOptions.map((option) => ({
          id: option.id,
          label: option.label,
          count: placementsMatchingPerGroup.availability.filter((placement) => option.match(placement)).length,
          checked: filters.availability.has(option.id),
        })),
      });
    }

    return groups;
  }, [
    allPlacements.length,
    availabilityFilterOptions,
    filters,
    industryCountMap,
    industryValues,
    areaCountMap,
    areaValues,
    placementsMatchingPerGroup,
    typeFilterOptions,
  ]);

  const addedPlacements = useMemo(
    () =>
      added
        .map((id) => placementsById.get(id))
        .filter((placement): placement is Placement => Boolean(placement)),
    [added, placementsById],
  );

  const appliedPlacements = useMemo(
    () =>
      applications
        .map((id) => placementsById.get(id))
        .filter((placement): placement is Placement => Boolean(placement)),
    [applications, placementsById],
  );

  const homeApplicationsCount = useMemo(
    () => appliedPlacements.filter((placement) => placement.homeArea).length,
    [appliedPlacements],
  );

  const selectedAddedHomeCount = useMemo(
    () => selectedAdded.reduce((count, id) => count + (placementsById.get(id)?.homeArea ? 1 : 0), 0),
    [selectedAdded, placementsById],
  );

  const homeRequirementMet = homeApplicationsCount >= HOME_AREA_REQUIREMENT;
  const homeRequirementSatisfiedAfterSelection =
    homeRequirementMet || homeApplicationsCount + selectedAddedHomeCount >= HOME_AREA_REQUIREMENT;
  const homeRequirementBlocking = !homeRequirementSatisfiedAfterSelection;
  const homeRequirementDisplayCount = Math.min(
    homeApplicationsCount + selectedAddedHomeCount,
    HOME_AREA_REQUIREMENT,
  );
  const homeRequirementDisplay = `${homeRequirementDisplayCount}/${HOME_AREA_REQUIREMENT}`;

  const toggleWishlist = useCallback((id: number) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  const toggleWishlistOnly = useCallback(() => {
    setWishlistOnly((prev) => !prev);
  }, []);

  const toggleAdded = useCallback(
    (id: number) => {
      const isCurrentlyAdded = added.includes(id);
      if (!isCurrentlyAdded && applications.includes(id)) {
        showNotification('Already applied', 'This placement is already in your Applied tab');
        return;
      }
      toggleAddedState(id);
      showNotification(
        isCurrentlyAdded ? 'Removed from Added list' : 'Added to Added list',
        isCurrentlyAdded ? '' : 'Check the box to select it for application',
      );
    },
    [applications, added, toggleAddedState, showNotification],
  );

  const removeAdded = useCallback(
    (id: number) => {
      if (!added.includes(id)) {
        return;
      }
      removeAddedState(id);
      showNotification('Removed from Added list', '');
    },
    [added, removeAddedState, showNotification],
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

        removeAddedItems([id]);
        showNotification('Application submitted!', 'You will be notified when reviewed');
        return [...prev, id];
      });
    },
    [removeAddedItems, showNotification],
  );

  const applyToSelected = useCallback(() => {
    if (selectedAdded.length === 0) {
      showNotification('No added placements selected', 'Use the Select buttons to pick added placements');
      return;
    }

    if (!homeRequirementSatisfiedAfterSelection) {
      showNotification(
        'Apply in your area first',
        `Select placements in your area until you reach ${HOME_AREA_REQUIREMENT} applications.`,
      );
      return;
    }

    setApplications((prev) => {
      if (prev.length >= APPLICATION_LIMIT) {
        showNotification('Application limit reached', 'You can only apply to 10 placements');
        return prev;
      }

      const remainingSlots = APPLICATION_LIMIT - prev.length;
      const alreadyAppliedSelections = selectedAdded.filter((id) => prev.includes(id));
      const pendingSelections = selectedAdded.filter((id) => !prev.includes(id));

      if (alreadyAppliedSelections.length > 0) {
        removeAddedItems(alreadyAppliedSelections);
      }

      if (pendingSelections.length === 0) {
        showNotification('Already applied', 'Selected placements are already in your Applied tab');
        return prev;
      }

      const toApply = pendingSelections.slice(0, remainingSlots);

      if (toApply.length === 0) {
        showNotification('Application limit reached', 'You can only apply to 10 placements');
        return prev;
      }

      removeAddedItems(toApply);
      showNotification(`Applied to ${toApply.length} placements!`, 'Check "Applied" tab to see them');
      return [...prev, ...toApply];
    });
  }, [homeRequirementSatisfiedAfterSelection, removeAddedItems, selectedAdded, showNotification]);

  const withdrawApplication = useCallback(
    (id: number) => {
      if (!window.confirm('Are you sure you want to withdraw this application?')) {
        return;
      }

      setApplications((prev) => {
        if (!prev.includes(id)) {
          return prev;
        }
        ensureAddedItem(id);
        showNotification('Application withdrawn', 'Moved back to your Added list');
        return prev.filter((appId) => appId !== id);
      });
    },
    [ensureAddedItem, showNotification],
  );

  const toggleFilterOption = useCallback((groupId: FilterGroupId, optionId: string) => {
    setFilters((prev) => {
      const nextGroup = new Set(prev[groupId]);
      if (nextGroup.has(optionId)) {
        nextGroup.delete(optionId);
      } else {
        nextGroup.add(optionId);
      }
      return { ...prev, [groupId]: nextGroup };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(createEmptyFilters());
    setSearchValue('');
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSortChange = useCallback((option: SortOption) => {
    setSortOption(option);
  }, []);

  const closeCompletionModal = useCallback(() => {
    setCompletionModalVisible(false);
  }, []);

  const modalPlacement = modalPlacementId ? placementsById.get(modalPlacementId) ?? null : null;

  const progressCount = `${applications.length}/${APPLICATION_LIMIT}`;
  const progressPercentage = Math.min(100, (applications.length / APPLICATION_LIMIT) * 100);
  const canApplyMore = applications.length < APPLICATION_LIMIT;
  const progressComplete = !canApplyMore;
  const applyButtonLabel = `Apply to Selected (${selectedAdded.length})`;
  const applyButtonDisabled = selectedAdded.length === 0 || !canApplyMore;
  const resultsLabel = `Showing ${sortedPlacements.length} ${sortedPlacements.length === 1 ? 'placement' : 'placements'}`;

  return {
    placements: sortedPlacements,
    wishlist,
    wishlistOnly,
    added,
    addedPlacements,
    applications,
    appliedPlacements,
    selectedAdded,
    activeTab,
    setActiveTab,
    notification,
    exitingNotification,
    notificationVisible: isNotificationVisible,
    clearNotification,
    toggleWishlist,
    toggleWishlistOnly,
    toggleAdded,
    toggleAddedSelection,
    selectAllAdded,
    deselectAllAdded,
    removeAdded,
    applyToPlacement,
    applyToSelected,
    withdrawApplication,
    modalPlacement,
    openModal,
    closeModal,
    completionModalVisible: isCompletionModalVisible,
    closeCompletionModal,
    progress: {
      count: progressCount,
      percentage: progressPercentage,
      week: 'Week: 34-37, 2025',
      complete: progressComplete,
    },
    homeRequirement: {
      met: homeRequirementMet,
      text: `Apply to at least ${HOME_AREA_REQUIREMENT} placements in your area (${homeRequirementDisplay})`,
      tooltip: HOME_REQUIREMENT_TOOLTIP,
      display: homeRequirementDisplay,
      blocking: homeRequirementBlocking,
      ready: !homeRequirementBlocking,
    },
    resultsLabel,
    wishlistCount: wishlist.length,
    addedCount: added.length,
    applicationsCount: applications.length,
    applyButtonLabel,
    applyButtonDisabled,
    canApplyMore,
    filterGroups,
    searchValue,
    onSearchChange: handleSearchChange,
    onToggleFilter: toggleFilterOption,
    onClearFilters: clearFilters,
    sortOption,
    onSortChange: handleSortChange,
  };
};

