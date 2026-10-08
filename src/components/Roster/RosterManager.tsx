import React, { useState } from 'react';
import { useHandball } from '../../context/HandballContext';
import type { Player } from '../../types/handball';
import { POSITION_LABELS } from '../../types/handball';
import { PlayerModal } from './PlayerModal';
import { TeamEditorModal } from './TeamEditorModal';
import { PlayerAnalysisModal } from '../PlayerAnalysis/PlayerAnalysisModal';
import {
  UserPlus,
  Settings,
  Search,
  Activity,
  Trash2,
  Edit2,
  Target,
} from 'lucide-react';

export const RosterManager: React.FC = () => {
  const { team, players, addPlayer, updatePlayer, deletePlayer, updateTeam } = useHandball();

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [analyzingPlayer, setAnalyzingPlayer] = useState<Player | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  // Statistics summaries
  const totalPlayers = players.length;
  const goalkeepers = players.filter((p) => p.position === 'GK').length;
  const fieldPlayers = totalPlayers - goalkeepers;
  const leftHanded = players.filter((p) => p.handedness === 'left').length;
  const rightHanded = totalPlayers - leftHanded;

  const filteredPlayers = players.filter((player) => {
    // Filter by position category
    if (filterCategory !== 'ALL') {
      const cat = POSITION_LABELS[player.position].category;
      if (filterCategory === 'GK' && cat !== 'Portería') return false;
      if (filterCategory === 'BACK' && cat !== 'Primera Línea') return false;
      if (filterCategory === 'WING' && cat !== 'Extremos') return false;
      if (filterCategory === 'PIVOT' && cat !== 'Pivote') return false;
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = player.name.toLowerCase().includes(q);
      const matchNum = player.number.toString().includes(q);
      const matchPos = POSITION_LABELS[player.position].name.toLowerCase().includes(q);
      if (!matchName && !matchNum && !matchPos) return false;
    }

    return true;
  });

  const handleOpenAddModal = () => {
    setEditingPlayer(null);
    setIsPlayerModalOpen(true);
  };

  const handleOpenEditModal = (player: Player) => {
    setEditingPlayer(player);
    setIsPlayerModalOpen(true);
  };

  const handleOpenAnalysisModal = (player: Player) => {
    setAnalyzingPlayer(player);
    setIsAnalysisModalOpen(true);
  };

  const handleSavePlayer = (playerData: any) => {
    if (editingPlayer) {
      updatePlayer({
        ...editingPlayer,
        ...playerData,
      });
    } else {
      addPlayer({
        ...playerData,
        teamId: team.id,
      });
    }
  };

  const handleDeletePlayer = (playerId: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${name} del plantel?`)) {
      deletePlayer(playerId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Team Header & Roster Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div
          className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: team.primaryColor }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl border-2 border-white/10"
              style={{
                backgroundColor: team.primaryColor,
                boxShadow: `0 10px 25px -5px ${team.primaryColor}55`,
              }}
            >
              {team.shortName || 'HB'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">{team.name}</h1>
                <button
                  onClick={() => setIsTeamModalOpen(true)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Editar configuración del equipo"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 font-semibold text-slate-300">
                  {team.category}
                </span>
                {team.coachName && (
                  <span className="text-slate-400">
                    DT: <strong className="text-slate-200">{team.coachName}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
            <div className="px-3 py-1.5">
              <span className="text-xs text-slate-400 block font-medium">Plantel Total</span>
              <span className="text-lg font-bold text-white">{totalPlayers} jug.</span>
            </div>
            <div className="px-3 py-1.5 border-l border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Porteros</span>
              <span className="text-lg font-bold text-blue-400">{goalkeepers}</span>
            </div>
            <div className="px-3 py-1.5 border-l border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Jugadores Campo</span>
              <span className="text-lg font-bold text-emerald-400">{fieldPlayers}</span>
            </div>
            <div className="px-3 py-1.5 border-l border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Zurdos / Diestros</span>
              <span className="text-lg font-bold text-amber-400">
                {leftHanded} <span className="text-xs font-normal text-slate-400">/ {rightHanded}</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenAddModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Añadir Jugador</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 w-full md:w-auto">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Todos ({players.length})
          </button>
          <button
            onClick={() => setFilterCategory('GK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterCategory === 'GK'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Portería ({players.filter((p) => p.position === 'GK').length})
          </button>
          <button
            onClick={() => setFilterCategory('BACK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterCategory === 'BACK'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Primera Línea ({players.filter((p) => ['LB', 'CB', 'RB'].includes(p.position)).length})
          </button>
          <button
            onClick={() => setFilterCategory('WING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterCategory === 'WING'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Extremos ({players.filter((p) => ['LW', 'RW'].includes(p.position)).length})
          </button>
          <button
            onClick={() => setFilterCategory('PIVOT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterCategory === 'PIVOT'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Pivotes ({players.filter((p) => p.position === 'PV').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, dorsal o puesto..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPlayers.map((player) => {
          const posMeta = POSITION_LABELS[player.position];
          const isGoalkeeper = player.position === 'GK';
          const shotEfficiency =
            player.stats.shots > 0
              ? Math.round((player.stats.goals / player.stats.shots) * 100)
              : 0;
          const saveEfficiency =
            player.stats.shotsFaced > 0
              ? Math.round((player.stats.saves / player.stats.shotsFaced) * 100)
              : 0;

          return (
            <div
              key={player.id}
              className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-4 shadow-lg transition-all hover:translate-y-[-2px] flex flex-col justify-between group"
            >
              <div>
                {/* Top card row: Number badge & Handedness & Actions */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {/* Jersey Number */}
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-2xl text-blue-400 shadow-inner group-hover:border-blue-500/50 transition-colors">
                      {player.number}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-100 text-sm group-hover:text-blue-400 transition-colors line-clamp-1">
                          {player.name}
                        </span>
                        {player.isCaptain && (
                          <span
                            title="Capitán"
                            className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded text-[10px] font-black"
                          >
                            C
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {posMeta.name} ({posMeta.short})
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditModal(player)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePlayer(player.id, player.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Badges: Handedness, Height, Secondary position */}
                <div className="flex flex-wrap items-center gap-1.5 mb-4 text-[11px]">
                  <span
                    className={`px-2 py-0.5 rounded-md font-semibold border ${
                      player.handedness === 'left'
                        ? 'bg-amber-950/40 text-amber-300 border-amber-700/50'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {player.handedness === 'left' ? 'Zurdo 🤚' : 'Diestro ✋'}
                  </span>

                  {player.secondaryPosition && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/60 font-medium">
                      2ª: {POSITION_LABELS[player.secondaryPosition].short}
                    </span>
                  )}

                  {player.heightCm && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/60 font-medium">
                      {player.heightCm} cm
                    </span>
                  )}
                </div>

                {/* Stats Breakdown */}
                {isGoalkeeper ? (
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Paradas</span>
                      <span className="text-sm font-bold text-blue-400">{player.stats.saves}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Tiros Rec.</span>
                      <span className="text-sm font-bold text-slate-300">{player.stats.shotsFaced}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Eficacia</span>
                      <span className="text-sm font-bold text-emerald-400">{saveEfficiency}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Goles</span>
                      <span className="text-sm font-bold text-emerald-400">{player.stats.goals}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Tiros</span>
                      <span className="text-sm font-bold text-slate-300">{player.stats.shots}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">% Gol</span>
                      <span className="text-sm font-bold text-blue-400">{shotEfficiency}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Asist</span>
                      <span className="text-sm font-bold text-indigo-400">{player.stats.assists}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom footer: Discipline summary */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-slate-500" />
                  +/-: <strong className={player.stats.plusMinus >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {player.stats.plusMinus > 0 ? `+${player.stats.plusMinus}` : player.stats.plusMinus}
                  </strong>
                </span>

                <div className="flex items-center space-x-2">
                  {player.stats.twoMinutes > 0 && (
                    <span className="px-1.5 py-0.2 rounded bg-orange-950/50 text-orange-400 border border-orange-800/50 text-[10px] font-bold">
                      2': {player.stats.twoMinutes}
                    </span>
                  )}
                  {player.stats.yellowCards > 0 && (
                    <span className="px-1.5 py-0.2 rounded bg-yellow-950/50 text-yellow-400 border border-yellow-800/50 text-[10px] font-bold">
                      🟨 {player.stats.yellowCards}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button: Diagnóstico & Aptitudes */}
              <button
                type="button"
                onClick={() => handleOpenAnalysisModal(player)}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 border border-blue-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm group-hover:border-blue-500/50"
              >
                <Target className="w-3.5 h-3.5 text-blue-400" />
                <span>Diagnóstico & Recomendaciones</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPlayers.length === 0 && (
        <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
          <p className="text-slate-400 font-medium">No se encontraron jugadores con ese filtro.</p>
        </div>
      )}

      {/* Modals */}
      <PlayerModal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        onSave={handleSavePlayer}
        initialPlayer={editingPlayer}
      />

      <TeamEditorModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        team={team}
        onSave={(data) => updateTeam(data)}
      />

      <PlayerAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        player={analyzingPlayer}
        allPlayers={players}
        onSelectPlayer={(p) => setAnalyzingPlayer(p)}
      />
    </div>
  );
};
