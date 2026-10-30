import { useEffect, useState } from 'react';

function MovieDetailPage({ movieId, onBack, onLoadMovie, favorite, inWatchlist, watched, onToggleFavorite, onToggleWatchlist, onToggleWatched }) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [review, setReview] = useState(() => {
    try { return localStorage.getItem(`movie-review-${movieId}`) || ''; } catch { return ''; }
  });
  const [reviewSaved, setReviewSaved] = useState(false);

  useEffect(() => {
    let ignore = false;
    onLoadMovie(movieId)
      .then((data) => { if (!ignore) setMovie(data); })
      .catch((requestError) => { if (!ignore) setError(requestError.message || 'Detail film tidak dapat dimuat.'); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [movieId, onLoadMovie]);

  useEffect(() => {
    try { localStorage.setItem(`movie-review-${movieId}`, review); } catch { /* Storage may be unavailable in private browsing. */ }
  }, [movieId, review]);

  const title = movie?.Title || 'film';
  const year = movie?.Year || '';
  const encodedTitle = encodeURIComponent(`${title} ${year}`.trim());
  const poster = !movie?.Poster || movie.Poster === 'N/A' ? '/poster-fallback.svg' : movie.Poster;

  return (
    <main className="detail-page">
      <div className="detail-topbar">
        <button type="button" className="detail-back" onClick={onBack}><span aria-hidden="true">←</span> Kembali ke katalog</button>
        <span className="detail-breadcrumb">SCREEN / SEARCH <span>/</span> DETAIL FILM</span>
      </div>

      {loading && <div className="detail-state"><span className="detail-spinner" /><p>Memuat detail film...</p></div>}
      {!loading && error && <div className="state-panel state-error"><span className="state-icon">!</span><h3>Detail film tidak tersedia</h3><p>{error}</p><button type="button" className="button-secondary" onClick={onBack}>Kembali ke katalog</button></div>}

      {!loading && movie && <>
        <section className="detail-hero">
          <div className="detail-backdrop" style={{ backgroundImage: `linear-gradient(90deg, #10110f 0%, rgba(16,17,15,.93) 38%, rgba(16,17,15,.38) 100%), linear-gradient(0deg, #10110f 0%, transparent 70%), url("${poster}")` }} />
          <div className="detail-hero-content">
            <img className="detail-poster" src={poster} alt={`Poster ${title}`} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/poster-fallback.svg'; }} />
            <div className="detail-title-block">
              <p className="eyebrow">{movie.Type === 'series' ? 'SERIAL' : movie.Type === 'game' ? 'GAME' : 'FILM'}{year && ` · ${year}`}{movie.Rated && movie.Rated !== 'N/A' ? ` · ${movie.Rated}` : ''}</p>
              <h1>{title}</h1>
              {movie.Tagline && movie.Tagline !== 'N/A' && <p className="detail-tagline">{movie.Tagline}</p>}
              <div className="detail-score-row">
                {movie.imdbRating && movie.imdbRating !== 'N/A' && <span className="detail-score"><strong>★ {movie.imdbRating}</strong><small>IMDb</small></span>}
                {movie.Runtime && movie.Runtime !== 'N/A' && <span>{movie.Runtime}</span>}
                {movie.Genre && movie.Genre !== 'N/A' && <span>{movie.Genre}</span>}
              </div>
              <div className="detail-actions">
                <a className="button-primary" href={`https://www.youtube.com/results?search_query=${encodedTitle}%20official%20trailer`} target="_blank" rel="noopener noreferrer">Lihat trailer resmi <span aria-hidden="true">↗</span></a>
                <button type="button" className={`button-secondary ${inWatchlist ? 'selected' : ''}`} onClick={() => onToggleWatchlist(movie)}>{inWatchlist ? '✓ Di watchlist' : '+ Watchlist'}</button>
                <button type="button" className={`button-secondary ${favorite ? 'selected favorite-selected' : ''}`} onClick={() => onToggleFavorite(movie)}>{favorite ? '♥ Favorit' : '♡ Favorit'}</button>
              </div>
            </div>
          </div>
        </section>

        <div className="detail-layout">
          <div className="detail-main-column">
            <section className="detail-section">
              <p className="eyebrow">TENTANG FILM</p>
              <h2>Sinopsis</h2>
              <p className="detail-plot">{movie.Plot && movie.Plot !== 'N/A' ? movie.Plot : 'Sinopsis belum tersedia untuk judul ini.'}</p>
              <div className="detail-credit-grid">
                {movie.Director && movie.Director !== 'N/A' && <div><span>SUTRADARA</span><strong>{movie.Director}</strong></div>}
                {movie.Writer && movie.Writer !== 'N/A' && <div><span>PENULIS</span><strong>{movie.Writer}</strong></div>}
                {movie.Actors && movie.Actors !== 'N/A' && <div><span>PEMERAN</span><strong>{movie.Actors}</strong></div>}
                {movie.Country && movie.Country !== 'N/A' && <div><span>NEGARA</span><strong>{movie.Country}</strong></div>}
              </div>
            </section>

            <section className="detail-section review-section">
              <div className="review-heading"><div><p className="eyebrow">CATATAN PRIBADI</p><h2>Ulasan kamu</h2></div><span>TERSIMPAN DI PERANGKAT INI</span></div>
              <label className="sr-only" htmlFor="personal-review">Tulis ulasan pribadi</label>
              <textarea id="personal-review" value={review} onChange={(event) => { setReview(event.target.value); setReviewSaved(false); }} placeholder="Apa yang paling berkesan dari film ini? Catatan ini hanya tersimpan di browser kamu." rows="4" />
              <div className="review-footer"><span>{reviewSaved ? 'Catatan tersimpan.' : 'Catatan tersimpan otomatis.'}</span><button className="button-secondary" type="button" onClick={() => { try { localStorage.setItem(`movie-review-${movieId}`, review); setReviewSaved(true); } catch { setReviewSaved(false); } }}>Simpan catatan</button></div>
            </section>
          </div>

          <aside className="detail-aside">
            <section className="provider-panel">
              <p className="eyebrow">TONTON SECARA LEGAL</p>
              <h2>Cari tempat menonton</h2>
              <p>Ketersediaan berbeda menurut negara dan dapat berubah. Periksa langsung di layanan resmi.</p>
              <a href={`https://www.justwatch.com/id/search?q=${encodedTitle}`} target="_blank" rel="noopener noreferrer" className="provider-link"><span className="provider-mark">JW</span><span><strong>Cari di JustWatch</strong><small>Periksa layanan streaming Indonesia</small></span><b aria-hidden="true">↗</b></a>
              <a href={`https://www.google.com/search?q=${encodedTitle}%20streaming%20resmi`} target="_blank" rel="noopener noreferrer" className="provider-link"><span className="provider-mark provider-mark-google">G</span><span><strong>Cari layanan resmi</strong><small>Hasil pencarian untuk judul ini</small></span><b aria-hidden="true">↗</b></a>
              <p className="provider-note">Screen Search tidak meng-host atau memutar film. Tautan di atas membawa kamu ke situs penyedia.</p>
            </section>
            {movie.Awards && movie.Awards !== 'N/A' && <section className="awards-panel"><p className="eyebrow">PENGHARGAAN</p><p>{movie.Awards}</p></section>}
            <button type="button" className={`watched-toggle ${watched ? 'selected' : ''}`} onClick={() => onToggleWatched(movie)}><span>{watched ? '✓' : '○'}</span>{watched ? 'Sudah kamu tonton' : 'Tandai sudah ditonton'}</button>
          </aside>
        </div>
      </>}
    </main>
  );
}

export default MovieDetailPage;
