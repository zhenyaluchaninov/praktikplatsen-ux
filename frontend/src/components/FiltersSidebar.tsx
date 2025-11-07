import { type MouseEvent, type ReactElement, useState } from 'react';

type FilterOption = {
  id: string;
  label: string;
  count: number;
};

type FilterGroup = {
  id: string;
  label: string;
  icon: ReactElement;
  options: FilterOption[];
};

const filterGroups: FilterGroup[] = [
  {
    id: 'industry',
    label: 'Industry',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
    options: [
      { id: 'cafe', label: 'Café & Restaurants', count: 24 },
      { id: 'retail', label: 'Retail & Fashion', count: 18 },
      { id: 'tech', label: 'Tech & IT', count: 12 },
      { id: 'healthcare', label: 'Healthcare', count: 15 },
      { id: 'media', label: 'Media & Design', count: 9 },
    ],
  },
  {
    id: 'location',
    label: 'Location',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    ),
    options: [
      { id: 'home', label: 'Your Home Area (Angered)', count: 32 },
      { id: 'nearby', label: 'Nearby Areas', count: 45 },
    ],
  },
  {
    id: 'type',
    label: 'Type',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="8.5" cy="7" r="4"></circle>
        <line x1="20" y1="8" x2="20" y2="14"></line>
        <line x1="23" y1="11" x2="17" y2="11"></line>
      </svg>
    ),
    options: [
      { id: 'group', label: 'Group PRAO', count: 8 },
      { id: 'new', label: 'New This Week', count: 5 },
    ],
  },
  {
    id: 'availability',
    label: 'Availability',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    ),
    options: [{ id: 'available', label: 'Spots Available', count: 54 }],
  },
];

const createDefaultState = () => {
  const state: Record<string, boolean> = {};
  filterGroups.forEach((group) => {
    group.options.forEach((option) => {
      state[option.id] = false;
    });
  });
  return state;
};

export const FiltersSidebar = () => {
  const [searchValue, setSearchValue] = useState('');
  const [checkedFilters, setCheckedFilters] = useState<Record<string, boolean>>(() => createDefaultState());

  const handleToggle = (id: string) => {
    setCheckedFilters((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      console.log('Filters applied');
      return updated;
    });
  };

  const handleClear = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setSearchValue('');
    setCheckedFilters(createDefaultState());
    console.log('Filters applied');
  };

  return (
    <aside className="filters-sidebar">
      <div className="filters-header">
        <h2 className="filters-title">Filters</h2>
        <a href="#clear" className="clear-filters" onClick={handleClear}>
          Clear all
        </a>
      </div>

      <input
        type="text"
        className="search-box"
        placeholder="Search by name, company..."
        id="searchInput"
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
      />

      {filterGroups.map((group) => (
        <div className="filter-group" key={group.id}>
          <label className="filter-label">
            {group.icon}
            {group.label}
          </label>
          {group.options.map((option) => (
            <div className="filter-option" key={option.id}>
              <input
                type="checkbox"
                id={option.id}
                checked={Boolean(checkedFilters[option.id])}
                onChange={() => handleToggle(option.id)}
              />
              <label htmlFor={option.id}>{option.label}</label>
              <span className="filter-count">{option.count}</span>
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
};
