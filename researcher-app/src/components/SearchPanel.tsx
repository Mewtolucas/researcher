import React, { useState } from 'react';
import {
  Search, SlidersHorizontal, ChevronDown, ChevronUp, Plus, X, Play, Loader2,
  FileText, BookOpen, ListChecks, AlignLeft,
} from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import { SourceType, OutputMode, DocumentType } from '../types';

const SOURCE_LABELS: Record<SourceType, string> = {
  google_scholar: 'Google Scholar (CrossRef)',
  core: 'CORE',
  internet_archive: 'Internet Archive',
  doaj: 'DOAJ',
  pmc: 'PubMed Central',
  web_search: 'Web Search',
  custom_url: 'Custom URL',
};

const OUTPUT_MODE_CONFIG: { mode: OutputMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { mode: 'thesis', label: 'Thesis Paper', icon: <FileText size={16} />, desc: 'Full thesis-style paper' },
  { mode: 'evidence', label: 'Evidence', icon: <ListChecks size={16} />, desc: 'Extract supporting evidence' },
  { mode: 'literature_review', label: 'Literature Review', icon: <BookOpen size={16} />, desc: 'Comprehensive lit review' },
  { mode: 'summary', label: 'Summary', icon: <AlignLeft size={16} />, desc: 'Concise synthesis' },
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
    <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <textarea
              value={state.currentQuery}
              onChange={(e) => dispatch({ type: 'SET_QUERY', payload: e.target.value })}
              placeholder="Enter your research question or topic..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-800 dark:text-surface-200 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
              rows={2}
              aria-label="Research question"
            />
          </div>
          <button
            type="submit"
            disabled={!state.currentQuery.trim() || state.progress.isResearching}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-surface-300 dark:disabled:bg-surface-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 self-start disabled:cursor-not-allowed"
          >
            {state.progress.isResearching ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Researching...</span>
              </>
            ) : (
              <>
                <Play size={18} />
                <span>Research</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Output Mode Selection */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 flex-wrap">
          {OUTPUT_MODE_CONFIG.map(({ mode, label, icon, desc }) => (
            <button
              key={mode}
              onClick={() => dispatch({ type: 'SET_OUTPUT_MODE', payload: mode })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                state.outputMode === mode
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                  : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600 border border-transparent'
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
      <div className="px-4 pb-3">
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_SOURCES.map(source => (
            <label
              key={source}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
                state.selectedSources.includes(source)
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700'
                  : 'bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400 border border-transparent hover:bg-surface-200 dark:hover:bg-surface-600'
              }`}
            >
              <input
                type="checkbox"
                checked={state.selectedSources.includes(source)}
                onChange={() => dispatch({ type: 'TOGGLE_SOURCE', payload: source })}
                className="sr-only"
              />
              <span className={`w-3 h-3 rounded-sm border flex items-center justify-center ${
                state.selectedSources.includes(source)
                  ? 'bg-primary-600 border-primary-600'
                  : 'border-surface-400'
              }`}>
                {state.selectedSources.includes(source) && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              {SOURCE_LABELS[source]}
            </label>
          ))}
        </div>
      </div>

      {/* Custom URLs */}
      <div className="px-4 pb-3">
        <div className="flex gap-2">
          <input
            type="url"
            value={customUrlInput}
            onChange={(e) => setCustomUrlInput(e.target.value)}
            placeholder="Paste a URL to include as a source..."
            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-800 dark:text-surface-200 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomUrl())}
          />
          <button
            onClick={addCustomUrl}
            className="px-3 py-1.5 text-sm rounded-lg bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        {state.customUrls.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {state.customUrls.map(url => (
              <span key={url} className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400 max-w-xs truncate">
                {new URL(url).hostname}
                <button onClick={() => removeCustomUrl(url)} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Filters Toggle */}
      <div className="px-4 pb-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors"
        >
          <SlidersHorizontal size={14} />
          Filters
          {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showFilters && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">From Year</label>
              <input
                type="number"
                min="1900"
                max={currentYear}
                value={state.filters.dateFrom || ''}
                onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { dateFrom: e.target.value ? parseInt(e.target.value) : null } })}
                placeholder="1900"
                className="w-full px-2 py-1.5 text-sm rounded border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">To Year</label>
              <input
                type="number"
                min="1900"
                max={currentYear}
                value={state.filters.dateTo || ''}
                onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { dateTo: e.target.value ? parseInt(e.target.value) : null } })}
                placeholder={currentYear.toString()}
                className="w-full px-2 py-1.5 text-sm rounded border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">Document Type</label>
              <select
                value={state.filters.documentType}
                onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { documentType: e.target.value as DocumentType } })}
                className="w-full px-2 py-1.5 text-sm rounded border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Types</option>
                <option value="peer_reviewed">Peer Reviewed</option>
                <option value="open_access">Open Access</option>
                <option value="books">Books</option>
                <option value="preprints">Preprints</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">Max Results</label>
              <input
                type="number"
                min="5"
                max="50"
                value={state.filters.maxResults}
                onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { maxResults: parseInt(e.target.value) || 20 } })}
                className="w-full px-2 py-1.5 text-sm rounded border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
