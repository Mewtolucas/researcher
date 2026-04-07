import { ResearchSession, UserPreferences, SearchFilters, ThemeConfig, ThemePresetName } from '../types';

const SESSIONS_KEY = 'researcher_sessions';
const PREFERENCES_KEY = 'researcher_preferences';
const API_KEY_KEY = 'researcher_api_key';

const defaultFilters: SearchFilters = {
  dateFrom: null,
  dateTo: null,
  documentType: 'all',
  language: 'en',
  maxResults: 20,
  exactSourceCount: null,
};

export const defaultTheme: ThemeConfig = {
  primaryColor: '#6366f1',
  accentColor: '#8b5cf6',
  backgroundColor: '#f8fafc',
  backgroundGradient: {
    enabled: true,
    type: 'linear',
    angle: 135,
    stops: [
      { color: '#f8fafc', position: 0 },
      { color: '#eef2ff', position: 50 },
      { color: '#f5f3ff', position: 100 },
    ],
  },
  panelColor: '#ffffff',
  panelOpacity: 0.7,
  textColor: '#1e293b',
  borderRadius: 16,
};

export const themePresets: Record<ThemePresetName, { label: string; theme: ThemeConfig; darkMode: boolean }> = {
  default: {
    label: 'Default',
    darkMode: false,
    theme: defaultTheme,
  },
  midnight: {
    label: 'Midnight',
    darkMode: true,
    theme: {
      primaryColor: '#818cf8',
      accentColor: '#a78bfa',
      backgroundColor: '#020617',
      backgroundGradient: {
        enabled: true,
        type: 'linear',
        angle: 135,
        stops: [
          { color: '#020617', position: 0 },
          { color: '#0f172a', position: 40 },
          { color: '#1e1b4b', position: 100 },
        ],
      },
      panelColor: '#0f172a',
      panelOpacity: 0.75,
      textColor: '#e2e8f0',
      borderRadius: 16,
    },
  },
  ocean: {
    label: 'Ocean',
    darkMode: true,
    theme: {
      primaryColor: '#06b6d4',
      accentColor: '#22d3ee',
      backgroundColor: '#042f2e',
      backgroundGradient: {
        enabled: true,
        type: 'linear',
        angle: 160,
        stops: [
          { color: '#042f2e', position: 0 },
          { color: '#083344', position: 50 },
          { color: '#0c4a6e', position: 100 },
        ],
      },
      panelColor: '#0f172a',
      panelOpacity: 0.6,
      textColor: '#e0f2fe',
      borderRadius: 20,
    },
  },
  sunset: {
    label: 'Sunset',
    darkMode: false,
    theme: {
      primaryColor: '#f97316',
      accentColor: '#ef4444',
      backgroundColor: '#fffbeb',
      backgroundGradient: {
        enabled: true,
        type: 'linear',
        angle: 135,
        stops: [
          { color: '#fffbeb', position: 0 },
          { color: '#fff1f2', position: 50 },
          { color: '#fef3c7', position: 100 },
        ],
      },
      panelColor: '#ffffff',
      panelOpacity: 0.75,
      textColor: '#292524',
      borderRadius: 16,
    },
  },
  forest: {
    label: 'Forest',
    darkMode: true,
    theme: {
      primaryColor: '#22c55e',
      accentColor: '#10b981',
      backgroundColor: '#052e16',
      backgroundGradient: {
        enabled: true,
        type: 'linear',
        angle: 150,
        stops: [
          { color: '#052e16', position: 0 },
          { color: '#14532d', position: 50 },
          { color: '#1a2e05', position: 100 },
        ],
      },
      panelColor: '#0f172a',
      panelOpacity: 0.65,
      textColor: '#d1fae5',
      borderRadius: 14,
    },
  },
  lavender: {
    label: 'Lavender',
    darkMode: false,
    theme: {
      primaryColor: '#a855f7',
      accentColor: '#d946ef',
      backgroundColor: '#faf5ff',
      backgroundGradient: {
        enabled: true,
        type: 'linear',
        angle: 135,
        stops: [
          { color: '#faf5ff', position: 0 },
          { color: '#f3e8ff', position: 40 },
          { color: '#fdf2f8', position: 100 },
        ],
      },
      panelColor: '#ffffff',
      panelOpacity: 0.7,
      textColor: '#1e1b4b',
      borderRadius: 20,
    },
  },
  rose: {
    label: 'Rose',
    darkMode: true,
    theme: {
      primaryColor: '#f43f5e',
      accentColor: '#fb7185',
      backgroundColor: '#1c1917',
      backgroundGradient: {
        enabled: true,
        type: 'linear',
        angle: 145,
        stops: [
          { color: '#1c1917', position: 0 },
          { color: '#27151a', position: 50 },
          { color: '#1f0c14', position: 100 },
        ],
      },
      panelColor: '#1c1917',
      panelOpacity: 0.7,
      textColor: '#fecdd3',
      borderRadius: 16,
    },
  },
  monochrome: {
    label: 'Mono',
    darkMode: false,
    theme: {
      primaryColor: '#404040',
      accentColor: '#737373',
      backgroundColor: '#fafafa',
      backgroundGradient: {
        enabled: false,
        type: 'linear',
        angle: 180,
        stops: [
          { color: '#fafafa', position: 0 },
          { color: '#f5f5f5', position: 100 },
        ],
      },
      panelColor: '#ffffff',
      panelOpacity: 0.9,
      textColor: '#171717',
      borderRadius: 12,
    },
  },
};

const defaultPreferences: UserPreferences = {
  defaultSources: ['core', 'doaj', 'pmc', 'internet_archive'],
  defaultCitationStyle: 'APA',
  defaultFilters,
  darkMode: false,
  defaultOutputMode: 'summary',
  theme: defaultTheme,
  themePreset: 'default',
};

export function loadSessions(): ResearchSession[] {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: ResearchSession[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function loadPreferences(): UserPreferences {
  try {
    const data = localStorage.getItem(PREFERENCES_KEY);
    return data ? { ...defaultPreferences, ...JSON.parse(data) } : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
}

export function loadApiKey(): string {
  return localStorage.getItem(API_KEY_KEY) || '';
}

export function saveApiKey(key: string): void {
  localStorage.setItem(API_KEY_KEY, key);
}

export function getDefaultFilters(): SearchFilters {
  return { ...defaultFilters };
}

export function getDefaultPreferences(): UserPreferences {
  return { ...defaultPreferences };
}

export function exportSession(session: ResearchSession): string {
  return JSON.stringify(session, null, 2);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
