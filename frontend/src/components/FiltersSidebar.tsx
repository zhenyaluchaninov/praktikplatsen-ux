import type { MouseEvent, ReactElement } from 'react';

import type { FilterGroupId } from '../hooks/usePlacements';

type FilterOption = {
  id: string;
  label: string;
  count: number;
  checked: boolean;
};

type FilterGroup = {
  id: FilterGroupId;
  label: string;
  options: FilterOption[];
};

type FiltersSidebarProps = {
  groups: FilterGroup[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onToggleFilter: (groupId: FilterGroupId, optionId: string) => void;
  onClearFilters: () => void;
};

const groupIcons: Record<string, ReactElement> = {
  industry: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  ),
  municipality: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  ),
  type: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="8.5" cy="7" r="4"></circle>
      <line x1="20" y1="8" x2="20" y2="14"></line>
      <line x1="23" y1="11" x2="17" y2="11"></line>
    </svg>
  ),
  availability: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
};

const getGroupIcon = (id: string) => groupIcons[id] ?? groupIcons.industry;

export const FiltersSidebar = ({ groups, searchValue, onSearchChange, onToggleFilter, onClearFilters }: FiltersSidebarProps) => {
  const handleClear = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onClearFilters();
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
        onChange={(event) => onSearchChange(event.target.value)}
      />

      {groups.map((group) => (
        <div className="filter-group" key={group.id}>
          <label className="filter-label">
            {getGroupIcon(group.id)}
            {group.label}
          </label>
          {group.options.map((option) => (
            <div className="filter-option" key={option.id}>
              <input
                type="checkbox"
                id={`${group.id}-${option.id}`}
                checked={option.checked}
                onChange={() => onToggleFilter(group.id, option.id)}
              />
              <label htmlFor={`${group.id}-${option.id}`}>{option.label}</label>
              <span className="filter-count">{option.count}</span>
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
};



