import React, { useState } from 'react';
import { useHandball } from '../../context/HandballContext';
import type { MatchCategory, Player } from '../../types/handball';
import { CATEGORY_DURATION_MAP, POSITION_LABELS } from '../../types/handball';
import { ExclusionTracker } from './ExclusionTracker';
import { EventLog } from './EventLog';
import { LineupRotations } from './LineupRotations';
import {
  Play,
  Pause,
  RotateCcw,
  ArrowLeftRight,
  Users,
  Undo2,
  ChevronDown,
  ChevronUp,
  Timer,
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
    undoLastEvent,
    resetMatch,
    setPossession,
    togglePossession,
    setMatchCategory,
    requestTimeout,
    cancelTimeoutCountdown,
    addExclusion,
  } = useHandball();

  // Selected player ID for quick event attributing (null = colectivo/equipo)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  // Toggle to show/hide detailed 7-player lineup & rotations panel
  const [showRotationsPanel, setShowRotationsPanel] = useState(false);
  // 7 vs 6 tactical mode
  const [is7v6, setIs7v6] = useState<boolean>(false);

  // Timer formatting
  const minutes = Math.floor(match.matchTimeSeconds / 60);
  const seconds = match.matchTimeSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isAttacking = match.possession === 'home';
  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  // Find primary local goalkeeper on court
  const localGoalkeeper = players.find(
    (p) => (match.onCourtPlayerIds || []).includes(p.id) && p.position === 'GK'
  ) || players.find((p) => p.position === 'GK');

  // Players currently on court
  const onCourtPlayers = (match.onCourtPlayerIds || [])
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is Player => p !== undefined);

  // Match statistics calculations for real-time summary
  const totalHomeShots = match.events.filter((e) => e.type === 'shot' && e.teamId === match.homeTeam.id).length;
  const homeGoals = match.events.filter((e) => e.type === 'shot' && e.teamId === match.homeTeam.id && e.shotOutcome === 'goal').length;
  const homeShotEff = totalHomeShots > 0 ? Math.round((homeGoals / totalHomeShots) * 100) : 0;
  const homeTurnovers = match.events.filter((e) => e.type === 'turnover' && e.teamId === match.homeTeam.id).length;

  const localGkSaves = match.events.filter(
    (e) => e.type === 'shot' && e.teamId === match.awayTeam.id && e.shotOutcome === 'save'
  ).length;
  const awayShotsOnTarget = match.events.filter(
    (e) => e.type === 'shot' && e.teamId === match.awayTeam.id && ['goal', 'save'].includes(e.shotOutcome || '')
  ).length;
  const gkSavePct = awayShotsOnTarget > 0 ? Math.round((localGkSaves / awayShotsOnTarget) * 100) : 0;

  // Total possessions approximate (shots + turnovers)
  const homePossessions = totalHomeShots + homeTurnovers;
  const attackSuccessPct = homePossessions > 0 ? Math.round((homeGoals / homePossessions) * 100) : 0;

  // -------------------------------------------------------------
  // ACTION HANDLERS (FAST 1-TOUCH LOGGING WITH POSSESSION SWITCH)
  // -------------------------------------------------------------

  // ATTACK: GOL NUESTRO
  const handleAttackGoal = () => {
    const actorName = selectedPlayer ? `#${selectedPlayer.number} ${selectedPlayer.name}` : match.homeTeam.name;
    recordEvent({
      matchId: match.id,
      period: match.currentPeriod,
      matchTimeSeconds: match.matchTimeSeconds,
      teamId: match.homeTeam.id,
      playerId: selectedPlayerId || undefined,
      type: 'shot',
      shotOutcome: 'goal',
      courtZone: '6m_center',
      goalZone: 'mid_center',
      is7v6,
      description: `⚽ GOL de ${actorName}${is7v6 ? ' (7v6)' : ''}`,
    });
    // Auto switch possession to Defense (rival restarts from center)
    setPossession('away');
    setSelectedPlayerId(null);
  };

  // ATTACK: PARADA DEL RIVAL
  const handleAttackSaved = () => {
    const actorName = selectedPlayer ? `#${selectedPlayer.number} ${selectedPlayer.name}` : match.homeTeam.name;
    recordEvent({
      matchId: match.id,
      period: match.currentPeriod,
      matchTimeSeconds: match.matchTimeSeconds,
      teamId: match.homeTeam.id,
      playerId: selectedPlayerId || undefined,
      type: 'shot',
      shotOutcome: 'save',
      description: `🧤 Parada del arquero rival a tiro de ${actorName}`,
    });
    setPossession('away');
    setSelectedPlayerId(null);
  };

  // ATTACK: TIRO FUERA / POSTE
  const handleAttackMiss = () => {
    const actorName = selectedPlayer ? `#${selectedPlayer.number} ${selectedPlayer.name}` : match.homeTeam.name;
    recordEvent({
      matchId: match.id,
      period: match.currentPeriod,
      matchTimeSeconds: match.matchTimeSeconds,
      teamId: match.homeTeam.id,
      playerId: selectedPlayerId || undefined,
      type: 'shot',
      shotOutcome: 'miss',
      description: `❌ Tiro desviado / fuera de ${actorName}`,
    });
    setPossession('away');
    setSelectedPlayerId(null);
  };

  // ATTACK: PÉRDIDA DE BALÓN
  const handleAttackTurnover = () => {
    const actorName = selectedPlayer ? `#${selectedPlayer.number} ${selectedPlayer.name}` : match.homeTeam.name;
    recordEvent({
      matchId: match.id,
      period: match.currentPeriod,
      matchTimeSeconds: match.matchTimeSeconds,
      teamId: match.homeTeam.id,
      playerId: selectedPlayerId || undefined,
      type: 'turnover',
      turnoverType: 'handling_error',
      description: `⚠️ Pérdida de balón de ${actorName}`,
    });
    setPossession('away');
    setSelectedPlayerId(null);
  };

  // ATTACK: 7 METROS FORZADO (Mantiene posesión)
  const handleForced7m = () => {
    const actorName = selectedPlayer ? `#${selectedPlayer.number} ${selectedPlayer.name}` : match.homeTeam.name;
    recordEvent({
      matchId: match.id,
      period: match.currentPeriod,
      matchTimeSeconds: match.matchTimeSeconds,
      teamId: match.homeTeam.id,
      playerId: selectedPlayerId || undefined,
      type: 'discipline',
      description: `🎯 7 Metros provocado por ${actorName}`,
    });
  };

  // ATTACK: 2 MINUTOS AL RIVAL
  const handleRivalExclusion = () => {
    recordEvent({
      matchId: match.id,
      period: match.currentPeriod,
      matchTimeSeconds: match.matchTimeSeconds,
      teamId: match.awayTeam.id,
      type: 'discipline',
      disciplineType: 'two_minute',
      description: `🛑 2 Minutos de exclusión al defensor rival (${match.awayTeam.name})`,
    });
  };

  // DEFENSE: PARADA DE NUESTRO ARQUERO
  const handleDefenseSave = () => {
    const gkName = localGoalkeeper ? `#${localGoalkeeper.number} ${localGoalkeeper.name}` : 'Arquero';
    recordEvent({
      matchId: match.id,
      period: match.currentPeriod,
      matchTimeSeconds: match.matchTimeSeconds,
      teamId: match.awayTeam.id,
      goalkeeperId: localGoalkeeper?.id,
      type: 'shot',
      shotOutcome: 'save',
      description: `🧤 ¡PARADA salvadora de ${gkName}!`,
    });
    setPossession('home');
    setSelectedPlayerId(null);
  };

  // DEFENSE: GOL RIVAL
  const handleRivalGoal = () => {
    recordEvent({
      matchId: match.id,
      period: match.currentPeriod,
      matchTimeSeconds: match.matchTimeSeconds,
      teamId: match.awayTeam.id,
      goalkeeperId: localGoalkeeper?.id,
      type: 'shot',
      shotOutcome: 'goal',
      description: `❌ Gol del rival (${match.awayTeam.name})`,
    });
    setPossession('home');
    setSelectedPlayerId(null);
  };

  // DEFENSE: ROBO / RECUPERO
  const handleDefenseSteal = () => {
    const actorName = selectedPlayer ? `#${selectedPlayer.number} ${selectedPlayer.name}` : match.homeTeam.name;
    recordEvent({
      matchId: match.id,
      period: match.currentPeriod,
      matchTimeSeconds: match.matchTimeSeconds,
      teamId: match.homeTeam.id,
      playerId: selectedPlayerId || undefined,
      type: 'steal',
      description: `🛡️ Balón recuperado / Robo de ${actorName}`,
    });
    setPossession('home');
    setSelectedPlayerId(null);
  };

  // DEFENSE: PÉRDIDA RIVAL
  const handleRivalTurnover = () => {
    recordEvent({
      matchId: match.id,
      period: match.currentPeriod,
      matchTimeSeconds: match.matchTimeSeconds,
      teamId: match.awayTeam.id,
      type: 'turnover',
      description: `⚠️ Pérdida no forzada del rival (${match.awayTeam.name})`,
    });
    setPossession('home');
    setSelectedPlayerId(null);
  };

  // DEFENSE: 2 MINUTOS A NUESTRO JUGADOR
  const handleHomeExclusion = () => {
    const actorName = selectedPlayer ? `#${selectedPlayer.number} ${selectedPlayer.name}` : 'Defensor';
    if (selectedPlayerId) {
      addExclusion(selectedPlayerId, match.homeTeam.id, 120);
    }
    recordEvent({
      matchId: match.id,
      period: match.currentPeriod,
      matchTimeSeconds: match.matchTimeSeconds,
      teamId: match.homeTeam.id,
      playerId: selectedPlayerId || undefined,
      type: 'discipline',
      disciplineType: 'two_minute',
      description: `🛑 2 Minutos de exclusión a ${actorName}`,
    });
    setSelectedPlayerId(null);
  };

  // DEFENSE: TARJETA AMARILLA A NUESTRO EQUIPO
  const handleHomeYellowCard = () => {
    const actorName = selectedPlayer ? `#${selectedPlayer.number} ${selectedPlayer.name}` : 'Defensor';
    recordEvent({
      matchId: match.id,
      period: match.currentPeriod,
      matchTimeSeconds: match.matchTimeSeconds,
      teamId: match.homeTeam.id,
      playerId: selectedPlayerId || undefined,
      type: 'discipline',
      disciplineType: 'yellow_card',
      description: `🟨 Tarjeta Amarilla a ${actorName}`,
    });
    setSelectedPlayerId(null);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16">
      {/* ------------------------------------------------------------- */}
      {/* 1. MODAL / BANNER DE TIEMPO MUERTO EN CURSO (60s IHF)         */}
      {/* ------------------------------------------------------------- */}
      {match.activeTimeoutCountdown && match.activeTimeoutCountdown.isActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Timer className="w-9 h-9 animate-spin" style={{ animationDuration: '4s' }} />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Reglamento IHF / Balonmano
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Tiempo Muerto de Equipo
              </h2>
              <p className="text-sm font-semibold text-slate-300 mt-0.5">
                Solicitado por: <strong className="text-white">{match.activeTimeoutCountdown.teamName}</strong>
              </p>
            </div>

            {/* Big Countdown Clock */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-inner">
              <div className="text-6xl font-black font-mono tracking-wider text-amber-400">
                0:{match.activeTimeoutCountdown.secondsLeft.toString().padStart(2, '0')}
              </div>
              <p className="text-xs font-bold text-slate-400 mt-2">
                {match.activeTimeoutCountdown.secondsLeft <= 10 ? (
                  <span className="text-rose-400 font-black animate-pulse">
                    ⚠️ ¡Señal a los 50s! Equipos regresando a la pista
                  </span>
                ) : (
                  'Cuenta regresiva de 1 minuto reglamentario'
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={cancelTimeoutCountdown}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Reanudar Partido / Finalizar TMO</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. TABLERO DE CONTROL: MARCADOR + RELOJ + CATEGORÍA + TMO     */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
        {/* Top line: Category selector & Period duration */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1">Categoría:</span>
            {(['menores', 'cadetes', 'mayores'] as MatchCategory[]).map((cat) => {
              const meta = CATEGORY_DURATION_MAP[cat];
              const isSelected = match.category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setMatchCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md font-black'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                  title={meta.description}
                >
                  {cat === 'menores' ? 'Menores (20m)' : cat === 'cadetes' ? 'Cadetes (25m)' : 'Mayores (30m)'}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMatchPeriod(match.currentPeriod === 1 ? 2 : 1)}
              className="text-xs font-black text-slate-200 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              {match.currentPeriod}º TIEMPO (2x{match.periodDurationMinutes}')
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Reiniciar partido? Se restablecerá el marcador y reloj a 0.')) {
                  resetMatch();
                }
              }}
              className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800"
              title="Reiniciar partido"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Score and Main Timer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Home Team Card */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md"
                style={{ backgroundColor: match.homeTeam.primaryColor }}
              >
                {match.homeTeam.shortName}
              </div>
              <div>
                <h3 className="font-black text-white text-base leading-tight truncate max-w-[150px]">
                  {match.homeTeam.name}
                </h3>
                <span className="text-[11px] font-bold text-blue-400">LOCAL</span>
              </div>
            </div>

            {/* Adjust fine buttons */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => updateScores(Math.max(0, match.homeScore - 1), match.awayScore)}
                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
                title="-1 gol local"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => updateScores(match.homeScore + 1, match.awayScore)}
                className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs hover:bg-blue-500 shadow"
                title="+1 gol local"
              >
                +
              </button>
            </div>
          </div>

          {/* Central Score & Clock */}
          <div className="text-center flex flex-col items-center justify-center">
            <div className="text-5xl font-black font-mono tracking-widest text-white flex items-center gap-4">
              <span className="text-blue-400">{match.homeScore}</span>
              <span className="text-slate-600">:</span>
              <span className="text-rose-400">{match.awayScore}</span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-mono font-bold text-amber-400 px-3 py-0.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
                {timeFormatted}
              </span>

              {match.isRunning ? (
                <button
                  type="button"
                  onClick={pauseMatchTimer}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-600/30 transition-all"
                >
                  <Pause className="w-3.5 h-3.5 fill-white" /> Pausar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startMatchTimer}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" /> Iniciar
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setMatchTime(Math.max(0, match.matchTimeSeconds - 10))}
                className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-400 hover:text-white rounded"
              >
                -10s
              </button>
              <button
                type="button"
                onClick={() => setMatchTime(match.matchTimeSeconds + 10)}
                className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-400 hover:text-white rounded"
              >
                +10s
              </button>
            </div>
          </div>

          {/* Away Team Card */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => updateScores(match.homeScore, Math.max(0, match.awayScore - 1))}
                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
                title="-1 gol rival"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => updateScores(match.homeScore, match.awayScore + 1)}
                className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs hover:bg-rose-500 shadow"
                title="+1 gol rival"
              >
                +
              </button>
            </div>

            <div className="flex items-center space-x-3 text-right">
              <div>
                <h3 className="font-black text-white text-base leading-tight truncate max-w-[150px]">
                  {match.awayTeam.name}
                </h3>
                <span className="text-[11px] font-bold text-rose-400">VISITANTE</span>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md"
                style={{ backgroundColor: match.awayTeam.primaryColor }}
              >
                {match.awayTeam.shortName}
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* TIEMPOS MUERTOS OFICIALES IHF (T1, T2, T3)                   */}
        {/* ----------------------------------------------------------- */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Home Timeouts */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">TMO {match.homeTeam.shortName}:</span>
            {[1, 2, 3].map((num) => {
              const used = (match.homeTimeouts || []).find((t) => t.number === num);
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    if (!used) requestTimeout(match.homeTeam.id);
                  }}
                  disabled={!!used}
                  className={`px-2 py-0.5 rounded-lg font-black text-[11px] border transition-all ${
                    used
                      ? 'bg-slate-800 text-slate-600 border-slate-800 line-through cursor-not-allowed'
                      : 'bg-emerald-950/80 hover:bg-emerald-800 text-emerald-400 border-emerald-600/60 shadow-sm cursor-pointer'
                  }`}
                  title={used ? `T${num} usado en ${used.period}ºT` : `Solicitar Tiempo Muerto T${num}`}
                >
                  T{num} {used ? '✓' : ''}
                </button>
              );
            })}
          </div>

          {/* Quick Undo & Possession Notice */}
          <div className="flex items-center space-x-2">
            {match.events.length > 0 && (
              <button
                type="button"
                onClick={undoLastEvent}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 flex items-center space-x-1 transition-colors"
                title="Deshacer última acción"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Deshacer Última Jugada</span>
              </button>
            )}
          </div>

          {/* Away Timeouts */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">TMO {match.awayTeam.shortName}:</span>
            {[1, 2, 3].map((num) => {
              const used = (match.awayTimeouts || []).find((t) => t.number === num);
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    if (!used) requestTimeout(match.awayTeam.id);
                  }}
                  disabled={!!used}
                  className={`px-2 py-0.5 rounded-lg font-black text-[11px] border transition-all ${
                    used
                      ? 'bg-slate-800 text-slate-600 border-slate-800 line-through cursor-not-allowed'
                      : 'bg-rose-950/80 hover:bg-rose-800 text-rose-400 border-rose-600/60 shadow-sm cursor-pointer'
                  }`}
                  title={used ? `T${num} usado en ${used.period}ºT` : `Pedir Tiempo Muerto rival T${num}`}
                >
                  T{num} {used ? '✓' : ''}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. CENTRO DE CONTROL DE POSESIÓN (ATACANDO vs DEFENDIENDO)    */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`rounded-3xl p-4 sm:p-5 border-2 shadow-2xl transition-all ${
          isAttacking
            ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/80 shadow-emerald-950/30'
            : 'bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border-rose-500/80 shadow-rose-950/30'
        }`}
      >
        {/* Possession Banner & Switch */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg ${
                isAttacking
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                  : 'bg-rose-500 text-white shadow-rose-500/30'
              }`}
            >
              {isAttacking ? '⚔️' : '🛡️'}
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                Estado Actual del Juego:
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isAttacking ? (
                  <span className="text-emerald-400">ESTAMOS ATACANDO (Posesión {match.homeTeam.name})</span>
                ) : (
                  <span className="text-rose-400">ESTAMOS DEFENDIENDO (Ataque {match.awayTeam.name})</span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={togglePossession}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow flex items-center space-x-2 transition-all"
            >
              <ArrowLeftRight className="w-4 h-4 text-amber-400" />
              <span>Cambiar Posesión (Rebote / Forzar)</span>
            </button>

            <button
              type="button"
              onClick={() => setIs7v6(!is7v6)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                is7v6
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md font-black'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {is7v6 ? '⚠️ 7v6 Activo' : '6v6'}
            </button>
          </div>
        </div>

        {/* Real-time Match Flow Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ataques Propios</span>
            <span className="text-base font-bold text-white font-mono">{homePossessions} posesiones</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Eficacia Ataque</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              {attackSuccessPct}% <span className="text-xs text-slate-400">({homeShotEff}% tiro)</span>
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pérdidas Propias</span>
            <span className="text-base font-bold text-amber-400 font-mono">{homeTurnovers}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Paradas Arquero</span>
            <span className="text-base font-bold text-blue-400 font-mono">{localGkSaves} ({gkSavePct}%)</span>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* SELECTOR DE DORSAL RÁPIDO (7 EN CANCHA + COLECTIVO)         */}
        {/* ----------------------------------------------------------- */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">
              ¿Quién ejecuta la jugada?{' '}
              {selectedPlayer ? (
                <strong className="text-blue-400">
                  (Seleccionado: #{selectedPlayer.number} {selectedPlayer.name})
                </strong>
              ) : (
                <span className="text-slate-500 font-normal">(Acción Colectiva / Equipo)</span>
              )}
            </span>

            {selectedPlayerId && (
              <button
                type="button"
                onClick={() => setSelectedPlayerId(null)}
                className="text-slate-400 hover:text-white underline text-[11px]"
              >
                Limpiar selección
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Collective button */}
            <button
              type="button"
              onClick={() => setSelectedPlayerId(null)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                selectedPlayerId === null
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md font-black'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              🏢 Equipo ({match.homeTeam.shortName})
            </button>

            {/* 7 players on court pills */}
            {onCourtPlayers.map((p) => {
              const isSelected = selectedPlayerId === p.id;
              const posMeta = POSITION_LABELS[p.position];

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlayerId(isSelected ? null : p.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-white shadow-lg shadow-blue-600/30 font-black scale-105'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="w-5 h-5 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-[10px] text-blue-300">
                    #{p.number}
                  </span>
                  <span>{p.name.split(' ')[0]}</span>
                  <span className="text-[9px] font-bold px-1 rounded bg-slate-900/60 text-slate-400">
                    {posMeta.short}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* 4. BOTONERA ULTRA RÁPIDA CONTEXTUAL (1 SOLO TOQUE)         */}
        {/* ----------------------------------------------------------- */}
        {isAttacking ? (
          /* BOTONES DE ATAQUE (ESTAMOS CON EL BALÓN) */
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block">
              Acciones de Ataque (Pulsar registra y cambia a Defensa automáticamente):
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* 1. GOL NUESTRO */}
              <button
                type="button"
                onClick={handleAttackGoal}
                className="py-4 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex flex-col items-center justify-center gap-1 active:scale-95 col-span-2 sm:col-span-1"
              >
                <span className="text-2xl">⚽</span>
                <span>GOL (+1)</span>
                <span className="text-[10px] font-normal opacity-80">Suma y pasa a Defensa</span>
              </button>

              {/* 2. PARADA RIVAL */}
              <button
                type="button"
                onClick={handleAttackSaved}
                className="py-4 px-3 rounded-2xl bg-blue-900/60 hover:bg-blue-800/80 border border-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <span className="text-2xl">🧤</span>
                <span>Parada Arquero Rival</span>
                <span className="text-[10px] font-normal text-slate-400">Pasa a Defensa</span>
              </button>

              {/* 3. TIRO FUERA / POSTE */}
              <button
                type="button"
                onClick={handleAttackMiss}
                className="py-4 px-3 rounded-2xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-white font-bold text-xs uppercase tracking-wider shadow transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <span className="text-2xl">❌</span>
                <span>Tiro Fuera / Poste</span>
                <span className="text-[10px] font-normal text-slate-400">Pasa a Defensa</span>
              </button>

              {/* 4. PÉRDIDA DE BALÓN */}
              <button
                type="button"
                onClick={handleAttackTurnover}
                className="py-4 px-3 rounded-2xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <span className="text-2xl">⚠️</span>
                <span>Pérdida (Pasos/Mal Pase)</span>
                <span className="text-[10px] font-normal text-slate-400">Pasa a Defensa</span>
              </button>

              {/* 5. 7 METROS FORZADO */}
              <button
                type="button"
                onClick={handleForced7m}
                className="py-4 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-500/50 text-amber-300 font-bold text-xs uppercase tracking-wider shadow transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <span className="text-2xl">🎯</span>
                <span>7 Metros Provocado</span>
                <span className="text-[10px] font-normal text-slate-400">Mantiene Ataque</span>
              </button>

              {/* 6. 2 MINUTOS AL RIVAL */}
              <button
                type="button"
                onClick={handleRivalExclusion}
                className="py-4 px-3 rounded-2xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700 text-purple-200 font-bold text-xs uppercase tracking-wider shadow transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <span className="text-2xl">🛑</span>
                <span>2 Minutos al Rival</span>
                <span className="text-[10px] font-normal text-slate-400">Exclusión rival</span>
              </button>
            </div>
          </div>
        ) : (
          /* BOTONES DE DEFENSA (EL RIVAL TIENE EL BALÓN) */
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-rose-400 block">
              Acciones de Defensa (Pulsar registra y cambia a Ataque automáticamente):
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* 1. PARADA DE NUESTRO ARQUERO */}
              <button
                type="button"
                onClick={handleDefenseSave}
                className="py-4 px-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all flex flex-col items-center justify-center gap-1 active:scale-95 col-span-2 sm:col-span-1"
              >
                <span className="text-2xl">🧤</span>
                <span>¡PARADA DE NUESTRO ARQUERO!</span>
                <span className="text-[10px] font-normal opacity-80">Pasa a Ataque</span>
              </button>

              {/* 2. GOL RIVAL */}
              <button
                type="button"
                onClick={handleRivalGoal}
                className="py-4 px-3 rounded-2xl bg-rose-900/80 hover:bg-rose-800 border border-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <span className="text-2xl">❌</span>
                <span>Gol del Rival (+1 Rival)</span>
                <span className="text-[10px] font-normal opacity-80">Pasa a Ataque</span>
              </button>

              {/* 3. ROBO / RECUPERACIÓN */}
              <button
                type="button"
                onClick={handleDefenseSteal}
                className="py-4 px-3 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600 text-emerald-200 font-bold text-xs uppercase tracking-wider shadow transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <span className="text-2xl">🛡️</span>
                <span>Robo / Balón Recuperado</span>
                <span className="text-[10px] font-normal text-slate-400">Pasa a Ataque</span>
              </button>

              {/* 4. PÉRDIDA RIVAL */}
              <button
                type="button"
                onClick={handleRivalTurnover}
                className="py-4 px-3 rounded-2xl bg-amber-950/70 hover:bg-amber-900 border border-amber-600 text-amber-200 font-bold text-xs uppercase tracking-wider shadow transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <span className="text-2xl">⚠️</span>
                <span>Fallo / Pérdida Rival</span>
                <span className="text-[10px] font-normal text-slate-400">Pasa a Ataque</span>
              </button>

              {/* 5. 2 MINUTOS A NUESTRO JUGADOR */}
              <button
                type="button"
                onClick={handleHomeExclusion}
                className="py-4 px-3 rounded-2xl bg-orange-950/70 hover:bg-orange-900 border border-orange-600 text-orange-200 font-bold text-xs uppercase tracking-wider shadow transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <span className="text-2xl">🛑</span>
                <span>2 Minutos Nuestro</span>
                <span className="text-[10px] font-normal text-slate-400">Inicia cronómetro 2'</span>
              </button>

              {/* 6. AMARILLA NUESTRA */}
              <button
                type="button"
                onClick={handleHomeYellowCard}
                className="py-4 px-3 rounded-2xl bg-yellow-950/70 hover:bg-yellow-900 border border-yellow-600 text-yellow-200 font-bold text-xs uppercase tracking-wider shadow transition-all flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <span className="text-2xl">🟨</span>
                <span>Tarjeta Amarilla</span>
                <span className="text-[10px] font-normal text-slate-400">Sanción disciplinaria</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. ACORDEÓN: ROTACIONES Y 7 EN CANCHA                         */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <button
          type="button"
          onClick={() => setShowRotationsPanel(!showRotationsPanel)}
          className="w-full p-4 px-5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center space-x-2.5">
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <span className="font-bold text-sm text-white block">
                Gestión de Plantilla, Minutero & Rotaciones Volantes
              </span>
              <span className="text-xs text-slate-400">
                {onCourtPlayers.length} jugadores en pista activa • Control de fatiga y sustituciones
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-400">
            <span className="text-xs font-semibold">{showRotationsPanel ? 'Ocultar' : 'Abrir'}</span>
            {showRotationsPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showRotationsPanel && (
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/50">
            <LineupRotations
              selectedPlayerId={selectedPlayerId}
              onSelectPlayer={setSelectedPlayerId}
            />
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. TRACKERS Y TIMELINE INFERIOR                               */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Exclusion Tracker */}
        <ExclusionTracker />

        {/* Live Event Log */}
        <EventLog />
      </div>
    </div>
  );
};
