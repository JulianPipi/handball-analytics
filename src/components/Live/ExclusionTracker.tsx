import React from 'react';
import { useHandball } from '../../context/HandballContext';
import { Timer, X, ShieldAlert } from 'lucide-react';

export const ExclusionTracker: React.FC = () => {
  const { match, removeExclusion } = useHandball();

  const homeExclusions = match.activeExclusions.filter((e) => e.teamId === match.homeTeam.id);
  const awayExclusions = match.activeExclusions.filter((e) => e.teamId === match.awayTeam.id);

  const homePlayersOnCourt = Math.max(2, 7 - homeExclusions.length);
  const awayPlayersOnCourt = Math.max(2, 7 - awayExclusions.length);

  const formatRemaining = (startSec: number, durationSec: number) => {
    const elapsed = match.matchTimeSeconds - startSec;
    const remaining = Math.max(0, durationSec - elapsed);
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Superiority / Inferiority Indicator Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-bold">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span className="text-slate-200 uppercase tracking-wider">Situación Numérica:</span>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`px-2.5 py-1 rounded-lg font-mono text-sm font-black border ${
              homePlayersOnCourt < awayPlayersOnCourt
                ? 'bg-rose-950/60 border-rose-700/60 text-rose-300'
                : homePlayersOnCourt > awayPlayersOnCourt
                ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}
          >
            {homePlayersOnCourt} vs {awayPlayersOnCourt}
          </span>
          {homePlayersOnCourt > awayPlayersOnCourt && (
            <span className="text-emerald-400 font-bold hidden sm:inline">Superioridad Local (+{homePlayersOnCourt - awayPlayersOnCourt})</span>
          )}
          {homePlayersOnCourt < awayPlayersOnCourt && (
            <span className="text-rose-400 font-bold hidden sm:inline">Inferioridad Local (-{awayPlayersOnCourt - homePlayersOnCourt})</span>
          )}
          {homePlayersOnCourt === awayPlayersOnCourt && (
            <span className="text-slate-400 hidden sm:inline">Igualdad Numérica</span>
          )}
        </div>
      </div>

      {/* Grid of exclusions for Home & Away */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local exclusions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: match.homeTeam.primaryColor }} />
              {match.homeTeam.name}
            </span>
            <span className="font-mono text-[11px]">{homeExclusions.length} activas</span>
          </div>

          {homeExclusions.length === 0 ? (
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 text-center text-[11px] text-slate-500">
              Sin exclusiones activas
            </div>
          ) : (
            <div className="space-y-2">
              {homeExclusions.map((exc) => (
                <div
                  key={exc.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-orange-950/40 border border-orange-800/60 animate-pulse"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-md bg-orange-600 text-white font-black text-xs flex items-center justify-center">
                      #{exc.playerNumber}
                    </span>
                    <span className="text-xs font-bold text-orange-200">{exc.playerName}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 font-mono font-bold text-xs text-orange-300">
                      <Timer className="w-3.5 h-3.5" />
                      <span>{formatRemaining(exc.startMatchTimeSeconds, exc.durationSeconds)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExclusion(exc.id)}
                      className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-orange-800/50"
                      title="Cancelar exclusión"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Away exclusions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: match.awayTeam.primaryColor }} />
              {match.awayTeam.name}
            </span>
            <span className="font-mono text-[11px]">{awayExclusions.length} activas</span>
          </div>

          {awayExclusions.length === 0 ? (
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 text-center text-[11px] text-slate-500">
              Sin exclusiones activas
            </div>
          ) : (
            <div className="space-y-2">
              {awayExclusions.map((exc) => (
                <div
                  key={exc.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 animate-pulse"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-md bg-rose-600 text-white font-black text-xs flex items-center justify-center">
                      #{exc.playerNumber}
                    </span>
                    <span className="text-xs font-bold text-rose-200">{exc.playerName}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 font-mono font-bold text-xs text-rose-300">
                      <Timer className="w-3.5 h-3.5" />
                      <span>{formatRemaining(exc.startMatchTimeSeconds, exc.durationSeconds)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExclusion(exc.id)}
                      className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-rose-800/50"
                      title="Cancelar exclusión"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
