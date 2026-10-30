function MovieCard({ movie, isFavorite, isInWatchlist, isWatched, onToggleFavorite, onToggleWatchlist, onSelect }) {
  const poster = !movie.Poster || movie.Poster === 'N/A' ? '/poster-fallback.svg' : movie.Poster;
  const rating = movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : null;

  return (
    <article className="movie-card">
      <button type="button" className="movie-open" onClick={() => onSelect(movie)} aria-label={`Lihat detail ${movie.Title}`}>
        <span className="poster-wrap">
          <img src={poster} alt={`Poster ${movie.Title}`} loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/poster-fallback.svg'; }} />
          {rating && <span className="rating-badge"><span aria-hidden="true">★</span> {rating}</span>}
          <span className="poster-type">{movie.Type === 'series' ? 'SERIAL' : movie.Type === 'game' ? 'GAME' : 'FILM'}</span>
          {isWatched && <span className="watched-tag">SUDAH DITONTON</span>}
        </span>
        <span className="movie-card-copy"><strong>{movie.Title}</strong><span>{movie.Year || 'Tahun tidak tersedia'}</span></span>
      </button>
      <div className="movie-card-actions">
        <button type="button" className={`icon-action ${isInWatchlist ? 'selected' : ''}`} onClick={() => onToggleWatchlist(movie)} aria-label={isInWatchlist ? `Hapus ${movie.Title} dari watchlist` : `Simpan ${movie.Title} ke watchlist`} title={isInWatchlist ? 'Hapus dari watchlist' : 'Simpan ke watchlist'}><span aria-hidden="true">{isInWatchlist ? '✓' : '+'}</span></button>
        <button type="button" className={`icon-action favorite-action ${isFavorite ? 'selected' : ''}`} onClick={() => onToggleFavorite(movie)} aria-label={isFavorite ? `Hapus ${movie.Title} dari favorit` : `Tambah ${movie.Title} ke favorit`} title={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}><span aria-hidden="true">♥</span></button>
      </div>
    </article>
  );
}

export default MovieCard;
