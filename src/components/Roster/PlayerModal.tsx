import React, { useState, useEffect } from 'react';
import type { Player, Position, Handedness } from '../../types/handball';
import { POSITION_LABELS } from '../../types/handball';
import { X, Check } from 'lucide-react';

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (playerData: any) => void;
  initialPlayer?: Player | null;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPlayer,
}) => {
  const [name, setName] = useState('');
  const [number, setNumber] = useState(1);
  const [position, setPosition] = useState<Position>('CB');
  const [secondaryPosition, setSecondaryPosition] = useState<Position | ''>('');
  const [handedness, setHandedness] = useState<Handedness>('right');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [isCaptain, setIsCaptain] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialPlayer) {
      setName(initialPlayer.name);
      setNumber(initialPlayer.number);
      setPosition(initialPlayer.position);
      setSecondaryPosition(initialPlayer.secondaryPosition || '');
      setHandedness(initialPlayer.handedness);
      setHeightCm(initialPlayer.heightCm || '');
      setWeightKg(initialPlayer.weightKg || '');
      setIsCaptain(!!initialPlayer.isCaptain);
      setNotes(initialPlayer.notes || '');
    } else {
      setName('');
      setNumber(7);
      setPosition('CB');
      setSecondaryPosition('');
      setHandedness('right');
      setHeightCm(185);
      setWeightKg(85);
      setIsCaptain(false);
      setNotes('');
    }
  }, [initialPlayer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      number: Number(number),
      position,
      secondaryPosition: secondaryPosition || undefined,
      handedness,
      heightCm: heightCm ? Number(heightCm) : undefined,
      weightKg: weightKg ? Number(weightKg) : undefined,
      isCaptain,
      isActive: true,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const positionsList: Position[] = ['GK', 'LW', 'LB', 'CB', 'RB', 'RW', 'PV'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
          {initialPlayer ? '✏️ Editar Jugador' : '➕ Añadir Nuevo Jugador'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Nombre y Apellidos
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Gonzalo Pérez"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Dorsal (#)
              </label>
              <input
                type="number"
                min="1"
                max="99"
                required
                value={number}
                onChange={(e) => setNumber(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white text-center font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Posición Principal */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Posición Principal
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as Position)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {positionsList.map((pos) => (
                <option key={pos} value={pos}>
                  {POSITION_LABELS[pos].name} ({POSITION_LABELS[pos].short})
                </option>
              ))}
            </select>
          </div>

          {/* Posición Secundaria y Lateralidad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Posición Secundaria (Opcional)
              </label>
              <select
                value={secondaryPosition}
                onChange={(e) => setSecondaryPosition(e.target.value as Position | '')}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Ninguna</option>
                {positionsList.map((pos) => (
                  <option key={pos} value={pos} disabled={pos === position}>
                    {POSITION_LABELS[pos].name} ({POSITION_LABELS[pos].short})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Mano Dominante
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setHandedness('right')}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    handedness === 'right'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  Diestro ✋
                </button>
                <button
                  type="button"
                  onClick={() => setHandedness('left')}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    handedness === 'left'
                      ? 'bg-amber-600 border-amber-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  Zurdo 🤚
                </button>
              </div>
            </div>
          </div>

          {/* Físico (Altura y Peso) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Altura (cm)
              </label>
              <input
                type="number"
                min="140"
                max="230"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ej. 192"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Peso (kg)
              </label>
              <input
                type="number"
                min="40"
                max="140"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ej. 90"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Capitán */}
          <div className="pt-1">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isCaptain}
                onChange={(e) => setIsCaptain(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-300">Capitán del equipo (C)</span>
            </label>
          </div>

          {/* Notas del Entrenador */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Notas y Observaciones del Entrenador (DT)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas técnicas, tácticas, puntos a trabajar..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 resize-y"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
