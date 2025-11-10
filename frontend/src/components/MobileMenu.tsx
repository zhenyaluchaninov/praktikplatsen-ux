import { useEffect } from 'react';
import { createPortal } from 'react-dom';

type NavItem = {
  label: string;
  href: string;
  active?: boolean;
};

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  userName: string;
  navItems: NavItem[];
};

export const MobileMenu = ({ open, onClose, userName, navItems }: MobileMenuProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.body.classList.add('menu-open');
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('menu-open');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Main navigation">
      <div className="mobile-menu__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="mobile-menu__panel">
        <header className="mobile-menu__header">
          <span className="mobile-menu__title">praktikplatsen.se</span>
          <button type="button" className="mobile-menu__close" onClick={onClose} aria-label="Close menu">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>
        <nav className="mobile-menu__nav">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`mobile-menu__link ${item.active ? 'active' : ''}`}
              onClick={(event) => event.preventDefault()}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mobile-menu__user">
          <p className="mobile-menu__label">Signed in as</p>
          <p className="mobile-menu__name">{userName}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
};
