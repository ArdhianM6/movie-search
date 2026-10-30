import MovieCard from './MovieCard';

function MovieList({ movies, favorites, watchlist, watchedIds, onToggleFavorite, onToggleWatchlist, onSelect }) {
  if (!movies.length) return null;

  return (
    <div className="movie-list">
      {movies.map((movie) => <MovieCard key={movie.imdbID} movie={movie} isFavorite={favorites.some((item) => item.imdbID === movie.imdbID)} isInWatchlist={watchlist.some((item) => item.imdbID === movie.imdbID)} isWatched={watchedIds.includes(movie.imdbID)} onToggleFavorite={onToggleFavorite} onToggleWatchlist={onToggleWatchlist} onSelect={onSelect} />)}
    </div>
  );
}

export default MovieList;
