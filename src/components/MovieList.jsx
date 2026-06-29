import MovieCard from './MovieCard';

function MovieList({ movies, favorites, onToggleFavorite, onSelect }) {
  return (
    <div className="movie-list">
      {movies.map((movie, index) => (
        <div
          key={movie.imdbID}
          className="movie-card-wrapper"
          style={{ animationDelay: `${index * 0.06}s` }}
        >
          <MovieCard
            movie={movie}
            isFavorite={favorites.some((f) => f.imdbID === movie.imdbID)}
            onToggleFavorite={onToggleFavorite}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
}

export default MovieList;