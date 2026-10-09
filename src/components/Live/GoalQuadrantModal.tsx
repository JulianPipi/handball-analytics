import React from 'react';
import type { GoalZone } from '../../types/handball';
import { GOAL_ZONE_LABELS } from '../../types/handball';
import { X, Zap } from 'lucide-react';

export type PendingShotType = 'home_goal' | 'rival_saved' | 'home_saved' | 'rival_goal';

interface GoalQuadrantModalProps {
  isOpen: boolean;
  shotType: PendingShotType | null;
  actorName: string;
  actorNumber?: number;
  teamName: string;
  is7v6?: boolean;
  onSelectQuadrant: (zone: GoalZone) => void;
  onSkipCenter: () => void;
  onCancel: () => void;
}

export const GoalQuadrantModal: React.FC<GoalQuadrantModalProps> = ({
  isOpen,
  shotType,
  actorName,
  actorNumber,
  teamName,
  is7v6,
  onSelectQuadrant,
  onSkipCenter,
  onCancel,
}) => {
  if (!isOpen || !shotType) return null;

  const quadrants: { id: GoalZone; label: string; icon: string }[][] = [
    [
      { id: 'top_left', label: 'Escuadra Izq.', icon: '↖️' },
      { id: 'top_center', label: 'Arriba Centro', icon: '⬆️' },
      { id: 'top_right', label: 'Escuadra Der.', icon: '↗️' },
    ],
    [
      { id: 'mid_left', label: 'Media Izq.', icon: '⬅️' },
      { id: 'mid_center', label: 'Centro', icon: '🎯' },
      { id: 'mid_right', label: 'Media Der.', icon: '➡️' },
    ],
    [
      { id: 'bottom_left', label: 'Raso Izq.', icon: '↙️' },
      { id: 'bottom_center', label: 'Raso Centro', icon: '⬇️' },
      { id: 'bottom_right', label: 'Raso Der.', icon: '↘️' },
    ],
  ];

  // Title and header badge based on shot event
  const getHeaderInfo = () => {
    switch (shotType) {
      case 'home_goal':
        return {
          title: '⚽ ¡GOL DE NUESTRO EQUIPO!',
          subtitle: actorNumber ? `#${actorNumber} ${actorName}` : actorName,
          accentBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          badgeText: is7v6 ? 'GOL 7v6' : 'GOL A FAVOR',
          targetLabel: '¿Por qué cuadrante entró el balón?',
        };
      case 'rival_saved':
        return {
          title: '🧤 PARADA DEL ARQUERO RIVAL',
          subtitle: `Tiro de: ${actorNumber ? `#${actorNumber} ${actorName}` : actorName}`,
          accentBg: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
          badgeText: 'PARADA RIVAL',
          targetLabel: '¿En qué cuadrante atajó el portero rival?',
        };
      case 'home_saved':
        return {
          title: '🧤 ¡PARADA DE NUESTRO ARQUERO!',
          subtitle: actorNumber ? `#${actorNumber} ${actorName}` : actorName,
          accentBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
          badgeText: 'PARADA LOCAL',
          targetLabel: '¿En qué cuadrante atajó nuestro arquero?',
        };
      case 'rival_goal':
        return {
          title: '❌ GOL DEL EQUIPO RIVAL',
          subtitle: teamName,
          accentBg: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
          badgeText: 'GOL EN CONTRA',
          targetLabel: '¿Por qué zona entró el gol rival?',
        };
    }
  };

  const info = getHeaderInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-4 sm:p-6 max-w-lg w-full shadow-2xl space-y-4">
        {/* Header with Title and Cancel button */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${info.accentBg}`}>
                {info.badgeText}
              </span>
              <span className="text-xs font-semibold text-slate-400">Paso 2: Registro de Portería</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {info.title}
            </h2>
            <p className="text-sm font-bold text-slate-300">
              {info.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Cancelar y descartar jugada"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Prompt */}
        <div className="text-center">
          <p className="text-xs sm:text-sm font-semibold text-amber-300/90">
            {info.targetLabel}
          </p>
          <span className="text-[11px] text-slate-400">
            Toca el cuadrante (1 solo toque registra y continúa el partido)
          </span>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3x3 HANDBALL GOAL (ARCO 3m x 2m REGLAMENTARIO)                */}
        {/* ------------------------------------------------------------- */}
        <div className="w-full max-w-md mx-auto aspect-[3/2] relative p-3.5 bg-slate-950 rounded-2xl border-4 border-dashed border-red-600/90 shadow-2xl flex flex-col justify-between overflow-hidden">
          {/* Official Handball Red/White striped goal frame */}
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_20px,#ffffff_20px,#ffffff_40px)] rounded-t-xl z-20" />
          <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_20px,#ffffff_20px,#ffffff_40px)] rounded-l-xl z-20" />
          <div className="absolute top-0 bottom-0 right-0 w-2.5 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_20px,#ffffff_20px,#ffffff_40px)] rounded-r-xl z-20" />

          {/* Goal Net Background simulation */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
              backgroundSize: '12px 12px',
            }}
          />

          {/* 9 Quadrant Buttons */}
          <div className="grid grid-rows-3 gap-2 h-full z-10 pt-1">
            {quadrants.map((row, rIdx) => (
              <div key={rIdx} className="grid grid-cols-3 gap-2">
                {row.map((cell) => (
                  <button
                    key={cell.id}
                    type="button"
                    onClick={() => onSelectQuadrant(cell.id)}
                    className="group relative rounded-xl p-2 bg-slate-900/90 hover:bg-blue-600/90 border border-slate-700/80 hover:border-white text-slate-200 hover:text-white transition-all transform active:scale-95 flex flex-col items-center justify-center shadow-md hover:shadow-blue-500/40 select-none"
                    title={GOAL_ZONE_LABELS[cell.id]}
                  >
                    <span className="text-base sm:text-lg mb-0.5 group-hover:scale-110 transition-transform">
                      {cell.icon}
                    </span>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight text-center leading-tight">
                      {cell.label}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* FAST FALLBACK: OMITIR / CENTRO                                */}
        {/* ------------------------------------------------------------- */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
          <button
            type="button"
            onClick={onSkipCenter}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
            title="Registrar en cuadrante Centro para no demorar el ritmo"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Omitir Selección (Registrar al Centro)</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-700 text-slate-400 hover:text-rose-300 font-bold text-xs uppercase tracking-wider transition-all"
          >
            Descartar Jugada
          </button>
        </div>
      </div>
    </div>
  );
};
