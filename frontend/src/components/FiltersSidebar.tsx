import type { FiltersContentProps } from './FiltersContent';
import { FiltersContent } from './FiltersContent';

type FiltersSidebarProps = FiltersContentProps;

export const FiltersSidebar = ({
  groups,
  searchValue,
  onSearchChange,
  onToggleFilter,
  onClearFilters,
}: FiltersSidebarProps) => (
  <aside className="filters-sidebar" aria-label="Filters">
    <FiltersContent
      groups={groups}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      onToggleFilter={onToggleFilter}
      onClearFilters={onClearFilters}
    />
  </aside>
);
