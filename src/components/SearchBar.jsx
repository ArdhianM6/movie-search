import { useState, useEffect, useRef } from 'react';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const debounceRef = useRef(null);

  // Auto search 600ms setelah user berhenti mengetik
  useEffect(() => {
    if (query.trim() === '') return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(query);
    }, 600);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() === '') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearch(query);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Ketik judul film... (otomatis mencari)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit">Cari</button>
    </form>
  );
}

export default SearchBar;