import React, { useState } from 'react';
import { History, Trash2, Moon, Sun, ChevronLeft, ChevronRight, Search, Key } from 'lucide-react';
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
      <div className="w-12 bg-surface-50 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 flex flex-col items-center py-4 gap-4">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="p-2 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400"
          aria-label="Open sidebar"
        >
          <ChevronRight size={18} />
        </button>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
          className="p-2 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400"
          aria-label="Toggle dark mode"
        >
          {state.preferences.darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 bg-surface-50 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 flex flex-col h-full" aria-label="Research history sidebar">
      {/* Header */}
      <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search size={20} className="text-primary-600 dark:text-primary-400" />
          <h1 className="text-lg font-bold text-surface-900 dark:text-surface-100">Researcher</h1>
        </div>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-500"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Research History */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center gap-2 mb-3 px-1">
          <History size={16} className="text-surface-500" />
          <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">Research History</span>
          <span className="ml-auto text-xs text-surface-400 bg-surface-200 dark:bg-surface-800 px-2 py-0.5 rounded-full">
            {state.sessions.length}
          </span>
        </div>

        {state.sessions.length === 0 ? (
          <p className="text-sm text-surface-400 dark:text-surface-500 px-2 py-4 text-center">
            No research sessions yet. Start a new research query above.
          </p>
        ) : (
          <div className="space-y-1">
            {state.sessions.map(session => (
              <div
                key={session.id}
                className={`group p-2.5 rounded-lg cursor-pointer transition-colors ${
                  state.currentSession?.id === session.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800'
                    : 'hover:bg-surface-100 dark:hover:bg-surface-800'
                }`}
                onClick={() => loadSession(session)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && loadSession(session)}
                aria-label={`Load research session: ${session.name}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">
                      {session.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-surface-400">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-surface-400">
                        {session.results.length} sources
                      </span>
                    </div>
                    <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400">
                      {session.outputMode.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'DELETE_SESSION', payload: session.id });
                    }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-surface-400 hover:text-red-500 transition-opacity"
                    aria-label={`Delete session: ${session.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with settings */}
      <div className="p-3 border-t border-surface-200 dark:border-surface-700 space-y-2">
        {showApiKeyInput && (
          <div className="p-2 bg-surface-100 dark:bg-surface-800 rounded-lg space-y-2">
            <label className="text-xs font-medium text-surface-600 dark:text-surface-400">Claude API Key</label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-2 py-1.5 text-sm rounded border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveApiKey}
                className="flex-1 text-xs py-1 rounded bg-primary-600 text-white hover:bg-primary-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowApiKeyInput(false)}
                className="flex-1 text-xs py-1 rounded bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-300 dark:hover:bg-surface-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg text-sm transition-colors ${
              state.apiKey
                ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
            }`}
            aria-label="Configure API key"
          >
            <Key size={16} />
            <span className="text-xs">{state.apiKey ? 'API Key Set' : 'Set API Key'}</span>
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
            className="p-2 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400"
            aria-label="Toggle dark mode"
          >
            {state.preferences.darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
