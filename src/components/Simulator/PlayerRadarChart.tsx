import React, { useState } from 'react';
import type { Player } from '../../types/handball';
import { POSITION_LABELS } from '../../types/handball';

interface PlayerRadarChartProps {
  players: Player[];
}

interface SkillDimension {
  key: string;
  label: string;
  value: number; // 0 - 100
  icon: string;
}

export const PlayerRadarChart: React.FC<PlayerRadarChartProps> = ({ players }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || '');

  const player = players.find((p) => p.id === selectedPlayerId) || players[0];

  if (!player) return null;

  // Calculate 6 dimensions (0-100) based on position and stats
  const calculateSkills = (p: Player): SkillDimension[] => {
    const isGK = p.position === 'GK';
    const isBack = ['LB', 'CB', 'RB'].includes(p.position);
    const isWing = ['LW', 'RW'].includes(p.position);
    const isPivot = p.position === 'PV';

    const shotEff = p.stats.shots > 0 ? (p.stats.goals / p.stats.shots) * 100 : 60;
    const saveEff = p.stats.shotsFaced > 0 ? (p.stats.saves / p.stats.shotsFaced) * 100 : 32;

    // 1. Lanzamiento Exterior (9m)
    let shooting9m = isBack ? Math.min(98, Math.round(55 + p.stats.goals * 0.4 + (p.heightCm ? (p.heightCm - 180) * 1.2 : 0))) : isWing ? 45 : 35;
    if (isGK) shooting9m = 25;

    // 2. Definición en 6m
    let finishing6m = isWing || isPivot ? Math.min(99, Math.round(60 + shotEff * 0.45)) : Math.min(92, Math.round(50 + shotEff * 0.4));
    if (isGK) finishing6m = Math.min(98, Math.round(saveEff * 2.5)); // Para portero: eficacia bajo palos

    // 3. Visión y Creación (Playmaking)
    let playmaking = p.position === 'CB' ? Math.min(98, Math.round(65 + p.stats.assists * 0.5 - p.stats.turnovers * 0.3)) : Math.min(90, Math.round(40 + p.stats.assists * 0.8));
    if (isGK) playmaking = Math.min(90, Math.round(30 + p.stats.assists * 3)); // pases de contraataque

    // 4. Defensa & Recuperación
    let defense = Math.min(98, Math.round(45 + p.stats.steals * 2 + (p.heightCm ? (p.heightCm - 180) * 1.1 : 0)));
    if (isGK) defense = Math.min(95, Math.round(saveEff * 2.3));

    // 5. Disciplina y Fair Play (Menos exclusiones = Mayor nota)
    const discipline = Math.max(30, Math.min(98, Math.round(95 - p.stats.twoMinutes * 4 - p.stats.yellowCards * 2)));

    // 6. Transición & Velocidad
    let transitionSpeed = isWing ? Math.min(98, Math.round(75 + p.stats.steals * 1.2)) : Math.min(88, Math.round(55 + p.stats.steals * 0.8));
    if (isGK) transitionSpeed = 50;

    return [
      { key: '9m', label: 'Tiro 9m Exterior', value: Math.max(20, Math.min(99, shooting9m)), icon: '🎯' },
      { key: '6m', label: isGK ? 'Paradas en 6m' : 'Definición 6m', value: Math.max(20, Math.min(99, finishing6m)), icon: '💥' },
      { key: 'playmaking', label: 'Visión & Pase', value: Math.max(20, Math.min(99, playmaking)), icon: '🧠' },
      { key: 'defense', label: 'Defensa & Robos', value: Math.max(20, Math.min(99, defense)), icon: '🛡️' },
      { key: 'discipline', label: 'Disciplina & Control', value: Math.max(20, Math.min(99, discipline)), icon: '⚖️' },
      { key: 'transition', label: 'Transición Rápida', value: Math.max(20, Math.min(99, transitionSpeed)), icon: '⚡' },
    ];
  };

  const skills = calculateSkills(player);
  const overallRating = Math.round(skills.reduce((acc, s) => acc + s.value, 0) / skills.length);

  // SVG Radar calculations
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const angleStep = (Math.PI * 2) / skills.length;

  const getCoordinates = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Build polygon points string
  const polygonPoints = skills
    .map((s, idx) => {
      const coords = getCoordinates(s.value, idx);
      return `${coords.x},${coords.y}`;
    })
    .join(' ');

  // Grid levels (20, 40, 60, 80, 100)
  const levels = [20, 40, 60, 80, 100];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Header & Player Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            🕸️ Radar de Habilidades & Potencial Táctico
          </h3>
          <p className="text-xs text-slate-400">
            Evaluación multidimensional de atributos según posición reglamentaria y estadísticas reales.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Jugador:</span>
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="w-full sm:w-60 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-blue-500"
          >
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.number} {p.name} ({POSITION_LABELS[p.position].short})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Radar SVG Visualizer */}
        <div className="flex flex-col items-center justify-center relative">
          <svg width={size} height={size} className="overflow-visible select-none">
            {/* Concentric grid polygons */}
            {levels.map((lvl) => {
              const points = skills
                .map((_, idx) => {
                  const coords = getCoordinates(lvl, idx);
                  return `${coords.x},${coords.y}`;
                })
                .join(' ');
              return (
                <polygon
                  key={lvl}
                  points={points}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray={lvl === 100 ? undefined : '2,2'}
                />
              );
            })}

            {/* Axes lines */}
            {skills.map((_, idx) => {
              const coords = getCoordinates(100, idx);
              return (
                <line
                  key={idx}
                  x1={center}
                  y1={center}
                  x2={coords.x}
                  y2={coords.y}
                  stroke="#475569"
                  strokeWidth="1"
                />
              );
            })}

            {/* Filled player polygon */}
            <polygon
              points={polygonPoints}
              fill="rgba(59, 130, 246, 0.45)"
              stroke="#60a5fa"
              strokeWidth="2.5"
              className="drop-shadow-lg"
            />

            {/* Points / Vertices */}
            {skills.map((s, idx) => {
              const coords = getCoordinates(s.value, idx);
              return (
                <circle
                  key={idx}
                  cx={coords.x}
                  cy={coords.y}
                  r="4.5"
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
              );
            })}

            {/* Labels outside */}
            {skills.map((s, idx) => {
              const angle = idx * angleStep - Math.PI / 2;
              const labelRadius = radius + 25;
              const x = center + labelRadius * Math.cos(angle);
              const y = center + labelRadius * Math.sin(angle);

              return (
                <text
                  key={idx}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-slate-300 font-bold text-[10px]"
                >
                  {s.icon} {s.label} ({s.value})
                </text>
              );
            })}
          </svg>

          {/* Central OVR Badge */}
          <div className="mt-4 flex items-center space-x-3 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 shadow-xl">
            <span className="text-xs font-bold text-slate-400">VALORACIÓN GLOBAL:</span>
            <span className="text-xl font-black font-mono text-blue-400">{overallRating} OVR</span>
          </div>
        </div>

        {/* Detailed Attributes & Scouting Report */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 font-black text-xl flex items-center justify-center">
                #{player.number}
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{player.name}</h4>
                <span className="text-xs text-slate-400">
                  {POSITION_LABELS[player.position].name} • {player.handedness === 'left' ? 'Zurdo' : 'Diestro'}{' '}
                  {player.heightCm ? `• ${player.heightCm} cm` : ''}
                </span>
              </div>
            </div>

            <span className="px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs font-bold">
              {overallRating >= 85 ? '⭐ Élite' : overallRating >= 75 ? '🔥 Titular Clave' : '📈 En Proyección'}
            </span>
          </div>

          {/* Attribute Bars */}
          <div className="space-y-2.5">
            {skills.map((s) => (
              <div key={s.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span>{s.icon}</span> {s.label}
                  </span>
                  <span className="font-mono font-bold text-slate-200">{s.value} / 100</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      s.value >= 80
                        ? 'bg-emerald-500'
                        : s.value >= 65
                        ? 'bg-blue-500'
                        : s.value >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
