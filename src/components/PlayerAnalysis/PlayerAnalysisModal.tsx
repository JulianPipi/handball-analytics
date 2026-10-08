import React, { useState } from 'react';
import type { Player } from '../../types/handball';
import { POSITION_LABELS } from '../../types/handball';
import { generatePlayerDiagnostic } from '../../utils/playerDiagnostics';
import {
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Dumbbell,
  Printer,
  Sparkles,
} from 'lucide-react';

interface PlayerAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  allPlayers: Player[];
  onSelectPlayer: (p: Player) => void;
}

export const PlayerAnalysisModal: React.FC<PlayerAnalysisModalProps> = ({
  isOpen,
  onClose,
  player,
  allPlayers,
  onSelectPlayer,
}) => {
  // Simulator adjustments
  const [shotEffBoost, setShotEffBoost] = useState(0); // 0 to 15%
  const [turnoverReduction, setTurnoverReduction] = useState(0); // 0 to 10
  const [disciplineBoost, setDisciplineBoost] = useState(false);

  if (!isOpen || !player) return null;

  const report = generatePlayerDiagnostic(player);

  // Projected improved player stats
  const projectedStats = {
    ...player.stats,
    goals: player.stats.goals + Math.round((player.stats.shots * shotEffBoost) / 100),
    turnovers: Math.max(0, player.stats.turnovers - turnoverReduction),
    twoMinutes: disciplineBoost ? Math.max(0, Math.floor(player.stats.twoMinutes / 2)) : player.stats.twoMinutes,
  };

  const projectedPlayer: Player = {
    ...player,
    stats: projectedStats,
  };

  const projectedReport = generatePlayerDiagnostic(projectedPlayer);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 relative space-y-6">
        {/* Close & Print Buttons */}
        <div className="absolute top-5 right-5 flex items-center space-x-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors border border-slate-700/60"
            title="Imprimir Ficha de Desarrollo Individual"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors border border-slate-700/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Header with Player Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800 pr-20">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-600/30 border-2 border-white/20">
              #{player.number}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-white">{player.name}</h3>
                {player.isCaptain && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black">
                    CAPITÁN
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400 font-semibold">
                <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200">
                  {POSITION_LABELS[player.position].name} ({POSITION_LABELS[player.position].short})
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-amber-300">
                  {player.handedness === 'left' ? 'Zurdo 🤚' : 'Diestro ✋'}
                </span>
                {player.heightCm && <span>{player.heightCm} cm</span>}
                {player.weightKg && <span>• {player.weightKg} kg</span>}
              </div>
            </div>
          </div>

          {/* Quick Player Switcher */}
          <div className="flex items-center space-x-2">
            <select
              value={player.id}
              onChange={(e) => {
                const found = allPlayers.find((p) => p.id === e.target.value);
                if (found) onSelectPlayer(found);
              }}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-blue-500"
            >
              {allPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.number} {p.name} ({POSITION_LABELS[p.position].short})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Rating & Potential Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Valoración Actual
              </span>
              <span className="text-3xl font-black font-mono text-blue-400">
                {report.overallRating} <span className="text-sm font-sans font-bold text-slate-500">OVR</span>
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-blue-950/60 border border-blue-700/60 text-blue-300 text-xs font-bold">
              {report.tacticalRole}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Techo Potencial
              </span>
              <span className="text-3xl font-black font-mono text-emerald-400">
                {report.potentialCeiling} <span className="text-sm font-sans font-bold text-slate-500">MAX</span>
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +{report.potentialCeiling - report.overallRating} pts
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Impacto en Cancha
              </span>
              <span className="text-3xl font-black font-mono text-amber-400">
                {player.stats.plusMinus >= 0 ? `+${player.stats.plusMinus}` : player.stats.plusMinus}
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400 text-right">
              Balance +/- de goles
            </span>
          </div>
        </div>

        {/* 3. Strengths & Weaknesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Puntos Fuertes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Puntos Fuertes (Aptitudes Destacadas):
            </h4>

            <div className="space-y-3">
              {report.strengths.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-1.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-300">{item.title}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700/50">
                      {item.metric}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Puntos Débiles / Oportunidades */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Puntos Débiles (Áreas a Corregir):
            </h4>

            <div className="space-y-3">
              {report.weaknesses.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-1.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-amber-300">{item.title}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700/50">
                      {item.metric}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Training Recommendations Plan */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-blue-400" /> Plan de Entrenamiento & Recomendaciones Técnicas
            </h4>
            <span className="text-xs text-slate-400">Consejos específicos para el cuerpo técnico</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.trainingRecommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-900/50 text-blue-300 border border-blue-700/50 text-[10px] font-bold uppercase">
                    {rec.category}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-100">{rec.drill}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">Foco técnico:</strong> {rec.focus}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Interactive Improvement Simulator */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-800/40 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> Simulador de Mejora Individual ("¿Qué pasa si corrige sus debilidades?")
            </h4>
            <span className="text-xs font-bold text-purple-300">
              Nuevo OVR Proyectado: <strong className="text-white text-sm font-mono">{projectedReport.overallRating} OVR</strong>{' '}
              (+{projectedReport.overallRating - report.overallRating})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            {/* Boost 1: Tiro */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Mejora de Tiro:</span>
                <span className="font-mono text-emerald-400">+{shotEffBoost}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={shotEffBoost}
                onChange={(e) => setShotEffBoost(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Proyecta +{Math.round((player.stats.shots * shotEffBoost) / 100)} goles más
              </span>
            </div>

            {/* Boost 2: Pérdidas */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Reducción de Pérdidas:</span>
                <span className="font-mono text-blue-400">-{turnoverReduction}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={turnoverReduction}
                onChange={(e) => setTurnoverReduction(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Pérdidas reducidas a {Math.max(0, player.stats.turnovers - turnoverReduction)}
              </span>
            </div>

            {/* Boost 3: Disciplina */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-300">Mayor Disciplina:</span>
                <span className="font-mono text-xs font-bold text-amber-400">
                  {disciplineBoost ? 'Activo (-50% 2\')' : 'Normal'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDisciplineBoost(!disciplineBoost)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-colors ${
                  disciplineBoost
                    ? 'bg-amber-600 border-amber-500 text-white shadow'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {disciplineBoost ? '✓ -50% Exclusiones Aplicado' : 'Simular Menos 2 Minutos'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
