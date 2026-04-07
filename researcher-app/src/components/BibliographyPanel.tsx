import React, { useState } from 'react';
import { X, Copy, Download, ExternalLink, Star, ChevronDown, ChevronUp, Check, BookMarked } from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import { CitationStyle, BibliographyEntry } from '../types';

const CITATION_STYLES: CitationStyle[] = ['APA', 'MLA', 'Chicago', 'Harvard'];

function BibEntry({ entry, citationStyle, index }: { entry: BibliographyEntry; citationStyle: CitationStyle; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(entry.citation[citationStyle]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group rounded-xl bg-white/40 dark:bg-white/[0.03] border border-surface-200/40 dark:border-white/5 hover:border-primary-200/40 dark:hover:border-primary-500/10 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 w-7 h-7 shrink-0 rounded-lg bg-gradient-to-br from-primary-500/10 to-accent-500/5 dark:from-primary-500/15 dark:to-accent-500/5 flex items-center justify-center text-[11px] font-bold text-primary-600 dark:text-primary-400">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-surface-700 dark:text-surface-300 leading-relaxed font-medium">
              {entry.citation[citationStyle]}
            </p>
            <div className="flex items-center gap-3 mt-2.5 flex-wrap">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-100/80 dark:bg-surface-800/30 text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                {entry.sourceResult.source.replace('_', ' ')}
              </span>
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={10} className={i < entry.relevanceRating ? 'text-amber-400 fill-amber-400' : 'text-surface-200 dark:text-surface-700'} />
                ))}
              </span>
              <span className="text-[10px] text-surface-400 font-medium">
                {entry.accessDate}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <a
              href={entry.sourceResult.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-surface-300 hover:text-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-500/10 transition-all duration-200"
              title="Open source"
            >
              <ExternalLink size={13} />
            </a>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-surface-300 hover:text-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-500/10 transition-all duration-200"
              title="Copy citation"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-surface-300 hover:text-surface-500 hover:bg-surface-100/50 dark:hover:bg-white/5 transition-all duration-200"
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 animate-fade-in-up">
          <div className="p-3.5 rounded-xl bg-surface-50/50 dark:bg-surface-800/20 border border-surface-200/20 dark:border-white/3 space-y-3">
            {entry.sourceResult.doi && (
              <p className="text-[11px] text-surface-500">
                <span className="font-semibold text-surface-600 dark:text-surface-400">DOI:</span> {entry.sourceResult.doi}
              </p>
            )}
            {entry.sourceResult.abstract && (
              <div>
                <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Abstract</p>
                <p className="text-[12px] text-surface-500 leading-relaxed">{entry.sourceResult.abstract}</p>
              </div>
            )}
            {entry.keyInformation.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-1">Key Information</p>
                <ul className="text-[12px] text-surface-500 space-y-1">
                  {entry.keyInformation.map((info, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary-400/50 mt-1.5 shrink-0" />
                      {info}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-4">
              <p className="text-[11px] text-surface-500">
                <span className="font-semibold">Status:</span>{' '}
                <span className={`font-medium ${entry.accessStatus === 'accessible' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {entry.accessStatus}
                </span>
              </p>
            </div>

            <div className="pt-2 border-t border-surface-200/30 dark:border-white/3">
              <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2">All Citation Styles</p>
              <div className="space-y-2">
                {CITATION_STYLES.map(style => (
                  <div key={style} className="flex items-start gap-2.5">
                    <span className={`text-[10px] font-bold w-14 shrink-0 pt-0.5 text-right uppercase tracking-wider ${
                      style === citationStyle ? 'text-primary-500' : 'text-surface-400'
                    }`}>{style}</span>
                    <p className="text-[11px] text-surface-500 leading-relaxed flex-1">{entry.citation[style]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BibliographyPanel() {
  const { state, dispatch } = useResearch();
  const [copiedAll, setCopiedAll] = useState(false);
  const session = state.currentSession;

  if (!state.bibliographyPanelOpen || !session) return null;

  const bibliography = session.bibliography;

  const copyAllCitations = () => {
    const text = bibliography
      .map(e => e.citation[state.citationStyle])
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const downloadBibliography = () => {
    let content = `ANNOTATED BIBLIOGRAPHY\n`;
    content += `Research Question: ${session.query}\n`;
    content += `Citation Style: ${state.citationStyle}\n`;
    content += `Date: ${new Date(session.timestamp).toLocaleDateString()}\n`;
    content += `${'='.repeat(60)}\n\n`;

    bibliography.forEach((entry, i) => {
      content += `[${i + 1}] ${entry.citation[state.citationStyle]}\n`;
      content += `    URL: ${entry.sourceResult.url}\n`;
      if (entry.sourceResult.doi) content += `    DOI: ${entry.sourceResult.doi}\n`;
      content += `    Source: ${entry.sourceResult.source}\n`;
      content += `    Relevance: ${'*'.repeat(entry.relevanceRating)}\n`;
      if (entry.keyInformation.length > 0) {
        content += `    Key Info: ${entry.keyInformation[0]}\n`;
      }
      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bibliography-${session.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in-up overflow-hidden shadow-xl" style={{
      background: `color-mix(in srgb, var(--theme-panel) calc(var(--theme-panel-opacity) * 100%), transparent)`,
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      borderRadius: 'var(--theme-radius)',
      border: `1px solid color-mix(in srgb, var(--theme-text) 8%, transparent)`,
    }}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-200/30 dark:border-white/5 flex items-center justify-between bg-white/30 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5 flex items-center justify-center border border-amber-200/30 dark:border-amber-500/10">
            <BookMarked size={15} className="text-amber-500" />
          </div>
          <div>
            <h2 className="font-bold text-surface-800 dark:text-surface-100 tracking-tight text-[15px]">
              Annotated Bibliography
            </h2>
            <span className="text-[10px] text-surface-400 font-medium">
              {bibliography.length} sources cited
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/50 dark:bg-white/5 rounded-xl border border-surface-200/40 dark:border-white/5 p-0.5">
            {CITATION_STYLES.map(style => (
              <button
                key={style}
                onClick={() => dispatch({ type: 'SET_CITATION_STYLE', payload: style })}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
                style={state.citationStyle === style
                  ? { background: `linear-gradient(to right, var(--theme-primary), var(--theme-accent))`, color: '#fff' }
                  : { color: 'var(--theme-text)', opacity: 0.4 }
                }
              >
                {style}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-surface-200/50 dark:bg-white/5" />
          <button
            onClick={copyAllCitations}
            className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-all duration-200"
            title="Copy all citations"
          >
            {copiedAll ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
          </button>
          <button
            onClick={downloadBibliography}
            className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-all duration-200"
            title="Download bibliography"
          >
            <Download size={15} />
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_BIBLIOGRAPHY' })}
            className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-all duration-200"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Bibliography entries */}
      <div className="p-5 space-y-3 max-h-[55vh] overflow-y-auto">
        {bibliography.length === 0 ? (
          <div className="text-center py-8">
            <BookMarked size={24} className="mx-auto text-surface-300 dark:text-surface-600 mb-3" />
            <p className="text-sm text-surface-400 font-medium">No sources in bibliography.</p>
          </div>
        ) : (
          bibliography.map((entry, i) => (
            <BibEntry key={entry.id} entry={entry} citationStyle={state.citationStyle} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
