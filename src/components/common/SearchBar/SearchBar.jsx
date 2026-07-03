import React from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ placeholder = 'Search...', value, onChange, className = '' }) => {
  return (
    <div style={{ position: 'relative', width: '100%' }} className={className}>
      <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
      <input
        type="text"
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ paddingLeft: '36px' }}
      />
    </div>
  );
};

export default SearchBar;