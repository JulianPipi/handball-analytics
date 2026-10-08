import React from 'react';
import type { CourtZone } from '../../types/handball';
import { COURT_ZONE_LABELS } from '../../types/handball';

interface Court2DProps {
  selectedZone?: CourtZone;
  onSelectZone: (zone: CourtZone) => void;
}

export const Court2D: React.FC<Court2DProps> = ({ selectedZone, onSelectZone }) => {
  return (
    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          📍 Zona de Lanzamiento / Acción
        </span>
        {selectedZone && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-900/60 text-blue-300 border border-blue-700/50">
            {COURT_ZONE_LABELS[selectedZone]}
          </span>
        )}
      </div>

      {/* Fastbreak option top banner */}
      <button
        type="button"
        onClick={() => onSelectZone('fastbreak')}
        className={`w-full py-2 mb-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
          selectedZone === 'fastbreak'
            ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/30'
            : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        ⚡ Contragolpe / Transición Rápida (1ª y 2ª Oleada)
      </button>

      {/* SVG Court representation */}
      <div className="relative w-full max-w-[420px] aspect-[4/3] bg-gradient-to-b from-blue-950/70 to-blue-900/50 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl p-2 select-none">
        {/* Goal line & Goal Area (6m) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-red-600/40 border-b-2 border-x-2 border-white/80 rounded-b-md flex items-center justify-center">
          <span className="text-[10px] font-black text-white/90 tracking-widest uppercase">Portería</span>
        </div>

        {/* 6m Area Arc (D-Zone) */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-36 border-b-2 border-dashed border-red-500/60 rounded-b-full pointer-events-none bg-red-900/20"
        />

        {/* 9m Free Throw Line Arc */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-52 border-b-2 border-dashed border-white/40 rounded-b-full pointer-events-none"
        />

        {/* 7m Penalty Mark */}
        <div
          className="absolute top-28 left-1/2 -translate-x-1/2 w-6 h-1 bg-white/90 pointer-events-none shadow"
        />

        {/* Interactive Zone Buttons mapped over court geometry */}
        {/* Extremo Izquierdo (6m) */}
        <button
          type="button"
          onClick={() => onSelectZone('6m_left_wing')}
          className={`absolute top-12 left-4 px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
            selectedZone === '6m_left_wing'
              ? 'bg-blue-600 border-white text-white shadow-lg scale-105 z-20'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white z-10'
          }`}
        >
          Extremo Izq. (6m)
        </button>

        {/* Extremo Derecho (6m) */}
        <button
          type="button"
          onClick={() => onSelectZone('6m_right_wing')}
          className={`absolute top-12 right-4 px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
            selectedZone === '6m_right_wing'
              ? 'bg-blue-600 border-white text-white shadow-lg scale-105 z-20'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white z-10'
          }`}
        >
          Extremo Der. (6m)
        </button>

        {/* 6m Centro / Pivote */}
        <button
          type="button"
          onClick={() => onSelectZone('6m_center')}
          className={`absolute top-16 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
            selectedZone === '6m_center'
              ? 'bg-blue-600 border-white text-white shadow-lg scale-105 z-20'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white z-10'
          }`}
        >
          6m Pivote / Centro
        </button>

        {/* 7m Penalti */}
        <button
          type="button"
          onClick={() => onSelectZone('7m')}
          className={`absolute top-32 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
            selectedZone === '7m'
              ? 'bg-amber-600 border-white text-white shadow-lg scale-105 z-20'
              : 'bg-slate-900/90 border-amber-600/70 text-amber-300 hover:bg-amber-600 hover:text-white z-10'
          }`}
        >
          🎯 7 Metros (Penalti)
        </button>

        {/* 9m Lateral Izquierdo */}
        <button
          type="button"
          onClick={() => onSelectZone('9m_left')}
          className={`absolute bottom-3 left-3 px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
            selectedZone === '9m_left'
              ? 'bg-blue-600 border-white text-white shadow-lg scale-105 z-20'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white z-10'
          }`}
        >
          9m Lateral Izq.
        </button>

        {/* 9m Central */}
        <button
          type="button"
          onClick={() => onSelectZone('9m_center')}
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
            selectedZone === '9m_center'
              ? 'bg-blue-600 border-white text-white shadow-lg scale-105 z-20'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white z-10'
          }`}
        >
          9m Central
        </button>

        {/* 9m Lateral Derecho */}
        <button
          type="button"
          onClick={() => onSelectZone('9m_right')}
          className={`absolute bottom-3 right-3 px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
            selectedZone === '9m_right'
              ? 'bg-blue-600 border-white text-white shadow-lg scale-105 z-20'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white z-10'
          }`}
        >
          9m Lateral Der.
        </button>
      </div>
    </div>
  );
};
