import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import MovieList from './components/MovieList';
import MovieDetailPage from './components/MovieDetailPage';
import SkeletonGrid from './components/SkeletonGrid';
import Toast from './components/Toast';
import './App.css';

const MENU_CONFIG = {
  home: { label: 'Pilihan populer', ids: ['tt1375666', 'tt0468569', 'tt4154796', 'tt0110912', 'tt0137523', 'tt0816692', 'tt6751668', 'tt1853728', 'tt9362722', 'tt15398776'] },
  indonesia: { label: 'Film Indonesia', search: 'indonesia' },
  inggris: { label: 'Film Inggris', search: 'british' },
  jepang: { label: 'Film Jepang', search: 'japanese' },
  korea: { label: 'Film Korea', search: 'korean' },
  anime: { label: 'Anime', search: 'anime' },
};

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

async function fetchMovies(query, page = 1, signal) {
  const apiKey = import.meta.env.VITE_OMDB_KEY;
  if (!apiKey) throw new Error('API key OMDb belum diatur. Tambahkan VITE_OMDB_KEY pada file .env.');

  const params = new URLSearchParams({ apikey: apiKey, s: query, page: String(page) });
  const response = await fetch(`https://www.omdbapi.com/?${params}`, { signal });
  if (!response.ok) throw new Error('Server film tidak dapat dihubungi. Coba lagi sebentar.');
  const data = await response.json();
  if (data.Response !== 'True') throw new Error(data.Error || 'Film tidak ditemukan. Coba kata kunci lain.');
  return { movies: data.Search || [], total: Number(data.totalResults) || 0 };
}

