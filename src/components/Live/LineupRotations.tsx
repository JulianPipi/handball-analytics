import React, { useState } from 'react';
import { useHandball } from '../../context/HandballContext';
import type { Player } from '../../types/handball';
import { POSITION_LABELS } from '../../types/handball';
import {
  Users,
  ArrowLeftRight,
  Clock,
  Check,
  Shield,
} from 'lucide-react';

interface LineupRotationsProps {
  selectedPlayerId: string | null;
  onSelectPlayer: (playerId: string | null) => void;
}

export const LineupRotations: React.FC<LineupRotationsProps> = ({
  selectedPlayerId,
  onSelectPlayer,
}) => {
  const { match, players, substitutePlayer, setOnCourtPlayers } = useHandball();

  // Selected player on court waiting to be substituted
  const [subOutPlayerId, setSubOutPlayerId] = useState<string | null>(null);
  // Starter configuration modal
  const [isStartersModalOpen, setIsStartersModalOpen] = useState(false);
  const [tempStarters, setTempStarters] = useState<string[]>([]);

  const activePlayers = players.filter((p) => p.isActive);
  const onCourtIds = match.onCourtPlayerIds || [];

  // Categorize players into on-court and bench
  const onCourtPlayers = onCourtIds
    .map((id) => activePlayers.find((p) => p.id === id))
    .filter((p): p is Player => p !== undefined);

  const benchPlayers = activePlayers.filter((p) => !onCourtIds.includes(p.id));

  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number = 0) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Perform substitution
  const handleSelectBenchSubstitute = (benchPlayerId: string) => {
    if (!subOutPlayerId) return;
    substitutePlayer(subOutPlayerId, benchPlayerId);
    setSubOutPlayerId(null);
  };

  // Open starters configuration
  const handleOpenStartersModal = () => {
    setTempStarters([...onCourtIds]);
    setIsStartersModalOpen(true);
  };

  const handleToggleStarter = (playerId: string) => {
    if (tempStarters.includes(playerId)) {
      setTempStarters(tempStarters.filter((id) => id !== playerId));
    } else {
      if (tempStarters.length < 7) {
        setTempStarters([...tempStarters, playerId]);
      }
    }
  };

  const handleSaveStarters = () => {
    setOnCourtPlayers(tempStarters);
    setIsStartersModalOpen(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>7 en Cancha & Rotaciones</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                {onCourtPlayers.length}/7 Activos
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Minutero en vivo, fatiga y sustituciones volantes en 1 toque
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {subOutPlayerId && (
            <button
              onClick={() => setSubOutPlayerId(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              Cancelar Cambio
            </button>
          )}

          <button
            onClick={handleOpenStartersModal}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/30 transition-all flex items-center space-x-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Definir 7 Titulares</span>
          </button>
        </div>
      </div>

      {/* Alert if substitution active */}
      {subOutPlayerId && (
        <div className="bg-amber-950/60 border border-amber-600/50 rounded-2xl p-3 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold">
            <ArrowLeftRight className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span>
              Selecciona el relevo del banco para sustituir a{' '}
              <strong className="text-white underline">
                #{activePlayers.find((p) => p.id === subOutPlayerId)?.number}{' '}
                {activePlayers.find((p) => p.id === subOutPlayerId)?.name}
              </strong>
            </span>
          </div>
          <button
            onClick={() => setSubOutPlayerId(null)}
            className="text-xs text-amber-400 hover:text-white font-bold underline ml-2"
          >
            Descartar
          </button>
        </div>
      )}

      {/* 1. ON COURT PLAYERS (7) */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
          Jugadores en Pista ({onCourtPlayers.length})
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {onCourtPlayers.map((player) => {
            const isSelectedForAction = selectedPlayerId === player.id;
            const isPendingSubOut = subOutPlayerId === player.id;
            const posMeta = POSITION_LABELS[player.position];
            const playedSecs = player.stats.timeOnCourtSeconds || 0;
            const playedMins = Math.floor(playedSecs / 60);
            const isHighFatigue = playedMins >= 22; // Over 22 mins continuous play

            return (
              <div
                key={player.id}
                className={`relative rounded-2xl p-3 border transition-all flex flex-col justify-between ${
                  isPendingSubOut
                    ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                    : isSelectedForAction
                    ? 'bg-blue-900/40 border-blue-400 shadow-lg shadow-blue-500/30 ring-2 ring-blue-400'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top header: Number, Position & Quick Action Select */}
                <div
                  className="cursor-pointer"
                  onClick={() => onSelectPlayer(player.id)}
                  title="Clic para seleccionar como ejecutor"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/40 flex items-center justify-center font-mono font-black text-xs">
                      #{player.number}
                    </span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {posMeta.short}
                    </span>
                  </div>

                  <div className="truncate font-bold text-xs text-white" title={player.name}>
                    {player.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {player.name.split(' ').slice(1).join(' ') || posMeta.name}
                  </div>
                </div>

                {/* Bottom stats: Time on Court & Substitute trigger */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  {/* Live playing time */}
                  <div
                    className={`flex items-center gap-1 font-mono text-[11px] font-bold ${
                      isHighFatigue ? 'text-rose-400 font-black' : 'text-slate-300'
                    }`}
                    title={`Tiempo en cancha: ${formatTime(playedSecs)}`}
                  >
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{formatTime(playedSecs)}</span>
                    {isHighFatigue && (
                      <span title="Alta carga de minutos (rotación sugerida)">🔥</span>
                    )}
                  </div>

                  {/* Substitute button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSubOutPlayerId(isPendingSubOut ? null : player.id);
                    }}
                    className={`p-1 rounded-lg text-[10px] font-bold border transition-colors ${
                      isPendingSubOut
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                    }`}
                    title="Realizar cambio / sustitución"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. BENCH PLAYERS */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Banquillo / Suplentes ({benchPlayers.length})
          </span>
          {subOutPlayerId && (
            <span className="text-[11px] font-bold text-amber-400 animate-pulse">
              👈 Toca al jugador del banco que entra a la cancha
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {benchPlayers.map((player) => {
            const isSelectedForAction = selectedPlayerId === player.id;
            const posMeta = POSITION_LABELS[player.position];
            const playedSecs = player.stats.timeOnCourtSeconds || 0;

            return (
              <button
                key={player.id}
                type="button"
                onClick={() => {
                  if (subOutPlayerId) {
                    handleSelectBenchSubstitute(player.id);
                  } else {
                    onSelectPlayer(player.id);
                  }
                }}
                className={`px-3 py-2 rounded-2xl border text-left transition-all flex items-center space-x-2.5 ${
                  subOutPlayerId
                    ? 'bg-emerald-950/60 hover:bg-emerald-900/80 border-emerald-500/80 hover:border-emerald-400 text-white shadow-lg ring-1 ring-emerald-500 animate-pulse'
                    : isSelectedForAction
                    ? 'bg-blue-900/40 border-blue-400 text-white shadow'
                    : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                }`}
              >
                <span className="w-5 h-5 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-[10px] text-slate-300">
                  #{player.number}
                </span>

                <div>
                  <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                    <span>{player.name.split(' ')[0]}</span>
                    <span className="text-[9px] font-bold px-1 rounded bg-slate-900 text-slate-400">
                      {posMeta.short}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {formatTime(playedSecs)} min
                  </div>
                </div>

                {subOutPlayerId && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                    Entra ➔
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MODAL: DEFINIR 7 TITULARES */}
      {isStartersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <Shield className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-base font-black text-white">Configurar 7 Titulares</h3>
                  <p className="text-xs text-slate-400">
                    Selecciona los 7 jugadores que inician en pista ({tempStarters.length}/7 seleccionados)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsStartersModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
              {activePlayers.map((player) => {
                const isChecked = tempStarters.includes(player.id);
                const posMeta = POSITION_LABELS[player.position];

                return (
                  <div
                    key={player.id}
                    onClick={() => handleToggleStarter(player.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isChecked
                        ? 'bg-blue-950/60 border-blue-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-xs text-blue-400">
                        #{player.number}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-white block">{player.name}</span>
                        <span className="text-[10px] text-slate-400">{posMeta.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {posMeta.short}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          isChecked
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                {tempStarters.length === 7 ? (
                  <span className="text-emerald-400 font-bold">✓ Septeto completo</span>
                ) : (
                  <span className="text-amber-400">
                    Faltan {7 - tempStarters.length} jugadores
                  </span>
                )}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsStartersModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveStarters}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                >
                  Guardar 7 Titulares
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
