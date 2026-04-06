import React, { useRef } from 'react';
import { Copy, Download, BookOpen, FileText, BarChart3 } from 'lucide-react';
import { useResearch } from '../context/ResearchContext';

function renderContent(content: string): React.ReactNode {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-lg font-semibold text-surface-800 dark:text-surface-200 mt-6 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-xl font-bold text-surface-900 dark:text-surface-100 mt-8 mb-3 pb-2 border-b border-surface-200 dark:border-surface-700">{line.slice(3)}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-2xl font-bold text-surface-900 dark:text-surface-100 mt-6 mb-4">{line.slice(2)}</h1>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={i} className="text-surface-700 dark:text-surface-300 ml-4 list-disc text-sm leading-relaxed">
          {renderInline(line.slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <li key={i} className="text-surface-700 dark:text-surface-300 ml-4 list-decimal text-sm leading-relaxed">
          {renderInline(line.replace(/^\d+\.\s/, ''))}
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-3" />);
    } else {
      elements.push(
        <p key={i} className="text-surface-700 dark:text-surface-300 text-sm leading-relaxed mb-2">
          {renderInline(line)}
        </p>
      );
    }
  }
  return elements;
}

function renderInline(text: string): React.ReactNode {
  // Handle bold, italic, and citations
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[0-9,\s]+\])/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const m = match[0];
    if (m.startsWith('**') && m.endsWith('**')) {
      parts.push(<strong key={match.index} className="font-semibold text-surface-800 dark:text-surface-200">{m.slice(2, -2)}</strong>);
    } else if (m.startsWith('*') && m.endsWith('*')) {
      parts.push(<em key={match.index}>{m.slice(1, -1)}</em>);
    } else if (m.startsWith('[') && m.endsWith(']')) {
      parts.push(
        <span key={match.index} className="text-primary-600 dark:text-primary-400 font-medium text-xs align-super cursor-help" title={`Source ${m}`}>
          {m}
        </span>
      );
    }
    lastIndex = match.index + m.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : text;
}

export default function ResultsDisplay() {
  const { state, dispatch } = useResearch();
  const contentRef = useRef<HTMLDivElement>(null);
  const session = state.currentSession;

  if (!session && !state.progress.isResearching) {
    return (
      <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm p-12 text-center">
        <BookOpen size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-4" />
        <h2 className="text-xl font-semibold text-surface-700 dark:text-surface-300 mb-2">Start Your Research</h2>
        <p className="text-surface-500 dark:text-surface-400 max-w-md mx-auto text-sm">
          Enter a research question above, select your sources, and click Research to begin.
          Results will be synthesized using Claude AI with full citations.
        </p>
      </div>
    );
  }

  const content = session?.generatedContent || '';
  const resultCount = session?.results.length || 0;
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
  };

  const downloadAsTxt = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-${session?.id || 'output'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-surface-800 dark:text-surface-200">Research Results</h2>
          <div className="flex items-center gap-3 text-xs text-surface-500">
            <span className="flex items-center gap-1"><BarChart3 size={12} /> {resultCount} sources</span>
            <span className="flex items-center gap-1"><FileText size={12} /> {wordCount} words</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_BIBLIOGRAPHY' })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
          >
            <BookOpen size={14} />
            Bibliography
          </button>
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500"
            title="Copy to clipboard"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={downloadAsTxt}
            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500"
            title="Download as text"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="p-6 prose-sm max-w-none overflow-y-auto max-h-[60vh]">
        {content ? renderContent(content) : (
          <p className="text-surface-400 text-sm italic">Generating content...</p>
        )}
      </div>
    </div>
  );
}
