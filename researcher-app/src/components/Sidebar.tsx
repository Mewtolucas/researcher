import React, { useState } from 'react';
import { History, Trash2, Moon, Sun, ChevronLeft, ChevronRight, Key, Sparkles } from 'lucide-react';
import { useResearch } from '../context/ResearchContext';

export default function Sidebar() {
  const { state, dispatch, loadSession } = useResearch();
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(state.apiKey);

  const handleSaveApiKey = () => {
    dispatch({ type: 'SET_API_KEY', payload: apiKeyInput });
    setShowApiKeyInput(false);
  };

  if (!state.sidebarOpen) {
    return (
      <div className="w-14 glass border-r border-white/20 dark:border-white/5 flex flex-col items-center py-5 gap-3 relative z-20">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="p-2.5 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 text-surface-500 dark:text-surface-400 transition-all duration-200 hover:scale-105"
          aria-label="Open sidebar"
        >
          <ChevronRight size={18} />
        </button>
        <div className="w-6 h-px bg-surface-200 dark:bg-surface-700/50" />
        <button
          onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
          className="p-2.5 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 text-surface-500 dark:text-surface-400 transition-all duration-200 hover:scale-105"
          aria-label="Toggle dark mode"
        >
          {state.preferences.darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    );
  }

  return (
    <aside className="w-[280px] glass border-r border-white/20 dark:border-white/5 flex flex-col h-full relative z-20" aria-label="Research history sidebar">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight text-surface-900 dark:text-white">Researcher</h1>
            <p className="text-[10px] text-surface-400 font-medium tracking-wide uppercase">AI-Powered</p>
          </div>
        </div>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="p-1.5 rounded-lg hover:bg-surface-200/50 dark:hover:bg-white/5 text-surface-400 transition-all duration-200"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Research History */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="flex items-center gap-2 mb-3 px-2">
          <History size={13} className="text-surface-400" />
          <span className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">History</span>
          <span className="ml-auto text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-100/80 dark:bg-primary-500/10 px-2 py-0.5 rounded-full">
            {state.sessions.length}
          </span>
        </div>

        {state.sessions.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-surface-100 dark:bg-surface-800/50 flex items-center justify-center">
              <History size={18} className="text-surface-300 dark:text-surface-600" />
            </div>
            <p className="text-xs text-surface-400 dark:text-surface-500 leading-relaxed">
              Your research sessions will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {state.sessions.map(session => (
              <div
                key={session.id}
                className={`group p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  state.currentSession?.id === session.id
                    ? 'bg-gradient-to-r from-primary-500/10 to-accent-500/5 dark:from-primary-500/15 dark:to-accent-500/5 shadow-sm shadow-primary-500/5'
                    : 'hover:bg-white/60 dark:hover:bg-white/5'
                }`}
                onClick={() => loadSession(session)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && loadSession(session)}
                aria-label={`Load research session: ${session.name}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-surface-800 dark:text-surface-200 truncate leading-snug">
                      {session.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] text-surface-400 font-medium">
                        {new Date(session.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="w-0.5 h-0.5 rounded-full bg-surface-300 dark:bg-surface-600" />
                      <span className="text-[10px] text-surface-400 font-medium">
                        {session.results.length} sources
                      </span>
                    </div>
                    <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-md bg-surface-100/80 dark:bg-surface-800/50 text-surface-500 dark:text-surface-400 font-medium">
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
      <div className="p-3 border-t border-surface-200/50 dark:border-white/5 space-y-2">
        {showApiKeyInput && (
          <div className="p-3 bg-white/60 dark:bg-surface-800/60 rounded-xl border border-surface-200/50 dark:border-white/5 space-y-2.5 animate-fade-in-up">
            <label className="text-[11px] font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Claude API Key</label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-600/50 bg-white dark:bg-surface-900/50 text-surface-800 dark:text-surface-200 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all duration-200"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveApiKey}
                className="flex-1 text-xs py-2 rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 text-white font-medium hover:shadow-lg hover:shadow-primary-500/20 transition-all duration-200"
              >
                Save Key
              </button>
              <button
                onClick={() => setShowApiKeyInput(false)}
                className="flex-1 text-xs py-2 rounded-lg bg-surface-100 dark:bg-surface-800/50 text-surface-500 dark:text-surface-400 font-medium hover:bg-surface-200 dark:hover:bg-surface-700/50 transition-all duration-200"
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
            onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
            className="p-2.5 rounded-xl hover:bg-surface-200/50 dark:hover:bg-white/5 text-surface-500 dark:text-surface-400 transition-all duration-200"
            aria-label="Toggle dark mode"
          >
            {state.preferences.darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
