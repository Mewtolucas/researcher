import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  AppState, ResearchSession, OutputMode, CitationStyle, SourceType,
  SearchFilters, ResearchProgress, SourceQueryStatus, BibliographyEntry, SourceResult,
  ThemeConfig, ThemePresetName,
} from '../types';
import {
  loadSessions, saveSessions, loadPreferences, savePreferences,
  loadApiKey, saveApiKey, generateId, themePresets,
} from '../utils/storage';
import { generateAllCitations } from '../utils/citations';
import { sourceSearchMap, fetchCustomUrl } from '../services/sourceSearch';
import { synthesizeResearch, generateSearchQueries } from '../services/claudeApi';

type Action =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_SOURCES'; payload: SourceType[] }
  | { type: 'TOGGLE_SOURCE'; payload: SourceType }
  | { type: 'SET_CUSTOM_URLS'; payload: string[] }
  | { type: 'SET_FILTERS'; payload: Partial<SearchFilters> }
  | { type: 'SET_OUTPUT_MODE'; payload: OutputMode }
  | { type: 'SET_CITATION_STYLE'; payload: CitationStyle }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_PROGRESS'; payload: Partial<ResearchProgress> }
  | { type: 'UPDATE_SOURCE_STATUS'; payload: SourceQueryStatus }
  | { type: 'SET_CURRENT_SESSION'; payload: ResearchSession | null }
  | { type: 'ADD_SESSION'; payload: ResearchSession }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'SET_SESSIONS'; payload: ResearchSession[] }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_BIBLIOGRAPHY' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'TOGGLE_THEME_CUSTOMIZER' }
  | { type: 'SET_THEME'; payload: ThemeConfig }
  | { type: 'SET_THEME_PRESET'; payload: ThemePresetName }
  | { type: 'SET_GENERATED_CONTENT'; payload: string };

const prefs = loadPreferences();

const initialState: AppState = {
  currentQuery: '',
  selectedSources: prefs.defaultSources,
  customUrls: [],
  filters: prefs.defaultFilters,
  outputMode: prefs.defaultOutputMode,
  citationStyle: prefs.defaultCitationStyle,
  sessions: loadSessions(),
  currentSession: null,
  progress: {
    isResearching: false,
    currentPhase: 'idle',
    sourceStatuses: [],
    overallProgress: 0,
    statusMessage: '',
  },
  preferences: prefs,
  sidebarOpen: true,
  bibliographyPanelOpen: false,
  themeCustomizerOpen: false,
  apiKey: loadApiKey(),
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, currentQuery: action.payload };
    case 'SET_SOURCES':
      return { ...state, selectedSources: action.payload };
    case 'TOGGLE_SOURCE': {
      const src = action.payload;
      const selected = state.selectedSources.includes(src)
        ? state.selectedSources.filter(s => s !== src)
        : [...state.selectedSources, src];
      return { ...state, selectedSources: selected };
    }
    case 'SET_CUSTOM_URLS':
      return { ...state, customUrls: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_OUTPUT_MODE':
      return { ...state, outputMode: action.payload };
    case 'SET_CITATION_STYLE':
      return { ...state, citationStyle: action.payload };
    case 'SET_API_KEY':
      return { ...state, apiKey: action.payload };
    case 'SET_PROGRESS':
      return { ...state, progress: { ...state.progress, ...action.payload } };
    case 'UPDATE_SOURCE_STATUS': {
      const statuses = state.progress.sourceStatuses.map(s =>
        s.source === action.payload.source ? action.payload : s
      );
      if (!statuses.find(s => s.source === action.payload.source)) {
        statuses.push(action.payload);
      }
      return { ...state, progress: { ...state.progress, sourceStatuses: statuses } };
    }
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };
    case 'ADD_SESSION': {
      const sessions = [action.payload, ...state.sessions];
      return { ...state, sessions, currentSession: action.payload };
    }
    case 'DELETE_SESSION': {
      const sessions = state.sessions.filter(s => s.id !== action.payload);
      const currentSession = state.currentSession?.id === action.payload ? null : state.currentSession;
      return { ...state, sessions, currentSession };
    }
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'TOGGLE_BIBLIOGRAPHY':
      return { ...state, bibliographyPanelOpen: !state.bibliographyPanelOpen };
    case 'TOGGLE_DARK_MODE': {
      const darkMode = !state.preferences.darkMode;
      return { ...state, preferences: { ...state.preferences, darkMode } };
    }
    case 'TOGGLE_THEME_CUSTOMIZER':
      return { ...state, themeCustomizerOpen: !state.themeCustomizerOpen };
    case 'SET_THEME':
      return { ...state, preferences: { ...state.preferences, theme: action.payload, themePreset: 'default' as ThemePresetName } };
    case 'SET_THEME_PRESET': {
      const preset = themePresets[action.payload];
      if (!preset) return state;
      return {
        ...state,
        preferences: {
          ...state.preferences,
          theme: preset.theme,
          themePreset: action.payload,
          darkMode: preset.darkMode,
        },
      };
    }
    case 'SET_GENERATED_CONTENT': {
      if (!state.currentSession) return state;
      const updated = { ...state.currentSession, generatedContent: action.payload };
      const sessions = state.sessions.map(s => s.id === updated.id ? updated : s);
      return { ...state, currentSession: updated, sessions };
    }
    default:
      return state;
  }
}

