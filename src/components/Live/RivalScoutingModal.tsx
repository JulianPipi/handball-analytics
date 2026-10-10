import React, { useState } from 'react';
import type { RivalPlayer, Position, Handedness } from '../../types/handball';
import { POSITION_LABELS } from '../../types/handball';
import { X, Trash2, Edit2, Shield, UserPlus, Save } from 'lucide-react';

interface RivalScoutingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rivalTeamName: string;
  rivalPlayers: RivalPlayer[];
  onAddRivalPlayer: (player: Omit<RivalPlayer, 'id'>) => void;
  onUpdateRivalPlayer: (player: RivalPlayer) => void;
  onDeleteRivalPlayer: (id: string) => void;
}

export const RivalScoutingModal: React.FC<RivalScoutingModalProps> = ({
  isOpen,
  onClose,
  rivalTeamName,
  rivalPlayers,
  onAddRivalPlayer,
  onUpdateRivalPlayer,
  onDeleteRivalPlayer,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form states
  const [number, setNumber] = useState<number>(10);
  const [name, setName] = useState<string>('');
  const [position, setPosition] = useState<Position>('LB');
  const [handedness, setHandedness] = useState<Handedness>('right');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setEditingId(null);
    setNumber(rivalPlayers.length > 0 ? Math.max(...rivalPlayers.map((r) => r.number)) + 1 : 1);
    setName('');
    setPosition('LB');
    setHandedness('right');
    setNotes('');
  };

  const handleStartEdit = (rp: RivalPlayer) => {
    setEditingId(rp.id);
    setIsAddingNew(false);
    setNumber(rp.number);
    setName(rp.name || '');
    setPosition(rp.position);
    setHandedness(rp.handedness || 'right');
    setNotes(rp.notes || '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdateRivalPlayer({
        id: editingId,
        number,
        name: name.trim() || undefined,
        position,
        handedness,
        notes: notes.trim() || undefined,
      });
      setEditingId(null);
    } else {
      onAddRivalPlayer({
        number,
        name: name.trim() || undefined,
        position,
        handedness,
        notes: notes.trim() || undefined,
      });
      setIsAddingNew(false);
    }
  };

  // Find player by position for tactical court preview
  const getPlayerInPos = (pos: Position) => rivalPlayers.find((r) => r.position === pos);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border-2 border-rose-600/80 rounded-3xl p-4 sm:p-6 max-w-3xl w-full shadow-2xl my-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-black shadow-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                Scouting Táctico
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Plantilla & Posiciones del Rival ({rivalTeamName})
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TACTICAL COURT LINEUP OF RIVAL TEAM                           */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>🏟️ Esquema Táctico Rival en Pista</span>
            <span className="text-[10px] text-slate-400 font-normal">Pulsa un jugador para editar o ver notas</span>
          </span>

          <div className="relative w-full aspect-[2.4/1] bg-gradient-to-b from-rose-950/40 to-slate-900 rounded-xl border border-slate-800 p-2 flex items-center justify-around select-none">
            {/* Goal at top */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded bg-red-600/40 border border-white/40 text-[9px] font-black text-white uppercase tracking-widest">
              Portería Rival
            </div>

            {/* GK */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center">
              {(() => {
                const p = getPlayerInPos('GK');
                return (
                  <div
                    onClick={() => p && handleStartEdit(p)}
                    className="cursor-pointer px-2 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 border border-indigo-400 text-white font-mono text-xs font-black flex items-center gap-1 shadow"
                    title={p ? p.notes : 'Sin asignar'}
                  >
                    <span>🧤 #{p ? p.number : '?'}</span>
                    <span className="text-[9px] font-sans opacity-90">{p?.name || 'POR'}</span>
                  </div>
                );
              })()}
            </div>

            {/* 6m Pivote */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
              {(() => {
                const p = getPlayerInPos('PV');
                return (
                  <div
                    onClick={() => p && handleStartEdit(p)}
                    className="cursor-pointer px-2 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-500 border border-rose-400 text-white font-mono text-xs font-black flex items-center gap-1 shadow"
                    title={p ? p.notes : 'Sin asignar'}
                  >
                    <span>#{p ? p.number : '?'}</span>
                    <span className="text-[9px] font-sans opacity-90">{p?.name || 'PIV'}</span>
                  </div>
                );
              })()}
            </div>

            {/* 1st Line: LW, LB, CB, RB, RW */}
            <div className="absolute bottom-2 inset-x-2 flex items-center justify-between">
              {/* LW */}
              {(() => {
                const p = getPlayerInPos('LW');
                return (
                  <div
                    onClick={() => p && handleStartEdit(p)}
                    className="cursor-pointer px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-mono text-xs font-bold flex items-center gap-1 shadow"
                  >
                    <span className="text-rose-400 font-black">#{p ? p.number : '?'}</span>
                    <span className="text-[9px] text-slate-300">{p?.name || 'EI'}</span>
                  </div>
                );
              })()}

              {/* LB */}
              {(() => {
                const p = getPlayerInPos('LB');
                return (
                  <div
                    onClick={() => p && handleStartEdit(p)}
                    className="cursor-pointer px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-mono text-xs font-bold flex items-center gap-1 shadow"
                  >
                    <span className="text-rose-400 font-black">#{p ? p.number : '?'}</span>
                    <span className="text-[9px] text-slate-300">{p?.name || 'LI'}</span>
                  </div>
                );
              })()}

              {/* CB */}
              {(() => {
                const p = getPlayerInPos('CB');
                return (
                  <div
                    onClick={() => p && handleStartEdit(p)}
                    className="cursor-pointer px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-mono text-xs font-bold flex items-center gap-1 shadow"
                  >
                    <span className="text-rose-400 font-black">#{p ? p.number : '?'}</span>
                    <span className="text-[9px] text-slate-300">{p?.name || 'CEN'}</span>
                  </div>
                );
              })()}

              {/* RB */}
              {(() => {
                const p = getPlayerInPos('RB');
                return (
                  <div
                    onClick={() => p && handleStartEdit(p)}
                    className="cursor-pointer px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-mono text-xs font-bold flex items-center gap-1 shadow"
                  >
                    <span className="text-rose-400 font-black">#{p ? p.number : '?'}</span>
                    <span className="text-[9px] text-slate-300">{p?.name || 'LD'}</span>
                  </div>
                );
              })()}

              {/* RW */}
              {(() => {
                const p = getPlayerInPos('RW');
                return (
                  <div
                    onClick={() => p && handleStartEdit(p)}
                    className="cursor-pointer px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-mono text-xs font-bold flex items-center gap-1 shadow"
                  >
                    <span className="text-rose-400 font-black">#{p ? p.number : '?'}</span>
                    <span className="text-[9px] text-slate-300">{p?.name || 'ED'}</span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* ADD / EDIT FORM                                               */}
        {/* ------------------------------------------------------------- */}
        {(isAddingNew || editingId) ? (
          <form onSubmit={handleSave} className="bg-slate-950 p-4 rounded-2xl border border-rose-500/50 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                {editingId ? 'Editar Jugador Rival' : 'Añadir Nuevo Jugador Rival'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingId(null);
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Dorsal (#):</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  required
                  value={number}
                  onChange={(e) => setNumber(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Nombre / Apodo:</label>
                <input
                  type="text"
                  placeholder="ej. Juan / El Zurdo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Posición:</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as Position)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-white font-bold"
                >
                  {(Object.keys(POSITION_LABELS) as Position[]).map((pos) => (
                    <option key={pos} value={pos}>
                      {POSITION_LABELS[pos].short} - {POSITION_LABELS[pos].name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Mano Dominante:</label>
                <select
                  value={handedness}
                  onChange={(e) => setHandedness(e.target.value as Handedness)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-white font-bold"
                >
                  <option value="right">Diestro (Derecho)</option>
                  <option value="left">Zurdo (Izquierdo)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Notas Tácticas / Puntos Débiles & Fuertes:
              </label>
              <input
                type="text"
                placeholder="ej. Tira siempre a la cadera, penetra entre 2-3, débil en defensa"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Jugador</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">
              {rivalPlayers.length} dorsales registrados en el scouting
            </span>
            <button
              type="button"
              onClick={handleStartAdd}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Añadir Dorsal Rival</span>
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* LIST OF REGISTERED RIVAL PLAYERS                              */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {rivalPlayers.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              No hay jugadores rivales guardados. Haz clic en "+ Añadir Dorsal Rival".
            </p>
          ) : (
            rivalPlayers
              .sort((a, b) => a.number - b.number)
              .map((rp) => (
                <div
                  key={rp.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-7 h-7 rounded-lg bg-rose-950/80 border border-rose-700/60 text-rose-300 font-mono font-black flex items-center justify-center text-xs">
                      #{rp.number}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">
                          {rp.name || `Jugador #${rp.number}`}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold">
                          {POSITION_LABELS[rp.position].name} ({POSITION_LABELS[rp.position].short})
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {rp.handedness === 'left' ? '🖐️ Zurdo' : 'Diestro'}
                        </span>
                      </div>
                      {rp.notes && (
                        <p className="text-[11px] text-amber-300/80 mt-0.5 italic">
                          "{rp.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(rp)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRivalPlayer(rp.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Cerrar Scouting
          </button>
        </div>
      </div>
    </div>
  );
};
