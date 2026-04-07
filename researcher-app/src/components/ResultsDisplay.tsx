import React, { useRef, useState } from 'react';
import { Copy, Download, BookOpen, FileText, BarChart3, Check, Sparkles } from 'lucide-react';
import { useResearch } from '../context/ResearchContext';

function renderContent(content: string): React.ReactNode {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-base font-semibold text-surface-800 dark:text-surface-100 mt-8 mb-3 tracking-tight">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-lg font-bold text-surface-900 dark:text-white mt-10 mb-4 tracking-tight flex items-center gap-3">
          <span className="h-5 w-1 rounded-full bg-gradient-to-b from-primary-500 to-accent-500" />
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-2xl font-bold text-surface-900 dark:text-white mt-6 mb-5 tracking-tight">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={i} className="text-surface-600 dark:text-surface-300 ml-4 text-[14px] leading-[1.85] list-none flex items-start gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-400/60 dark:bg-primary-500/40 mt-2.5 shrink-0" />
          <span>{renderInline(line.slice(2))}</span>
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)?.[1] || '';
      elements.push(
        <li key={i} className="text-surface-600 dark:text-surface-300 ml-4 text-[14px] leading-[1.85] list-none flex items-start gap-2.5">
          <span className="text-[11px] font-bold text-primary-500 dark:text-primary-400 mt-1 min-w-[18px] text-right shrink-0">{num}.</span>
          <span>{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-surface-600 dark:text-surface-300 text-[14px] leading-[1.85] mb-1">
          {renderInline(line)}
        </p>
      );
    }
  }
  return elements;
}

function renderInline(text: string): React.ReactNode {
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
      parts.push(<strong key={match.index} className="font-semibold text-surface-800 dark:text-surface-100">{m.slice(2, -2)}</strong>);
    } else if (m.startsWith('*') && m.endsWith('*')) {
      parts.push(<em key={match.index} className="italic text-surface-700 dark:text-surface-200">{m.slice(1, -1)}</em>);
    } else if (m.startsWith('[') && m.endsWith(']')) {
      parts.push(
        <span key={match.index} className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-md bg-primary-100/80 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 align-text-top cursor-help mx-0.5 hover:bg-primary-200/80 dark:hover:bg-primary-500/25 transition-colors" title={`Source ${m}`}>
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
  const [copied, setCopied] = useState(false);
  const session = state.currentSession;

  if (!session && !state.progress.isResearching) {
    return (
      <div className="p-16 text-center animate-fade-in-up shadow-xl" style={{
        background: `color-mix(in srgb, var(--theme-panel) calc(var(--theme-panel-opacity) * 100%), transparent)`,
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderRadius: 'var(--theme-radius)',
        border: `1px solid color-mix(in srgb, var(--theme-text) 8%, transparent)`,
      }}>
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: `color-mix(in srgb, var(--theme-primary) 10%, transparent)`, border: `1px solid color-mix(in srgb, var(--theme-primary) 15%, transparent)` }}>
          <Sparkles size={28} style={{ color: 'var(--theme-primary)' }} />
        </div>
        <h2 className="text-xl font-bold text-surface-800 dark:text-surface-100 mb-3 tracking-tight">Start Your Research</h2>
        <p className="text-surface-400 dark:text-surface-500 max-w-sm mx-auto text-sm leading-relaxed">
          Enter a research question, select your sources, and let AI synthesize findings with full academic citations.
        </p>
        <div className="flex items-center justify-center gap-6 mt-8">
          {[
            { icon: '1', text: 'Ask a question' },
            { icon: '2', text: 'Select sources' },
            { icon: '3', text: 'Get insights' },
          ].map(step => (
            <div key={step.icon} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, var(--theme-primary), var(--theme-accent))` }}>
                {step.icon}
              </span>
              <span className="text-xs font-medium text-surface-400">{step.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const content = session?.generatedContent || '';
  const resultCount = session?.results.length || 0;
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="animate-fade-in-up overflow-hidden shadow-xl" style={{
      background: `color-mix(in srgb, var(--theme-panel) calc(var(--theme-panel-opacity) * 100%), transparent)`,
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      borderRadius: 'var(--theme-radius)',
      border: `1px solid color-mix(in srgb, var(--theme-text) 8%, transparent)`,
    }}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-200/30 dark:border-white/5 flex items-center justify-between flex-wrap gap-3 bg-white/30 dark:bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-surface-800 dark:text-surface-100 tracking-tight">Research Results</h2>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-surface-400 bg-surface-100/60 dark:bg-surface-800/30 px-2.5 py-1 rounded-lg">
              <BarChart3 size={11} /> {resultCount} sources
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-surface-400 bg-surface-100/60 dark:bg-surface-800/30 px-2.5 py-1 rounded-lg">
              <FileText size={11} /> {wordCount.toLocaleString()} words
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_BIBLIOGRAPHY' })}
            className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-500/5 text-primary-600 dark:text-primary-400 border border-primary-200/40 dark:border-primary-500/15 hover:from-primary-500/15 hover:to-accent-500/10 transition-all duration-200"
          >
            <BookOpen size={14} />
            Bibliography
          </button>
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-all duration-200"
            title="Copy to clipboard"
          >
            {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
          </button>
          <button
            onClick={downloadAsTxt}
            className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-all duration-200"
            title="Download as text"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="px-8 py-7 max-w-none overflow-y-auto max-h-[65vh]">
        {content ? renderContent(content) : (
          <div className="flex items-center gap-3 py-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20" style={{ animation: 'progressPulse 2s infinite' }}>
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-sm text-surface-400 font-medium">Synthesizing research findings...</span>
          </div>
        )}
      </div>
    </div>
  );
}
