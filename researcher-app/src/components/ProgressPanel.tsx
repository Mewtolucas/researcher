import React from 'react';
import { Loader2, CheckCircle2, XCircle, Clock, Search } from 'lucide-react';
import { useResearch } from '../context/ResearchContext';

const SOURCE_DISPLAY: Record<string, string> = {
  google_scholar: 'Google Scholar (CrossRef)',
  core: 'CORE',
  internet_archive: 'Internet Archive',
  doaj: 'DOAJ',
  pmc: 'PubMed Central',
  web_search: 'Web Search',
};

export default function ProgressPanel() {
  const { state } = useResearch();
  const { progress } = state;

  if (!progress.isResearching && progress.currentPhase === 'idle') return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'searching': return <Loader2 size={14} className="animate-spin text-primary-500" />;
      case 'completed': return <CheckCircle2 size={14} className="text-green-500" />;
      case 'failed': return <XCircle size={14} className="text-red-500" />;
      default: return <Clock size={14} className="text-surface-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm p-4">
      <div className="flex items-center gap-3 mb-3">
        {progress.isResearching ? (
          <Loader2 size={18} className="animate-spin text-primary-500" />
        ) : progress.currentPhase === 'complete' ? (
          <CheckCircle2 size={18} className="text-green-500" />
        ) : (
          <Search size={18} className="text-surface-400" />
        )}
        <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
          {progress.statusMessage}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${progress.overallProgress}%` }}
        />
      </div>

      {/* Source statuses */}
      {progress.sourceStatuses.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {progress.sourceStatuses.map(s => (
            <div
              key={s.source}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-50 dark:bg-surface-900 text-sm"
            >
              {getStatusIcon(s.status)}
              <span className="text-surface-600 dark:text-surface-400 truncate text-xs">
                {SOURCE_DISPLAY[s.source] || (s.source.startsWith('http') ? new URL(s.source).hostname : s.source)}
              </span>
              {s.status === 'completed' && (
                <span className="ml-auto text-xs text-green-600 dark:text-green-400 font-medium">
                  {s.resultCount}
                </span>
              )}
              {s.status === 'failed' && (
                <span className="ml-auto text-xs text-red-500" title={s.error}>!</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
