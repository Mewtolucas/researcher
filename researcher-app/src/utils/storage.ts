import { ResearchSession, UserPreferences, SearchFilters } from '../types';

const SESSIONS_KEY = 'researcher_sessions';
const PREFERENCES_KEY = 'researcher_preferences';
const API_KEY_KEY = 'researcher_api_key';

const defaultFilters: SearchFilters = {
  dateFrom: null,
  dateTo: null,
  documentType: 'all',
  language: 'en',
  maxResults: 20,
};

const defaultPreferences: UserPreferences = {
  defaultSources: ['core', 'doaj', 'pmc', 'internet_archive'],
  defaultCitationStyle: 'APA',
  defaultFilters,
  darkMode: false,
  defaultOutputMode: 'summary',
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
