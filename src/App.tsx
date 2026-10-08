import React from 'react';
import { HandballProvider, useHandball } from './context/HandballContext';
import { Header } from './components/Header';
import { RosterManager } from './components/Roster/RosterManager';
import { LiveConsole } from './components/Live/LiveConsole';
import { AnalyticsDashboard } from './components/Stats/AnalyticsDashboard';
import { MonteCarloSimulatorView } from './components/Simulator/MonteCarloSimulatorView';

const MainContent: React.FC = () => {
  const { activeTab } = useHandball();

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-8 pb-24 md:pb-8">
      {activeTab === 'roster' && <RosterManager />}
      {activeTab === 'live' && <LiveConsole />}
      {activeTab === 'stats' && <AnalyticsDashboard />}
      {activeTab === 'simulator' && <MonteCarloSimulatorView />}
    </main>
  );
};

export default function App() {
  return (
    <HandballProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Header />
        <div className="flex-1">
          <MainContent />
        </div>
        <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
          <p>HandballOS • Plataforma Analítica & Simulador de Balonmano • Desarrollado para análisis técnico</p>
        </footer>
      </div>
    </HandballProvider>
  );
}
