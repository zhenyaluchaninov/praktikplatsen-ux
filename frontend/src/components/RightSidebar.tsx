import type { SavedPanelsProps } from './SavedPanels';
import { SavedPanels } from './SavedPanels';

export type RightSidebarProps = SavedPanelsProps;

export const RightSidebar = (props: RightSidebarProps) => (
  <aside className="right-sidebar" aria-label="Saved placements">
    <div className="sidebar-card">
      <SavedPanels {...props} />
    </div>
  </aside>
);
