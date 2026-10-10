import React from 'react';
import type { CourtZone, MatchEvent } from '../../types/handball';
import { COURT_ZONE_LABELS } from '../../types/handball';

interface CourtHeatmapProps {
  events: MatchEvent[];
  teamIdFilter?: string; // If undefined, all teams
}

export const CourtHeatmap: React.FC<CourtHeatmapProps> = ({ events, teamIdFilter }) => {
  const filteredEvents = teamIdFilter
    ? events.filter((e) => e.teamId === teamIdFilter && e.type === 'shot' && e.courtZone)
    : events.filter((e) => e.type === 'shot' && e.courtZone);

  // Group by zone
  const zoneStats: Record<CourtZone, { shots: number; goals: number }> = {
    'interval_1_2_left': { shots: 0, goals: 0 },
    'interval_2_3_left': { shots: 0, goals: 0 },
    'interval_3_3_center': { shots: 0, goals: 0 },
    'interval_2_3_right': { shots: 0, goals: 0 },
    'interval_1_2_right': { shots: 0, goals: 0 },
    '6m_center': { shots: 0, goals: 0 },
    '6m_left_wing': { shots: 0, goals: 0 },
    '6m_right_wing': { shots: 0, goals: 0 },
    '7m': { shots: 0, goals: 0 },
    '9m_left': { shots: 0, goals: 0 },
    '9m_center': { shots: 0, goals: 0 },
    '9m_right': { shots: 0, goals: 0 },
    'fastbreak': { shots: 0, goals: 0 },
  };

  filteredEvents.forEach((ev) => {
    if (ev.courtZone && zoneStats[ev.courtZone]) {
      zoneStats[ev.courtZone].shots += 1;
      if (ev.shotOutcome === 'goal') {
        zoneStats[ev.courtZone].goals += 1;
      }
    }
  });

  const renderBadge = (zone: CourtZone) => {
    const data = zoneStats[zone];
    const eff = data.shots > 0 ? Math.round((data.goals / data.shots) * 100) : 0;

    let badgeColor = 'bg-slate-900/90 border-slate-700 text-slate-400';
    if (data.shots > 0) {
      if (eff >= 65) {
        badgeColor = 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-emerald-500/30';
      } else if (eff >= 45) {
        badgeColor = 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-amber-500/30';
      } else {
        badgeColor = 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-rose-500/30';
      }
    }

    return (
      <div
        className={`px-2 py-1 rounded-xl border shadow-lg text-center backdrop-blur-md transition-all ${badgeColor}`}
      >
        <span className="text-[10px] font-bold block opacity-80 uppercase leading-none">
          {COURT_ZONE_LABELS[zone].split(' ')[0]}
        </span>
        <div className="font-mono font-black text-xs mt-0.5 leading-tight">
          {data.goals}/{data.shots}
          {data.shots > 0 && <span className="text-[10px] ml-1 font-bold">({eff}%)</span>}
        </div>
      </div>
    );
  };

  const totalShots = filteredEvents.length;
  const totalGoals = filteredEvents.filter((e) => e.shotOutcome === 'goal').length;
  const globalEff = totalShots > 0 ? Math.round((totalGoals / totalShots) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            🗺️ Mapa de Calor y Efectividad por Zonas
          </h3>
          <span className="text-xs text-slate-400">
            Total lanzamientos analizados: <strong className="text-white">{totalShots}</strong> ({totalGoals} goles • {globalEff}%)
          </span>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center space-x-2 text-[10px] font-semibold">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> ≥65% Alta
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> 45-64% Media
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> &lt;45% Baja
          </span>
        </div>
      </div>

      {/* Fastbreak top indicator */}
      <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
          ⚡ Contragolpe / Transición Rápida
        </span>
        <div className="font-mono font-bold text-xs text-white">
          {zoneStats.fastbreak.goals} / {zoneStats.fastbreak.shots} goles{' '}
          {zoneStats.fastbreak.shots > 0 && (
            <span className="text-emerald-400 font-black">
              ({Math.round((zoneStats.fastbreak.goals / zoneStats.fastbreak.shots) * 100)}%)
            </span>
          )}
        </div>
      </div>

      {/* 2D Court Heatmap Layout */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-blue-950/80 to-blue-900/60 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl p-2 select-none flex flex-col justify-between">
        {/* Goal Area and 6m Arc */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-red-600/40 border-b-2 border-x-2 border-white/80 rounded-b-md flex items-center justify-center">
          <span className="text-[10px] font-black text-white/90 tracking-widest uppercase">Portería</span>
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-40 border-b-2 border-dashed border-red-500/60 rounded-b-full pointer-events-none bg-red-900/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-88 h-56 border-b-2 border-dashed border-white/40 rounded-b-full pointer-events-none" />
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/90 pointer-events-none" />

        {/* Positioned Badges */}
        {/* Extremo Izquierdo */}
        <div className="absolute top-10 left-3">{renderBadge('6m_left_wing')}</div>

        {/* 6m Centro / Pivote */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2">{renderBadge('6m_center')}</div>

        {/* Extremo Derecho */}
        <div className="absolute top-10 right-3">{renderBadge('6m_right_wing')}</div>

        {/* 7 Metros Penalti */}
        <div className="absolute top-36 left-1/2 -translate-x-1/2">{renderBadge('7m')}</div>

        {/* 9m Lateral Izquierdo */}
        <div className="absolute bottom-3 left-3">{renderBadge('9m_left')}</div>

        {/* 9m Central */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">{renderBadge('9m_center')}</div>

        {/* 9m Lateral Derecho */}
        <div className="absolute bottom-3 right-3">{renderBadge('9m_right')}</div>
      </div>
    </div>
  );
};
