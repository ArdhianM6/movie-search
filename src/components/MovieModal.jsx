import { useEffect, useRef } from 'react';

function MovieModal({ movie, onClose, isFavorite, isInWatchlist, isWatched, onToggleFavorite, onToggleWatchlist, onToggleWatched }) {
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [onClose]);

  const poster = !movie.Poster || movie.Poster === 'N/A' ? '/poster-fallback.svg' : movie.Poster;
  const rating = movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : null;
  const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.Title} ${movie.Year || ''} official trailer`)}`;

  return (
    <div className="modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
        <section className="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title" onKeyDown={(event) => {
          if (event.key !== 'Tab') return;
          const focusable = event.currentTarget.querySelectorAll('button, a[href]');
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }}>
        <button ref={closeButtonRef} type="button" className="modal-close" onClick={onClose} aria-label="Tutup detail">×</button>
        <div className="modal-body">
          <img src={poster} alt={`Poster ${movie.Title}`} className="modal-poster" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/poster-fallback.svg'; }} />
          <div className="modal-info">
            <p className="eyebrow">{movie.Type === 'series' ? 'SERIAL' : movie.Type === 'game' ? 'GAME' : 'FILM'}{movie.Year && ` · ${movie.Year}`}</p>
            <h2 id="modal-title">{movie.Title}</h2>
            {rating && <p className="modal-rating"><span aria-hidden="true">★</span> {rating} <span>/ 10 IMDb</span></p>}
            <div className="modal-facts">{movie.Rated && movie.Rated !== 'N/A' && <span>{movie.Rated}</span>}{movie.Runtime && movie.Runtime !== 'N/A' && <span>{movie.Runtime}</span>}{movie.Released && movie.Released !== 'N/A' && <span>{movie.Released}</span>}</div>
            {movie.detailLoading && <p className="detail-loading" aria-live="polite">Memuat detail film...</p>}
            {movie.detailError && <p className="detail-error" role="status">{movie.detailError}</p>}
            {movie.Genre && movie.Genre !== 'N/A' && <p><strong>Genre</strong><span>{movie.Genre}</span></p>}
            {movie.Director && movie.Director !== 'N/A' && <p><strong>Sutradara</strong><span>{movie.Director}</span></p>}
            {movie.Actors && movie.Actors !== 'N/A' && <p><strong>Pemeran</strong><span>{movie.Actors}</span></p>}
            {movie.Plot && movie.Plot !== 'N/A' && <p className="modal-plot">{movie.Plot}</p>}
            <div className="modal-actions">
              <a href={trailerUrl} target="_blank" rel="noopener noreferrer" className="button-primary">Cari trailer <span aria-hidden="true">↗</span></a>
              <button type="button" className={`button-secondary ${isInWatchlist ? 'selected' : ''}`} onClick={() => onToggleWatchlist(movie)}>{isInWatchlist ? '✓ Di watchlist' : '+ Watchlist'}</button>
              <button type="button" className={`button-secondary ${isWatched ? 'selected' : ''}`} onClick={() => onToggleWatched(movie)}>{isWatched ? '✓ Sudah ditonton' : 'Tandai ditonton'}</button>
              <button type="button" className={`button-secondary ${isFavorite ? 'selected favorite-selected' : ''}`} onClick={() => onToggleFavorite(movie)}>{isFavorite ? '♥ Favorit' : '♡ Favorit'}</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MovieModal;
