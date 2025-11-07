interface HeaderProps {
  onNotificationsClick: () => void;
}

export const Header = ({ onNotificationsClick }: HeaderProps) => (
  <header className="header">
    <div className="header-content">
      <div className="header-nav">
        <div className="logo">
          <span>praktik</span>
          <span>platsen</span>
          <span>.se</span>
        </div>
        <nav className="nav-tabs">
          <a href="#browse" className="nav-tab active" onClick={(event) => event.preventDefault()}>
            Browse Placements
          </a>
          <a href="#history" className="nav-tab" onClick={(event) => event.preventDefault()}>
            History
          </a>
        </nav>
      </div>
      <div className="user-info">
        <button
          type="button"
          className="notification-bell"
          onClick={onNotificationsClick}
          aria-label="Toggle notifications"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="notification-badge">2</span>
        </button>
        <div className="user-name">Emma S.</div>
      </div>
    </div>
  </header>
);

