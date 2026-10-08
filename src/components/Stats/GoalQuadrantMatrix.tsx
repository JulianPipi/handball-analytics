import React from 'react';
import type { GoalZone, MatchEvent } from '../../types/handball';
import { GOAL_ZONE_LABELS } from '../../types/handball';

interface GoalQuadrantMatrixProps {
  events: MatchEvent[];
  teamIdFilter?: string;
}

export const GoalQuadrantMatrix: React.FC<GoalQuadrantMatrixProps> = ({ events, teamIdFilter }) => {
  const filteredEvents = teamIdFilter
    ? events.filter((e) => e.teamId === teamIdFilter && e.type === 'shot' && e.goalZone)
    : events.filter((e) => e.type === 'shot' && e.goalZone);

  const quadrants: GoalZone[][] = [
    ['top_left', 'top_center', 'top_right'],
    ['mid_left', 'mid_center', 'mid_right'],
    ['bottom_left', 'bottom_center', 'bottom_right'],
  ];

  // Stats per quadrant
  const quadStats: Record<GoalZone, { shots: number; goals: number; saves: number; posts: number; misses: number }> = {
    top_left: { shots: 0, goals: 0, saves: 0, posts: 0, misses: 0 },
    top_center: { shots: 0, goals: 0, saves: 0, posts: 0, misses: 0 },
    top_right: { shots: 0, goals: 0, saves: 0, posts: 0, misses: 0 },
    mid_left: { shots: 0, goals: 0, saves: 0, posts: 0, misses: 0 },
    mid_center: { shots: 0, goals: 0, saves: 0, posts: 0, misses: 0 },
    mid_right: { shots: 0, goals: 0, saves: 0, posts: 0, misses: 0 },
    bottom_left: { shots: 0, goals: 0, saves: 0, posts: 0, misses: 0 },
    bottom_center: { shots: 0, goals: 0, saves: 0, posts: 0, misses: 0 },
    bottom_right: { shots: 0, goals: 0, saves: 0, posts: 0, misses: 0 },
  };

  filteredEvents.forEach((ev) => {
    if (ev.goalZone && quadStats[ev.goalZone]) {
      quadStats[ev.goalZone].shots += 1;
      if (ev.shotOutcome === 'goal') quadStats[ev.goalZone].goals += 1;
      else if (ev.shotOutcome === 'save') quadStats[ev.goalZone].saves += 1;
      else if (ev.shotOutcome === 'post') quadStats[ev.goalZone].posts += 1;
      else if (ev.shotOutcome === 'miss') quadStats[ev.goalZone].misses += 1;
    }
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            🥅 Matriz de Portería por Cuadrantes
          </h3>
          <span className="text-xs text-slate-400">
            Distribución de disparos entre los 3 palos y paradas del arquero
          </span>
        </div>
      </div>

      {/* Goal 3x3 Grid with official post styling */}
      <div className="w-full aspect-[3/2] relative p-3 bg-slate-950/90 rounded-2xl border-4 border-dashed border-red-600/80 shadow-2xl flex flex-col justify-between">
        {/* Red/White Stripes */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_20px,#ffffff_20px,#ffffff_40px)] rounded-t-xl" />
        <div className="absolute top-0 bottom-0 left-0 w-2 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_20px,#ffffff_20px,#ffffff_40px)] rounded-l-xl" />
        <div className="absolute top-0 bottom-0 right-0 w-2 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_20px,#ffffff_20px,#ffffff_40px)] rounded-r-xl" />

        <div className="grid grid-rows-3 gap-2 h-full z-10 pt-1">
          {quadrants.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-3 gap-2">
              {row.map((zoneKey) => {
                const data = quadStats[zoneKey];
                const savePct =
                  data.shots > 0 ? Math.round((data.saves / (data.goals + data.saves || 1)) * 100) : 0;

                return (
                  <div
                    key={zoneKey}
                    className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-center text-center shadow-inner hover:border-slate-700 transition-colors"
                  >
                    <span className="text-[10px] font-bold text-slate-400 block line-clamp-1">
                      {GOAL_ZONE_LABELS[zoneKey]}
                    </span>
                    <div className="font-mono font-black text-sm text-white mt-1">
                      {data.goals} <span className="text-emerald-400 text-xs">gol</span> / {data.saves}{' '}
                      <span className="text-blue-400 text-xs">par</span>
                    </div>
                    {data.shots > 0 ? (
                      <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                        {data.shots} tiros • {savePct}% paradas
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600 mt-0.5">Sin tiros</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
