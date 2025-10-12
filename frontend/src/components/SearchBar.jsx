// frontend/src/components/SearchBar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchBar() {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = () => {
        navigate('/search', { state: { query } });
    };

    return (
        <div style={{ display: 'flex', margin: '20px' }}>
            <input type="text" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 1, padding: '10px' }} />
            <button onClick={handleSearch} style={{ padding: '10px' }}>Search</button>
        </div>
    );
}

export default SearchBar;
