import React, { useState } from 'react';
import { useHandball } from '../../context/HandballContext';
import type { CourtZone, GoalZone, ShotOutcome, TurnoverType, DisciplineType } from '../../types/handball';
import { COURT_ZONE_LABELS, GOAL_ZONE_LABELS, TURNOVER_LABELS, DISCIPLINE_LABELS } from '../../types/handball';
import { Court2D } from './Court2D';
import { Goal2D } from './Goal2D';
import { ExclusionTracker } from './ExclusionTracker';
import { EventLog } from './EventLog';
import { LineupRotations } from './LineupRotations';
import {
  Play,
  Pause,
  Plus,
  Minus,
  RotateCcw,
  CheckCircle2,
  Shield,
  Activity,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

export const LiveConsole: React.FC = () => {
  const {
    match,
    players,
    startMatchTimer,
    pauseMatchTimer,
    setMatchTime,
    setMatchPeriod,
    updateScores,
    recordEvent,
    resetMatch,
  } = useHandball();

  // Active Team toggle ('home' or 'away')
  const [activeTeamId, setActiveTeamId] = useState<string>(match.homeTeam.id);
  // Selected Player ID
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  // 7 vs 6 tactical toggle
  const [is7v6, setIs7v6] = useState<boolean>(false);

  // Active Action Tab: 'shot' | 'turnover' | 'steal' | 'discipline'
  const [actionTab, setActionTab] = useState<'shot' | 'turnover' | 'steal' | 'discipline'>('shot');

  // Shot states
  const [selectedCourtZone, setSelectedCourtZone] = useState<CourtZone>('6m_center');
  const [selectedGoalZone, setSelectedGoalZone] = useState<GoalZone>('mid_center');
  const [selectedOutcome, setSelectedOutcome] = useState<ShotOutcome>('goal');
  const [assistedByPlayerId, setAssistedByPlayerId] = useState<string>('');

  // Timer formatting
  const minutes = Math.floor(match.matchTimeSeconds / 60);
  const seconds = match.matchTimeSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isHomeActive = activeTeamId === match.homeTeam.id;
  const currentTeam = isHomeActive ? match.homeTeam : match.awayTeam;

  // Available players for selection
  const teamPlayers = isHomeActive
    ? players.filter((p) => p.isActive)
    : []; // For away team, if no specific squad loaded, allows general team logging

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  // Event dispatchers
  const handleRegisterShot = () => {
    const playerName = selectedPlayer ? `#${selectedPlayer.number} ${selectedPlayer.name}` : currentTeam.name;
    const outcomeLabel = selectedOutcome === 'goal' ? 'GOL' : selectedOutcome.toUpperCase();
    const zoneName = COURT_ZONE_LABELS[selectedCourtZone];
    const goalZoneName = GOAL_ZONE_LABELS[selectedGoalZone];

    let desc = `${playerName} - [${outcomeLabel}] desde ${zoneName} (${goalZoneName})`;
    if (assistedByPlayerId) {
      const assistant = players.find((p) => p.id === assistedByPlayerId);
      if (assistant) desc += ` [Asist: #${assistant.number} ${assistant.name}]`;
    }
    if (is7v6) desc += ` (Ataque 7v6)`;

    recordEvent({
      matchId: match.id,
      period: match.currentPeriod,
      matchTimeSeconds: match.matchTimeSeconds,
      teamId: activeTeamId,
      playerId: selectedPlayerId || undefined,
      type: 'shot',
      shotOutcome: selectedOutcome,
      courtZone: selectedCourtZone,
      goalZone: selectedGoalZone,
      assistedByPlayerId: assistedByPlayerId || undefined,
      is7v6,
      description: desc,
    });

    // Reset assists
    setAssistedByPlayerId('');
  };

  const handleRegisterTurnover = (type: TurnoverType) => {
    const playerName = selectedPlayer ? `#${selectedPlayer.number} ${selectedPlayer.name}` : currentTeam.name;
    const reason = TURNOVER_LABELS[type];

    recordEvent({
      matchId: match.id,
      period: match.currentPeriod,
      matchTimeSeconds: match.matchTimeSeconds,
      teamId: activeTeamId,
      playerId: selectedPlayerId || undefined,
      type: 'turnover',
      turnoverType: type,
      description: `${playerName} - Pérdida de balón (${reason})`,
    });
  };

  const handleRegisterSteal = () => {
    const playerName = selectedPlayer ? `#${selectedPlayer.number} ${selectedPlayer.name}` : currentTeam.name;

    recordEvent({
      matchId: match.id,
      period: match.currentPeriod,
      matchTimeSeconds: match.matchTimeSeconds,
      teamId: activeTeamId,
      playerId: selectedPlayerId || undefined,
      type: 'steal',
      description: `${playerName} - Robo / Recuperación de balón`,
    });
  };

  const handleRegisterDiscipline = (type: DisciplineType) => {
    const playerName = selectedPlayer ? `#${selectedPlayer.number} ${selectedPlayer.name}` : currentTeam.name;
    const label = DISCIPLINE_LABELS[type].label;

    recordEvent({
      matchId: match.id,
      period: match.currentPeriod,
      matchTimeSeconds: match.matchTimeSeconds,
      teamId: activeTeamId,
      playerId: selectedPlayerId || undefined,
      type: 'discipline',
      disciplineType: type,
      description: `${playerName} - Sanción: ${label}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. MASTER SCOREBOARD & CLOCK BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-6">
          {/* Home Team Card */}
          <div
            onClick={() => {
              setActiveTeamId(match.homeTeam.id);
            }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              isHomeActive
                ? 'bg-blue-950/50 border-blue-500 shadow-lg shadow-blue-500/20'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl text-white shadow"
                style={{ backgroundColor: match.homeTeam.primaryColor }}
              >
                {match.homeTeam.shortName}
              </div>
              <div>
                <h3 className="font-black text-white text-base leading-tight">{match.homeTeam.name}</h3>
                <span className="text-[11px] font-bold text-blue-400">LOCAL {isHomeActive && '● ACTIVO'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateScores(Math.max(0, match.homeScore - 1), match.awayScore);
                }}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-sm"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateScores(match.homeScore + 1, match.awayScore);
                }}
                className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center text-sm shadow"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Score & Match Clock */}
          <div className="flex flex-col items-center">
            {/* Score */}
            <div className="text-5xl font-black font-mono tracking-widest text-white flex items-center gap-4">
              <span className="text-blue-400">{match.homeScore}</span>
              <span className="text-slate-600">:</span>
              <span className="text-rose-400">{match.awayScore}</span>
            </div>

            {/* Time badge */}
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => setMatchPeriod(match.currentPeriod === 1 ? 2 : 1)}
                className="text-xs font-bold text-slate-300 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                title="Cambiar periodo (1º / 2º Tiempo)"
              >
                {match.currentPeriod}º TIEMPO
              </button>
              <span className="text-2xl font-mono font-bold text-amber-400 px-3 py-0.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
                {timeFormatted}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => setMatchTime(Math.max(0, match.matchTimeSeconds - 10))}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white rounded-lg"
                title="-10 segundos"
              >
                -10s
              </button>

              {match.isRunning ? (
                <button
                  type="button"
                  onClick={pauseMatchTimer}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-600/30 transition-all"
                >
                  <Pause className="w-4 h-4" /> Pausar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startMatchTimer}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Play className="w-4 h-4" /> Iniciar
                </button>
              )}

              <button
                type="button"
                onClick={() => setMatchTime(match.matchTimeSeconds + 10)}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white rounded-lg"
                title="+10 segundos"
              >
                +10s
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Reiniciar partido? Se restablecerá el marcador y reloj a 0.')) {
                    resetMatch();
                  }
                }}
                className="p-2 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 ml-1"
                title="Reiniciar partido"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Away Team Card */}
          <div
            onClick={() => {
              setActiveTeamId(match.awayTeam.id);
            }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              !isHomeActive
                ? 'bg-rose-950/50 border-rose-500 shadow-lg shadow-rose-500/20'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateScores(match.homeScore, Math.max(0, match.awayScore - 1));
                }}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-sm"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateScores(match.homeScore, match.awayScore + 1);
                }}
                className="w-8 h-8 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center text-sm shadow"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-3 text-right">
              <div>
                <h3 className="font-black text-white text-base leading-tight">{match.awayTeam.name}</h3>
                <span className="text-[11px] font-bold text-rose-400">VISITANTE {!isHomeActive && '● ACTIVO'}</span>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl text-white shadow"
                style={{ backgroundColor: match.awayTeam.primaryColor }}
              >
                {match.awayTeam.shortName}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ON-COURT 7 LINEUP, ROTATIONS & EXECUTOR SELECTOR */}
      {isHomeActive ? (
        <div className="space-y-3">
          <LineupRotations
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={setSelectedPlayerId}
          />

          {/* Tactical Bar: Active Selection + 7v6 Mode */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 px-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-400">Ejecutor Seleccionado:</span>
              {selectedPlayer ? (
                <div className="flex items-center space-x-2 bg-blue-950/80 border border-blue-600/50 px-3 py-1 rounded-xl">
                  <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-mono font-black text-xs flex items-center justify-center">
                    #{selectedPlayer.number}
                  </span>
                  <span className="text-xs font-bold text-white">{selectedPlayer.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPlayerId(null)}
                    className="text-slate-400 hover:text-white text-xs ml-1 font-bold"
                    title="Deseleccionar"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span className="text-xs font-bold text-slate-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                  🏢 {match.homeTeam.name} (Acción Colectiva / Equipo)
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSelectedPlayerId(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  selectedPlayerId === null
                    ? 'bg-slate-200 text-slate-900 border-white shadow'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                🏢 Colectivo
              </button>

              <button
                type="button"
                onClick={() => setIs7v6(!is7v6)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  is7v6
                    ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {is7v6 ? '⚠️ Ataque 7 vs 6 Activo' : 'Táctica: 6 vs 6 Regular'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Visitor team selector strip */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Registrar acción para el rival ({match.awayTeam.name}):
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIs7v6(!is7v6)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                is7v6
                  ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {is7v6 ? '⚠️ Ataque 7 vs 6 Rival' : 'Táctica: 6 vs 6 Regular'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedPlayerId(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white shadow border border-rose-500"
            >
              🏢 {match.awayTeam.name} (Acción Colectiva)
            </button>
          </div>
        </div>
      )}

      {/* 3. ACTION TABS (LANZAMIENTO | PÉRDIDA | ROBO | DISCIPLINA) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Navigation buttons */}
        <div className="grid grid-cols-4 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActionTab('shot')}
            className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              actionTab === 'shot'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            🎯 Lanzamiento
          </button>

          <button
            type="button"
            onClick={() => setActionTab('turnover')}
            className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              actionTab === 'turnover'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            ⚠️ Pérdida
          </button>

          <button
            type="button"
            onClick={() => setActionTab('steal')}
            className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              actionTab === 'steal'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            🛡️ Robo / Defensa
          </button>

          <button
            type="button"
            onClick={() => setActionTab('discipline')}
            className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              actionTab === 'discipline'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            🛑 Disciplina (2')
          </button>
        </div>

        {/* TAB 1: SHOT / LANZAMIENTO */}
        {actionTab === 'shot' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Court 2D */}
              <Court2D
                selectedZone={selectedCourtZone}
                onSelectZone={(zone) => setSelectedCourtZone(zone)}
              />

              {/* Right: Goal 2D */}
              <Goal2D
                selectedGoalZone={selectedGoalZone}
                selectedOutcome={selectedOutcome}
                onSelectGoalZone={(gZone) => setSelectedGoalZone(gZone)}
                onSelectOutcome={(outcome) => setSelectedOutcome(outcome)}
              />
            </div>

            {/* Optional Assist selector & Big Submit Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  Asistido por:
                </span>
                <select
                  value={assistedByPlayerId}
                  onChange={(e) => setAssistedByPlayerId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-full sm:w-48"
                >
                  <option value="">Sin asistencia</option>
                  {teamPlayers
                    .filter((p) => p.id !== selectedPlayerId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.number} {p.name}
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleRegisterShot}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Registrar Lanzamiento ({selectedOutcome.toUpperCase()})</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TURNOVER / PÉRDIDA */}
        {actionTab === 'turnover' && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Selecciona el motivo de la pérdida:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.keys(TURNOVER_LABELS) as TurnoverType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleRegisterTurnover(type)}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/70 hover:bg-amber-950/30 text-slate-200 hover:text-white font-bold text-xs transition-all flex flex-col items-center justify-center text-center space-y-1"
                >
                  <span className="text-lg">⚠️</span>
                  <span>{TURNOVER_LABELS[type]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STEAL / ROBO */}
        {actionTab === 'steal' && (
          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
            <Shield className="w-12 h-12 text-blue-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Robo o Recuperación Defensiva</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Registra una recuperación de balón provocada por{' '}
              <strong className="text-slate-200">
                {selectedPlayer ? `#${selectedPlayer.number} ${selectedPlayer.name}` : currentTeam.name}
              </strong>
              .
            </p>
            <button
              type="button"
              onClick={handleRegisterSteal}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all"
            >
              Confirmar Recuperación
            </button>
          </div>
        )}

        {/* TAB 4: DISCIPLINE / SANCIONES (2 MINUTOS, TARJETAS) */}
        {actionTab === 'discipline' && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" /> Sanciones Disciplinarias:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(DISCIPLINE_LABELS) as DisciplineType[]).map((dType) => {
                const info = DISCIPLINE_LABELS[dType];
                return (
                  <button
                    key={dType}
                    type="button"
                    onClick={() => handleRegisterDiscipline(dType)}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500 hover:bg-purple-950/30 text-white font-bold text-xs transition-all flex flex-col items-center justify-center text-center space-y-2"
                  >
                    <span className="text-2xl">
                      {dType === 'yellow_card' && '🟨'}
                      {dType === 'two_minute' && '⏱️ 2 min'}
                      {dType === 'red_card' && '🟥'}
                      {dType === 'blue_card' && '🟦'}
                    </span>
                    <span>{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. ACTIVE EXCLUSIONS & REAL-TIME EVENT LOG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExclusionTracker />
        <EventLog />
      </div>
    </div>
  );
};
