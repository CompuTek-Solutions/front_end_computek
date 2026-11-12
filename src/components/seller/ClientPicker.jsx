import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Search, UserPlus, X } from 'lucide-react';
import { clientAPI } from '../../services/api';
import { inputClass } from '../ui';

export default function ClientPicker({ value, onChange, onCreate }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = { page: 1, pageSize: 8 };
        if (term.trim()) params.search = term.trim();
        const { data } = await clientAPI.getAll(params);
        if (!cancelled) {
          setResults(Array.isArray(data) ? data : data?.data ?? []);
          setHighlight(0);
        }
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term, open]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const select = (client) => {
    onChange(client);
    setTerm('');
    setOpen(false);
  };

  const create = () => {
    onCreate(term.trim());
    setOpen(false);
  };

  const optionCount = results.length + 1;

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => (h + 1) % optionCount);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h - 1 + optionCount) % optionCount);
    } else if (e.key === 'Enter' && open) {
      e.preventDefault();
      if (highlight < results.length) select(results[highlight]);
      else create();
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-dark-900 truncate">{value.name}</p>
          <p className="text-xs text-dark-500 truncate">
            {[value.phone, value.email].filter(Boolean).join(' · ') || 'Aucune coordonnée'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-lg text-dark-500 hover:bg-white hover:text-dark-900"
          aria-label="Retirer le client"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
      <input
        type="text"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Nom, téléphone ou email (facultatif)"
        className={`${inputClass} pl-9`}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-dark-400" />}

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-dark-200 bg-white py-1 shadow-lg"
        >
          {results.map((client, index) => (
            <li key={client.id} role="option" aria-selected={highlight === index}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(client)}
                onMouseEnter={() => setHighlight(index)}
                className={`w-full px-3 py-2 text-left ${highlight === index ? 'bg-primary-50' : ''}`}
              >
                <p className="text-sm font-medium text-dark-900 truncate">{client.name}</p>
                <p className="text-xs text-dark-500 truncate">
                  {[client.phone, client.email].filter(Boolean).join(' · ') || '—'}
                </p>
              </button>
            </li>
          ))}
          {!loading && results.length === 0 && term.trim() && (
            <li className="px-3 py-2 text-sm text-dark-500">Aucun client trouvé</li>
          )}
          <li role="option" aria-selected={highlight === results.length} className="border-t border-dark-100 mt-1 pt-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={create}
              onMouseEnter={() => setHighlight(results.length)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium text-primary-700 ${
                highlight === results.length ? 'bg-primary-50' : ''
              }`}
            >
              <UserPlus className="h-4 w-4 shrink-0" />
              <span className="truncate">{term.trim() ? `Créer le client « ${term.trim()} »` : 'Nouveau client'}</span>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
