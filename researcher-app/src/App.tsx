import React from 'react';
import { ResearchProvider } from './context/ResearchContext';
import Sidebar from './components/Sidebar';
import SearchPanel from './components/SearchPanel';
import ProgressPanel from './components/ProgressPanel';
import ResultsDisplay from './components/ResultsDisplay';
import BibliographyPanel from './components/BibliographyPanel';
import ThemeCustomizer from './components/ThemeCustomizer';
import { useThemeStyles } from './utils/themeStyles';

function AppContent() {
  const ts = useThemeStyles();
  return (
    <div
      className="flex h-screen overflow-hidden transition-colors duration-300"
      style={ts.appBackground}
    >
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-10" role="main">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          <SearchPanel />
          <ProgressPanel />
          <ResultsDisplay />
          <BibliographyPanel />
        </div>
      </main>
      <ThemeCustomizer />
    </div>
  );
}

function App() {
  return (
    <ResearchProvider>
      <AppContent />
    </ResearchProvider>
  );
}

export default App;
