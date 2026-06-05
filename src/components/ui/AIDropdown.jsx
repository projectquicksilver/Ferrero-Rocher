import React, { useState, useEffect, useRef } from 'react';

/**
 * AIDropdown: A premium searchable dropdown that suggests items from an array.
 * Includes an "Others" option to switch to free-text input.
 */
export const AIDropdown = ({ 
  label, 
  value, 
  options = [], 
  onChange, 
  onOther, 
  loading = false, 
  placeholder = "Select an option..." 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isManual, setIsManual] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (opt) => {
    if (opt === 'Others') {
      setIsManual(true);
      onOther?.();
    } else {
      onChange(opt);
    }
    setIsOpen(false);
    setSearch('');
  };

  if (isManual) {
    return (
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.6rem' }}>
          <label style={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase' }}>{label}</label>
          <button 
            type="button"
            onClick={() => setIsManual(false)} 
            style={{ background: 'none', border: 'none', color: 'var(--g4)', fontSize: '.7rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Show Suggestions
          </button>
        </div>
        <div style={{ background: '#1a1a1a', border: '1.5px solid #2a2a2a', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center' }}>
          <input 
            autoFocus
            placeholder={`Enter ${label.toLowerCase()}...`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none', fontSize: '1rem' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', marginBottom: '1rem' }} ref={dropdownRef}>
      <label style={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: '.6rem', display: 'block' }}>
        {label}
      </label>
      
      <div 
        onClick={() => !loading && setIsOpen(!isOpen)}
        style={{ 
          background: '#1a1a1a', 
          border: '1.5px solid', 
          borderColor: isOpen ? 'var(--g4)' : '#2a2a2a',
          borderRadius: '12px', 
          padding: '1rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: loading ? 'wait' : 'pointer',
          transition: 'all .2s'
        }}
      >
        <span style={{ color: value ? '#fff' : 'var(--t3)', fontSize: '1rem' }}>
          {loading ? 'Thinking...' : value || placeholder}
        </span>
        <span className={`material-symbols-outlined ${loading ? 'aspin' : ''}`} style={{ color: 'var(--t3)', fontSize: '1.2rem', transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
          {loading ? 'sync' : 'expand_more'}
        </span>
      </div>

      {isOpen && (
        <div className="au" style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          right: 0, 
          background: '#1a1a1a', 
          border: '1px solid #333', 
          borderRadius: '12px', 
          marginTop: '.5rem', 
          zIndex: 100, 
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          animation: 'slideUpIn .2s ease-out'
        }}>
          <div style={{ padding: '.75rem', borderBottom: '1px solid #2a2a2a' }}>
            <input 
              placeholder="Filter list..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '.6rem', color: '#fff', width: '100%', outline: 'none', fontSize: '.9rem' }}
            />
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredOptions.map((opt, i) => (
              <div 
                key={i} 
                onClick={() => handleSelect(opt)}
                style={{ padding: '1rem', cursor: 'pointer', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: '.7rem', transition: 'background .2s' }}
                onMouseEnter={(e) => e.target.style.background = '#222'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--g4)' }}></div>
                <span style={{ fontSize: '.95rem', color: value === opt ? 'var(--g4)' : '#eee', fontWeight: value === opt ? 700 : 400 }}>{opt}</span>
              </div>
            ))}
            <div 
              onClick={() => handleSelect('Others')}
              style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.7rem', color: 'var(--g4)', fontWeight: 800 }}
              onMouseEnter={(e) => e.target.style.background = '#222'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>add_circle</span>
              <span style={{ fontSize: '.95rem' }}>Others (Type Manually)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
