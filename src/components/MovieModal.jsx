import { useEffect } from 'react';

function MovieModal({ movie, onClose, isFavorite, onToggleFavorite }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!movie) return null;

  const poster =
    movie.Poster !== 'N/A'
      ? movie.Poster
      : 'https://via.placeholder.com/300x445?text=No+Image';

  const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    movie.Title + ' trailer'
  )}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <div className="modal-body">
          <img src={poster} alt={movie.Title} className="modal-poster" />

          <div className="modal-info">
            <h2>
              {movie.Title} <span className="modal-year">({movie.Year})</span>
            </h2>

            {movie.imdbRating && movie.imdbRating !== 'N/A' && (
              <p className="modal-rating">⭐ {movie.imdbRating} / 10 IMDb</p>
            )}

            {movie.Genre && <p><strong>Genre:</strong> {movie.Genre}</p>}
            {movie.Runtime && <p><strong>Durasi:</strong> {movie.Runtime}</p>}
            {movie.Director && <p><strong>Sutradara:</strong> {movie.Director}</p>}
            {movie.Actors && <p><strong>Pemain:</strong> {movie.Actors}</p>}
            {movie.Plot && <p className="modal-plot">{movie.Plot}</p>}

            <div className="modal-actions">
              <a
                href={trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="trailer-btn"
              >
                ▶ Watch Trailer
              </a>

              <button
                className={`favorite-btn-modal ${isFavorite ? 'active' : ''}`}
                onClick={() => onToggleFavorite(movie)}
              >
                {isFavorite ? '❤️ Hapus dari Favorit' : '🤍 Tambah ke Favorit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieModal;