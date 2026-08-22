'use client';

import { useEffect, useRef, useState } from 'react';
import { LocationName } from '@/lib/config';

type Props = {
  value: string;
  disabled?: boolean;
  placeholder?: string;
  location: LocationName;
  onChange: (value: string) => void;
};

async function readJsonSafely(res: Response) {
  try { return await res.json(); } catch { return { artists: [] }; }
}

export default function ArtistAutocompleteInput({ value, disabled, placeholder = 'Artist / Terminname', location, onChange }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const requestId = useRef(0);

  useEffect(() => {
    const q = value.trim();
    setActiveIndex(-1);

    if (disabled || q.length < 1) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const currentRequest = ++requestId.current;
    const timeout = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/artists?q=${encodeURIComponent(q)}&limit=10`, { cache: 'no-store' });
        const json = await readJsonSafely(res);
        if (currentRequest !== requestId.current) return;
        const nextSuggestions = Array.isArray(json.artists)
          ? json.artists.filter((item: unknown): item is string => typeof item === 'string' && item.trim() && item.trim() !== value.trim())
          : [];
        setSuggestions(nextSuggestions);
        setOpen(nextSuggestions.length > 0);
      } catch {
        if (currentRequest !== requestId.current) return;
        setSuggestions([]);
        setOpen(false);
      }
    }, 160);

    return () => window.clearTimeout(timeout);
  }, [value, disabled, location]);

  function selectSuggestion(name: string) {
    onChange(name);
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
  }

  return <div className="relative">
    <input
      className="input"
      disabled={disabled}
      placeholder={placeholder}
      value={value}
      autoComplete="off"
      onChange={ev => onChange(ev.target.value)}
      onFocus={() => { if (suggestions.length) setOpen(true); }}
      onBlur={() => window.setTimeout(() => setOpen(false), 120)}
      onKeyDown={ev => {
        if (!open || !suggestions.length) return;
        if (ev.key === 'ArrowDown') {
          ev.preventDefault();
          setActiveIndex(index => index >= suggestions.length - 1 ? 0 : index + 1);
        }
        if (ev.key === 'ArrowUp') {
          ev.preventDefault();
          setActiveIndex(index => index <= 0 ? suggestions.length - 1 : index - 1);
        }
        if (ev.key === 'Enter' && activeIndex >= 0) {
          ev.preventDefault();
          selectSuggestion(suggestions[activeIndex]);
        }
        if (ev.key === 'Escape') {
          setOpen(false);
          setActiveIndex(-1);
        }
      }}
    />

    {open && suggestions.length > 0 && <div className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[#c9d7e8] bg-white shadow-xl shadow-[#06285f]/15">
      <div className="px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Vorschläge</div>
      {suggestions.map((name, index) => <button
        key={`${name}-${index}`}
        type="button"
        className={`block w-full px-3 py-2 text-left text-sm font-bold text-[#06285f] hover:bg-[#f3f7fb] ${index === activeIndex ? 'bg-[#f3f7fb]' : ''}`}
        onMouseDown={ev => {
          ev.preventDefault();
          selectSuggestion(name);
        }}
      >{name}</button>)}
    </div>}
  </div>;
}
