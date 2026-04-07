import React, { useRef, useState } from 'react';
import { Copy, Download, BookOpen, FileText, BarChart3, Check, Sparkles, Highlighter } from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import { useThemeStyles } from '../utils/themeStyles';

// 20 distinct colors for source highlighting
const SOURCE_COLORS = [
  { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.4)', text: '#4f46e5', label: 'Indigo' },
  { bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.4)', text: '#db2777', label: 'Pink' },
  { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#059669', label: 'Emerald' },
  { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#d97706', label: 'Amber' },
  { bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.4)', text: '#0891b2', label: 'Cyan' },
  { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)', text: '#7c3aed', label: 'Purple' },
  { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#dc2626', label: 'Red' },
  { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', text: '#16a34a', label: 'Green' },
  { bg: 'rgba(251, 146, 60, 0.15)', border: 'rgba(251, 146, 60, 0.4)', text: '#ea580c', label: 'Orange' },
  { bg: 'rgba(14, 165, 233, 0.15)', border: 'rgba(14, 165, 233, 0.4)', text: '#0284c7', label: 'Sky' },
  { bg: 'rgba(217, 70, 239, 0.15)', border: 'rgba(217, 70, 239, 0.4)', text: '#c026d3', label: 'Fuchsia' },
  { bg: 'rgba(132, 204, 22, 0.15)', border: 'rgba(132, 204, 22, 0.4)', text: '#65a30d', label: 'Lime' },
  { bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.4)', text: '#e11d48', label: 'Rose' },
  { bg: 'rgba(45, 212, 191, 0.15)', border: 'rgba(45, 212, 191, 0.4)', text: '#0d9488', label: 'Teal' },
  { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', text: '#2563eb', label: 'Blue' },
  { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)', text: '#ca8a04', label: 'Yellow' },
  { bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.4)', text: '#7c3aed', label: 'Violet' },
  { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)', text: '#ea580c', label: 'Deep Orange' },
  { bg: 'rgba(20, 184, 166, 0.15)', border: 'rgba(20, 184, 166, 0.4)', text: '#0d9488', label: 'Teal Alt' },
  { bg: 'rgba(192, 38, 211, 0.15)', border: 'rgba(192, 38, 211, 0.4)', text: '#a21caf', label: 'Magenta' },
];

function getSourceColor(sourceId: number) {
  return SOURCE_COLORS[(sourceId - 1) % SOURCE_COLORS.length];
}

/**
 * Strip <src> tags from content for plain text display/copy
 */
function stripSourceTags(content: string): string {
  return content.replace(/<src\s+id="[^"]*">/g, '').replace(/<\/src>/g, '');
}

/**
 * Parse content with <src> tags into segments for highlighting
 */
interface ContentSegment {
  text: string;
  sourceIds: number[];
}

function parseSourceSegments(content: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const regex = /<src\s+id="([^"]*)">([\s\S]*?)<\/src>/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Text before this tag
    if (match.index > lastIndex) {
      segments.push({ text: content.slice(lastIndex, match.index), sourceIds: [] });
    }
    // Tagged text
    const ids = match[1].split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    segments.push({ text: match[2], sourceIds: ids });
    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < content.length) {
    segments.push({ text: content.slice(lastIndex), sourceIds: [] });
  }

  return segments;
}

function renderInline(text: string, highlighting: boolean): React.ReactNode {
  if (highlighting) {
    // First parse source tags, then render inline formatting within each segment
    const segments = parseSourceSegments(text);
    return segments.map((seg, segIdx) => {
      const formatted = renderInlineFormatting(seg.text, `seg-${segIdx}`);
      if (seg.sourceIds.length > 0) {
        const primaryColor = getSourceColor(seg.sourceIds[0]);
        return (
          <span
            key={`seg-${segIdx}`}
            style={{
              backgroundColor: primaryColor.bg,
              borderBottom: `2px solid ${primaryColor.border}`,
              borderRadius: '2px',
              padding: '0 1px',
            }}
            title={`Source${seg.sourceIds.length > 1 ? 's' : ''}: ${seg.sourceIds.map(id => `[${id}]`).join(', ')}`}
          >
            {formatted}
            <sup style={{ fontSize: '9px', fontWeight: 700, color: primaryColor.text, marginLeft: '1px' }}>
              {seg.sourceIds.map(id => `[${id}]`).join('')}
            </sup>
          </span>
        );
      }
      return <React.Fragment key={`seg-${segIdx}`}>{formatted}</React.Fragment>;
    });
  }

  // No highlighting: strip tags and render normally
  return renderInlineFormatting(stripSourceTags(text), 'plain');
}

function renderInlineFormatting(text: string, keyPrefix: string): React.ReactNode {
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
      parts.push(<strong key={`${keyPrefix}-${match.index}`} className="font-semibold">{m.slice(2, -2)}</strong>);
    } else if (m.startsWith('*') && m.endsWith('*')) {
      parts.push(<em key={`${keyPrefix}-${match.index}`} className="italic">{m.slice(1, -1)}</em>);
    } else if (m.startsWith('[') && m.endsWith(']')) {
      const nums = m.slice(1, -1).split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const color = nums.length > 0 ? getSourceColor(nums[0]) : { bg: 'rgba(99,102,241,0.1)', text: '#6366f1' };
      parts.push(
        <span
          key={`${keyPrefix}-${match.index}`}
          className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-md align-text-top cursor-help mx-0.5 transition-colors"
          style={{ backgroundColor: color.bg, color: color.text }}
          title={`Source ${m}`}
        >
          {m}
        </span>
      );
    }
    lastIndex = match.index + m.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : text;
}

function renderContent(content: string, highlighting: boolean, textColor: string, textMuted: string, primary: string, gradient: string): React.ReactNode {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-base font-semibold mt-8 mb-3 tracking-tight" style={{ color: textColor }}>
          {renderInline(line.slice(4), highlighting)}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-lg font-bold mt-10 mb-4 tracking-tight flex items-center gap-3" style={{ color: textColor }}>
          <span className="h-5 w-1 rounded-full" style={{ background: gradient }} />
          {renderInline(line.slice(3), highlighting)}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-2xl font-bold mt-6 mb-5 tracking-tight" style={{ color: textColor }}>
          {renderInline(line.slice(2), highlighting)}
        </h1>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={i} className="ml-4 text-[14px] leading-[1.85] list-none flex items-start gap-2.5" style={{ color: textMuted }}>
          <span className="w-1.5 h-1.5 rounded-full mt-2.5 shrink-0" style={{ background: primary, opacity: 0.5 }} />
          <span>{renderInline(line.slice(2), highlighting)}</span>
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)?.[1] || '';
      elements.push(
        <li key={i} className="ml-4 text-[14px] leading-[1.85] list-none flex items-start gap-2.5" style={{ color: textMuted }}>
          <span className="text-[11px] font-bold mt-1 min-w-[18px] text-right shrink-0" style={{ color: primary }}>{num}.</span>
          <span>{renderInline(line.replace(/^\d+\.\s/, ''), highlighting)}</span>
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-[14px] leading-[1.85] mb-1" style={{ color: textMuted }}>
          {renderInline(line, highlighting)}
        </p>
      );
    }
  }
  return elements;
}

