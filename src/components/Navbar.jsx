import './Navbar.css';

const MENU_ITEMS = [
  { id: 'home',      label: '🏠 Home'      },
  { id: 'indonesia', label: '🇮🇩 Indonesia' },
  { id: 'inggris',   label: '🇬🇧 Inggris'  },
  { id: 'jepang',    label: '🇯🇵 Jepang'   },
  { id: 'korea',     label: '🇰🇷 Korea'    },
  { id: 'anime',     label: '✨ Anime'      },
  { id: 'favorit',   label: '❤️ Favorit'   },
];

function Navbar({ activeMenu, onMenuClick, favoritesCount }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-logo">
          <span className="logo-se">Se</span>
          <span className="logo-ar">AR</span>
          <span className="logo-ch">ch</span>
        </span>
      </div>

      {/* Desktop menu */}
      <ul className="navbar-menu">
        {MENU_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              className={`nav-btn ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => onMenuClick(item.id)}
            >
              {item.label}
              {item.id === 'favorit' && favoritesCount > 0 && (
                <span className="nav-badge">{favoritesCount}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Hamburger mobile */}
      <input type="checkbox" id="nav-toggle" className="nav-toggle-input" />
      <label className="hamburger" htmlFor="nav-toggle" aria-label="Toggle menu">
        <span /><span /><span />
      </label>

      {/* Mobile drawer */}
      <ul className="navbar-drawer">
        {MENU_ITEMS.map((item) => (
          <li key={item.id}>
            <button
              className={`nav-btn ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => {
                onMenuClick(item.id);
                document.getElementById('nav-toggle').checked = false;
              }}
            >
              {item.label}
              {item.id === 'favorit' && favoritesCount > 0 && (
                <span className="nav-badge">{favoritesCount}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;