function App() {
  const [activeMenu, setActiveMenu] = useState('home');
  const [searchMode, setSearchMode] = useState(() => Boolean(new URLSearchParams(window.location.search).get('q')));
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') || '');
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState(() => window.location.pathname.match(/^\/movie\/([^/]+)/)?.[1] || '');
  const [sortBy, setSortBy] = useState('default');
  const [filterType, setFilterType] = useState('all');
  const [toast, setToast] = useState('');
  const [favorites, setFavorites] = useState(() => {
    const saved = readStorage('movie-favorites', []);
    return Array.isArray(saved) ? saved : [];
  });
  const [history, setHistory] = useState(() => {
    const saved = readStorage('movie-search-history', []);
    return Array.isArray(saved) ? saved : [];
  });
  const [watchlist, setWatchlist] = useState(() => {
    const saved = readStorage('movie-watchlist', []);
    return Array.isArray(saved) ? saved : [];
  });
  const [watchedIds, setWatchedIds] = useState(() => {
    const saved = readStorage('movie-watched', []);
    return Array.isArray(saved) ? saved : [];
  });

  const requestRef = useRef(null);
  const toastTimerRef = useRef(null);
  const detailCacheRef = useRef(new Map());
  const activeQuery = query.trim();
  const isSearchMode = searchMode && activeQuery.length > 0;

  useEffect(() => localStorage.setItem('movie-favorites', JSON.stringify(favorites)), [favorites]);
  useEffect(() => localStorage.setItem('movie-search-history', JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem('movie-watchlist', JSON.stringify(watchlist)), [watchlist]);
  useEffect(() => localStorage.setItem('movie-watched', JSON.stringify(watchedIds)), [watchedIds]);

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(''), 2400);
  }, []);

  const runSearch = useCallback(async (rawQuery, requestedPage = 1, addHistory = false) => {
    const nextQuery = rawQuery.trim();
    if (!nextQuery) return;
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setError('');
    setPage(requestedPage);
    setQuery(nextQuery);
    setSearchMode(true);
    if (requestedPage === 1) setMovies([]);

    const url = new URL(window.location.href);
    url.searchParams.set('q', nextQuery);
    url.searchParams.delete('page');
    if (requestedPage > 1) url.searchParams.set('page', String(requestedPage));
    window.history.replaceState({}, '', url);

    try {
      const result = await fetchMovies(nextQuery, requestedPage, controller.signal);
      if (controller.signal.aborted) return;
      setMovies((current) => requestedPage === 1 ? result.movies : [...current, ...result.movies]);
      setTotalResults(result.total);
      if (addHistory) {
        setHistory((current) => [nextQuery, ...current.filter((item) => item.toLowerCase() !== nextQuery.toLowerCase())].slice(0, 8));
      }
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setError(requestError.message || 'Terjadi kesalahan saat mengambil data.');
        if (requestedPage > 1) setPage(requestedPage - 1);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (detailId) return undefined;
    if (isSearchMode) {
      const initialPage = Number(new URLSearchParams(window.location.search).get('page')) || 1;
      const timer = window.setTimeout(() => runSearch(activeQuery, initialPage), 0);
      return () => {
        window.clearTimeout(timer);
        requestRef.current?.abort();
      };
    }

    if (searchMode) {
      return undefined;
    }

    if (activeMenu === 'watchlist' || activeMenu === 'watched') {
      const savedMovies = activeMenu === 'watchlist' ? watchlist : favorites.concat(watchlist).filter((movie, index, list) => watchedIds.includes(movie.imdbID) && list.findIndex((item) => item.imdbID === movie.imdbID) === index);
      const timer = window.setTimeout(() => {
        setMovies(savedMovies);
        setTotalResults(savedMovies.length);
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const category = MENU_CONFIG[activeMenu];
    if (!category) return undefined;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError('');
      const categoryRequest = category.ids
        ? Promise.all(category.ids.map(async (id) => {
          const apiKey = import.meta.env.VITE_OMDB_KEY;
          if (!apiKey) throw new Error('API key OMDb belum diatur. Tambahkan VITE_OMDB_KEY pada file .env.');
          const params = new URLSearchParams({ apikey: apiKey, i: id });
          const response = await fetch(`https://www.omdbapi.com/?${params}`, { signal: controller.signal });
          if (!response.ok) throw new Error('Server film tidak dapat dihubungi. Coba lagi sebentar.');
          return response.json();
        })).then((results) => ({ movies: results.filter((movie) => movie.Response === 'True'), total: results.length }))
        : fetchMovies(category.search, 1, controller.signal);
      categoryRequest
        .then(({ movies: results, total }) => {
          if (!controller.signal.aborted) {
            setMovies(results);
            setTotalResults(total);
          }
        })
        .catch((requestError) => {
          if (requestError.name !== 'AbortError') setError(requestError.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [activeMenu, isSearchMode, activeQuery, runSearch, watchlist, favorites, watchedIds, searchMode, detailId]);

  useEffect(() => () => {
    requestRef.current?.abort();
    window.clearTimeout(toastTimerRef.current);
  }, []);

  const openMovie = useCallback((movie) => {
    const url = new URL(window.location.href);
    url.pathname = `/movie/${movie.imdbID}`;
    url.search = '';
    window.history.pushState({}, '', url);
    setDetailId(movie.imdbID);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const closeDetails = useCallback(() => {
    if (window.location.pathname.startsWith('/movie/')) window.history.pushState({}, '', '/');
    setDetailId('');
  }, []);

  useEffect(() => {
    const syncRoute = () => setDetailId(window.location.pathname.match(/^\/movie\/([^/]+)/)?.[1] || '');
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  useEffect(() => {
    if (!detailId) return;
    const url = new URL(window.location.href);
    url.search = '';
    url.pathname = `/movie/${detailId}`;
    window.history.replaceState({}, '', url);
  }, [detailId]);

  const loadMovieById = useCallback(async (imdbID) => {
    const cached = detailCacheRef.current.get(imdbID);
    if (cached) return cached;
    const apiKey = import.meta.env.VITE_OMDB_KEY;
    if (!apiKey) throw new Error('API key OMDb belum diatur. Tambahkan VITE_OMDB_KEY pada file .env.');
    const params = new URLSearchParams({ apikey: apiKey, i: imdbID, plot: 'full' });
    const response = await fetch(`https://www.omdbapi.com/?${params}`);
    if (!response.ok) throw new Error('Detail film tidak dapat dimuat.');
    const data = await response.json();
    if (data.Response !== 'True') throw new Error(data.Error || 'Detail film tidak ditemukan.');
    detailCacheRef.current.set(imdbID, data);
    return data;
  }, []);

  const toggleInList = useCallback((movie, list, setter, label) => {
    const exists = list.some((item) => item.imdbID === movie.imdbID);
    setter((current) => exists ? current.filter((item) => item.imdbID !== movie.imdbID) : [...current, movie]);
    showToast(exists ? `${movie.Title} dihapus dari ${label}.` : `${movie.Title} ditambahkan ke ${label}.`);
  }, [showToast]);

  const toggleWatched = useCallback((movie) => {
    setWatchedIds((current) => current.includes(movie.imdbID)
      ? current.filter((id) => id !== movie.imdbID)
      : [...current, movie.imdbID]);
  }, []);

  const handleMenuClick = useCallback((menuId) => {
    requestRef.current?.abort();
    setQuery('');
    setSearchMode(false);
    setMovies([]);
    setDetailId('');
    setActiveMenu(menuId);
    setError('');
    setPage(1);
    setSortBy('default');
    setFilterType('all');
    const url = new URL(window.location.href);
    url.pathname = '/';
    url.searchParams.delete('q');
    url.searchParams.delete('page');
    window.history.replaceState({}, '', url);
  }, []);

  const visibleMovies = useMemo(() => {
    const result = movies.filter((movie) => filterType === 'all' || movie.Type === filterType);
    if (sortBy === 'title') result.sort((a, b) => a.Title.localeCompare(b.Title));
    if (sortBy === 'year-desc') result.sort((a, b) => (parseInt(b.Year, 10) || 0) - (parseInt(a.Year, 10) || 0));
    if (sortBy === 'year-asc') result.sort((a, b) => (parseInt(a.Year, 10) || 0) - (parseInt(b.Year, 10) || 0));
    if (sortBy === 'rating') result.sort((a, b) => (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0));
    return result;
  }, [movies, filterType, sortBy]);

  const activeLabel = isSearchMode
    ? `Hasil untuk “${activeQuery}”`
    : activeMenu === 'watchlist' ? 'Watchlist kamu' : activeMenu === 'watched' ? 'Sudah ditonton' : MENU_CONFIG[activeMenu]?.label;

  return (
    <div className="app-wrapper">
      <Navbar activeMenu={isSearchMode ? '' : activeMenu} onMenuClick={handleMenuClick} favoritesCount={favorites.length} watchlistCount={watchlist.length} />

      {detailId ? <MovieDetailPage key={detailId} movieId={detailId} onBack={closeDetails} onLoadMovie={loadMovieById} favorite={favorites.some((item) => item.imdbID === detailId)} inWatchlist={watchlist.some((item) => item.imdbID === detailId)} watched={watchedIds.includes(detailId)} onToggleFavorite={(movie) => toggleInList(movie, favorites, setFavorites, 'favorit')} onToggleWatchlist={(movie) => toggleInList(movie, watchlist, setWatchlist, 'watchlist')} onToggleWatched={toggleWatched} /> : <>

      <main className="app">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">PUSAT REFERENSI FILM</p>
            <h1 id="hero-title">Temukan cerita<br /><span>yang kamu suka.</span></h1>
            <p className="hero-description">Jelajahi film dan serial dari seluruh dunia, simpan pilihanmu, lalu tentukan tontonan berikutnya.</p>
            <SearchBar onSearch={(value) => runSearch(value, 1, true)} history={history} onPickHistory={(value) => runSearch(value, 1, true)} onClearHistory={() => setHistory([])} />
            <div className="hero-meta"><span><i className="meta-dot" /> Didukung database IMDb</span><span>Film, serial, dan anime</span></div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-poster-grid">
              {movies.slice(0, 4).map((movie) => <img key={movie.imdbID} src={!movie.Poster || movie.Poster === 'N/A' ? '/poster-fallback.svg' : movie.Poster} alt="" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/poster-fallback.svg'; }} />)}
            </div>
            <div className="hero-art-caption"><span>NOW SHOWING</span><strong>Stories worth staying up for.</strong></div>
          </div>
        </section>

        <section className="catalog" aria-labelledby="section-title">
          <div className="section-heading">
            <div><p className="eyebrow">KOLEKSI PILIHAN</p><h2 id="section-title">{activeLabel}</h2></div>
            {!loading && !error && movies.length > 0 && <p className="result-count">{isSearchMode ? `${totalResults.toLocaleString('id-ID')} judul ditemukan` : `${movies.length} judul`}</p>}
          </div>

          {!isSearchMode && activeMenu !== 'watchlist' && activeMenu !== 'watched' && (
            <div className="category-tabs" aria-label="Kategori film">
              {Object.entries(MENU_CONFIG).map(([id, category]) => (
                <button key={id} type="button" className={`category-tab ${activeMenu === id ? 'active' : ''}`} onClick={() => handleMenuClick(id)}>{category.label}</button>
              ))}
            </div>
          )}

          {movies.length > 0 && !loading && (
            <div className="filter-bar">
              <label>Jenis<select value={filterType} onChange={(event) => setFilterType(event.target.value)}><option value="all">Semua</option><option value="movie">Film</option><option value="series">Serial</option><option value="game">Game</option></select></label>
              <label>Urutkan<select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="default">Rekomendasi</option><option value="rating">Rating tertinggi</option><option value="year-desc">Tahun terbaru</option><option value="year-asc">Tahun terlama</option><option value="title">Judul A–Z</option></select></label>
            </div>
          )}

          {error && <div className="state-panel state-error"><span className="state-icon">!</span><h3>Ada kendala memuat film</h3><p>{error}</p><button type="button" className="button-secondary" onClick={() => isSearchMode ? runSearch(activeQuery, page) : handleMenuClick(activeMenu)}>Coba lagi</button></div>}
          {!loading && !error && movies.length === 0 && <div className="state-panel"><span className="state-icon">⌕</span><h3>{activeMenu === 'watchlist' ? 'Watchlist masih kosong' : activeMenu === 'watched' ? 'Belum ada yang ditonton' : isSearchMode ? 'Film belum ditemukan' : 'Belum ada film untuk ditampilkan'}</h3><p>{activeMenu === 'watchlist' ? 'Simpan film dari tombol bookmark pada kartu untuk menemukannya di sini.' : activeMenu === 'watched' ? 'Tandai film sebagai sudah ditonton dari panel detail.' : 'Coba kata kunci atau kategori yang berbeda.'}</p></div>}
          {loading && movies.length === 0 ? <SkeletonGrid count={10} /> : <MovieList movies={visibleMovies} favorites={favorites} watchlist={watchlist} watchedIds={watchedIds} onToggleFavorite={(movie) => toggleInList(movie, favorites, setFavorites, 'favorit')} onToggleWatchlist={(movie) => toggleInList(movie, watchlist, setWatchlist, 'watchlist')} onSelect={openMovie} />}

          {loading && movies.length > 0 && <div className="load-more-status">Memuat halaman berikutnya...</div>}
          {isSearchMode && !loading && movies.length > 0 && movies.length < totalResults && <div className="load-more-wrap"><button type="button" className="button-secondary load-more" onClick={() => runSearch(activeQuery, page + 1)}>Muat lebih banyak <span>({movies.length} dari {totalResults})</span></button></div>}
        </section>
        <footer className="site-footer"><span>SCREEN / SEARCH</span><span>Data film disediakan oleh OMDb API</span><span>Dirancang untuk pecinta cerita.</span></footer>
      </main>
      <Toast message={toast} />
      </>}
    </div>
  );
}

export default App;
