export type Position = 'GK' | 'LW' | 'LB' | 'CB' | 'RB' | 'RW' | 'PV';

export const POSITION_LABELS: Record<Position, { name: string; short: string; category: string }> = {
  GK: { name: 'Portero / Arquero', short: 'POR', category: 'Portería' },
  LW: { name: 'Extremo Izquierdo', short: 'EI', category: 'Extremos' },
  LB: { name: 'Lateral Izquierdo', short: 'LI', category: 'Primera Línea' },
  CB: { name: 'Central', short: 'CEN', category: 'Primera Línea' },
  RB: { name: 'Lateral Derecho', short: 'LD', category: 'Primera Línea' },
  RW: { name: 'Extremo Derecho', short: 'ED', category: 'Extremos' },
  PV: { name: 'Pivote', short: 'PIV', category: 'Pivote' },
};

export type Handedness = 'right' | 'left';

export interface PlayerStats {
  goals: number;
  shots: number;
  assists: number;
  turnovers: number;
  steals: number;
  saves: number;
  shotsFaced: number;
  twoMinutes: number;
  yellowCards: number;
  redCards: number;
  plusMinus: number;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  number: number;
  position: Position;
  secondaryPosition?: Position;
  handedness: Handedness;
  heightCm?: number;
  weightKg?: number;
  isCaptain?: boolean;
  isActive: boolean;
  stats: PlayerStats;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  category: string;
  primaryColor: string;
  secondaryColor: string;
  coachName?: string;
}

export type CourtZone =
  | '6m_center'
  | '6m_left_wing'
  | '6m_right_wing'
  | '7m'
  | '9m_left'
  | '9m_center'
  | '9m_right'
  | 'fastbreak';

export const COURT_ZONE_LABELS: Record<CourtZone, string> = {
  '6m_center': '6m Centro / Pivote',
  '6m_left_wing': '6m Extremo Izquierdo',
  '6m_right_wing': '6m Extremo Derecho',
  '7m': '7m (Penalti)',
  '9m_left': '9m Lateral Izquierdo',
  '9m_center': '9m Central',
  '9m_right': '9m Lateral Derecho',
  'fastbreak': 'Contragolpe / Transición',
};

export type GoalZone =
  | 'top_left'
  | 'top_center'
  | 'top_right'
  | 'mid_left'
  | 'mid_center'
  | 'mid_right'
  | 'bottom_left'
  | 'bottom_center'
  | 'bottom_right';

export const GOAL_ZONE_LABELS: Record<GoalZone, string> = {
  'top_left': 'Escuadra Izquierda',
  'top_center': 'Arriba Centro',
  'top_right': 'Escuadra Derecha',
  'mid_left': 'Media Altura Izquierda',
  'mid_center': 'Centro',
  'mid_right': 'Media Altura Derecha',
  'bottom_left': 'Raso Izquierda',
  'bottom_center': 'Raso Centro',
  'bottom_right': 'Raso Derecha',
};

export type ShotOutcome = 'goal' | 'save' | 'post' | 'miss' | 'blocked';

export const SHOT_OUTCOME_LABELS: Record<ShotOutcome, { label: string; color: string }> = {
  goal: { label: 'Gol', color: 'emerald' },
  save: { label: 'Parada', color: 'blue' },
  post: { label: 'Poste', color: 'amber' },
  miss: { label: 'Fuera', color: 'rose' },
  blocked: { label: 'Bloqueado', color: 'purple' },
};

export type TurnoverType =
  | 'bad_pass'
  | 'steps'
  | 'double_dribble'
  | 'offensive_foul'
  | 'area_violation'
  | 'handling_error';

export const TURNOVER_LABELS: Record<TurnoverType, string> = {
  bad_pass: 'Pase errático',
  steps: 'Pasos',
  double_dribble: 'Dobles',
  offensive_foul: 'Falta en ataque',
  area_violation: 'Invasión de área',
  handling_error: 'Error de recepción',
};

export type DisciplineType = 'yellow_card' | 'two_minute' | 'red_card' | 'blue_card';

export const DISCIPLINE_LABELS: Record<DisciplineType, { label: string; color: string }> = {
  yellow_card: { label: 'Tarjeta Amarilla', color: 'yellow' },
  two_minute: { label: '2 Minutos', color: 'orange' },
  red_card: { label: 'Tarjeta Roja', color: 'red' },
  blue_card: { label: 'Tarjeta Azul', color: 'blue' },
};

export type EventType = 'shot' | 'turnover' | 'steal' | 'discipline' | 'timeout';

export interface ActiveExclusion {
  id: string;
  teamId: string;
  playerId: string;
  playerName: string;
  playerNumber: number;
  startMatchTimeSeconds: number;
  durationSeconds: number;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  timestamp: number;
  period: 1 | 2;
  matchTimeSeconds: number;
  teamId: string;
  playerId?: string;
  goalkeeperId?: string;
  type: EventType;
  shotOutcome?: ShotOutcome;
  courtZone?: CourtZone;
  goalZone?: GoalZone;
  turnoverType?: TurnoverType;
  disciplineType?: DisciplineType;
  assistedByPlayerId?: string;
  is7v6?: boolean;
  scoreHomeAfter: number;
  scoreAwayAfter: number;
  description: string;
}

export interface Match {
  id: string;
  date: string;
  title: string;
  competition: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  currentPeriod: 1 | 2;
  matchTimeSeconds: number;
  periodDurationMinutes: number;
  isRunning: boolean;
  activeExclusions: ActiveExclusion[];
  events: MatchEvent[];
  isFinished: boolean;
}
