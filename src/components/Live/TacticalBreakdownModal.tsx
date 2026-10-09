import React, { useState } from 'react';
import type { Match, Player, GoalZone } from '../../types/handball';
import { GOAL_ZONE_LABELS } from '../../types/handball';
import {
  Timer,
  Play,
  X,
  Target,
  Shield,
  AlertTriangle,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface TacticalBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  players: Player[];
  onStartSecondPeriod?: () => void;
  onCancelTimeout?: () => void;
  isHalftime?: boolean;
}

export const TacticalBreakdownModal: React.FC<TacticalBreakdownModalProps> = ({
  isOpen,
  onClose,
  match,
  players,
  onStartSecondPeriod,
  onCancelTimeout,
  isHalftime,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'current' | 'all'>('current');

  if (!isOpen) return null;

  const currentPeriodNum = match.currentPeriod;
  const isTimeoutActive = !!(match.activeTimeoutCountdown && match.activeTimeoutCountdown.isActive);

  // Filter events based on tab: current period or all match
  const filteredEvents = filterPeriod === 'current'
    ? match.events.filter((e) => e.period === currentPeriodNum)
    : match.events;

  // 1. Home Attack metrics
  const homeShots = filteredEvents.filter((e) => e.type === 'shot' && e.teamId === match.homeTeam.id);
  const homeGoals = homeShots.filter((e) => e.shotOutcome === 'goal').length;
  const homeTotalShots = homeShots.length;
  const homeShotEff = homeTotalShots > 0 ? Math.round((homeGoals / homeTotalShots) * 100) : 0;

  const homeTurnovers = filteredEvents.filter((e) => e.type === 'turnover' && e.teamId === match.homeTeam.id).length;
  const homePossessions = homeTotalShots + homeTurnovers;
  const possessionEff = homePossessions > 0 ? Math.round((homeGoals / homePossessions) * 100) : 0;

  // 2. Defense & Local Goalkeeper metrics
  const awayShots = filteredEvents.filter((e) => e.type === 'shot' && e.teamId === match.awayTeam.id);
  const awayGoals = awayShots.filter((e) => e.shotOutcome === 'goal').length;
  const localGkSaves = awayShots.filter((e) => e.shotOutcome === 'save').length;
  const shotsOnTargetFaced = awayGoals + localGkSaves;
  const gkSavePct = shotsOnTargetFaced > 0 ? Math.round((localGkSaves / shotsOnTargetFaced) * 100) : 0;

  const steals = filteredEvents.filter((e) => e.type === 'steal' && e.teamId === match.homeTeam.id).length;
  const rivalTurnovers = filteredEvents.filter((e) => e.type === 'turnover' && e.teamId === match.awayTeam.id).length;
  const turnoversForced = steals + rivalTurnovers;

  // 3. Discipline
  const homeExclusions = filteredEvents.filter(
    (e) => e.type === 'discipline' && e.teamId === match.homeTeam.id && e.disciplineType === 'two_minute'
  ).length;
  const awayExclusions = filteredEvents.filter(
    (e) => e.type === 'discipline' && e.teamId === match.awayTeam.id && e.disciplineType === 'two_minute'
  ).length;
  const homeYellows = filteredEvents.filter(
    (e) => e.type === 'discipline' && e.teamId === match.homeTeam.id && e.disciplineType === 'yellow_card'
  ).length;

  // 4. Period Score
  const periodHomeScore = homeGoals;
  const periodAwayScore = awayGoals;
  const scoreDiff = match.homeScore - match.awayScore;

  // 5. Top Scorers of the filtered period
  const playerScoringMap = new Map<string, { goals: number; shots: number }>();
  homeShots.forEach((ev) => {
    if (ev.playerId) {
      const cur = playerScoringMap.get(ev.playerId) || { goals: 0, shots: 0 };
      cur.shots += 1;
      if (ev.shotOutcome === 'goal') cur.goals += 1;
      playerScoringMap.set(ev.playerId, cur);
    }
  });

  const topScorers = Array.from(playerScoringMap.entries())
    .map(([pId, data]) => {
      const p = players.find((pl) => pl.id === pId);
      return {
        id: pId,
        player: p,
        goals: data.goals,
        shots: data.shots,
        eff: data.shots > 0 ? Math.round((data.goals / data.shots) * 100) : 0,
      };
    })
    .sort((a, b) => b.goals - a.goals || b.eff - a.eff)
    .slice(0, 4);

  // 6. Goal Quadrant Matrix for Home Goals in the filtered period
  const quadrantGoalCounts: Record<GoalZone, number> = {
    top_left: 0,
    top_center: 0,
    top_right: 0,
    mid_left: 0,
    mid_center: 0,
    mid_right: 0,
    bottom_left: 0,
    bottom_center: 0,
    bottom_right: 0,
  };

  homeShots
    .filter((e) => e.shotOutcome === 'goal' && e.goalZone)
    .forEach((e) => {
      if (e.goalZone && quadrantGoalCounts[e.goalZone] !== undefined) {
        quadrantGoalCounts[e.goalZone] += 1;
      }
    });

  const quadRows: GoalZone[][] = [
    ['top_left', 'top_center', 'top_right'],
    ['mid_left', 'mid_center', 'mid_right'],
    ['bottom_left', 'bottom_center', 'bottom_right'],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-4 sm:p-6 max-w-3xl w-full shadow-2xl my-auto space-y-5">
        {/* Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg ${
                isTimeoutActive
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                  : isHalftime
                  ? 'bg-purple-600 text-white shadow-purple-600/30'
                  : 'bg-blue-600 text-white shadow-blue-600/30'
              }`}
            >
              {isTimeoutActive ? <Timer className="w-6 h-6 animate-pulse" /> : isHalftime ? '🏁' : '📊'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {match.category.toUpperCase()} (2x{match.periodDurationMinutes}')
                </span>
                {isTimeoutActive && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
                    Tiempo Muerto ({match.activeTimeoutCountdown?.teamName})
                  </span>
                )}
                {isHalftime && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Entretiempo Cumplido
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {isHalftime
                  ? 'Charla Técnica: Resumen del 1º Tiempo'
                  : isTimeoutActive
                  ? 'Resumen Táctico de Tiempo Muerto'
                  : 'Resumen Táctico & Estadísticas en Vivo'}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Tab switch */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilterPeriod('current')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterPeriod === 'current'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {currentPeriodNum}º Periodo
              </button>
              <button
                type="button"
                onClick={() => setFilterPeriod('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterPeriod === 'all'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Partido Completo
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TIMEOUT COUNTDOWN EMBEDDED IF ACTIVE                          */}
        {/* ------------------------------------------------------------- */}
        {isTimeoutActive && match.activeTimeoutCountdown && (
          <div className="bg-gradient-to-r from-amber-950/80 via-slate-950 to-slate-950 p-3.5 rounded-2xl border border-amber-500/50 flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-black font-mono text-amber-400">
                0:{match.activeTimeoutCountdown.secondsLeft.toString().padStart(2, '0')}
              </div>
              <div>
                <span className="text-xs font-bold text-amber-300 block">
                  Cuenta regresiva IHF (1 minuto oficial)
                </span>
                <span className="text-[11px] text-slate-400">
                  {match.activeTimeoutCountdown.secondsLeft <= 10
                    ? '⚠️ ¡Aviso a los 50s! Reanudando juego en breve.'
                    : 'Aprovecha este resumen para dar indicaciones directas al equipo.'}
                </span>
              </div>
            </div>

            {onCancelTimeout && (
              <button
                type="button"
                onClick={onCancelTimeout}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Reanudar Partido</span>
              </button>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SCOREBOARD SUMMARY                                            */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-3 items-center bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
          <div>
            <span className="text-xs font-black uppercase text-blue-400 block truncate">
              {match.homeTeam.name}
            </span>
            <span className="text-3xl font-black font-mono text-white">
              {filterPeriod === 'current' ? periodHomeScore : match.homeScore}
            </span>
            {filterPeriod === 'current' && (
              <span className="text-[10px] text-slate-400 block">Global: {match.homeScore}</span>
            )}
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
              {filterPeriod === 'current' ? `Parcial ${currentPeriodNum}º Tiempo` : 'Resultado General'}
            </span>
            <div className="inline-block mt-0.5 px-3 py-0.5 rounded-full text-xs font-black bg-slate-900 border border-slate-700">
              {scoreDiff > 0 ? (
                <span className="text-emerald-400">+{scoreDiff} A Favor</span>
              ) : scoreDiff < 0 ? (
                <span className="text-rose-400">{scoreDiff} En Contra</span>
              ) : (
                <span className="text-slate-300">Empate</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-black uppercase text-rose-400 block truncate">
              {match.awayTeam.name}
            </span>
            <span className="text-3xl font-black font-mono text-white">
              {filterPeriod === 'current' ? periodAwayScore : match.awayScore}
            </span>
            {filterPeriod === 'current' && (
              <span className="text-[10px] text-slate-400 block">Global: {match.awayScore}</span>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4 TACTICAL PILLARS (ATTACK, TURNOVERS, GOALKEEPER, DISCIPLINE)*/}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Pillar 1: Ataque */}
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-emerald-900/60 space-y-1">
            <div className="flex items-center space-x-1 text-emerald-400 font-bold uppercase text-[10px]">
              <Target className="w-3.5 h-3.5" />
              <span>Ataque & Posesión</span>
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {possessionEff}%{' '}
              <span className="text-xs text-emerald-400 font-bold">eficacia</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {homeGoals} goles de {homePossessions} posesiones ({homeShotEff}% en lanzamientos)
            </p>
          </div>

          {/* Pillar 2: Pérdidas vs Recuperaciones */}
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-amber-900/60 space-y-1">
            <div className="flex items-center space-x-1 text-amber-400 font-bold uppercase text-[10px]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Control de Balón</span>
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {homeTurnovers} <span className="text-xs text-amber-400 font-bold">pérdidas</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {turnoversForced} balones recuperados (robos/pérdidas rivales)
            </p>
          </div>

          {/* Pillar 3: Portería */}
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-blue-900/60 space-y-1">
            <div className="flex items-center space-x-1 text-blue-400 font-bold uppercase text-[10px]">
              <Shield className="w-3.5 h-3.5" />
              <span>Portería Propia</span>
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {gkSavePct}% <span className="text-xs text-blue-400 font-bold">paradas</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {localGkSaves} paradas de {shotsOnTargetFaced} disparos entre los 3 palos
            </p>
          </div>

          {/* Pillar 4: Disciplina */}
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-purple-900/60 space-y-1">
            <div className="flex items-center space-x-1 text-purple-400 font-bold uppercase text-[10px]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Sanciones 2 Min</span>
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {homeExclusions} <span className="text-xs text-purple-400 font-bold">exclusiones</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {awayExclusions} provocadas al rival • {homeYellows} amarillas nuestras
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* LOWER SECTION: TOP SCORERS & GOAL QUADRANTS MATRIX            */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Scorers Card */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Máximos Goleadores ({filterPeriod === 'current' ? `${currentPeriodNum}ºT` : 'Global'})
              </span>
              <span className="text-[10px] text-slate-400">Goles / Tiros</span>
            </div>

            {topScorers.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                Aún no hay goles registrados en este periodo
              </p>
            ) : (
              <div className="space-y-1.5">
                {topScorers.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 font-mono font-black text-blue-400 flex items-center justify-center text-[11px]">
                        #{item.player?.number || '?'}
                      </span>
                      <span className="font-bold text-white truncate max-w-[140px]">
                        {item.player?.name || 'Jugador'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 font-mono">
                      <span className="font-black text-emerald-400">{item.goals}G</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-slate-400">{item.shots}T</span>
                      <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-950">
                        {item.eff}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goal Quadrant Mini Matrix */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                🥅 Mapa de Goles en Portería
              </span>
              <span className="text-[10px] text-slate-400">Nuestros goles por zona</span>
            </div>

            {/* Mini 3x3 goal frame */}
            <div className="aspect-[3/2] relative p-2 bg-slate-900 rounded-xl border-2 border-dashed border-red-600/70 flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_10px,#ffffff_10px,#ffffff_20px)] rounded-t-lg z-10" />
              <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_10px,#ffffff_10px,#ffffff_20px)] rounded-l-lg z-10" />
              <div className="absolute top-0 bottom-0 right-0 w-1.5 bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_10px,#ffffff_10px,#ffffff_20px)] rounded-r-lg z-10" />

              <div className="grid grid-rows-3 gap-1 h-full z-10 pt-0.5">
                {quadRows.map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-3 gap-1">
                    {row.map((z) => {
                      const count = quadrantGoalCounts[z] || 0;
                      return (
                        <div
                          key={z}
                          className={`rounded-lg p-1 flex flex-col items-center justify-center text-center transition-all ${
                            count > 0
                              ? 'bg-emerald-600/30 border border-emerald-500/60 text-white font-black'
                              : 'bg-slate-950/60 border border-slate-800 text-slate-600'
                          }`}
                        >
                          <span className="font-mono text-xs font-black">
                            {count > 0 ? `${count}⚽` : '-'}
                          </span>
                          <span className="text-[8px] text-slate-400 line-clamp-1">
                            {GOAL_ZONE_LABELS[z].split(' ')[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* BOTTOM ACTION BUTTONS                                         */}
        {/* ------------------------------------------------------------- */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Cerrar y Continuar
          </button>

          {isHalftime && currentPeriodNum === 1 && onStartSecondPeriod && (
            <button
              type="button"
              onClick={onStartSecondPeriod}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <span>Comenzar 2º Tiempo (2x{match.periodDurationMinutes}')</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
