import { useState } from 'react';
import './Navbar.css';

const MENU_ITEMS = [
  { id: 'home', label: 'Jelajahi' },
  { id: 'watchlist', label: 'Watchlist', icon: '▤' },
  { id: 'watched', label: 'Sudah ditonton', icon: '✓' },
];

function Navbar({ activeMenu, onMenuClick, favoritesCount, watchlistCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const selectMenu = (id) => {
    onMenuClick(id);
    setMenuOpen(false);
  };

  return (
    <header className="navbar-shell">
      <nav className="navbar" aria-label="Navigasi utama">
        <button type="button" className="navbar-brand" onClick={() => selectMenu('home')} aria-label="Screen Search, ke beranda">
          <span className="brand-mark">S<span>/</span></span><span className="brand-name">SCREEN<span>SEARCH</span></span>
        </button>
        <div className="navbar-menu">
          {MENU_ITEMS.map((item) => <button key={item.id} type="button" className={`nav-btn ${activeMenu === item.id || (item.id === 'home' && activeMenu && activeMenu !== 'watchlist' && activeMenu !== 'watched') ? 'active' : ''}`} onClick={() => selectMenu(item.id)}>{item.icon && <span aria-hidden="true">{item.icon}</span>}{item.label}{item.id === 'watchlist' && watchlistCount > 0 && <span className="nav-badge">{watchlistCount}</span>}</button>)}
        </div>
        <div className="navbar-actions"><span className="favorites-indicator"><span aria-hidden="true">♥</span> {favoritesCount} favorit</span><button className="menu-toggle" type="button" aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /></button></div>
        {menuOpen && <div className="mobile-menu">{MENU_ITEMS.map((item) => <button key={item.id} type="button" onClick={() => selectMenu(item.id)}>{item.label}{item.id === 'watchlist' && watchlistCount > 0 && <span>{watchlistCount}</span>}</button>)}</div>}
      </nav>
    </header>
  );
}

export default Navbar;
