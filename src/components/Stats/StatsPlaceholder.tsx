import React from 'react';
import { useHandball } from '../../context/HandballContext';
import { POSITION_LABELS } from '../../types/handball';
import { BarChart3, ShieldCheck, Flame } from 'lucide-react';

export const StatsPlaceholder: React.FC = () => {
  const { players, team } = useHandball();

  // Top scorers
  const topScorers = [...players]
    .filter((p) => p.position !== 'GK')
    .sort((a, b) => b.stats.goals - a.stats.goals)
    .slice(0, 5);

  // Top goalkeepers
  const goalkeepers = [...players]
    .filter((p) => p.position === 'GK')
    .sort((a, b) => b.stats.saves - a.stats.saves);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" /> Estadísticas Generales del Plantel
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Resumen acumulado de rendimiento y efectividad de {team.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Goleadores */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-400" /> Máximos Goleadores
          </h3>
          <div className="space-y-3">
            {topScorers.map((p, idx) => {
              const eff = p.stats.shots > 0 ? Math.round((p.stats.goals / p.stats.shots) * 100) : 0;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 text-center font-black text-slate-500 text-sm">
                      #{idx + 1}
                    </span>
                    <span className="w-8 h-8 rounded-lg bg-blue-900/40 text-blue-300 font-bold flex items-center justify-center text-xs border border-blue-700/40">
                      {p.number}
                    </span>
                    <div>
                      <span className="text-sm font-bold text-slate-200 block">{p.name}</span>
                      <span className="text-[11px] text-slate-400">
                        {POSITION_LABELS[p.position].short} • {p.handedness === 'left' ? 'Zurdo' : 'Diestro'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-400 block">{p.stats.goals} goles</span>
                    <span className="text-[11px] text-slate-400">{eff}% efectividad ({p.stats.shots} tiros)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Portería */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" /> Rendimiento en Portería
          </h3>
          <div className="space-y-3">
            {goalkeepers.map((gk) => {
              const eff =
                gk.stats.shotsFaced > 0
                  ? Math.round((gk.stats.saves / gk.stats.shotsFaced) * 100)
                  : 0;
              return (
                <div
                  key={gk.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 rounded-lg bg-blue-900/40 text-blue-300 font-bold flex items-center justify-center text-xs border border-blue-700/40">
                        {gk.number}
                      </span>
                      <div>
                        <span className="text-sm font-bold text-slate-200 block">{gk.name}</span>
                        <span className="text-[11px] text-slate-400">{gk.heightCm} cm</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-blue-400 block">{eff}%</span>
                      <span className="text-[11px] text-slate-400">{gk.stats.saves} / {gk.stats.shotsFaced} paradas</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, eff)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
