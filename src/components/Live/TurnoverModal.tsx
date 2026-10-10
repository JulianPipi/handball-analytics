import React, { useState } from 'react';
import type { Player, TurnoverType, CourtZone } from '../../types/handball';
import { X, AlertTriangle, Zap, Footprints, Shuffle, Ban, ShieldAlert } from 'lucide-react';

interface TurnoverModalProps {
  isOpen: boolean;
  onCourtPlayers: Player[];
  selectedPlayerId: string | null;
  onConfirm: (playerId: string | undefined, turnoverType: TurnoverType, courtZone?: CourtZone) => void;
  onCancel: () => void;
}

export const TurnoverModal: React.FC<TurnoverModalProps> = ({
  isOpen,
  onCourtPlayers,
  selectedPlayerId: initialPlayerId,
  onConfirm,
  onCancel,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(initialPlayerId);
  const [selectedTurnoverType, setSelectedTurnoverType] = useState<TurnoverType>('handling_error');
  const [selectedCourtZone, setSelectedCourtZone] = useState<CourtZone>('9m_center');

  if (!isOpen) return null;

  const turnoverTypes: { id: TurnoverType; label: string; icon: React.ReactNode }[] = [
    { id: 'steps', label: 'Pasos', icon: <Footprints className="w-4 h-4 text-amber-400" /> },
    { id: 'bad_pass', label: 'Mal Pase', icon: <Shuffle className="w-4 h-4 text-rose-400" /> },
    { id: 'double_dribble', label: 'Dobles', icon: <span className="text-sm">🏀</span> },
    { id: 'offensive_foul', label: 'Falta en Ataque', icon: <Ban className="w-4 h-4 text-purple-400" /> },
    { id: 'area_violation', label: 'Pisó Área (6m)', icon: <ShieldAlert className="w-4 h-4 text-orange-400" /> },
    { id: 'handling_error', label: 'Mala Recepción / Balón Suelto', icon: <AlertTriangle className="w-4 h-4 text-yellow-400" /> },
  ];

  const quickZones: { id: CourtZone; label: string }[] = [
    { id: 'interval_1_2_left', label: '1-2 Izq' },
    { id: 'interval_2_3_left', label: '2-3 Izq' },
    { id: 'interval_3_3_center', label: '3-3 Cen' },
    { id: 'interval_2_3_right', label: '2-3 Der' },
    { id: 'interval_1_2_right', label: '1-2 Der' },
    { id: '9m_center', label: '9m Centro' },
    { id: '6m_left_wing', label: 'Extr. Izq' },
    { id: '6m_right_wing', label: 'Extr. Der' },
    { id: 'fastbreak', label: 'Contragolpe' },
  ];

  const handleQuickSubmit = () => {
    onConfirm(selectedPlayerId || undefined, selectedTurnoverType, selectedCourtZone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-4 sm:p-6 max-w-lg w-full shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Registro de Pérdida de Balón
              </h2>
              <span className="text-xs text-slate-400">
                Aclara qué jugador ocasionó el error y la infracción
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Selección de Jugador en Pista */}
        <div className="space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-slate-300 block">
            1. ¿Quién perdió el balón? (7 en pista):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedPlayerId(null)}
              className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                selectedPlayerId === null
                  ? 'bg-blue-600 text-white border-white shadow-md font-black'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              🏢 Error Colectivo
            </button>
            {onCourtPlayers.map((p) => {
              const isSelected = selectedPlayerId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlayerId(p.id)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-white shadow-md font-black scale-105'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className="w-5 h-5 rounded-md bg-slate-900 text-amber-400 font-mono text-[10px] flex items-center justify-center font-bold">
                    #{p.number}
                  </span>
                  <span className="truncate">{p.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Tipo de Pérdida */}
        <div className="space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-slate-300 block">
            2. ¿Qué infracción / error fue?:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {turnoverTypes.map((item) => {
              const isSelected = selectedTurnoverType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedTurnoverType(item.id)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-2 ${
                    isSelected
                      ? 'bg-rose-600 text-white border-white shadow-md font-black'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Zona en Cancha donde ocurrió la pérdida */}
        <div className="space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-slate-300 block">
            3. ¿En qué sector ocurrió la pérdida?:
          </span>
          <div className="flex flex-wrap items-center gap-1">
            {quickZones.map((z) => {
              const isSelected = selectedCourtZone === z.id;
              return (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => setSelectedCourtZone(z.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-white font-black shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {z.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
          <button
            type="button"
            onClick={handleQuickSubmit}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Registrar Pérdida y Pasar a Defensa</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
