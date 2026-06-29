function SkeletonGrid({ count = 8 }) {
  return (
    <div className="movie-list">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-poster"></div>
          <div className="skeleton-line short"></div>
          <div className="skeleton-line"></div>
        </div>
      ))}
    </div>
  );
}

export default SkeletonGrid;