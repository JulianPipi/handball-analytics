import React, { useState } from 'react';
import type { Player } from '../../types/handball';
import { POSITION_LABELS } from '../../types/handball';
import { ArrowUpDown, Target } from 'lucide-react';
import { PlayerAnalysisModal } from '../PlayerAnalysis/PlayerAnalysisModal';

interface PlayerStatsTableProps {
  players: Player[];
}

type SortField = 'number' | 'name' | 'goals' | 'shots' | 'efficiency' | 'assists' | 'turnovers' | 'steals' | 'twoMinutes' | 'plusMinus' | 'timeOnCourt';

export const PlayerStatsTable: React.FC<PlayerStatsTableProps> = ({ players }) => {
  const [sortField, setSortField] = useState<SortField>('goals');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [analyzingPlayer, setAnalyzingPlayer] = useState<Player | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const formatTime = (totalSec: number = 0) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default descending for stats
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    let aVal: any = 0;
    let bVal: any = 0;

    switch (sortField) {
      case 'number':
        aVal = a.number;
        bVal = b.number;
        break;
      case 'name':
        return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      case 'goals':
        aVal = a.stats.goals;
        bVal = b.stats.goals;
        break;
      case 'shots':
        aVal = a.stats.shots;
        bVal = b.stats.shots;
        break;
      case 'efficiency':
        aVal = a.stats.shots > 0 ? (a.stats.goals / a.stats.shots) * 100 : 0;
        bVal = b.stats.shots > 0 ? (b.stats.goals / b.stats.shots) * 100 : 0;
        break;
      case 'assists':
        aVal = a.stats.assists;
        bVal = b.stats.assists;
        break;
      case 'turnovers':
        aVal = a.stats.turnovers;
        bVal = b.stats.turnovers;
        break;
      case 'steals':
        aVal = a.stats.steals;
        bVal = b.stats.steals;
        break;
      case 'twoMinutes':
        aVal = a.stats.twoMinutes;
        bVal = b.stats.twoMinutes;
        break;
      case 'plusMinus':
        aVal = a.stats.plusMinus;
        bVal = b.stats.plusMinus;
        break;
      case 'timeOnCourt':
        aVal = a.stats.timeOnCourtSeconds || 0;
        bVal = b.stats.timeOnCourtSeconds || 0;
        break;
    }

    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            📋 Planilla de Rendimiento Individual (Box Score)
          </h3>
          <span className="text-xs text-slate-400">
            Haz clic en los encabezados para ordenar por cualquier métrica
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th
                onClick={() => handleSort('number')}
                className="py-3 px-2 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1"># <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">Jugador <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="py-3 px-2">Puesto</th>
              <th
                onClick={() => handleSort('goals')}
                className="py-3 px-2 text-center cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-center gap-1">Goles <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th
                onClick={() => handleSort('shots')}
                className="py-3 px-2 text-center cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-center gap-1">Tiros <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th
                onClick={() => handleSort('efficiency')}
                className="py-3 px-2 text-center cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-center gap-1">% Acierto <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th
                onClick={() => handleSort('assists')}
                className="py-3 px-2 text-center cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-center gap-1">Asist <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th
                onClick={() => handleSort('turnovers')}
                className="py-3 px-2 text-center cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-center gap-1">Pérdidas <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th
                onClick={() => handleSort('steals')}
                className="py-3 px-2 text-center cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-center gap-1">Robos <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th
                onClick={() => handleSort('twoMinutes')}
                className="py-3 px-2 text-center cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-center gap-1">2 Min <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th
                onClick={() => handleSort('plusMinus')}
                className="py-3 px-2 text-center cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-center gap-1">+/- <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th
                onClick={() => handleSort('timeOnCourt')}
                className="py-3 px-2 text-center cursor-pointer hover:text-white"
                title="Minutos jugados en pista"
              >
                <div className="flex items-center justify-center gap-1">Tiempo <ArrowUpDown className="w-3 h-3" /></div>
              </th>
              <th className="py-3 px-2 text-center">Diagnóstico</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {sortedPlayers.map((p) => {
              const eff = p.stats.shots > 0 ? Math.round((p.stats.goals / p.stats.shots) * 100) : 0;
              const isGK = p.position === 'GK';
              const gkEff = p.stats.shotsFaced > 0 ? Math.round((p.stats.saves / p.stats.shotsFaced) * 100) : 0;

              return (
                <tr key={p.id} className="hover:bg-slate-950/60 transition-colors">
                  <td className="py-2.5 px-2 font-mono font-bold text-blue-400">#{p.number}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-200">{p.name}</span>
                      {p.isCaptain && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded font-black border border-amber-500/40">
                          C
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-[11px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-semibold text-slate-300">
                      {POSITION_LABELS[p.position].short}
                    </span>
                    <span className="ml-1 text-[10px] text-slate-500">
                      {p.handedness === 'left' ? '(Z)' : '(D)'}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono font-bold text-emerald-400">
                    {p.stats.goals}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono text-slate-300">{p.stats.shots}</td>
                  <td className="py-2.5 px-2 text-center font-mono">
                    {p.stats.shots > 0 ? (
                      <span
                        className={`font-bold ${
                          eff >= 65 ? 'text-emerald-400' : eff >= 45 ? 'text-amber-400' : 'text-rose-400'
                        }`}
                      >
                        {eff}%
                      </span>
                    ) : isGK && p.stats.shotsFaced > 0 ? (
                      <span className="text-blue-400 font-bold" title="Eficacia bajo palos">
                        {gkEff}% par.
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono text-indigo-400 font-bold">
                    {p.stats.assists}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono text-rose-400 font-bold">
                    {p.stats.turnovers}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono text-blue-400 font-bold">
                    {p.stats.steals}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono">
                    {p.stats.twoMinutes > 0 ? (
                      <span className="px-1.5 py-0.5 rounded bg-orange-950/60 text-orange-400 border border-orange-800/60 font-bold">
                        {p.stats.twoMinutes}
                      </span>
                    ) : (
                      <span className="text-slate-600">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono font-bold">
                    <span className={p.stats.plusMinus >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {p.stats.plusMinus > 0 ? `+${p.stats.plusMinus}` : p.stats.plusMinus}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-300">
                    {formatTime(p.stats.timeOnCourtSeconds || 0)}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setAnalyzingPlayer(p);
                        setIsModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 border border-blue-500/30 transition-all inline-flex items-center gap-1"
                    >
                      <Target className="w-3 h-3" />
                      <span>Ficha</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <PlayerAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        player={analyzingPlayer}
        allPlayers={players}
        onSelectPlayer={(p) => setAnalyzingPlayer(p)}
      />
    </div>
  );
};
