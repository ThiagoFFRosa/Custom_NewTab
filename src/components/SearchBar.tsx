import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { isUrl, formatUrl } from '../utils/url';
import { GlassCard } from './GlassCard';

interface SearchBarProps {
  engineName: string;
  searchUrl: string;
  placeholder?: string;
}

export function SearchBar({ engineName, searchUrl, placeholder }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus search on mount
    inputRef.current?.focus();
    
    // Also focus when pressing any letter key if not focused on another input
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName !== 'INPUT' && 
        document.activeElement?.tagName !== 'TEXTAREA' &&
        e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey
      ) {
        inputRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (isUrl(query)) {
      window.location.href = formatUrl(query.trim());
    } else {
      window.location.href = `${searchUrl}${encodeURIComponent(query)}`;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 relative group">
      <form onSubmit={handleSubmit} className="w-full">
        <input
          ref={inputRef}
          type="text"
          className="w-full bg-white/5 border border-white/10 backdrop-blur-xl px-8 py-5 rounded-full text-lg outline-none focus:border-white/30 transition-all placeholder:text-white/20 text-center"
          placeholder={placeholder || `Search with ${engineName} or enter address`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-50 transition-opacity pointer-events-none">
          <Search size={20} />
        </div>
      </form>
    </div>
  );
}

