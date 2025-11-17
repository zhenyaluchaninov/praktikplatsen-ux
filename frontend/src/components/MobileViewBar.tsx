import type { ReactElement } from 'react';

export type MobileView = 'explore' | 'added' | 'applied';

type MobileViewBarProps = {
  activeView: MobileView;
  onChange: (view: MobileView) => void;
  counts: Record<MobileView, number>;
};

const MobileExploreIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="7" height="7" rx="2" />
    <rect x="14" y="4" width="7" height="7" rx="2" />
    <rect x="3" y="15" width="7" height="7" rx="2" />
    <rect x="14" y="15" width="7" height="7" rx="2" />
  </svg>
);

const MobileAddedIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6v12" />
    <path d="M6 12h12" />
  </svg>
);

const MobileAppliedIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 13h6" />
    <path d="M9 17h4" />
  </svg>
);

const BUTTONS: Array<{
  id: MobileView;
  label: string;
  Icon: () => ReactElement;
}> = [
  { id: 'explore', label: 'Explore', Icon: MobileExploreIcon },
  { id: 'added', label: 'Added', Icon: MobileAddedIcon },
  { id: 'applied', label: 'Applied', Icon: MobileAppliedIcon },
];

export const MobileViewBar = ({ activeView, onChange, counts }: MobileViewBarProps) => (
  <nav className="mobile-view-bar" aria-label="Primary mobile navigation">
    {BUTTONS.map(({ id, label, Icon }) => {
      const isActive = activeView === id;
      return (
        <button
          key={id}
          type="button"
          className={`mobile-view-bar__button ${isActive ? 'is-active' : ''}`}
          onClick={() => onChange(id)}
          aria-pressed={isActive}
        >
          <span className="mobile-view-bar__icon" aria-hidden="true">
            <Icon />
          </span>
          <span className="mobile-view-bar__label">{label}</span>
          <span className="mobile-view-bar__count" aria-label={`${label} count`}>
            {counts[id]}
          </span>
        </button>
      );
    })}
  </nav>
);
