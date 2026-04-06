import React from 'react';
import { ResearchProvider } from './context/ResearchContext';
import Sidebar from './components/Sidebar';
import SearchPanel from './components/SearchPanel';
import ProgressPanel from './components/ProgressPanel';
import ResultsDisplay from './components/ResultsDisplay';
import BibliographyPanel from './components/BibliographyPanel';

function AppContent() {
  return (
    <div className="flex h-screen bg-surface-100 dark:bg-surface-950 text-surface-800 dark:text-surface-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" role="main">
        <div className="max-w-5xl mx-auto p-6 space-y-4">
          <SearchPanel />
          <ProgressPanel />
          <ResultsDisplay />
          <BibliographyPanel />
        </div>
      </main>
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
