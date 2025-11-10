export const Header = () => (
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
        <div className="user-name">Emma S.</div>
      </div>
    </div>
  </header>
);

