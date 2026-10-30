import { useEffect, useRef, useState } from 'react';

function SearchBar({ onSearch, history, onPickHistory, onClearHistory }) {
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') || '');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const closeOnOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setIsHistoryOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      window.clearTimeout(debounceRef.current);
    };
  }, []);

  const submit = (event) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    window.clearTimeout(debounceRef.current);
    setIsHistoryOpen(false);
    onSearch(value);
  };

  return (
    <div className="search-wrap" ref={wrapperRef}>
      <form className="search-bar" onSubmit={submit} role="search">
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          aria-label="Cari judul film atau serial"
          placeholder="Cari film, serial, atau anime..."
          value={query}
          onFocus={() => setIsHistoryOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            window.clearTimeout(debounceRef.current);
            if (event.target.value.trim()) debounceRef.current = window.setTimeout(() => onSearch(event.target.value), 700);
          }}
        />
        {query && <button type="button" className="search-clear" aria-label="Hapus pencarian" onClick={() => { setQuery(''); window.clearTimeout(debounceRef.current); }}>×</button>}
        <button className="search-submit" type="submit">Cari <span aria-hidden="true">↗</span></button>
      </form>
      {isHistoryOpen && history.length > 0 && (
        <div className="search-history" role="listbox" aria-label="Pencarian terakhir">
          <div className="history-heading"><span>TERAKHIR DICARI</span><button type="button" onClick={onClearHistory}>Hapus riwayat</button></div>
          {history.map((item) => <button key={item} type="button" className="history-item" role="option" aria-selected="false" onClick={() => { setQuery(item); setIsHistoryOpen(false); onPickHistory(item); }}><span aria-hidden="true">↺</span>{item}</button>)}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
