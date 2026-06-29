function MovieCard({ movie, isFavorite, onToggleFavorite, onSelect }) {
  const poster =
    movie.Poster !== 'N/A'
      ? movie.Poster
      : 'https://via.placeholder.com/300x445?text=No+Image';

  const rating =
    movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : null;

  return (
    <div className="movie-card" onClick={() => onSelect(movie)}>
      <div className="poster-wrap">
        <img src={poster} alt={movie.Title} />

        {rating && <span className="rating-badge">⭐ {rating}</span>}

        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation(); // biar klik hati tidak ikut membuka modal
            onToggleFavorite(movie);
          }}
          aria-label="Tambah ke favorit"
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      <h3>{movie.Title}</h3>
      <p>{movie.Year}</p>
    </div>
  );
}

export default MovieCard;