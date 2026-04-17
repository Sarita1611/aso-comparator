import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2, AlertCircle, Smartphone, Star } from 'lucide-react';
import { api } from '../lib/api';

// const PLATFORM_OPTIONS = [
//   { value: 'both', label: 'Both', icon: '🔍' },
//   { value: 'ios', label: 'iOS', icon: '🍎' },
//   { value: 'android', label: 'Android', icon: '🤖' },
// ];

export default function AppInputCard({ index, appData, onAppFetched, onRemove, canRemove, country }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const searchTimeout = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { results } = await api.searchApps(query.trim(), 'both', country);
        setSuggestions(results || []);
        setShowSuggestions(true);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(searchTimeout.current);
  }, [query, country]);

  const handleSelectSuggestion = async (suggestion) => {
    setShowSuggestions(false);
    setQuery('');
    setSuggestions([]);
    setFetching(true);
    setError('');
    try {
      const { app } = await api.fetchApp(suggestion.appId, suggestion.platform, country);
      onAppFetched(index, app);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleClear = () => {
    onAppFetched(index, null);
    setQuery('');
    setError('');
    setSuggestions([]);
  };

  const platformColors = {
    ios: 'bg-blue-50 text-blue-700 border-blue-200',
    android: 'bg-green-50 text-green-700 border-green-200',
  };

  const platformIcons = { ios: '🍎', android: '🤖' };

  return (
    <div className={`card p-5 transition-all duration-200 ${appData ? 'border-brand-200 bg-brand-50/20' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-brand-700">#{index + 1}</span>
          </div>
          <span className="text-sm font-semibold text-slate-700 font-display">
            {appData ? appData.name : index === 0 ? 'Your App' : `Competitor ${index}`}
          </span>
          {appData && (
            <span className={`badge border text-xs ${platformColors[appData.platform]}`}>
              {platformIcons[appData.platform]} {appData.platform === 'ios' ? 'App Store' : 'Google Play'}
            </span>
          )}
        </div>
        {canRemove && !appData && (
          <button onClick={() => onRemove(index)} className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Fetched App Preview */}
      {appData ? (
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-surface-200">
            {appData.icon ? (
              <img src={appData.icon} alt={appData.name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 shadow-sm" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center flex-shrink-0">
                <Smartphone size={22} className="text-slate-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate">{appData.name}</p>
              <p className="text-xs text-slate-500 truncate mb-1.5">{appData.developer}</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`badge border text-xs ${platformColors[appData.platform]}`}>
                  {platformIcons[appData.platform]} {appData.platform === 'ios' ? 'App Store' : 'Google Play'}
                </span>
                <span className="badge bg-amber-50 text-amber-700 border border-amber-200 text-xs">
                  ⭐ {appData.rating}
                </span>
                <span className="badge bg-surface-100 text-slate-600 border border-surface-200 text-xs">
                  {appData.category}
                </span>
              </div>
            </div>
          </div>
          <button onClick={handleClear} className="mt-2 w-full text-xs text-slate-400 hover:text-red-500 transition-colors py-1">
            ✕ Remove and search again
          </button>
        </div>
      ) : (
        <>
         

          {/* Search with Autocomplete */}
          <div className="relative" ref={wrapperRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                {searching || fetching ? (
                  <Loader2 size={15} className="text-brand-500 animate-spin" />
                ) : (
                  <Search size={15} className="text-slate-400" />
                )}
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setError(''); }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search App Store & Play Store..."
                className="input-field pl-9 pr-4"
                disabled={fetching}
              />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-xl shadow-elevated z-50 overflow-hidden animate-fade-in">
                <div className="p-1.5 max-h-80 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <button
                      key={`${s.platform}-${s.appId}-${i}`}
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full flex items-center gap-3 p-2.5 hover:bg-surface-50 rounded-lg transition-colors text-left group"
                    >
                      {s.icon ? (
                        <img src={s.icon} alt={s.title} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
                          <Smartphone size={16} className="text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate group-hover:text-brand-700">{s.title}</p>
                        <p className="text-xs text-slate-400 truncate">{s.developer}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`badge border text-[10px] px-1.5 py-0.5 ${s.platform === 'ios' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                            {s.platform === 'ios' ? '🍎' : '🤖'} {s.platform === 'ios' ? 'App Store' : 'Play Store'}
                          </span>
                          {s.score > 0 && (
                            <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                              <Star size={9} fill="currentColor" /> {s.score}
                            </span>
                          )}
                          {s.category && (
                            <span className="text-[10px] text-slate-400">{s.category}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-3 py-2 bg-surface-50 border-t border-surface-100">
                  <p className="text-[10px] text-slate-400">
                    {suggestions.length} result{suggestions.length !== 1 ? 's' : ''} — click to select
                  </p>
                </div>
              </div>
            )}

            {showSuggestions && query.length >= 2 && suggestions.length === 0 && !searching && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-xl shadow-elevated z-50 p-4 text-center animate-fade-in">
                <p className="text-xs text-slate-500">No apps found for "{query}"</p>
                <p className="text-xs text-slate-400 mt-1">Try a different name or paste a store URL</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle size={12} />
              {error}
            </div>
          )}

          <p className="mt-2 text-xs text-slate-400 text-center">
            Type to search or paste an App Store / Play Store URL
          </p>
        </>
      )}
    </div>
  );
}
