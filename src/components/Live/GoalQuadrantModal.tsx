import React, { useState } from 'react';
import type { GoalZone, CourtZone, RivalPlayer } from '../../types/handball';
import { GOAL_ZONE_LABELS, COURT_ZONE_LABELS } from '../../types/handball';
import { X, Zap, MapPin } from 'lucide-react';

export type PendingShotType = 'home_goal' | 'rival_saved' | 'home_saved' | 'rival_goal';

interface GoalQuadrantModalProps {
  isOpen: boolean;
  shotType: PendingShotType | null;
  actorName: string;
  actorNumber?: number;
  teamName: string;
  is7v6?: boolean;
  rivalPlayers?: RivalPlayer[];
  initialCourtZone?: CourtZone;
  onSelectQuadrant: (goalZone: GoalZone, courtZone: CourtZone, rivalNumber?: number) => void;
  onSkipCenter: (courtZone: CourtZone, rivalNumber?: number) => void;
  onCancel: () => void;
}

export const GoalQuadrantModal: React.FC<GoalQuadrantModalProps> = ({
  isOpen,
  shotType,
  actorName,
  actorNumber,
  teamName,
  is7v6,
  rivalPlayers = [],
  initialCourtZone = 'interval_3_3_center',
  onSelectQuadrant,
  onSkipCenter,
  onCancel,
}) => {
  const [selectedCourtZone, setSelectedCourtZone] = useState<CourtZone>(initialCourtZone);
  const [selectedRivalNumber, setSelectedRivalNumber] = useState<number | undefined>(undefined);

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

  // Defensive intervals and shooting positions
  const tacticalIntervals: { id: CourtZone; label: string; group: string }[] = [
    { id: 'interval_1_2_left', label: '1 - 2 Izq', group: 'Intervalos Defensivos' },
    { id: 'interval_2_3_left', label: '2 - 3 Izq', group: 'Intervalos Defensivos' },
    { id: 'interval_3_3_center', label: '3 - 3 Central', group: 'Intervalos Defensivos' },
    { id: 'interval_2_3_right', label: '2 - 3 Der', group: 'Intervalos Defensivos' },
    { id: 'interval_1_2_right', label: '1 - 2 Der', group: 'Intervalos Defensivos' },
  ];

  const secondaryZones: { id: CourtZone; label: string }[] = [
    { id: '6m_left_wing', label: 'Extremo Izq' },
    { id: '9m_left', label: '9m Izquierdo' },
    { id: '9m_center', label: '9m Central' },
    { id: '9m_right', label: '9m Derecho' },
    { id: '6m_right_wing', label: 'Extremo Der' },
    { id: '7m', label: '7m Penalti' },
    { id: 'fastbreak', label: 'Contraataque' },
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
          targetLabel: '¿Por qué cuadrante entró el balón al arco?',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-4 sm:p-6 max-w-xl w-full shadow-2xl my-auto space-y-4">
        {/* Header with Title and Cancel button */}
        <div className="flex items-start justify-between pb-2.5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${info.accentBg}`}>
                {info.badgeText}
              </span>
              <span className="text-xs font-semibold text-slate-400">Análisis Táctico de Tiro</span>
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

        {/* ------------------------------------------------------------- */}
        {/* 1. SELECCIÓN DE DORSAL RIVAL (SI ES GOL / TIRO RIVAL)         */}
        {/* ------------------------------------------------------------- */}
        {shotType === 'rival_goal' && rivalPlayers.length > 0 && (
          <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 block">
              ¿Qué dorsal rival tiró / metió el gol? (Opcional):
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {rivalPlayers.map((rp) => {
                const isSelected = selectedRivalNumber === rp.number;
                return (
                  <button
                    key={rp.id}
                    type="button"
                    onClick={() => setSelectedRivalNumber(isSelected ? undefined : rp.number)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white border-white shadow-md font-black'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    #{rp.number} {rp.name || rp.position}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 2. ZONA EN CANCHA / INTERVALO DEFENSIVO (1-2, 2-3, 3-3, etc)  */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              1. ¿Desde dónde tiró? (Intervalo / Posición):
            </span>
            <span className="text-[11px] font-bold text-slate-300 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700">
              {COURT_ZONE_LABELS[selectedCourtZone]}
            </span>
          </div>

          {/* Primary Defensive Intervals */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block mb-1">
              Penetración entre Defensores:
            </span>
            <div className="grid grid-cols-5 gap-1">
              {tacticalIntervals.map((zone) => {
                const isSelected = selectedCourtZone === zone.id;
                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => setSelectedCourtZone(zone.id)}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-black border transition-all truncate text-center ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-white shadow-md scale-105 z-10'
                        : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                    }`}
                    title={zone.label}
                  >
                    {zone.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Court Zones (Wings, 9m, 7m, Fastbreak) */}
          <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-800/80">
            {secondaryZones.map((zone) => {
              const isSelected = selectedCourtZone === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setSelectedCourtZone(zone.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-white shadow font-black'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {zone.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. ARCO 3x2m REGLAMENTARIO (9 CUADRANTES DE PORTERÍA)         */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-1.5">
          <div className="text-center">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 block">
              2. {info.targetLabel}
            </span>
            <span className="text-[10px] text-slate-400">
              Toca el cuadrante (1 toque registra ambas zonas y continúa el juego)
            </span>
          </div>

          <div className="w-full max-w-sm mx-auto aspect-[3/2] relative p-3 bg-slate-950 rounded-2xl border-4 border-dashed border-red-600/90 shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Handball Red/White post frame */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_20px,#ffffff_20px,#ffffff_40px)] rounded-t-xl z-20" />
            <div className="absolute top-0 bottom-0 left-0 w-2 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_20px,#ffffff_20px,#ffffff_40px)] rounded-l-xl z-20" />
            <div className="absolute top-0 bottom-0 right-0 w-2 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_20px,#ffffff_20px,#ffffff_40px)] rounded-r-xl z-20" />

            {/* Net simulation */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                backgroundSize: '12px 12px',
              }}
            />

            {/* 9 Quadrant Buttons */}
            <div className="grid grid-rows-3 gap-1.5 h-full z-10 pt-1">
              {quadrants.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-3 gap-1.5">
                  {row.map((cell) => (
                    <button
                      key={cell.id}
                      type="button"
                      onClick={() => onSelectQuadrant(cell.id, selectedCourtZone, selectedRivalNumber)}
                      className="group relative rounded-xl p-1.5 bg-slate-900/90 hover:bg-blue-600/90 border border-slate-700/80 hover:border-white text-slate-200 hover:text-white transition-all transform active:scale-95 flex flex-col items-center justify-center shadow-md select-none"
                      title={GOAL_ZONE_LABELS[cell.id]}
                    >
                      <span className="text-sm sm:text-base group-hover:scale-110 transition-transform">
                        {cell.icon}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight text-center leading-tight">
                        {cell.label}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* FAST FALLBACK: OMITIR / CENTRO                                */}
        {/* ------------------------------------------------------------- */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
          <button
            type="button"
            onClick={() => onSkipCenter(selectedCourtZone, selectedRivalNumber)}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
            title="Registrar en cuadrante Centro para no demorar"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Omitir Arco (Registrar al Centro)</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-950 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-700 text-slate-400 hover:text-rose-300 font-bold text-xs uppercase tracking-wider transition-all"
          >
            Descartar
          </button>
        </div>
      </div>
    </div>
  );
};
