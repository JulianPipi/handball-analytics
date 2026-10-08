import React from 'react';
import type { GoalZone, ShotOutcome } from '../../types/handball';
import { GOAL_ZONE_LABELS } from '../../types/handball';

interface Goal2DProps {
  selectedGoalZone?: GoalZone;
  selectedOutcome?: ShotOutcome;
  onSelectGoalZone: (zone: GoalZone) => void;
  onSelectOutcome: (outcome: ShotOutcome) => void;
}

export const Goal2D: React.FC<Goal2DProps> = ({
  selectedGoalZone,
  selectedOutcome,
  onSelectGoalZone,
  onSelectOutcome,
}) => {
  const quadrants: { id: GoalZone; label: string }[][] = [
    [
      { id: 'top_left', label: 'Escuadra Izq.' },
      { id: 'top_center', label: 'Arriba Centro' },
      { id: 'top_right', label: 'Escuadra Der.' },
    ],
    [
      { id: 'mid_left', label: 'Media Izq.' },
      { id: 'mid_center', label: 'Centro' },
      { id: 'mid_right', label: 'Media Der.' },
    ],
    [
      { id: 'bottom_left', label: 'Raso Izq.' },
      { id: 'bottom_center', label: 'Raso Centro' },
      { id: 'bottom_right', label: 'Raso Der.' },
    ],
  ];

  return (
    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          🥅 Cuadrante del Lanzamiento (3m x 2m)
        </span>
        {selectedGoalZone && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-900/60 text-purple-300 border border-purple-700/50">
            {GOAL_ZONE_LABELS[selectedGoalZone]}
          </span>
        )}
      </div>

      {/* Goal Frame with Official Red/White stripes styling */}
      <div className="w-full max-w-[420px] aspect-[3/2] relative p-3 bg-slate-900/90 rounded-2xl border-4 border-dashed border-red-600/80 shadow-2xl flex flex-col justify-between">
        {/* Goal Post Header Simulation (Red/White stripes) */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_20px,#ffffff_20px,#ffffff_40px)] rounded-t-xl" />
        <div className="absolute top-0 bottom-0 left-0 w-2 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_20px,#ffffff_20px,#ffffff_40px)] rounded-l-xl" />
        <div className="absolute top-0 bottom-0 right-0 w-2 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_20px,#ffffff_20px,#ffffff_40px)] rounded-r-xl" />

        {/* 3x3 Quadrants Grid */}
        <div className="grid grid-rows-3 gap-2 h-full z-10 pt-1">
          {quadrants.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-3 gap-2">
              {row.map((cell) => {
                const isSelected = selectedGoalZone === cell.id;
                return (
                  <button
                    key={cell.id}
                    type="button"
                    onClick={() => onSelectGoalZone(cell.id)}
                    className={`rounded-xl text-[11px] font-bold p-1 border transition-all flex flex-col items-center justify-center select-none ${
                      isSelected
                        ? 'bg-purple-600 border-white text-white shadow-lg scale-105 z-20 font-black'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span>{cell.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Outcome Selectors (Gol, Parada, Poste, Fuera) */}
      <div className="w-full mt-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Resultado del Lanzamiento:
        </span>
        <div className="grid grid-cols-5 gap-1.5">
          <button
            type="button"
            onClick={() => onSelectOutcome('goal')}
            className={`py-2 rounded-xl text-xs font-black transition-all border ${
              selectedOutcome === 'goal'
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/40 scale-105'
                : 'bg-slate-900 border-slate-800 text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            ⚽ GOL
          </button>

          <button
            type="button"
            onClick={() => onSelectOutcome('save')}
            className={`py-2 rounded-xl text-xs font-black transition-all border ${
              selectedOutcome === 'save'
                ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/40 scale-105'
                : 'bg-slate-900 border-slate-800 text-blue-400 hover:bg-blue-950/40'
            }`}
          >
            🧤 PARADA
          </button>

          <button
            type="button"
            onClick={() => onSelectOutcome('post')}
            className={`py-2 rounded-xl text-xs font-black transition-all border ${
              selectedOutcome === 'post'
                ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/40 scale-105'
                : 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-amber-950/40'
            }`}
          >
            💥 POSTE
          </button>

          <button
            type="button"
            onClick={() => onSelectOutcome('miss')}
            className={`py-2 rounded-xl text-xs font-black transition-all border ${
              selectedOutcome === 'miss'
                ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/40 scale-105'
                : 'bg-slate-900 border-slate-800 text-rose-400 hover:bg-rose-950/40'
            }`}
          >
            ❌ FUERA
          </button>

          <button
            type="button"
            onClick={() => onSelectOutcome('blocked')}
            className={`py-2 rounded-xl text-xs font-black transition-all border ${
              selectedOutcome === 'blocked'
                ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/40 scale-105'
                : 'bg-slate-900 border-slate-800 text-purple-400 hover:bg-purple-950/40'
            }`}
          >
            🛡️ BLOQUEO
          </button>
        </div>
      </div>
    </div>
  );
};
