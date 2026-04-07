import React, { useState } from 'react';
import {
  Search, SlidersHorizontal, ChevronDown, ChevronUp, Plus, X, Loader2,
  FileText, BookOpen, ListChecks, AlignLeft, ArrowRight, Link,
} from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import { useThemeStyles } from '../utils/themeStyles';
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


const OUTPUT_MODE_CONFIG: { mode: OutputMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { mode: 'thesis', label: 'Thesis Paper', icon: <FileText size={15} />, desc: 'Full thesis-style paper' },
  { mode: 'evidence', label: 'Evidence', icon: <ListChecks size={15} />, desc: 'Extract supporting evidence' },
  { mode: 'literature_review', label: 'Lit Review', icon: <BookOpen size={15} />, desc: 'Comprehensive lit review' },
  { mode: 'summary', label: 'Summary', icon: <AlignLeft size={15} />, desc: 'Concise synthesis' },
];

const AVAILABLE_SOURCES: SourceType[] = ['google_scholar', 'core', 'internet_archive', 'doaj', 'pmc', 'web_search'];

export default function SearchPanel() {
  const { state, dispatch, startResearch } = useResearch();
  const ts = useThemeStyles();
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
    <div className="animate-fade-in-up overflow-hidden shadow-xl" style={ts.panelStyle}>
      {/* Subtle gradient accent at top */}
      <div className="h-[2px]" style={{ background: `linear-gradient(to right, transparent, ${ts.primary}, transparent)` }} />

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="p-5 pb-4">
        <div className="flex gap-3">
          <div className="flex-1 relative group">
            <Search size={18} className="absolute left-4 top-4 transition-colors duration-200" style={{ color: ts.textFaint }} />
            <textarea
              value={state.currentQuery}
              onChange={(e) => dispatch({ type: 'SET_QUERY', payload: e.target.value })}
              placeholder="What would you like to research?"
              className="w-full pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 resize-none text-[15px] leading-relaxed transition-all duration-200"
              style={{ ...ts.inputStyle, '--tw-ring-color': ts.primaryBorder } as React.CSSProperties}
              rows={2}
              aria-label="Research question"
            />
          </div>
          <button
            type="submit"
            disabled={!state.currentQuery.trim() || state.progress.isResearching}
            className="group/btn px-6 py-3.5 text-white disabled:opacity-40 font-semibold text-sm transition-all duration-300 flex items-center gap-2 self-start disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none hover:scale-[1.02] active:scale-[0.98]"
            style={(!state.currentQuery.trim() || state.progress.isResearching)
              ? { background: '#94a3b8', borderRadius: ts.radius }
              : ts.gradientButton
            }
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
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2.5 px-0.5" style={{ color: ts.textMuted }}>Output Format</p>
        <div className="flex gap-2 flex-wrap">
          {OUTPUT_MODE_CONFIG.map(({ mode, label, icon, desc }) => (
            <button
              key={mode}
              onClick={() => dispatch({ type: 'SET_OUTPUT_MODE', payload: mode })}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200"
              style={state.outputMode === mode ? ts.activeChip : ts.inactiveChip}
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
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2.5 px-0.5" style={{ color: ts.textMuted }}>Sources</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_SOURCES.map(source => {
            const isActive = state.selectedSources.includes(source);
            return (
              <label
                key={source}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium cursor-pointer transition-all duration-200"
                style={isActive ? ts.activeChip : ts.inactiveChip}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => dispatch({ type: 'TOGGLE_SOURCE', payload: source })}
                  className="sr-only"
                />
                <span className="w-3.5 h-3.5 rounded flex items-center justify-center transition-all duration-200"
                  style={isActive ? { background: ts.primaryBg } : { border: `1px solid ${ts.borderColorStrong}` }}
                >
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
            <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: ts.textFaint }} />
            <input
              type="url"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="Add a custom source URL..."
              className="w-full pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 transition-all duration-200"
              style={ts.inputStyle}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomUrl())}
            />
          </div>
          <button
            onClick={addCustomUrl}
            className="px-3 py-2 rounded-xl transition-all duration-200"
            style={ts.inactiveChip}
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

      {/* Source Count Selector */}
      <div className="px-5 pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2.5 px-0.5" style={{ color: ts.textMuted }}>Number of Sources</p>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {[null, 5, 10, 15, 20, 30].map(count => (
              <button
                key={count ?? 'auto'}
                onClick={() => dispatch({ type: 'SET_FILTERS', payload: { exactSourceCount: count } })}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200"
                style={state.filters.exactSourceCount === count ? ts.activeChip : ts.inactiveChip}
              >
                {count === null ? 'Auto' : count}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium" style={{ color: ts.textFaint }}>Custom:</span>
            <input
              type="number"
              min="1"
              max="100"
              value={state.filters.exactSourceCount && ![5, 10, 15, 20, 30].includes(state.filters.exactSourceCount) ? state.filters.exactSourceCount : ''}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : null;
                dispatch({ type: 'SET_FILTERS', payload: { exactSourceCount: val } });
              }}
              placeholder="#"
              className="w-14 px-2 py-1.5 text-[12px] text-center rounded-lg focus:outline-none transition-all duration-200"
              style={ts.inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Filters Toggle */}
      <div className="px-5 pb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-[13px] transition-all duration-200 group"
          style={{ color: ts.textMuted }}
        >
          <SlidersHorizontal size={13} className="transition-colors" />
          <span className="font-medium">Advanced Filters</span>
          {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {showFilters && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: ts.textMuted }}>From Year</label>
              <input
                type="number"
                min="1900"
                max={currentYear}
                value={state.filters.dateFrom || ''}
                onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { dateFrom: e.target.value ? parseInt(e.target.value) : null } })}
                placeholder="1900"
                className="w-full px-3 py-2 text-[13px] focus:outline-none focus:ring-2 transition-all duration-200"
                style={ts.inputStyle}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: ts.textMuted }}>To Year</label>
              <input
                type="number"
                min="1900"
                max={currentYear}
                value={state.filters.dateTo || ''}
                onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { dateTo: e.target.value ? parseInt(e.target.value) : null } })}
                placeholder={currentYear.toString()}
                className="w-full px-3 py-2 text-[13px] focus:outline-none focus:ring-2 transition-all duration-200"
                style={ts.inputStyle}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: ts.textMuted }}>Doc Type</label>
              <select
                value={state.filters.documentType}
                onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { documentType: e.target.value as DocumentType } })}
                className="w-full px-3 py-2 text-[13px] focus:outline-none focus:ring-2 transition-all duration-200 appearance-none"
                style={ts.inputStyle}
              >
                <option value="all">All Types</option>
                <option value="peer_reviewed">Peer Reviewed</option>
                <option value="open_access">Open Access</option>
                <option value="books">Books</option>
                <option value="preprints">Preprints</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: ts.textMuted }}>Max per Source</label>
              <input
                type="number"
                min="5"
                max="50"
                value={state.filters.maxResults}
                onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { maxResults: parseInt(e.target.value) || 20 } })}
                className="w-full px-3 py-2 text-[13px] focus:outline-none focus:ring-2 transition-all duration-200"
                style={ts.inputStyle}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
