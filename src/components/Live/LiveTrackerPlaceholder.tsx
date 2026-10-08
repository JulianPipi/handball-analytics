import React from 'react';
import { useHandball } from '../../context/HandballContext';
import { Play, Pause } from 'lucide-react';

export const LiveTrackerPlaceholder: React.FC = () => {
  const { match, startMatchTimer, pauseMatchTimer, setActiveTab } = useHandball();

  const minutes = Math.floor(match.matchTimeSeconds / 60);
  const seconds = match.matchTimeSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* Match Scoreboard Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Home Team */}
          <div className="flex items-center space-x-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg"
              style={{ backgroundColor: match.homeTeam.primaryColor }}
            >
              {match.homeTeam.shortName}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{match.homeTeam.name}</h2>
              <span className="text-xs text-slate-400 font-semibold">LOCAL</span>
            </div>
          </div>

          {/* Score & Timer Display */}
          <div className="flex flex-col items-center">
            <div className="text-5xl font-black tracking-widest text-white font-mono flex items-center gap-4">
              <span className="text-blue-400">{match.homeScore}</span>
              <span className="text-slate-600">-</span>
              <span className="text-rose-400">{match.awayScore}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xl font-mono font-bold text-amber-400 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800">
                {timeFormatted}
              </span>
              <span className="text-xs font-bold text-slate-400 px-2 py-1 rounded-md bg-slate-800">
                {match.currentPeriod}º TIEMPO
              </span>
            </div>

            <div className="flex items-center gap-2 mt-3">
              {match.isRunning ? (
                <button
                  onClick={pauseMatchTimer}
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Pause className="w-3.5 h-3.5" /> Pausar Reloj
                </button>
              ) : (
                <button
                  onClick={startMatchTimer}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Play className="w-3.5 h-3.5" /> Iniciar Reloj
                </button>
              )}
            </div>
          </div>

          {/* Away Team */}
          <div className="flex items-center space-x-4 flex-row-reverse md:flex-row text-right md:text-left">
            <div>
              <h2 className="text-xl font-bold text-white">{match.awayTeam.name}</h2>
              <span className="text-xs text-slate-400 font-semibold">VISITANTE</span>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg"
              style={{ backgroundColor: match.awayTeam.primaryColor }}
            >
              {match.awayTeam.shortName}
            </div>
          </div>
        </div>
      </div>

      {/* Info Callout for Phase 2 */}
      <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-800/40 rounded-2xl p-6 text-center space-y-3">
        <div className="w-12 h-12 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto text-xl">
          🎯
        </div>
        <h3 className="text-lg font-bold text-white">Módulo de Captura en Vivo (Próxima Fase 2)</h3>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Aquí se integrará la <strong>Cancha 2D Interactiva</strong> de Handball (6m, 7m, 9m, extremos y contragolpe) y la <strong>Portería 2D</strong> por cuadrantes para registrar goles, paradas, pérdidas y sanciones en 2 toques rápidos.
        </p>
        <div className="pt-2">
          <button
            onClick={() => setActiveTab('roster')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700"
          >
            Volver a Gestión de Plantel
          </button>
        </div>
      </div>
    </div>
  );
};
