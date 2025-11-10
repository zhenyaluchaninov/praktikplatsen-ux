import { forwardRef, useState, type ComponentPropsWithoutRef } from 'react';

import { MobileMenu } from './MobileMenu';

type HeaderProps = ComponentPropsWithoutRef<'header'>;

const navItems = [
  { label: 'Browse Placements', href: '#browse', active: true },
  { label: 'History', href: '#history', active: false },
];

export const Header = forwardRef<HTMLElement, HeaderProps>((_props, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header ref={ref} className="header">
      <div className="header-content">
        <div className="header-nav">
          <div className="logo">
            <span>praktik</span>
            <span>platsen</span>
            <span>.se</span>
          </div>
          <nav className="nav-tabs">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`nav-tab ${item.active ? 'active' : ''}`}
                onClick={(event) => event.preventDefault()}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="header-actions">
          <div className="user-info">
            <div className="user-name">Emma S.</div>
          </div>
          <button
            type="button"
            className="burger-btn"
            aria-label="Open navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <MobileMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)} userName="Emma S." navItems={navItems} />
    </header>
  );
});

Header.displayName = 'Header';

