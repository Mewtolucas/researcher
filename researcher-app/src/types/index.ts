export type OutputMode = 'thesis' | 'evidence' | 'literature_review' | 'summary';

export type CitationStyle = 'APA' | 'MLA' | 'Chicago' | 'Harvard';

export type SourceType =
  | 'google_scholar'
  | 'core'
  | 'internet_archive'
  | 'doaj'
  | 'pmc'
  | 'web_search'
  | 'custom_url';

export type DocumentType = 'peer_reviewed' | 'open_access' | 'books' | 'preprints' | 'all';

export interface SearchFilters {
  dateFrom: number | null;
  dateTo: number | null;
  documentType: DocumentType;
  language: string;
  maxResults: number;
}

export interface SourceResult {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  abstract: string;
  url: string;
  doi: string | null;
  source: SourceType;
  documentType: string;
  relevanceScore: number;
  fullText?: string;
}

export interface BibliographyEntry {
  id: string;
  sourceResult: SourceResult;
  citation: Record<CitationStyle, string>;
  keyInformation: string[];
  usageInOutput: string;
  relevanceRating: number;
  accessDate: string;
  accessStatus: 'accessible' | 'restricted' | 'unavailable';
}

export interface ResearchSession {
  id: string;
  query: string;
  outputMode: OutputMode;
  selectedSources: SourceType[];
  customUrls: string[];
  filters: SearchFilters;
  citationStyle: CitationStyle;
  results: SourceResult[];
  bibliography: BibliographyEntry[];
  generatedContent: string;
  timestamp: string;
  name: string;
  tags: string[];
}

export interface SourceQueryStatus {
  source: SourceType | string;
  status: 'pending' | 'searching' | 'completed' | 'failed';
  resultCount: number;
  error?: string;
}

export interface ResearchProgress {
  isResearching: boolean;
  currentPhase: 'idle' | 'searching' | 'processing' | 'synthesizing' | 'complete' | 'error';
  sourceStatuses: SourceQueryStatus[];
  overallProgress: number;
  statusMessage: string;
}

export interface UserPreferences {
  defaultSources: SourceType[];
  defaultCitationStyle: CitationStyle;
  defaultFilters: SearchFilters;
  darkMode: boolean;
  defaultOutputMode: OutputMode;
}

export interface AppState {
  currentQuery: string;
  selectedSources: SourceType[];
  customUrls: string[];
  filters: SearchFilters;
  outputMode: OutputMode;
  citationStyle: CitationStyle;
  sessions: ResearchSession[];
  currentSession: ResearchSession | null;
  progress: ResearchProgress;
  preferences: UserPreferences;
  sidebarOpen: boolean;
  bibliographyPanelOpen: boolean;
  apiKey: string;
}
