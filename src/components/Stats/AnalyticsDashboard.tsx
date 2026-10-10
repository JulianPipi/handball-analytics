import React, { useState } from 'react';
import { useHandball } from '../../context/HandballContext';
import { CourtHeatmap } from './CourtHeatmap';
import { GoalQuadrantMatrix } from './GoalQuadrantMatrix';
import { PlayerStatsTable } from './PlayerStatsTable';
import { ComparisonRow } from './MatchComparisonBar';
import { PlayerPerformanceHeatmap } from './PlayerPerformanceHeatmap';
import {
  BarChart3,
  Printer,
  Filter,
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { match, players } = useHandball();

  // Scope: 'live_match' vs 'season_roster'
  const [scope, setScope] = useState<'live_match' | 'season_roster'>('live_match');
  // Team filter for court/goal views
  const [teamFilter, setTeamFilter] = useState<'all' | 'home' | 'away'>('all');
  const [viewMode, setViewMode] = useState<'team' | 'player'>('team');

  // Compute live match statistics from recorded events
  const homeEvents = match.events.filter((e) => e.teamId === match.homeTeam.id);
  const awayEvents = match.events.filter((e) => e.teamId === match.awayTeam.id);

  // Home shots
  const homeShots = homeEvents.filter((e) => e.type === 'shot');
  const homeGoals = homeShots.filter((e) => e.shotOutcome === 'goal').length;
  const homeShotEff = homeShots.length > 0 ? Math.round((homeGoals / homeShots.length) * 100) : 0;

  // Away shots
  const awayShots = awayEvents.filter((e) => e.type === 'shot');
  const awayGoals = awayShots.filter((e) => e.shotOutcome === 'goal').length;
  const awayShotEff = awayShots.length > 0 ? Math.round((awayGoals / awayShots.length) * 100) : 0;

  // 6m shots
  const home6mShots = homeShots.filter((e) => e.courtZone && ['6m_center', '6m_left_wing', '6m_right_wing'].includes(e.courtZone));
  const home6mGoals = home6mShots.filter((e) => e.shotOutcome === 'goal').length;
  const away6mShots = awayShots.filter((e) => e.courtZone && ['6m_center', '6m_left_wing', '6m_right_wing'].includes(e.courtZone));
  const away6mGoals = away6mShots.filter((e) => e.shotOutcome === 'goal').length;

  // 9m shots
  const home9mShots = homeShots.filter((e) => e.courtZone && ['9m_left', '9m_center', '9m_right'].includes(e.courtZone));
  const home9mGoals = home9mShots.filter((e) => e.shotOutcome === 'goal').length;
  const away9mShots = awayShots.filter((e) => e.courtZone && ['9m_left', '9m_center', '9m_right'].includes(e.courtZone));
  const away9mGoals = away9mShots.filter((e) => e.shotOutcome === 'goal').length;

  // 7m Penalties
  const home7mShots = homeShots.filter((e) => e.courtZone === '7m');
  const home7mGoals = home7mShots.filter((e) => e.shotOutcome === 'goal').length;
  const away7mShots = awayShots.filter((e) => e.courtZone === '7m');
  const away7mGoals = away7mShots.filter((e) => e.shotOutcome === 'goal').length;

  // Fastbreak
  const homeFbShots = homeShots.filter((e) => e.courtZone === 'fastbreak');
  const homeFbGoals = homeFbShots.filter((e) => e.shotOutcome === 'goal').length;
  const awayFbShots = awayShots.filter((e) => e.courtZone === 'fastbreak');
  const awayFbGoals = awayFbShots.filter((e) => e.shotOutcome === 'goal').length;

  // Turnovers
  const homeTurnovers = homeEvents.filter((e) => e.type === 'turnover').length;
  const awayTurnovers = awayEvents.filter((e) => e.type === 'turnover').length;

  // Exclusions (2 min)
  const home2m = homeEvents.filter((e) => e.type === 'discipline' && e.disciplineType === 'two_minute').length;
  const away2m = awayEvents.filter((e) => e.type === 'discipline' && e.disciplineType === 'two_minute').length;

  // Selected team ID for Court/Goal view
  const currentTeamFilterId =
    teamFilter === 'all' ? undefined : teamFilter === 'home' ? match.homeTeam.id : match.awayTeam.id;

  return (
    <div className="space-y-6">
      {/* 1. Header & Scope Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" /> Centro de Analítica Táctica de Handball
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mapas de calor de cancha, análisis de cuadrantes de portería y comparativa de equipos.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Scope toggle */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setScope('live_match')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                scope === 'live_match'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⏱️ Partido Actual
            </button>
            <button
              type="button"
              onClick={() => setScope('season_roster')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                scope === 'season_roster'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📈 Plantel Acumulado
            </button>
          </div>

          {/* Print report */}
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
            title="Imprimir / Exportar Reporte"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Mode Toggle: Equipo vs Jugador Individual */}
      <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl max-w-xl shadow-lg">
        <button
          type="button"
          onClick={() => setViewMode('team')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            viewMode === 'team'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>📊 Resumen Colectivo & Comparativa</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('player')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            viewMode === 'player'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🔥 Mapa de Rendimiento por Jugador</span>
        </button>
      </div>

      {viewMode === 'player' ? (
        <PlayerPerformanceHeatmap
          players={players}
          events={match.events}
          onCourtPlayerIds={match.onCourtPlayerIds || []}
        />
      ) : (
        <>
      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Marcador Actual
          </span>
          <div className="text-2xl font-black font-mono text-white flex items-center gap-2">
            <span className="text-blue-400">{match.homeScore}</span>
            <span className="text-slate-600">:</span>
            <span className="text-rose-400">{match.awayScore}</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            {match.events.length} eventos registrados
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Eficacia Ofensiva Local
          </span>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {homeShotEff}%
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            {homeGoals} goles en {homeShots.length} tiros
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Lanzamientos 6m & Penaltis
          </span>
          <div className="text-2xl font-black font-mono text-blue-400">
            {home6mGoals + home7mGoals} / {home6mShots.length + home7mShots.length}
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            7m: {home7mGoals}/{home7mShots.length} penaltis
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Pérdidas de Balón
          </span>
          <div className="text-2xl font-black font-mono text-rose-400">
            {homeTurnovers} <span className="text-xs text-slate-400 font-normal">vs {awayTurnovers} (rival)</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            2 min recibidos: {home2m}
          </span>
        </div>
      </div>

      {/* 3. Team Filter Bar for Visuals */}
      <div className="flex items-center justify-between bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-blue-400" /> Filtrar Mapas Visuales por Equipo:
        </span>

        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setTeamFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              teamFilter === 'all' ? 'bg-slate-100 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ambos Equipos
          </button>
          <button
            type="button"
            onClick={() => setTeamFilter('home')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              teamFilter === 'home' ? 'bg-blue-600 text-white font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            {match.homeTeam.shortName} (Local)
          </button>
          <button
            type="button"
            onClick={() => setTeamFilter('away')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              teamFilter === 'away' ? 'bg-rose-600 text-white font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            {match.awayTeam.shortName} (Rival)
          </button>
        </div>
      </div>

      {/* 4. Court Heatmap & Goal Quadrants Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CourtHeatmap events={match.events} teamIdFilter={currentTeamFilterId} />
        <GoalQuadrantMatrix events={match.events} teamIdFilter={currentTeamFilterId} />
      </div>

      {/* 5. Team vs Team Match Comparison */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: match.homeTeam.primaryColor }} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {match.homeTeam.name}
            </h3>
          </div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Comparativa Frente a Frente
          </span>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {match.awayTeam.name}
            </h3>
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: match.awayTeam.primaryColor }} />
          </div>
        </div>

        <div className="space-y-1">
          <ComparisonRow
            label="Goles Totales"
            homeValue={`${match.homeScore} goles`}
            awayValue={`${match.awayScore} goles`}
            homeNum={match.homeScore}
            awayNum={match.awayScore}
          />

          <ComparisonRow
            label="Eficacia en Tiro"
            homeValue={`${homeShotEff}% (${homeGoals}/${homeShots.length})`}
            awayValue={`${awayShotEff}% (${awayGoals}/${awayShots.length})`}
            homeNum={homeShotEff}
            awayNum={awayShotEff}
          />

          <ComparisonRow
            label="Lanzamientos 6m"
            homeValue={`${home6mGoals}/${home6mShots.length}`}
            awayValue={`${away6mGoals}/${away6mShots.length}`}
            homeNum={home6mGoals}
            awayNum={away6mGoals}
          />

          <ComparisonRow
            label="Lanzamientos 9m (Distancia)"
            homeValue={`${home9mGoals}/${home9mShots.length}`}
            awayValue={`${away9mGoals}/${away9mShots.length}`}
            homeNum={home9mGoals}
            awayNum={away9mGoals}
          />

          <ComparisonRow
            label="Penaltis 7m"
            homeValue={`${home7mGoals}/${home7mShots.length}`}
            awayValue={`${away7mGoals}/${away7mShots.length}`}
            homeNum={home7mGoals}
            awayNum={away7mGoals}
          />

          <ComparisonRow
            label="Contragolpes"
            homeValue={`${homeFbGoals}/${homeFbShots.length}`}
            awayValue={`${awayFbGoals}/${awayFbShots.length}`}
            homeNum={homeFbGoals}
            awayNum={awayFbGoals}
          />

          <ComparisonRow
            label="Pérdidas de Balón"
            homeValue={`${homeTurnovers}`}
            awayValue={`${awayTurnovers}`}
            homeNum={homeTurnovers}
            awayNum={awayTurnovers}
          />

          <ComparisonRow
            label="Exclusiones 2 Minutos"
            homeValue={`${home2m}`}
            awayValue={`${away2m}`}
            homeNum={home2m}
            awayNum={away2m}
          />
        </div>
      </div>

      {/* 6. Individual Player Box Score Table */}
      <PlayerStatsTable players={players} />
        </>
      )}
    </div>
  );
};
