import { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import MovieList from './components/MovieList';
import MovieModal from './components/MovieModal';
import SkeletonGrid from './components/SkeletonGrid';
import Toast from './components/Toast';
import './App.css';

// Konfigurasi konten setiap menu
// Kamu bisa ubah query/ids sesuai selera
const MENU_CONFIG = {
  home: {
    label: '🔥 Trending Sekarang',
    ids: [
      'tt1375666', // Inception
      'tt0468569', // The Dark Knight
      'tt4154796', // Avengers: Endgame
      'tt0110912', // Pulp Fiction
      'tt0137523', // Fight Club
      'tt0816692', // Interstellar
      'tt6751668', // Parasite
      'tt1853728', // Django Unchained
    ],
  },
  indonesia: {
    label: '🇮🇩 Film Indonesia',
    queries: ['laskar pelangi', 'dilan', 'pengabdi setan', 'habibie ainun', 'ada apa dengan cinta'],
  },
  inggris: {
    label: '🇬🇧 Film Inggris',
    queries: ['james bond', 'harry potter', 'sherlock holmes', 'kingsman', 'atonement'],
  },
  jepang: {
    label: '🇯🇵 Film Jepang',
    queries: ['spirited away', 'your name', 'ring japanese', 'akira', 'princess mononoke'],
  },
  korea: {
    label: '🇰🇷 Film Korea',
    queries: ['parasite', 'train to busan', 'oldboy', 'squid game', 'crash landing on you'],
  },
  anime: {
    label: '✨ Anime',
    queries: ['attack on titan', 'demon slayer', 'naruto', 'one piece', 'fullmetal alchemist'],
  },
};

function App() {
  const [activeMenu, setActiveMenu]       = useState('home');
  const [menuMovies, setMenuMovies]       = useState([]);
  const [menuLoading, setMenuLoading]     = useState(true);
  const [movies, setMovies]               = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [hasSearched, setHasSearched]     = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [sortBy, setSortBy]               = useState('default');
  const [filterType, setFilterType]       = useState('all');
  const [toast, setToast]                 = useState(null);

  const toastTimeoutRef = useRef(null);
  const searchIdRef     = useRef(0);
  const menuCacheRef    = useRef({});

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('movie-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('movie-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Fetch film sesuai menu yang aktif
  useEffect(() => {
    if (activeMenu === 'favorit') return;

    // Pakai cache supaya tidak re-fetch setiap klik
    if (menuCacheRef.current[activeMenu]) {
      setMenuMovies(menuCacheRef.current[activeMenu]);
      setMenuLoading(false);
      return;
    }

    const apiKey = import.meta.env.VITE_OMDB_KEY;
    const config = MENU_CONFIG[activeMenu];
    setMenuLoading(true);
    setMenuMovies([]);

    let fetchPromise;

    if (config.ids) {
      // Fetch by IMDb ID (Home)
      fetchPromise = Promise.all(
        config.ids.map((id) =>
          fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${id}&plot=short`).then((r) => r.json())
        )
      ).then((data) => data.filter((d) => d.Response !== 'False'));
    } else {
      // Fetch by query keyword
      fetchPromise = Promise.all(
        config.queries.map((q) =>
          fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(q)}`)
            .then((r) => r.json())
            .then(async (searchData) => {
              if (searchData.Response !== 'True' || !searchData.Search?.length) return [];
              const details = await Promise.all(
                searchData.Search.slice(0, 3).map((m) =>
                  fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${m.imdbID}&plot=short`).then((r) => r.json())
                )
              );
              return details.filter((d) => d.Response !== 'False');
            })
        )
      ).then((nested) => {
        const seen = new Set();
        return nested.flat().filter((m) => {
          if (seen.has(m.imdbID)) return false;
          seen.add(m.imdbID);
          return true;
        });
      });
    }

    fetchPromise
      .then((data) => {
        menuCacheRef.current[activeMenu] = data;
        setMenuMovies(data);
      })
      .catch(() => {})
      .finally(() => setMenuLoading(false));
  }, [activeMenu]);

  const showToast = (message) => {
    setToast(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 2200);
  };

  const toggleFavorite = (movie) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.imdbID === movie.imdbID);
      if (exists) {
        showToast(`Dihapus dari favorit: ${movie.Title}`);
        return prev.filter((f) => f.imdbID !== movie.imdbID);
      }
      showToast(`Ditambahkan ke favorit: ${movie.Title}`);
      return [...prev, movie];
    });
  };

  const isFavorite = (movie) => favorites.some((f) => f.imdbID === movie.imdbID);

  const handleSearch = async (query) => {
    const currentId = ++searchIdRef.current;
    setHasSearched(true);
    setLoading(true);
    setError('');
    setMovies([]);

    try {
      const apiKey    = import.meta.env.VITE_OMDB_KEY;
      const searchRes = await fetch(
        `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}`
      );
      const searchData = await searchRes.json();

      if (searchData.Response !== 'True') {
        if (currentId === searchIdRef.current) {
          setError(searchData.Error || 'Film tidak ditemukan');
          setLoading(false);
        }
        return;
      }

      const detailedMovies = await Promise.all(
        searchData.Search.map((m) =>
          fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${m.imdbID}&plot=short`).then((r) => r.json())
        )
      );

      if (currentId === searchIdRef.current) setMovies(detailedMovies);
    } catch {
      if (currentId === searchIdRef.current)
        setError('Terjadi kesalahan saat mengambil data. Coba lagi.');
    } finally {
      if (currentId === searchIdRef.current) setLoading(false);
    }
  };

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    setHasSearched(false);
    setMovies([]);
    setError('');
    setSortBy('default');
    setFilterType('all');
  };

  const getBaseList = () => {
    if (hasSearched)              return movies;
    if (activeMenu === 'favorit') return favorites;
    return menuMovies;
  };

  const getVisibleMovies = () => {
    let result = [...getBaseList()];

    if (filterType !== 'all') {
      result = result.filter((m) => m.Type === filterType);
    }

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0));
        break;
      case 'year-desc':
        result.sort((a, b) => (parseInt(b.Year) || 0) - (parseInt(a.Year) || 0));
        break;
      case 'year-asc':
        result.sort((a, b) => (parseInt(a.Year) || 0) - (parseInt(b.Year) || 0));
        break;
      case 'title':
        result.sort((a, b) => a.Title.localeCompare(b.Title));
        break;
      default:
        break;
    }

    return result;
  };

  const visibleMovies = getVisibleMovies();
  const baseList      = getBaseList();

  const isLoadingNow = hasSearched
    ? loading
    : activeMenu === 'favorit'
    ? false
    : menuLoading;

  const getSectionLabel = () => {
    if (hasSearched)              return null;
    if (activeMenu === 'favorit') return null;
    return MENU_CONFIG[activeMenu]?.label ?? null;
  };

  return (
    <div className="app-wrapper">
      <Navbar
        activeMenu={hasSearched ? 'home' : activeMenu}
        onMenuClick={handleMenuClick}
        favoritesCount={favorites.length}
      />

      <main className="app">
        <SearchBar onSearch={handleSearch} />

        {getSectionLabel() && (
          <p className="section-label">{getSectionLabel()}</p>
        )}

        {activeMenu === 'favorit' && !hasSearched && favorites.length === 0 && (
          <div className="welcome-state">
            <span className="welcome-icon">🤍</span>
            <p>Belum ada film favorit. Klik ikon hati di kartu film untuk menyimpannya.</p>
          </div>
        )}

        {hasSearched && error && <p className="status error">{error}</p>}

        {hasSearched && !loading && !error && movies.length === 0 && (
          <div className="welcome-state">
            <span className="welcome-icon">🔍</span>
            <p>Film tidak ditemukan. Coba kata kunci lain.</p>
          </div>
        )}

        {baseList.length > 0 && !isLoadingNow && (
          <div className="filter-bar">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">Semua Tipe</option>
              <option value="movie">Movie</option>
              <option value="series">Series</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">Urutan Default</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="year-desc">Tahun Terbaru</option>
              <option value="year-asc">Tahun Terlama</option>
              <option value="title">Judul A–Z</option>
            </select>
          </div>
        )}

        {isLoadingNow ? (
          <SkeletonGrid count={8} />
        ) : (
          <MovieList
            movies={visibleMovies}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelect={setSelectedMovie}
          />
        )}
      </main>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          isFavorite={isFavorite(selectedMovie)}
          onToggleFavorite={toggleFavorite}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}

export default App;