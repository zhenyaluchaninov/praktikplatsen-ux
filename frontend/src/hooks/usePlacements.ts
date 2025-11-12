import { useCallback, useEffect, useMemo, useState } from 'react';

import placementsData from '../data/placements.json';
import type { Placement } from '../types/placement';
import { useWishlist } from './useWishlist';
import { useNotifications } from './useNotifications';

const APPLICATION_LIMIT = 10;
const HOME_MUNICIPALITY_REQUIREMENT = 3;
const HOME_REQUIREMENT_TOOLTIP =
  'You must apply for at least 3 placements in your own municipality before applying elsewhere. This ensures local students get priority for local placements.';

export type SortOption = 'recommended' | 'newest' | 'available' | 'alphabetical' | 'homeArea';
export type FilterGroupId = 'industry' | 'municipality' | 'type' | 'availability';

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

const INITIAL_WISHLIST: number[] = [];
const INITIAL_APPLICATIONS: number[] = [];

const FILTER_GROUPS: FilterGroupId[] = ['industry', 'municipality', 'type', 'availability'];

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
  municipality: new Set<string>(),
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
    case 'municipality':
      return placement.municipality === optionId;
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
    wishlist,
    selectedWishlist,
    toggleWishlistItem: toggleWishlistState,
    toggleWishlistSelection,
    selectAllWishlist,
    deselectAllWishlist,
    removeWishlistItem: removeWishlistState,
    removeWishlistItems,
  } = useWishlist(INITIAL_WISHLIST);

  const { notification, showNotification, clearNotification } = useNotifications();

  const [applications, setApplications] = useState<number[]>(INITIAL_APPLICATIONS);
  const [activeTab, setActiveTab] = useState<'wishlist' | 'applications'>('wishlist');
  const [modalPlacementId, setModalPlacementId] = useState<number | null>(null);
  const [allPlacements, setAllPlacements] = useState<Placement[]>([]);
  const [filters, setFilters] = useState<FiltersState>(() => createEmptyFilters());
  const [searchValue, setSearchValue] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('recommended');

  useEffect(() => {
    setAllPlacements(placementsFromJson);
  }, []);

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

  const municipalityValues = useMemo(() => {
    const values = Array.from(new Set(allPlacements.map((placement) => placement.municipality)));
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

  const placementsMatchingSearch = useMemo(
    () => allPlacements.filter((placement) => matchesSearch(placement, searchValue)),
    [allPlacements, searchValue],
  );

  const placementsMatchingPerGroup = useMemo<Record<FilterGroupId, Placement[]>>(
    () => ({
      industry: placementsMatchingSearch.filter((placement) =>
        placementMatchesFiltersExcluding(placement, filters, 'industry'),
      ),
      municipality: placementsMatchingSearch.filter((placement) =>
        placementMatchesFiltersExcluding(placement, filters, 'municipality'),
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

  const municipalityCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    placementsMatchingPerGroup.municipality.forEach((placement) => {
      counts.set(placement.municipality, (counts.get(placement.municipality) ?? 0) + 1);
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

    if (municipalityValues.length > 0) {
      groups.push({
        id: 'municipality',
        label: 'Municipality',
        options: municipalityValues.map((municipality) => ({
          id: municipality,
          label: municipality,
          count: municipalityCountMap.get(municipality) ?? 0,
          checked: filters.municipality.has(municipality),
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
    municipalityCountMap,
    municipalityValues,
    placementsMatchingPerGroup,
    typeFilterOptions,
  ]);

  const wishlistPlacements = useMemo(
    () =>
      wishlist
        .map((id) => placementsById.get(id))
        .filter((placement): placement is Placement => Boolean(placement)),
    [wishlist, placementsById],
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

  const selectedWishlistHomeCount = useMemo(
    () => selectedWishlist.reduce((count, id) => count + (placementsById.get(id)?.homeArea ? 1 : 0), 0),
    [selectedWishlist, placementsById],
  );

  const homeRequirementMet = homeApplicationsCount >= HOME_MUNICIPALITY_REQUIREMENT;
  const homeRequirementSatisfiedAfterSelection =
    homeRequirementMet || homeApplicationsCount + selectedWishlistHomeCount >= HOME_MUNICIPALITY_REQUIREMENT;
  const homeRequirementBlocking = !homeRequirementSatisfiedAfterSelection;
  const homeRequirementDisplayCount = Math.min(
    homeApplicationsCount + selectedWishlistHomeCount,
    HOME_MUNICIPALITY_REQUIREMENT,
  );
  const homeRequirementDisplay = `${homeRequirementDisplayCount}/${HOME_MUNICIPALITY_REQUIREMENT}`;

  const toggleWishlist = useCallback(
    (id: number) => {
      const isCurrentlyWishlist = wishlist.includes(id);
      toggleWishlistState(id);
      showNotification(
        isCurrentlyWishlist ? 'Removed from wishlist' : 'Added to wishlist',
        isCurrentlyWishlist ? '' : 'Check the box to select it for application',
      );
    },
    [wishlist, toggleWishlistState, showNotification],
  );

  const removeWishlist = useCallback(
    (id: number) => {
      if (!wishlist.includes(id)) {
        return;
      }
      removeWishlistState(id);
      showNotification('Removed from wishlist', '');
    },
    [wishlist, removeWishlistState, showNotification],
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

        removeWishlistItems([id]);
        showNotification('Application submitted!', 'You will be notified when reviewed');
        return [...prev, id];
      });
    },
    [removeWishlistItems, showNotification],
  );

  const applyToSelected = useCallback(() => {
    if (!homeRequirementSatisfiedAfterSelection) {
      showNotification(
        'Apply in your municipality first',
        `Select placements in your municipality until you reach ${HOME_MUNICIPALITY_REQUIREMENT} applications.`,
      );
      return;
    }

    setApplications((prev) => {
      if (prev.length >= APPLICATION_LIMIT) {
        showNotification('Application limit reached', 'You can only apply to 10 placements');
        return prev;
      }

      if (selectedWishlist.length === 0) {
        showNotification('No wishlist selected', 'Check the boxes to pick wishlist placements');
        return prev;
      }

      const remainingSlots = APPLICATION_LIMIT - prev.length;
      const toApply = selectedWishlist.filter((id) => !prev.includes(id)).slice(0, remainingSlots);

      if (toApply.length === 0) {
        showNotification('No wishlist selected', 'Check the boxes to pick wishlist placements');
        return prev;
      }

      removeWishlistItems(toApply);
      showNotification(`Applied to ${toApply.length} placements!`, 'Check "Applied" tab to see them');
      return [...prev, ...toApply];
    });
  }, [homeRequirementSatisfiedAfterSelection, removeWishlistItems, selectedWishlist, showNotification]);

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

  const modalPlacement = modalPlacementId ? placementsById.get(modalPlacementId) ?? null : null;

  const progressCount = `${applications.length}/${APPLICATION_LIMIT}`;
  const progressPercentage = Math.min(100, (applications.length / APPLICATION_LIMIT) * 100);
  const canApplyMore = applications.length < APPLICATION_LIMIT;
  const applyButtonLabel = `Apply to Selected (${selectedWishlist.length})`;
  const applyButtonDisabled = selectedWishlist.length === 0 || !canApplyMore || homeRequirementBlocking;
  const resultsLabel = `Showing ${sortedPlacements.length} ${sortedPlacements.length === 1 ? 'placement' : 'placements'}`;

  return {
    placements: sortedPlacements,
    wishlist,
    wishlistPlacements,
    applications,
    appliedPlacements,
    selectedWishlist,
    activeTab,
    setActiveTab,
    notification,
    clearNotification,
    toggleWishlist,
    toggleWishlistSelection,
    selectAllWishlist,
    deselectAllWishlist,
    removeWishlist,
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
    },
    homeRequirement: {
      met: homeRequirementMet,
      text: `Apply to at least ${HOME_MUNICIPALITY_REQUIREMENT} placements in your municipality (${homeRequirementDisplay})`,
      tooltip: HOME_REQUIREMENT_TOOLTIP,
      display: homeRequirementDisplay,
      blocking: homeRequirementBlocking,
      ready: !homeRequirementBlocking,
    },
    resultsLabel,
    wishlistCount: wishlist.length,
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

