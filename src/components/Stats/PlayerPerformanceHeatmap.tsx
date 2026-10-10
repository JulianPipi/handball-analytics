import React, { useState } from 'react';
import type { Player, MatchEvent, CourtZone } from '../../types/handball';
import { COURT_ZONE_LABELS, POSITION_LABELS } from '../../types/handball';
import { calculatePlayerPerformance } from '../../utils/playerPerformance';
import { Award, AlertTriangle, Lightbulb, Target } from 'lucide-react';

interface ZoneStats {
  goals: number;
  shotsMissedOrSaved: number;
  turnovers: number;
  steals: number;
  positiveScore: number;
  negativeScore: number;
  netScore: number;
}

interface PlayerPerformanceHeatmapProps {
  players: Player[];
  events: MatchEvent[];
  onCourtPlayerIds: string[];
}

export const PlayerPerformanceHeatmap: React.FC<PlayerPerformanceHeatmapProps> = ({
  players,
  events,
  onCourtPlayerIds,
}) => {
  // Players who participated (on court or have events)
  const participatingPlayers = players.filter(
    (p) => onCourtPlayerIds.includes(p.id) || events.some((e) => e.playerId === p.id)
  );

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    participatingPlayers[0]?.id || players[0]?.id || ''
  );

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId) || participatingPlayers[0];

  if (!selectedPlayer) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
        No hay datos de jugadores participantes en el partido.
      </div>
    );
  }

  // Calculate overall performance rating
  const performance = calculatePlayerPerformance(selectedPlayer, events);

  // Filter events for this specific player
  const playerEvents = events.filter((e) => e.playerId === selectedPlayer.id);

  // Group actions by court zone
  const allZones: CourtZone[] = [
    'interval_1_2_left',
    'interval_2_3_left',
    'interval_3_3_center',
    'interval_2_3_right',
    'interval_1_2_right',
    '6m_left_wing',
    '6m_right_wing',
    '9m_left',
    '9m_center',
    '9m_right',
    '7m',
    'fastbreak',
  ];

  const zoneBreakdown: Record<CourtZone, ZoneStats> = {} as any;

  allZones.forEach((z) => {
    zoneBreakdown[z] = {
      goals: 0,
      shotsMissedOrSaved: 0,
      turnovers: 0,
      steals: 0,
      positiveScore: 0,
      negativeScore: 0,
      netScore: 0,
    };
  });

  playerEvents.forEach((ev) => {
    const zone = ev.courtZone || 'interval_3_3_center';
    if (!zoneBreakdown[zone]) return;

    if (ev.type === 'shot') {
      if (ev.shotOutcome === 'goal') {
        zoneBreakdown[zone].goals += 1;
        zoneBreakdown[zone].positiveScore += 2;
      } else {
        zoneBreakdown[zone].shotsMissedOrSaved += 1;
        zoneBreakdown[zone].negativeScore += 1;
      }
    } else if (ev.type === 'turnover') {
      zoneBreakdown[zone].turnovers += 1;
      zoneBreakdown[zone].negativeScore += 2;
    } else if (ev.type === 'steal') {
      zoneBreakdown[zone].steals += 1;
      zoneBreakdown[zone].positiveScore += 2;
    }
  });

  // Calculate net scores
  allZones.forEach((z) => {
    zoneBreakdown[z].netScore = zoneBreakdown[z].positiveScore - zoneBreakdown[z].negativeScore;
  });

  // Find strongest zone (most positive) and weakest zone (most negative)
  let bestZone: CourtZone | null = null;
  let bestScore = 0;
  let worstZone: CourtZone | null = null;
  let worstScore = 0;

  for (const z of allZones) {
    const data = zoneBreakdown[z];
    if (data.positiveScore > 0 && data.positiveScore > bestScore) {
      bestScore = data.positiveScore;
      bestZone = z;
    }
    if (data.negativeScore > 0 && data.negativeScore > worstScore) {
      worstScore = data.negativeScore;
      worstZone = z;
    }
  }

  const bestData = bestZone ? zoneBreakdown[bestZone] : null;
  const worstData = worstZone ? zoneBreakdown[worstZone] : null;

  // Render court badge for each zone
  const renderZoneBadge = (zoneKey: CourtZone, customLabel?: string) => {
    const data = zoneBreakdown[zoneKey];
    const totalActions = data.goals + data.shotsMissedOrSaved + data.turnovers + data.steals;
    const isStrong = data.positiveScore > data.negativeScore && data.positiveScore > 0;
    const isWeak = data.negativeScore > data.positiveScore && data.negativeScore > 0;

    let badgeClass = 'bg-slate-900/90 border-slate-700 text-slate-400';
    if (totalActions > 0) {
      if (isStrong) {
        badgeClass = 'bg-emerald-950/95 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/30';
      } else if (isWeak) {
        badgeClass = 'bg-rose-950/95 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/30';
      } else {
        badgeClass = 'bg-amber-950/95 border-amber-500 text-amber-300 shadow';
      }
    }

    return (
      <div className={`p-1.5 sm:p-2 rounded-xl border text-center transition-all ${badgeClass}`}>
        <span className="text-[10px] font-black uppercase tracking-tight block">
          {customLabel || COURT_ZONE_LABELS[zoneKey].split(' ')[0]}
        </span>
        <div className="font-mono text-xs font-black mt-0.5 flex items-center justify-center gap-1.5">
          {data.goals > 0 && <span className="text-emerald-400">+{data.goals}⚽</span>}
          {data.turnovers > 0 && <span className="text-rose-400">-{data.turnovers}⚠️</span>}
          {data.shotsMissedOrSaved > 0 && <span className="text-amber-400">-{data.shotsMissedOrSaved}❌</span>}
          {totalActions === 0 && <span className="text-slate-600 text-[10px]">Sin acciones</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6">
      {/* 1. Player Selector Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <span>Mapa de Calor Individual: Zonas Fuertes vs Pérdidas</span>
            </h3>
            <p className="text-xs text-slate-400">
              Selecciona cualquier jugador participante para ver por dónde fue letal y por dónde perdió más balones.
            </p>
          </div>
        </div>

        {/* Player Pills Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {participatingPlayers.map((p) => {
            const isSelected = selectedPlayer.id === p.id;
            const perf = calculatePlayerPerformance(p, events);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlayerId(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-white shadow-lg font-black scale-105'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span className="w-5 h-5 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-[10px] text-blue-300">
                  #{p.number}
                </span>
                <span>{p.name.split(' ')[0]}</span>
                <span className="text-[10px]">{perf.shortBadge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Player Performance Overview Card */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-mono text-2xl font-black text-blue-400 shadow-md">
            #{selectedPlayer.number}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-black text-white">{selectedPlayer.name}</h4>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                {POSITION_LABELS[selectedPlayer.position].name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${performance.badgeBg} ${performance.textColor} ${performance.borderColor}`}>
                {performance.label}
              </span>
              <span className="text-xs text-slate-400">{performance.summary}</span>
            </div>
          </div>
        </div>

        {/* Quick numbers */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-sans">Goles/Tiros</span>
            <span className="text-emerald-400 font-black text-sm">
              {performance.goals}/{performance.shots} ({performance.shotEff}%)
            </span>
          </div>
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-sans">Pérdidas</span>
            <span className="text-rose-400 font-black text-sm">{performance.turnovers}</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-sans">Robos</span>
            <span className="text-blue-400 font-black text-sm">{performance.steals}</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Handball Court Heatmap */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold text-white uppercase tracking-wider">
            🗺️ Cancha Táctica: Distribución por Zonas e Intervalos
          </span>
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Verde = Fuerte / Goles
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Rojo = Pérdidas / Fallos
            </span>
          </div>
        </div>

        <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-blue-950/80 to-slate-950 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl p-3 flex flex-col justify-between select-none">
          {/* Goal simulation */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-red-600/40 border-b-2 border-x-2 border-white/80 rounded-b-md flex items-center justify-center">
            <span className="text-[9px] font-black text-white/90 tracking-widest uppercase">Portería Rival</span>
          </div>

          {/* 6m Area and lines */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-44 border-b-2 border-dashed border-red-500/60 rounded-b-full pointer-events-none bg-red-900/15" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-60 border-b-2 border-dashed border-white/40 rounded-b-full pointer-events-none" />

          {/* Top row: Wings and 7m */}
          <div className="flex items-center justify-between z-10 pt-6">
            <div>{renderZoneBadge('6m_left_wing', 'Extremo Izq')}</div>
            <div className="mt-6">{renderZoneBadge('7m', '7 Metros')}</div>
            <div>{renderZoneBadge('6m_right_wing', 'Extremo Der')}</div>
          </div>

          {/* Middle row: The 5 Defensive Intervals (1-2, 2-3, 3-3, 2-3, 1-2) */}
          <div className="z-10 my-auto">
            <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest block text-center mb-1">
              Intervalos de Penetración Defensiva:
            </span>
            <div className="grid grid-cols-5 gap-1.5 max-w-xl mx-auto">
              <div>{renderZoneBadge('interval_1_2_left', '1-2 Izq')}</div>
              <div>{renderZoneBadge('interval_2_3_left', '2-3 Izq')}</div>
              <div>{renderZoneBadge('interval_3_3_center', '3-3 Cen')}</div>
              <div>{renderZoneBadge('interval_2_3_right', '2-3 Der')}</div>
              <div>{renderZoneBadge('interval_1_2_right', '1-2 Der')}</div>
            </div>
          </div>

          {/* Bottom row: 9m Distance and Fastbreak */}
          <div className="z-10 grid grid-cols-4 gap-1.5">
            <div>{renderZoneBadge('9m_left', '9m Izq')}</div>
            <div>{renderZoneBadge('9m_center', '9m Central')}</div>
            <div>{renderZoneBadge('9m_right', '9m Der')}</div>
            <div>{renderZoneBadge('fastbreak', 'Contraataque')}</div>
          </div>
        </div>
      </div>

      {/* 4. Automated Tactical Diagnosis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Strongest zone card */}
        <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/50 space-y-2 shadow-inner">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold uppercase tracking-wider text-xs">
            <Award className="w-4 h-4" />
            <span>🏆 Donde fue más fuerte:</span>
          </div>
          {bestZone && bestData ? (
            <div>
              <p className="text-base font-black text-white">
                {COURT_ZONE_LABELS[bestZone]}
              </p>
              <p className="text-xs text-emerald-300 mt-1">
                Anotó <strong className="text-white">{bestData.goals} goles</strong>{' '}
                {bestData.steals > 0 && `y recuperó ${bestData.steals} balones`}.
                Eficacia dominante en este sector de la pista.
              </p>
            </div>
          ) : (
            <p className="text-slate-400 italic">Sin acciones ofensivas destacadas registradas aún.</p>
          )}
        </div>

        {/* Weakest zone card */}
        <div className="bg-rose-950/40 p-4 rounded-2xl border border-rose-500/50 space-y-2 shadow-inner">
          <div className="flex items-center space-x-2 text-rose-400 font-bold uppercase tracking-wider text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>⚠️ Por donde perdió más / Puntos a ajustar:</span>
          </div>
          {worstZone && worstData ? (
            <div>
              <p className="text-base font-black text-white">
                {COURT_ZONE_LABELS[worstZone]}
              </p>
              <p className="text-xs text-rose-300 mt-1">
                Cometió <strong className="text-white">{worstData.turnovers} pérdidas</strong>{' '}
                y erró {worstData.shotsMissedOrSaved} tiros en este sector.
              </p>
            </div>
          ) : (
            <p className="text-slate-400 italic">No ha registrado pérdidas ni errores críticos en este partido.</p>
          )}
        </div>
      </div>

      {/* 5. Coach Tactical Recommendation */}
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 p-4 rounded-2xl border border-blue-500/40 flex items-start space-x-3 text-xs">
        <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-black text-white uppercase tracking-wider block">
            Indicación Táctica para el Entrenador:
          </span>
          <p className="text-slate-300 mt-0.5 leading-relaxed">
            {bestZone && worstZone ? (
              <>
                Explotar sus penetraciones y juego asociativo por{' '}
                <strong className="text-emerald-400">{COURT_ZONE_LABELS[bestZone]}</strong>, donde genera ventaja numérica clara. Al mismo tiempo, evitar pases de alto riesgo o tiros forzados en{' '}
                <strong className="text-rose-400">{COURT_ZONE_LABELS[worstZone]}</strong> donde el rival concentra las recuperaciones.
              </>
            ) : bestZone ? (
              <>
                Mantener el foco en abastecer a #{selectedPlayer.number} en{' '}
                <strong className="text-emerald-400">{COURT_ZONE_LABELS[bestZone]}</strong> ya que está con alta confianza de lanzamiento.
              </>
            ) : (
              <>
                Monitorear los minutos en cancha y buscar involucrarlo en acciones claras de 6m o contraataque para ganar confianza.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
