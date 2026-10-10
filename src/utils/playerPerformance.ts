import type { Player, MatchEvent } from '../types/handball';

export type PerformanceRating = 'hot' | 'good' | 'neutral' | 'warning' | 'cold';

export interface PlayerPerformance {
  rating: PerformanceRating;
  label: string;
  shortBadge: string;
  score: number;
  badgeBg: string;
  borderColor: string;
  textColor: string;
  glowClass: string;
  goals: number;
  shots: number;
  shotEff: number;
  turnovers: number;
  steals: number;
  twoMinutes: number;
  saves: number;
  shotsFaced: number;
  savePct: number;
  summary: string;
}

export function calculatePlayerPerformance(
  player: Player,
  events: MatchEvent[]
): PlayerPerformance {
  const isGk = player.position === 'GK';

  // Events involving this player
  const playerShots = events.filter((e) => e.type === 'shot' && e.playerId === player.id);
  const goals = playerShots.filter((e) => e.shotOutcome === 'goal').length;
  const shots = playerShots.length;
  const shotEff = shots > 0 ? Math.round((goals / shots) * 100) : 0;

  const turnovers = events.filter((e) => e.type === 'turnover' && e.playerId === player.id).length;
  const steals = events.filter((e) => e.type === 'steal' && e.playerId === player.id).length;
  const twoMinutes = events.filter(
    (e) => e.type === 'discipline' && e.playerId === player.id && e.disciplineType === 'two_minute'
  ).length;

  // Goalkeeper specific events
  const gkSaves = events.filter((e) => e.type === 'shot' && e.goalkeeperId === player.id && e.shotOutcome === 'save').length;
  const gkGoalsConceded = events.filter((e) => e.type === 'shot' && e.goalkeeperId === player.id && e.shotOutcome === 'goal').length;
  const shotsFaced = gkSaves + gkGoalsConceded;
  const savePct = shotsFaced > 0 ? Math.round((gkSaves / shotsFaced) * 100) : 0;

  let rating: PerformanceRating = 'neutral';
  let score = 0;
  let summary = '';

  if (isGk) {
    // Goalkeeper evaluation
    score = (gkSaves * 3) - (gkGoalsConceded * 1) + (steals * 2) - (turnovers * 2);
    if (shotsFaced >= 3 && savePct >= 38) {
      rating = 'hot';
      summary = `Muro en portería: ${gkSaves} paradas (${savePct}%)`;
    } else if (shotsFaced >= 3 && savePct >= 30) {
      rating = 'good';
      summary = `Buen rendimiento: ${savePct}% de efectividad`;
    } else if (shotsFaced >= 5 && savePct < 22) {
      rating = 'cold';
      summary = `Dificultades bajo palos: solo ${savePct}% paradas`;
    } else if (shotsFaced >= 3 && savePct < 25) {
      rating = 'warning';
      summary = `Bajo porcentaje de atajadas (${savePct}%)`;
    } else {
      rating = 'neutral';
      summary = `${gkSaves} paradas en ${shotsFaced} disparos`;
    }
  } else {
    // Field player evaluation
    score = (goals * 2.5) + (steals * 2) - (turnovers * 2.5) - (twoMinutes * 2);
    if (shots >= 2 && shotEff >= 70) score += 2;
    if (shots >= 3 && shotEff <= 33) score -= 2.5;

    if (goals >= 3 && shotEff >= 65 && turnovers <= 1) {
      rating = 'hot';
      summary = `On Fire: ${goals}/${shots} (${shotEff}%) y gran ritmo`;
    } else if (score >= 4 || (goals >= 2 && turnovers === 0)) {
      rating = 'hot';
      summary = `Gran momento: ${goals} goles sin fallos graves`;
    } else if (score >= 1.5) {
      rating = 'good';
      summary = `Sólido: Aporte positivo al juego colectivo`;
    } else if (turnovers >= 3 || (shots >= 3 && goals === 0)) {
      rating = 'cold';
      summary = `Racha negativa: ${turnovers} pérdidas y ${goals}/${shots} en tiro`;
    } else if (score <= -2 || turnovers >= 2 || (shots >= 2 && goals === 0)) {
      rating = 'warning';
      summary = `En alerta: ${turnovers} pérdidas o poca puntería`;
    } else {
      rating = 'neutral';
      summary = `En partido: ${goals}G / ${turnovers} pérdidas`;
    }
  }

  const ratingStyles = {
    hot: {
      label: '🔥 On Fire / Destacado',
      shortBadge: '🔥 Hot',
      badgeBg: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500',
      textColor: 'text-emerald-400',
      glowClass: 'shadow-lg shadow-emerald-500/30 border-emerald-400',
    },
    good: {
      label: '🟢 Rendimiento Positivo',
      shortBadge: '🟢 Bien',
      badgeBg: 'bg-teal-500/20',
      borderColor: 'border-teal-500',
      textColor: 'text-teal-400',
      glowClass: 'border-teal-500/80',
    },
    neutral: {
      label: '⚪ En Ritmo / Regular',
      shortBadge: '⚪ Ok',
      badgeBg: 'bg-slate-800',
      borderColor: 'border-slate-700',
      textColor: 'text-slate-300',
      glowClass: '',
    },
    warning: {
      label: '⚠️ En Alerta / Impreciso',
      shortBadge: '⚠️ Alerta',
      badgeBg: 'bg-amber-500/20',
      borderColor: 'border-amber-500',
      textColor: 'text-amber-400',
      glowClass: 'shadow-md shadow-amber-500/20 border-amber-400/90',
    },
    cold: {
      label: '🧊 Racha Negativa / Desacierto',
      shortBadge: '🧊 Frío',
      badgeBg: 'bg-rose-500/20',
      borderColor: 'border-rose-500',
      textColor: 'text-rose-400',
      glowClass: 'shadow-lg shadow-rose-500/30 border-rose-500 animate-pulse',
    },
  };

  const style = ratingStyles[rating];

  return {
    rating,
    label: style.label,
    shortBadge: style.shortBadge,
    score,
    badgeBg: style.badgeBg,
    borderColor: style.borderColor,
    textColor: style.textColor,
    glowClass: style.glowClass,
    goals,
    shots,
    shotEff,
    turnovers,
    steals,
    twoMinutes,
    saves: gkSaves,
    shotsFaced,
    savePct,
    summary,
  };
}