export default function ResultsDisplay() {
  const { state, dispatch } = useResearch();
  const ts = useThemeStyles();
  const contentRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const session = state.currentSession;
  const highlighting = state.sourceHighlighting;

  if (!session && !state.progress.isResearching) {
    return (
      <div className="p-16 text-center animate-fade-in-up shadow-xl" style={ts.panelStyle}>
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: ts.primaryBg, border: `1px solid ${ts.primaryBorder}` }}>
          <Sparkles size={28} style={{ color: ts.primary }} />
        </div>
        <h2 className="text-xl font-bold mb-3 tracking-tight" style={{ color: ts.text }}>Start Your Research</h2>
        <p className="max-w-sm mx-auto text-sm leading-relaxed" style={{ color: ts.textMuted }}>
          Enter a research question, select your sources, and let AI synthesize findings with full academic citations.
        </p>
        <div className="flex items-center justify-center gap-6 mt-8">
          {[
            { icon: '1', text: 'Ask a question' },
            { icon: '2', text: 'Select sources' },
            { icon: '3', text: 'Get insights' },
          ].map(step => (
            <div key={step.icon} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center shadow-lg" style={{ background: ts.gradient }}>
                {step.icon}
              </span>
              <span className="text-xs font-medium" style={{ color: ts.textMuted }}>{step.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const content = session?.generatedContent || '';
  const resultCount = session?.results.length || 0;
  const wordCount = stripSourceTags(content).split(/\s+/).filter(Boolean).length;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(stripSourceTags(content));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsTxt = () => {
    const blob = new Blob([stripSourceTags(content)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-${session?.id || 'output'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Check if content has source tags
  const hasSourceTags = /<src\s+id="/.test(content);

  return (
    <div className="animate-fade-in-up overflow-hidden shadow-xl" style={ts.panelStyle}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3" style={{ ...ts.headerBorder, background: ts.hoverBg }}>
        <div className="flex items-center gap-4">
          <h2 className="font-bold tracking-tight" style={{ color: ts.text }}>Research Results</h2>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg" style={{ color: ts.textMuted, background: ts.hoverBg }}>
              <BarChart3 size={11} /> {resultCount} sources
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg" style={{ color: ts.textMuted, background: ts.hoverBg }}>
              <FileText size={11} /> {wordCount.toLocaleString()} words
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Source Highlighting Toggle */}
          {hasSourceTags && (
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SOURCE_HIGHLIGHTING' })}
              className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-xl transition-all duration-200"
              style={highlighting ? {
                background: 'linear-gradient(to right, rgba(99,102,241,0.15), rgba(236,72,153,0.15), rgba(16,185,129,0.15))',
                color: ts.primary,
                border: `1px solid ${ts.primaryBorder}`,
              } : ts.inactiveChip}
              title="Color-code text by source"
            >
              <Highlighter size={13} />
              {highlighting ? 'Sources On' : 'Sources Off'}
            </button>
          )}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_BIBLIOGRAPHY' })}
            className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-xl transition-all duration-200"
            style={ts.activeChip}
          >
            <BookOpen size={14} />
            Bibliography
          </button>
          <button
            onClick={copyToClipboard}
            className="p-2 rounded-xl transition-all duration-200"
            style={{ color: ts.textMuted }}
            title="Copy to clipboard"
          >
            {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
          </button>
          <button
            onClick={downloadAsTxt}
            className="p-2 rounded-xl transition-all duration-200"
            style={{ color: ts.textMuted }}
            title="Download as text"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* Source Legend (when highlighting is on) */}
      {highlighting && hasSourceTags && session && (
        <div className="px-6 py-3 flex flex-wrap gap-2 items-center" style={{ borderBottom: `1px solid ${ts.borderColor}` }}>
          <span className="text-[10px] font-bold uppercase tracking-wider mr-1" style={{ color: ts.textFaint }}>Legend:</span>
          {session.results.slice(0, 20).map((r, idx) => {
            const color = getSourceColor(idx + 1);
            return (
              <span
                key={idx}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold"
                style={{ backgroundColor: color.bg, color: color.text, border: `1px solid ${color.border}` }}
                title={r.title}
              >
                [{idx + 1}] {r.title.length > 25 ? r.title.substring(0, 25) + '...' : r.title}
              </span>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div ref={contentRef} className="px-8 py-7 max-w-none overflow-y-auto max-h-[65vh]">
        {content ? renderContent(content, highlighting, ts.text, ts.textMuted, ts.primary, ts.gradient) : (
          <div className="flex items-center gap-3 py-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{ ...ts.gradientIcon, animation: 'progressPulse 2s infinite' }}>
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-sm font-medium" style={{ color: ts.textMuted }}>Synthesizing research findings...</span>
          </div>
        )}
      </div>
    </div>
  );
}
