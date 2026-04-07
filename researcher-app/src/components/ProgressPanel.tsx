import React from 'react';
import { Loader2, CheckCircle2, XCircle, Clock, Sparkles } from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import { useThemeStyles } from '../utils/themeStyles';

const SOURCE_DISPLAY: Record<string, string> = {
  google_scholar: 'Google Scholar',
  core: 'CORE',
  internet_archive: 'Internet Archive',
  doaj: 'DOAJ',
  pmc: 'PubMed Central',
  web_search: 'Web Search',
};

export default function ProgressPanel() {
  const { state } = useResearch();
  const ts = useThemeStyles();
  const { progress } = state;

  if (!progress.isResearching && progress.currentPhase === 'idle') return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'searching': return <Loader2 size={13} className="animate-spin text-primary-500" />;
      case 'completed': return <CheckCircle2 size={13} className="text-emerald-500" />;
      case 'failed': return <XCircle size={13} className="text-red-400" />;
      default: return <Clock size={13} className="text-surface-300 dark:text-surface-600" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'searching': return 'bg-primary-50/50 dark:bg-primary-500/5 border-primary-200/30 dark:border-primary-500/10';
      case 'completed': return 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200/30 dark:border-emerald-500/10';
      case 'failed': return 'bg-red-50/50 dark:bg-red-500/5 border-red-200/30 dark:border-red-500/10';
      default: return 'bg-white/30 dark:bg-white/3 border-surface-200/30 dark:border-surface-700/20';
    }
  };

  return (
    <div className="p-5 animate-fade-in-up overflow-hidden relative shadow-xl" style={ts.panelStyle}>
      {/* Shimmer overlay when researching */}
      {progress.isResearching && (
        <div className="absolute inset-0 animate-shimmer pointer-events-none" />
      )}

      <div className="flex items-center gap-3 mb-4 relative">
        {progress.isResearching ? (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{ ...ts.gradientIcon, animation: 'progressPulse 2s infinite' }}>
            <Sparkles size={15} className="text-white" />
          </div>
        ) : progress.currentPhase === 'complete' ? (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 size={15} className="text-white" />
          </div>
        ) : null}
        <div>
          <span className="text-sm font-semibold block" style={{ color: ts.text }}>
            {progress.isResearching ? 'Researching...' : progress.currentPhase === 'complete' ? 'Research Complete' : 'Research Status'}
          </span>
          <span className="text-xs font-medium" style={{ color: ts.textMuted }}>
            {progress.statusMessage}
          </span>
        </div>
        <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-lg" style={{ color: ts.primary, background: ts.primaryBg }}>
          {progress.overallProgress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: ts.hoverBg }}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            progress.currentPhase === 'complete'
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
              : 'progress-bar-animated'
          }`}
          style={{ width: `${progress.overallProgress}%` }}
        />
      </div>

      {/* Source statuses */}
      {progress.sourceStatuses.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 relative">
          {progress.sourceStatuses.map(s => (
            <div
              key={s.source}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 ${getStatusBg(s.status)}`}
            >
              {getStatusIcon(s.status)}
              <span className="truncate text-[11px] font-medium flex-1" style={{ color: ts.textMuted }}>
                {SOURCE_DISPLAY[s.source] || (s.source.startsWith('http') ? new URL(s.source).hostname : s.source)}
              </span>
              {s.status === 'completed' && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                  {s.resultCount}
                </span>
              )}
              {s.status === 'failed' && (
                <span className="text-[10px] font-bold text-red-500 bg-red-100/50 dark:bg-red-500/10 px-1.5 py-0.5 rounded-md" title={s.error}>
                  err
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