interface ResearchContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  startResearch: () => Promise<void>;
  loadSession: (session: ResearchSession) => void;
}

const ResearchContext = createContext<ResearchContextType | null>(null);

export function ResearchProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    saveSessions(state.sessions);
  }, [state.sessions]);

  useEffect(() => {
    savePreferences(state.preferences);
    const root = document.documentElement;

    if (state.preferences.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply theme CSS custom properties
    const t = state.preferences.theme;
    root.style.setProperty('--theme-primary', t.primaryColor);
    root.style.setProperty('--theme-accent', t.accentColor);
    root.style.setProperty('--theme-bg', t.backgroundColor);
    root.style.setProperty('--theme-panel', t.panelColor);
    root.style.setProperty('--theme-panel-opacity', t.panelOpacity.toString());
    root.style.setProperty('--theme-text', t.textColor);
    root.style.setProperty('--theme-radius', `${t.borderRadius}px`);

    // Apply background
    if (t.backgroundGradient.enabled) {
      const stops = t.backgroundGradient.stops
        .map(s => `${s.color} ${s.position}%`)
        .join(', ');
      const grad = t.backgroundGradient.type === 'radial'
        ? `radial-gradient(ellipse at center, ${stops})`
        : `linear-gradient(${t.backgroundGradient.angle}deg, ${stops})`;
      root.style.setProperty('--theme-bg-gradient', grad);
    } else {
      root.style.setProperty('--theme-bg-gradient', t.backgroundColor);
    }
  }, [state.preferences]);

  useEffect(() => {
    saveApiKey(state.apiKey);
  }, [state.apiKey]);

  const loadSession = useCallback((session: ResearchSession) => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
    dispatch({ type: 'SET_QUERY', payload: session.query });
    dispatch({ type: 'SET_OUTPUT_MODE', payload: session.outputMode });
    dispatch({ type: 'SET_SOURCES', payload: session.selectedSources });
    dispatch({ type: 'SET_CITATION_STYLE', payload: session.citationStyle });
    dispatch({ type: 'SET_FILTERS', payload: session.filters });
    dispatch({ type: 'SET_CUSTOM_URLS', payload: session.customUrls });
    if (session.bibliography.length > 0) {
      dispatch({ type: 'TOGGLE_BIBLIOGRAPHY' });
    }
  }, []);

  const startResearch = useCallback(async () => {
    if (!state.currentQuery.trim()) return;

    const sourceStatuses: SourceQueryStatus[] = [
      ...state.selectedSources.map(s => ({
        source: s,
        status: 'pending' as const,
        resultCount: 0,
      })),
      ...state.customUrls.map(u => ({
        source: u,
        status: 'pending' as const,
        resultCount: 0,
      })),
    ];

    dispatch({
      type: 'SET_PROGRESS',
      payload: {
        isResearching: true,
        currentPhase: 'searching',
        sourceStatuses,
        overallProgress: 0,
        statusMessage: 'Generating optimized search queries...',
      },
    });

    // Generate search queries
    const queries = await generateSearchQueries(state.currentQuery, state.apiKey);
    const primaryQuery = queries[0] || state.currentQuery;

    // Search each source in parallel
    let allResults: SourceResult[] = [];
    const totalSources = state.selectedSources.length + state.customUrls.length;
    let completedSources = 0;

    const searchPromises = state.selectedSources.map(async (source) => {
      dispatch({ type: 'UPDATE_SOURCE_STATUS', payload: { source, status: 'searching', resultCount: 0 } });
      dispatch({ type: 'SET_PROGRESS', payload: { statusMessage: `Searching ${source}...` } });

      const searchFn = sourceSearchMap[source];
      if (!searchFn) return [];

      try {
        const results = await searchFn(primaryQuery, state.filters);
        completedSources++;
        dispatch({
          type: 'UPDATE_SOURCE_STATUS',
          payload: { source, status: 'completed', resultCount: results.length },
        });
        dispatch({
          type: 'SET_PROGRESS',
          payload: {
            overallProgress: Math.round((completedSources / totalSources) * 60),
            statusMessage: `Completed ${source} (${results.length} results)`,
          },
        });
        return results;
      } catch (err: any) {
        completedSources++;
        dispatch({
          type: 'UPDATE_SOURCE_STATUS',
          payload: { source, status: 'failed', resultCount: 0, error: err.message },
        });
        return [];
      }
    });

    const customPromises = state.customUrls.map(async (url) => {
      dispatch({ type: 'UPDATE_SOURCE_STATUS', payload: { source: url, status: 'searching', resultCount: 0 } });
      try {
        const result = await fetchCustomUrl(url);
        completedSources++;
        dispatch({
          type: 'UPDATE_SOURCE_STATUS',
          payload: { source: url, status: 'completed', resultCount: result ? 1 : 0 },
        });
        return result ? [result] : [];
      } catch {
        completedSources++;
        dispatch({
          type: 'UPDATE_SOURCE_STATUS',
          payload: { source: url, status: 'failed', resultCount: 0 },
        });
        return [];
      }
    });

    const resultsArrays = await Promise.all([...searchPromises, ...customPromises]);
    allResults = resultsArrays.flat();

    // Deduplicate by title similarity
    const seen = new Set<string>();
    allResults = allResults.filter(r => {
      const key = r.title.toLowerCase().trim().substring(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    dispatch({
      type: 'SET_PROGRESS',
      payload: {
        currentPhase: 'synthesizing',
        overallProgress: 65,
        statusMessage: 'Synthesizing research findings with Claude...',
      },
    });

    // Synthesize with Claude API
    let generatedContent = '';
    try {
      generatedContent = await synthesizeResearch(
        {
          query: state.currentQuery,
          results: allResults,
          outputMode: state.outputMode,
          citationStyle: state.citationStyle,
        },
        state.apiKey,
        (chunk) => {
          dispatch({ type: 'SET_GENERATED_CONTENT', payload: chunk });
        }
      );
    } catch (err: any) {
      generatedContent = `## Research Results\n\nFound ${allResults.length} sources across ${state.selectedSources.length} databases.\n\n**Note:** ${err.message}\n\n### Sources Found\n\n${allResults.map((r, i) => `${i + 1}. **${r.title}** (${r.year || 'n.d.'})\n   ${r.authors.join(', ')}\n   ${r.abstract ? r.abstract.substring(0, 200) + '...' : 'No abstract available.'}\n   [Link](${r.url})`).join('\n\n')}`;
    }

    // Generate bibliography
    const bibliography: BibliographyEntry[] = allResults.map(r => ({
      id: generateId(),
      sourceResult: r,
      citation: generateAllCitations(r),
      keyInformation: r.abstract ? [r.abstract.substring(0, 300)] : [],
      usageInOutput: 'Referenced in generated content',
      relevanceRating: r.relevanceScore > 0 ? Math.min(5, Math.ceil(r.relevanceScore / 20)) : 3,
      accessDate: new Date().toISOString().split('T')[0],
      accessStatus: 'accessible' as const,
    }));

    const session: ResearchSession = {
      id: generateId(),
      query: state.currentQuery,
      outputMode: state.outputMode,
      selectedSources: state.selectedSources,
      customUrls: state.customUrls,
      filters: state.filters,
      citationStyle: state.citationStyle,
      results: allResults,
      bibliography,
      generatedContent,
      timestamp: new Date().toISOString(),
      name: state.currentQuery.substring(0, 60),
      tags: [],
    };

    dispatch({ type: 'ADD_SESSION', payload: session });
    dispatch({
      type: 'SET_PROGRESS',
      payload: {
        isResearching: false,
        currentPhase: 'complete',
        overallProgress: 100,
        statusMessage: `Research complete. Found ${allResults.length} sources.`,
      },
    });
    dispatch({ type: 'SET_GENERATED_CONTENT', payload: generatedContent });
  }, [state.currentQuery, state.selectedSources, state.customUrls, state.filters, state.outputMode, state.citationStyle, state.apiKey]);

  return (
    <ResearchContext.Provider value={{ state, dispatch, startResearch, loadSession }}>
      {children}
    </ResearchContext.Provider>
  );
}

export function useResearch() {
  const context = useContext(ResearchContext);
  if (!context) throw new Error('useResearch must be used within ResearchProvider');
  return context;
}
