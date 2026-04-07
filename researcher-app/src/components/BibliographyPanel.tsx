import React, { useState } from 'react';
import { X, Copy, Download, ExternalLink, Star, ChevronDown, ChevronUp, Check, BookMarked, Shield, ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import { useThemeStyles } from '../utils/themeStyles';
import { CitationStyle, BibliographyEntry, CredibilityAssessment } from '../types';

const CITATION_STYLES: CitationStyle[] = ['APA', 'MLA', 'Chicago', 'Harvard'];

function CredibilityBadge({ credibility }: { credibility: CredibilityAssessment }) {
  const config = {
    high: { icon: ShieldCheck, color: '#059669', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', label: 'High Credibility' },
    medium: { icon: Shield, color: '#d97706', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', label: 'Medium Credibility' },
    low: { icon: ShieldAlert, color: '#dc2626', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', label: 'Low Credibility' },
    unknown: { icon: ShieldQuestion, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', border: 'rgba(107, 114, 128, 0.3)', label: 'Unknown' },
  };
  const c = config[credibility.level];
  const Icon = c.icon;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold"
      style={{ backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}` }}
      title={`Credibility: ${credibility.score}/10 - ${credibility.reasoning}`}
    >
      <Icon size={10} />
      {credibility.score}/10
    </span>
  );
}

function CredibilityDetails({ credibility }: { credibility: CredibilityAssessment }) {
  const ts = useThemeStyles();
  const levelColors = {
    high: { color: '#059669', bg: 'rgba(16, 185, 129, 0.08)' },
    medium: { color: '#d97706', bg: 'rgba(245, 158, 11, 0.08)' },
    low: { color: '#dc2626', bg: 'rgba(239, 68, 68, 0.08)' },
    unknown: { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.08)' },
  };
  const lc = levelColors[credibility.level];

  return (
    <div className="p-3 rounded-lg space-y-2" style={{ background: lc.bg, border: `1px solid ${lc.color}22` }}>
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck size={13} style={{ color: lc.color }} />
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: lc.color }}>
          Credibility Assessment — {credibility.score}/10
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: ts.textFaint }}>Author Expertise</p>
          <p className="text-[11px] leading-relaxed" style={{ color: ts.textMuted }}>{credibility.authorExpertise}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: ts.textFaint }}>Publication Type</p>
          <p className="text-[11px] leading-relaxed" style={{ color: ts.textMuted }}>{credibility.publicationType}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: ts.textFaint }}>Peer Reviewed</p>
          <p className="text-[11px] leading-relaxed" style={{ color: credibility.peerReviewed ? '#059669' : '#d97706' }}>
            {credibility.peerReviewed ? 'Yes' : 'No / Unknown'}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: ts.textFaint }}>Journal/Publisher</p>
          <p className="text-[11px] leading-relaxed" style={{ color: ts.textMuted }}>{credibility.journalReputation}</p>
        </div>
      </div>

      {credibility.methodology && credibility.methodology !== 'N/A' && credibility.methodology !== 'Not assessed' && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: ts.textFaint }}>Methodology</p>
          <p className="text-[11px] leading-relaxed" style={{ color: ts.textMuted }}>{credibility.methodology}</p>
        </div>
      )}

      <div>
        <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: ts.textFaint }}>Assessment Summary</p>
        <p className="text-[11px] leading-relaxed" style={{ color: ts.text }}>{credibility.reasoning}</p>
      </div>
    </div>
  );
}

function BibEntry({ entry, citationStyle, index }: { entry: BibliographyEntry; citationStyle: CitationStyle; index: number }) {
  const ts = useThemeStyles();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(entry.citation[citationStyle]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg" style={{ background: ts.hoverBg, border: `1px solid ${ts.borderColor}` }}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-[11px] font-bold" style={{ background: ts.primaryBg, color: ts.primary }}>
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] leading-relaxed font-medium" style={{ color: ts.text }}>
              {entry.citation[citationStyle]}
            </p>
            <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider" style={{ background: ts.hoverBg, color: ts.textMuted, border: `1px solid ${ts.borderColor}` }}>
                {entry.sourceResult.source.replace('_', ' ')}
              </span>
              {entry.credibility && (
                <CredibilityBadge credibility={entry.credibility} />
              )}
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={10} className={i < entry.relevanceRating ? 'text-amber-400 fill-amber-400' : ''} style={i >= entry.relevanceRating ? { color: ts.borderColorStrong } : {}} />
                ))}
              </span>
              <span className="text-[10px] font-medium" style={{ color: ts.textFaint }}>
                {entry.accessDate}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <a
              href={entry.sourceResult.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg transition-all duration-200"
              style={{ color: ts.textFaint }}
              title="Open source"
            >
              <ExternalLink size={13} />
            </a>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg transition-all duration-200"
              style={{ color: ts.textFaint }}
              title="Copy citation"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg transition-all duration-200"
              style={{ color: ts.textFaint }}
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0 animate-fade-in-up space-y-3">
          {/* Credibility Assessment */}
          {entry.credibility && entry.credibility.level !== 'unknown' && (
            <CredibilityDetails credibility={entry.credibility} />
          )}

          <div className="p-3.5 rounded-xl space-y-3" style={{ background: ts.hoverBg, border: `1px solid ${ts.borderColor}` }}>
            {entry.sourceResult.doi && (
              <p className="text-[11px]" style={{ color: ts.textMuted }}>
                <span className="font-semibold" style={{ color: ts.text }}>DOI:</span> {entry.sourceResult.doi}
              </p>
            )}
            {entry.sourceResult.abstract && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: ts.textFaint }}>Abstract</p>
                <p className="text-[12px] leading-relaxed" style={{ color: ts.textMuted }}>{entry.sourceResult.abstract}</p>
              </div>
            )}
            {entry.keyInformation.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: ts.textFaint }}>Key Information</p>
                <ul className="text-[12px] space-y-1" style={{ color: ts.textMuted }}>
                  {entry.keyInformation.map((info, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: ts.primary, opacity: 0.5 }} />
                      {info}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-4">
              <p className="text-[11px]" style={{ color: ts.textMuted }}>
                <span className="font-semibold">Status:</span>{' '}
                <span className="font-medium" style={{ color: entry.accessStatus === 'accessible' ? '#059669' : '#d97706' }}>
                  {entry.accessStatus}
                </span>
              </p>
            </div>

            <div className="pt-2" style={{ borderTop: `1px solid ${ts.borderColor}` }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: ts.textFaint }}>All Citation Styles</p>
              <div className="space-y-2">
                {CITATION_STYLES.map(style => (
                  <div key={style} className="flex items-start gap-2.5">
                    <span className="text-[10px] font-bold w-14 shrink-0 pt-0.5 text-right uppercase tracking-wider" style={{ color: style === citationStyle ? ts.primary : ts.textFaint }}>{style}</span>
                    <p className="text-[11px] leading-relaxed flex-1" style={{ color: ts.textMuted }}>{entry.citation[style]}</p>
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
  const ts = useThemeStyles();
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
      if (entry.credibility) {
        content += `    Credibility: ${entry.credibility.score}/10 (${entry.credibility.level})\n`;
        content += `    Author Expertise: ${entry.credibility.authorExpertise}\n`;
        content += `    Publication Type: ${entry.credibility.publicationType}\n`;
        content += `    Peer Reviewed: ${entry.credibility.peerReviewed ? 'Yes' : 'No'}\n`;
        content += `    Journal/Publisher: ${entry.credibility.journalReputation}\n`;
        if (entry.credibility.methodology !== 'N/A' && entry.credibility.methodology !== 'Not assessed') {
          content += `    Methodology: ${entry.credibility.methodology}\n`;
        }
        content += `    Assessment: ${entry.credibility.reasoning}\n`;
      }
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
    <div className="animate-fade-in-up overflow-hidden shadow-xl" style={ts.panelStyle}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ ...ts.headerBorder, background: ts.hoverBg }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ts.primaryBg, border: `1px solid ${ts.primaryBorder}` }}>
            <BookMarked size={15} style={{ color: ts.primary }} />
          </div>
          <div>
            <h2 className="font-bold tracking-tight text-[15px]" style={{ color: ts.text }}>
              Annotated Bibliography
            </h2>
            <span className="text-[10px] font-medium" style={{ color: ts.textMuted }}>
              {bibliography.length} sources cited
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl p-0.5" style={{ background: ts.hoverBg, border: `1px solid ${ts.borderColor}` }}>
            {CITATION_STYLES.map(style => (
              <button
                key={style}
                onClick={() => dispatch({ type: 'SET_CITATION_STYLE', payload: style })}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
                style={state.citationStyle === style
                  ? { background: ts.gradient, color: '#fff' }
                  : { color: ts.textMuted }
                }
              >
                {style}
              </button>
            ))}
          </div>
          <div className="w-px h-5" style={{ background: ts.borderColor }} />
          <button
            onClick={copyAllCitations}
            className="p-2 rounded-xl transition-all duration-200"
            style={{ color: ts.textMuted }}
            title="Copy all citations"
          >
            {copiedAll ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
          </button>
          <button
            onClick={downloadBibliography}
            className="p-2 rounded-xl transition-all duration-200"
            style={{ color: ts.textMuted }}
            title="Download bibliography"
          >
            <Download size={15} />
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_BIBLIOGRAPHY' })}
            className="p-2 rounded-xl transition-all duration-200"
            style={{ color: ts.textMuted }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Bibliography entries */}
      <div className="p-5 space-y-3 max-h-[55vh] overflow-y-auto">
        {bibliography.length === 0 ? (
          <div className="text-center py-8">
            <BookMarked size={24} style={{ color: ts.textFaint }} className="mx-auto mb-3" />
            <p className="text-sm font-medium" style={{ color: ts.textMuted }}>No sources in bibliography.</p>
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
