import React, { useRef, useState } from 'react';
import { useHandball } from '../context/HandballContext';
import {
  Users,
  PlayCircle,
  BarChart3,
  Cpu,
  Download,
  Upload,
  RotateCcw,
  Smartphone,
  Menu,
  X,
} from 'lucide-react';
import { MobileConnectModal } from './Mobile/MobileConnectModal';

export const Header: React.FC = () => {
  const { team, activeTab, setActiveTab, exportBackup, importBackup, resetAllToDefault } = useHandball();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const success = importBackup(content);
          if (success) {
            alert('¡Datos importados con éxito!');
          } else {
            alert('Error al importar el archivo JSON.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const confirmReset = () => {
    if (window.confirm('¿Seguro que deseas restablecer todos los datos a la plantilla de ejemplo? Se perderán los cambios no exportados.')) {
      resetAllToDefault();
    }
  };

  return (
    <>
      {/* Top Header */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Team Pill */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-base sm:text-xl shrink-0">
                🤾
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-base sm:text-lg font-black tracking-wide text-white">
                    HANDBALL<span className="text-blue-400">OS</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-900/60 text-blue-300 font-semibold border border-blue-700/50">
                    v1.0
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium truncate">
                  <span
                    className="inline-block w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: team.primaryColor }}
                  />
                  <span className="text-slate-300 font-semibold truncate max-w-[150px] sm:max-w-xs">
                    {team.name}
                  </span>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span className="text-slate-400 hidden sm:inline truncate">{team.category}</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex space-x-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('roster')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'roster'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Plantel</span>
              </button>

              <button
                onClick={() => setActiveTab('live')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'live'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>En Vivo</span>
              </button>

              <button
                onClick={() => setActiveTab('stats')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'stats'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Estadísticas</span>
              </button>

              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'simulator'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Simulador</span>
              </button>
            </nav>

            {/* Desktop Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setIsMobileModalOpen(true)}
                title="Conectar y controlar desde el Celular (Código QR)"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/40 transition-all shadow-sm"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>📱 Celular</span>
              </button>

              <button
                onClick={exportBackup}
                title="Exportar copia de seguridad (JSON)"
                className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                title="Importar copia de seguridad (JSON)"
                className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60"
              >
                <Upload className="w-4 h-4" />
              </button>

              <button
                onClick={confirmReset}
                title="Restablecer plantilla inicial de ejemplo"
                className="p-2 text-slate-400 hover:text-amber-400 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Header Menu Button */}
            <div className="flex md:hidden items-center space-x-1.5">
              <button
                onClick={() => setIsMobileModalOpen(true)}
                className="p-2 text-blue-400 bg-blue-950/60 border border-blue-800/60 rounded-xl"
                title="Código QR Celular"
              >
                <Smartphone className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white bg-slate-800 rounded-xl border border-slate-700 transition-colors"
                title="Menú de Opciones"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Mobile Dropdown Menu for Secondary Actions */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Gestión de Datos y Copias
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  exportBackup();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Exportar JSON</span>
              </button>

              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Importar JSON</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
              <button
                onClick={() => {
                  confirmReset();
                  setIsMobileMenuOpen(false);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1.5 p-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer Ejemplo</span>
              </button>

              <span className="text-[10px] text-slate-500 font-mono">
                {team.shortName} • {team.category}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* FIXED BOTTOM NAVIGATION BAR FOR MOBILE (Native App Feel) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 shadow-[0_-8px_20px_rgba(0,0,0,0.4)] px-2 py-1.5 flex items-center justify-around safe-area-bottom">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'roster'
              ? 'text-blue-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Plantel</span>
        </button>

        <button
          onClick={() => setActiveTab('live')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'live'
              ? 'text-red-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <PlayCircle className="w-5 h-5 mb-0.5" />
            <span className="w-2 h-2 rounded-full bg-red-500 absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>
          <span className="text-[10px]">En Vivo</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'stats'
              ? 'text-emerald-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Stats</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'simulator'
              ? 'text-purple-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Simulador</span>
        </button>
      </nav>

      {/* Mobile Connect QR Modal */}
      <MobileConnectModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />
    </>
  );
};
