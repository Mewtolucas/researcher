import React, { useState } from 'react';
import { History, Trash2, Moon, Sun, ChevronLeft, ChevronRight, Key, Sparkles, Palette } from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import { useThemeStyles } from '../utils/themeStyles';

export default function Sidebar() {
  const { state, dispatch, loadSession } = useResearch();
  const ts = useThemeStyles();
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(state.apiKey);

  const handleSaveApiKey = () => {
    dispatch({ type: 'SET_API_KEY', payload: apiKeyInput });
    setShowApiKeyInput(false);
  };

  if (!state.sidebarOpen) {
    return (
      <div className="w-14 flex flex-col items-center py-5 gap-3 relative z-20" style={ts.sidebarStyle}>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="p-2.5 rounded-xl transition-all duration-200 hover:scale-105"
          style={{ color: ts.textMuted }}
          aria-label="Open sidebar"
        >
          <ChevronRight size={18} />
        </button>
        <div className="w-6 h-px" style={{ background: ts.borderColor }} />
        <button
          onClick={() => dispatch({ type: 'TOGGLE_THEME_CUSTOMIZER' })}
          className="p-2.5 rounded-xl transition-all duration-200 hover:scale-105"
          style={{ color: ts.textMuted }}
          aria-label="Customize theme"
        >
          <Palette size={18} />
        </button>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
          className="p-2.5 rounded-xl transition-all duration-200 hover:scale-105"
          style={{ color: ts.textMuted }}
          aria-label="Toggle dark mode"
        >
          {state.preferences.darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    );
  }

  return (
    <aside className="w-[280px] flex flex-col h-full relative z-20" style={ts.sidebarStyle} aria-label="Research history sidebar">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={ts.gradientIcon}>
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight" style={{ color: ts.text }}>Researcher</h1>
            <p className="text-[10px] font-medium tracking-wide uppercase" style={{ color: ts.textFaint }}>AI-Powered</p>
          </div>
        </div>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="p-1.5 rounded-lg transition-all duration-200"
          style={{ color: ts.textMuted }}
          aria-label="Collapse sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Research History */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="flex items-center gap-2 mb-3 px-2">
          <History size={13} style={{ color: ts.textMuted }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: ts.textMuted }}>History</span>
          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: ts.primary, background: ts.primaryBg }}>
            {state.sessions.length}
          </span>
        </div>

        {state.sessions.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ background: ts.hoverBg }}>
              <History size={18} style={{ color: ts.textFaint }} />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: ts.textMuted }}>
              Your research sessions will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {state.sessions.map(session => (
              <div
                key={session.id}
                className="group p-3 rounded-xl cursor-pointer transition-all duration-200"
                style={state.currentSession?.id === session.id
                  ? { background: ts.primaryBg, border: `1px solid ${ts.primaryBorder}` }
                  : {}
                }
                onClick={() => loadSession(session)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && loadSession(session)}
                aria-label={`Load research session: ${session.name}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate leading-snug" style={{ color: ts.text }}>
                      {session.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] font-medium" style={{ color: ts.textMuted }}>
                        {new Date(session.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="w-0.5 h-0.5 rounded-full" style={{ background: ts.textFaint }} />
                      <span className="text-[10px] font-medium" style={{ color: ts.textMuted }}>
                        {session.results.length} sources
                      </span>
                    </div>
                    <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-md font-medium" style={{ background: ts.hoverBg, color: ts.textMuted }}>
                      {session.outputMode.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'DELETE_SESSION', payload: session.id });
                    }}
                    className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 text-surface-300 hover:text-red-500 transition-all duration-200"
                    aria-label={`Delete session: ${session.name}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 space-y-2" style={ts.footerBorder}>
        {showApiKeyInput && (
          <div className="p-3 rounded-xl space-y-2.5 animate-fade-in-up" style={{ background: ts.hoverBg, border: `1px solid ${ts.borderColor}` }}>
            <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: ts.textMuted }}>Claude API Key</label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
              style={{ ...ts.inputStyle, '--tw-ring-color': ts.primaryBorder } as React.CSSProperties}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveApiKey}
                className="flex-1 text-xs py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                style={ts.gradientButton}
              >
                Save Key
              </button>
              <button
                onClick={() => setShowApiKeyInput(false)}
                className="flex-1 text-xs py-2 rounded-lg font-medium transition-all duration-200"
                style={{ background: ts.hoverBg, color: ts.textMuted }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className={`flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
              state.apiKey
                ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
            }`}
            aria-label="Configure API key"
          >
            <Key size={14} />
            <span>{state.apiKey ? 'API Key Set' : 'Set API Key'}</span>
            {state.apiKey && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_THEME_CUSTOMIZER' })}
            className="p-2.5 rounded-xl transition-all duration-200"
            style={{ color: ts.textMuted }}
            aria-label="Customize theme"
          >
            <Palette size={15} />
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
            className="p-2.5 rounded-xl transition-all duration-200"
            style={{ color: ts.textMuted }}
            aria-label="Toggle dark mode"
          >
            {state.preferences.darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
