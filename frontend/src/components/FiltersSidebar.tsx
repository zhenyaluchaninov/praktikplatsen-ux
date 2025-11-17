import type { FiltersContentProps } from './FiltersContent';
import { FiltersContent } from './FiltersContent';

type FiltersSidebarProps = FiltersContentProps;

export const FiltersSidebar = ({
  groups,
  searchValue,
  onSearchChange,
  onToggleFilter,
  onClearFilters,
  wishlistOnly,
  wishlistCount,
  onToggleWishlistOnly,
}: FiltersSidebarProps) => (
  <aside className="filters-sidebar" aria-label="Filters">
    <FiltersContent
      groups={groups}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      onToggleFilter={onToggleFilter}
      onClearFilters={onClearFilters}
      wishlistOnly={wishlistOnly}
      wishlistCount={wishlistCount}
      onToggleWishlistOnly={onToggleWishlistOnly}
    />
  </aside>
);
