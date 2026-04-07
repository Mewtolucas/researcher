import React, { useState } from 'react';
import {
  Search, SlidersHorizontal, ChevronDown, ChevronUp, Plus, X, Loader2,
  FileText, BookOpen, ListChecks, AlignLeft, ArrowRight, Link,
} from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import { SourceType, OutputMode, DocumentType } from '../types';

const SOURCE_LABELS: Record<SourceType, string> = {
  google_scholar: 'Google Scholar',
  core: 'CORE',
  internet_archive: 'Internet Archive',
  doaj: 'DOAJ',
  pmc: 'PubMed Central',
  web_search: 'Web Search',
  custom_url: 'Custom URL',
};

const SOURCE_COLORS: Record<SourceType, string> = {
  google_scholar: 'from-blue-500/10 to-blue-600/5 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-500/20',
  core: 'from-orange-500/10 to-orange-600/5 text-orange-700 dark:text-orange-300 border-orange-200/50 dark:border-orange-500/20',
  internet_archive: 'from-emerald-500/10 to-emerald-600/5 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-500/20',
  doaj: 'from-amber-500/10 to-amber-600/5 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-500/20',
  pmc: 'from-cyan-500/10 to-cyan-600/5 text-cyan-700 dark:text-cyan-300 border-cyan-200/50 dark:border-cyan-500/20',
  web_search: 'from-violet-500/10 to-violet-600/5 text-violet-700 dark:text-violet-300 border-violet-200/50 dark:border-violet-500/20',
  custom_url: 'from-pink-500/10 to-pink-600/5 text-pink-700 dark:text-pink-300 border-pink-200/50 dark:border-pink-500/20',
};

const OUTPUT_MODE_CONFIG: { mode: OutputMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { mode: 'thesis', label: 'Thesis Paper', icon: <FileText size={15} />, desc: 'Full thesis-style paper' },
  { mode: 'evidence', label: 'Evidence', icon: <ListChecks size={15} />, desc: 'Extract supporting evidence' },
  { mode: 'literature_review', label: 'Lit Review', icon: <BookOpen size={15} />, desc: 'Comprehensive lit review' },
  { mode: 'summary', label: 'Summary', icon: <AlignLeft size={15} />, desc: 'Concise synthesis' },
];

const AVAILABLE_SOURCES: SourceType[] = ['google_scholar', 'core', 'internet_archive', 'doaj', 'pmc', 'web_search'];

