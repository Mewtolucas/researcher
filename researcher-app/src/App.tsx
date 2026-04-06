import React from 'react';
import { ResearchProvider } from './context/ResearchContext';
import Sidebar from './components/Sidebar';
import SearchPanel from './components/SearchPanel';
import ProgressPanel from './components/ProgressPanel';
import ResultsDisplay from './components/ResultsDisplay';
import BibliographyPanel from './components/BibliographyPanel';

function AppContent() {
  return (
    <div className="flex h-screen overflow-hidden noise-bg bg-gradient-to-br from-surface-50 via-primary-50/30 to-accent-400/5 dark:from-surface-950 dark:via-surface-900 dark:to-primary-900/20 text-surface-800 dark:text-surface-200 transition-colors duration-300">
      {/* Decorative gradient orbs */}
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary-400/10 to-accent-500/10 dark:from-primary-500/5 dark:to-accent-500/5 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-primary-300/10 to-accent-400/5 dark:from-primary-600/5 dark:to-accent-500/3 blur-3xl pointer-events-none" />

      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-10" role="main">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
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
