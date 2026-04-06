import React, { useState } from 'react';
import { X, Copy, Download, ExternalLink, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import { CitationStyle, BibliographyEntry } from '../types';

const CITATION_STYLES: CitationStyle[] = ['APA', 'MLA', 'Chicago', 'Harvard'];

function BibEntry({ entry, citationStyle }: { entry: BibliographyEntry; citationStyle: CitationStyle }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-surface-800 dark:text-surface-200 font-medium leading-relaxed">
            {entry.citation[citationStyle]}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              {entry.sourceResult.source.replace('_', ' ')}
            </span>
            <span className="flex items-center gap-0.5 text-xs text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={10} fill={i < entry.relevanceRating ? 'currentColor' : 'none'} />
              ))}
            </span>
            <span className="text-xs text-surface-400">
              Accessed {entry.accessDate}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <a
            href={entry.sourceResult.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-400 hover:text-primary-500"
            title="Open source"
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(entry.citation[citationStyle])}
            className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-400 hover:text-primary-500"
            title="Copy citation"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-400"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-surface-200 dark:border-surface-700 space-y-2">
          {entry.sourceResult.doi && (
            <p className="text-xs text-surface-500">
              <span className="font-medium">DOI:</span> {entry.sourceResult.doi}
            </p>
          )}
          {entry.sourceResult.abstract && (
            <div>
              <p className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">Abstract:</p>
              <p className="text-xs text-surface-500 leading-relaxed">{entry.sourceResult.abstract}</p>
            </div>
          )}
          {entry.keyInformation.length > 0 && (
            <div>
              <p className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">Key Information:</p>
              <ul className="text-xs text-surface-500 space-y-1">
                {entry.keyInformation.map((info, i) => (
                  <li key={i} className="list-disc ml-3">{info}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-4">
            <p className="text-xs text-surface-500">
              <span className="font-medium">Status:</span>{' '}
              <span className={entry.accessStatus === 'accessible' ? 'text-green-500' : 'text-amber-500'}>
                {entry.accessStatus}
              </span>
            </p>
          </div>

          {/* All citation styles */}
          <div>
            <p className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1">All Citation Styles:</p>
            <div className="space-y-1.5">
              {CITATION_STYLES.map(style => (
                <div key={style} className="flex items-start gap-2">
                  <span className="text-xs font-medium text-surface-500 w-16 shrink-0 pt-0.5">{style}:</span>
                  <p className="text-xs text-surface-500 leading-relaxed flex-1">{entry.citation[style]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BibliographyPanel() {
  const { state, dispatch } = useResearch();
  const session = state.currentSession;

  if (!state.bibliographyPanelOpen || !session) return null;

  const bibliography = session.bibliography;

  const copyAllCitations = () => {
    const text = bibliography
      .map(e => e.citation[state.citationStyle])
      .join('\n\n');
    navigator.clipboard.writeText(text);
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
    <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-surface-800 dark:text-surface-200">
            Annotated Bibliography
          </h2>
          <span className="text-xs text-surface-400 bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded-full">
            {bibliography.length} sources
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Citation style selector */}
          <select
            value={state.citationStyle}
            onChange={(e) => dispatch({ type: 'SET_CITATION_STYLE', payload: e.target.value as CitationStyle })}
            className="text-sm px-2 py-1 rounded border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-700 dark:text-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {CITATION_STYLES.map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
          <button onClick={copyAllCitations} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500" title="Copy all citations">
            <Copy size={16} />
          </button>
          <button onClick={downloadBibliography} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500" title="Download bibliography">
            <Download size={16} />
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_BIBLIOGRAPHY' })}
            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Bibliography entries */}
      <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
        {bibliography.length === 0 ? (
          <p className="text-sm text-surface-400 text-center py-4">No sources in bibliography.</p>
        ) : (
          bibliography.map(entry => (
            <BibEntry key={entry.id} entry={entry} citationStyle={state.citationStyle} />
          ))
        )}
      </div>
    </div>
  );
}