export default function SearchPanel() {
  const { state, dispatch, startResearch } = useResearch();
  const [showFilters, setShowFilters] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.currentQuery.trim() && !state.progress.isResearching) {
      startResearch();
    }
  };

  const addCustomUrl = () => {
    const url = customUrlInput.trim();
    if (url && !state.customUrls.includes(url)) {
      try {
        new URL(url);
        dispatch({ type: 'SET_CUSTOM_URLS', payload: [...state.customUrls, url] });
        setCustomUrlInput('');
      } catch {
        // invalid URL
      }
    }
  };

  const removeCustomUrl = (url: string) => {
    dispatch({ type: 'SET_CUSTOM_URLS', payload: state.customUrls.filter(u => u !== url) });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="animate-fade-in-up overflow-hidden shadow-xl" style={{
      background: `color-mix(in srgb, var(--theme-panel) calc(var(--theme-panel-opacity) * 100%), transparent)`,
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      borderRadius: 'var(--theme-radius)',
      border: `1px solid color-mix(in srgb, var(--theme-text) 8%, transparent)`,
    }}>
      {/* Subtle gradient accent at top */}
      <div className="h-[2px]" style={{ background: `linear-gradient(to right, transparent, color-mix(in srgb, var(--theme-primary) 50%, transparent), transparent)` }} />

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="p-5 pb-4">
        <div className="flex gap-3">
          <div className="flex-1 relative group">
            <Search size={18} className="absolute left-4 top-4 text-surface-300 dark:text-surface-500 group-focus-within:text-primary-500 transition-colors duration-200" />
            <textarea
              value={state.currentQuery}
              onChange={(e) => dispatch({ type: 'SET_QUERY', payload: e.target.value })}
              placeholder="What would you like to research?"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-surface-200/80 dark:border-surface-700/50 bg-white/60 dark:bg-surface-800/40 text-surface-800 dark:text-surface-200 placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400/50 dark:focus:border-primary-500/30 resize-none text-[15px] leading-relaxed transition-all duration-200 focus:bg-white/80 dark:focus:bg-surface-800/60 focus-ring"
              rows={2}
              aria-label="Research question"
            />
          </div>
          <button
            type="submit"
            disabled={!state.currentQuery.trim() || state.progress.isResearching}
            className="group/btn px-6 py-3.5 text-white disabled:opacity-40 font-semibold text-sm transition-all duration-300 flex items-center gap-2 self-start disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: (!state.currentQuery.trim() || state.progress.isResearching) ? '#94a3b8' : `linear-gradient(to right, var(--theme-primary), var(--theme-accent))`,
              borderRadius: 'var(--theme-radius)',
              boxShadow: (!state.currentQuery.trim() || state.progress.isResearching) ? 'none' : `0 8px 20px color-mix(in srgb, var(--theme-primary) 25%, transparent)`,
            }}
          >
            {state.progress.isResearching ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                <span>Researching</span>
              </>
            ) : (
              <>
                <span>Research</span>
                <ArrowRight size={17} className="group-hover/btn:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Output Mode Selection */}
      <div className="px-5 pb-4">
        <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2.5 px-0.5">Output Format</p>
        <div className="flex gap-2 flex-wrap">
          {OUTPUT_MODE_CONFIG.map(({ mode, label, icon, desc }) => (
            <button
              key={mode}
              onClick={() => dispatch({ type: 'SET_OUTPUT_MODE', payload: mode })}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                state.outputMode === mode
                  ? 'bg-gradient-to-r from-primary-500/10 to-accent-500/5 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-500/20 shadow-sm shadow-primary-500/5'
                  : 'bg-white/40 dark:bg-white/5 text-surface-500 dark:text-surface-400 border border-surface-200/50 dark:border-surface-700/30 hover:bg-white/70 dark:hover:bg-white/10 hover:text-surface-700 dark:hover:text-surface-300 hover:border-surface-300/50 dark:hover:border-surface-600/30'
              }`}
              title={desc}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Source Selection */}
      <div className="px-5 pb-4">
        <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2.5 px-0.5">Sources</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_SOURCES.map(source => {
            const isActive = state.selectedSources.includes(source);
            return (
              <label
                key={source}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium cursor-pointer transition-all duration-200 border ${
                  isActive
                    ? `bg-gradient-to-r ${SOURCE_COLORS[source]} shadow-sm`
                    : 'bg-white/30 dark:bg-white/3 text-surface-400 dark:text-surface-500 border-surface-200/40 dark:border-surface-700/20 hover:bg-white/60 dark:hover:bg-white/5 hover:text-surface-600 dark:hover:text-surface-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => dispatch({ type: 'TOGGLE_SOURCE', payload: source })}
                  className="sr-only"
                />
                <span className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-current/20'
                    : 'border border-surface-300 dark:border-surface-600'
                }`}>
                  {isActive && (
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                {SOURCE_LABELS[source]}
              </label>
            );
          })}
        </div>
      </div>

      {/* Custom URLs */}
      <div className="px-5 pb-4">
        <div className="flex gap-2">
          <div className="flex-1 relative group">
            <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-300 dark:text-surface-500 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="url"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="Add a custom source URL..."
              className="w-full pl-9 pr-3 py-2 text-[13px] rounded-xl border border-surface-200/60 dark:border-surface-700/30 bg-white/40 dark:bg-white/3 text-surface-700 dark:text-surface-300 placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400/50 transition-all duration-200"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomUrl())}
            />
          </div>
          <button
            onClick={addCustomUrl}
            className="px-3 py-2 rounded-xl bg-white/50 dark:bg-white/5 text-surface-400 hover:text-primary-500 border border-surface-200/50 dark:border-surface-700/20 hover:border-primary-200/50 transition-all duration-200 hover:bg-white/70 dark:hover:bg-white/8"
          >
            <Plus size={15} />
          </button>
        </div>
        {state.customUrls.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {state.customUrls.map(url => (
              <span key={url} className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-gradient-to-r from-pink-500/10 to-pink-600/5 text-pink-600 dark:text-pink-400 border border-pink-200/50 dark:border-pink-500/20 max-w-xs truncate">
                <Link size={10} />
                {new URL(url).hostname}
                <button onClick={() => removeCustomUrl(url)} className="ml-0.5 hover:text-red-500 transition-colors">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Filters Toggle */}
      <div className="px-5 pb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-[13px] text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-all duration-200 group"
        >
          <SlidersHorizontal size={13} className="group-hover:text-primary-500 transition-colors" />
          <span className="font-medium">Advanced Filters</span>
          {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {showFilters && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up">
            <div>
              <label className="block text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1.5">From Year</label>
              <input
                type="number"
                min="1900"
                max={currentYear}
                value={state.filters.dateFrom || ''}
                onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { dateFrom: e.target.value ? parseInt(e.target.value) : null } })}
                placeholder="1900"
                className="w-full px-3 py-2 text-[13px] rounded-xl border border-surface-200/60 dark:border-surface-700/30 bg-white/40 dark:bg-white/3 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400/50 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1.5">To Year</label>
              <input
                type="number"
                min="1900"
                max={currentYear}
                value={state.filters.dateTo || ''}
                onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { dateTo: e.target.value ? parseInt(e.target.value) : null } })}
                placeholder={currentYear.toString()}
                className="w-full px-3 py-2 text-[13px] rounded-xl border border-surface-200/60 dark:border-surface-700/30 bg-white/40 dark:bg-white/3 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400/50 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1.5">Doc Type</label>
              <select
                value={state.filters.documentType}
                onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { documentType: e.target.value as DocumentType } })}
                className="w-full px-3 py-2 text-[13px] rounded-xl border border-surface-200/60 dark:border-surface-700/30 bg-white/40 dark:bg-white/3 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400/50 transition-all duration-200 appearance-none"
              >
                <option value="all">All Types</option>
                <option value="peer_reviewed">Peer Reviewed</option>
                <option value="open_access">Open Access</option>
                <option value="books">Books</option>
                <option value="preprints">Preprints</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1.5">Max Results</label>
              <input
                type="number"
                min="5"
                max="50"
                value={state.filters.maxResults}
                onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { maxResults: parseInt(e.target.value) || 20 } })}
                className="w-full px-3 py-2 text-[13px] rounded-xl border border-surface-200/60 dark:border-surface-700/30 bg-white/40 dark:bg-white/3 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400/50 transition-all duration-200"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
