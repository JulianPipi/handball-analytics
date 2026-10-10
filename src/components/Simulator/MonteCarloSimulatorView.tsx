import React, { useState, useEffect } from 'react';
import { useHandball } from '../../context/HandballContext';
import type { TeamTacticalParams, SimulationResult } from '../../utils/monteCarloEngine';
import { runMonteCarloSimulation } from '../../utils/monteCarloEngine';
import { PlayerRadarChart } from './PlayerRadarChart';
import { TacticalScenarioTester } from './TacticalScenarioTester';
import { Cpu, Zap, Sliders } from 'lucide-react';

export const MonteCarloSimulatorView: React.FC = () => {
  const { team, match, players } = useHandball();

  // Sub-tabs: 'monte_carlo' | 'what_if' | 'radar'
  const [subTab, setSubTab] = useState<'monte_carlo' | 'what_if' | 'radar'>('monte_carlo');

  // Mobile team parameters toggle
  const [mobileTeamTab, setMobileTeamTab] = useState<'home' | 'away'>('home');

  // Simulation parameters for Home
  const [homePace, setHomePace] = useState(54);
  const [homeShotEff, setHomeShotEff] = useState(64);
  const [homeTurnoverPct, setHomeTurnoverPct] = useState(13);
  const [homeGkSavePct, setHomeGkSavePct] = useState(34);
  const [homeIs7v6, setHomeIs7v6] = useState(false);

  // Simulation parameters for Away
  const [awayPace, setAwayPace] = useState(54);
  const [awayShotEff, setAwayShotEff] = useState(59);
  const [awayTurnoverPct, setAwayTurnoverPct] = useState(16);
  const [awayGkSavePct, setAwayGkSavePct] = useState(30);
  const [awayIs7v6, setAwayIs7v6] = useState(false);

  // Number of iterations
  const [iterations, setIterations] = useState<number>(2500);

  // Results
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const homeParams: TeamTacticalParams = {
    name: team.name,
    shortName: team.shortName,
    color: team.primaryColor,
    pacePossessions: homePace,
    turnoverRatePct: homeTurnoverPct,
    shotEfficiencyPct: homeShotEff,
    fastbreakSharePct: 18,
    fastbreakEfficiencyPct: 78,
    sixMeterSharePct: 46,
    sixMeterEfficiencyPct: 68,
    nineMeterSharePct: 36,
    nineMeterEfficiencyPct: 48,
    goalkeeperSaveRatePct: homeGkSavePct,
    twoMinuteRatePerGame: 3,
    is7v6Active: homeIs7v6,
  };

  const awayParams: TeamTacticalParams = {
    name: match.awayTeam.name,
    shortName: match.awayTeam.shortName,
    color: match.awayTeam.primaryColor,
    pacePossessions: awayPace,
    turnoverRatePct: awayTurnoverPct,
    shotEfficiencyPct: awayShotEff,
    fastbreakSharePct: 16,
    fastbreakEfficiencyPct: 75,
    sixMeterSharePct: 48,
    sixMeterEfficiencyPct: 65,
    nineMeterSharePct: 36,
    nineMeterEfficiencyPct: 45,
    goalkeeperSaveRatePct: awayGkSavePct,
    twoMinuteRatePerGame: 3.5,
    is7v6Active: awayIs7v6,
  };

  // Run initial simulation on mount
  useEffect(() => {
    handleRunSimulation();
  }, []);

  const handleSyncWithMatch = () => {
    const homeShots = match.events.filter((e) => e.type === 'shot' && e.teamId === match.homeTeam.id);
    const homeGoals = homeShots.filter((e) => e.shotOutcome === 'goal').length;
    const computedHomeEff = homeShots.length > 0 ? Math.round((homeGoals / homeShots.length) * 100) : 62;

    const homeTurnovers = match.events.filter((e) => e.type === 'turnover' && e.teamId === match.homeTeam.id).length;
    const homePoss = homeShots.length + homeTurnovers;
    const computedHomeTo = homePoss > 0 ? Math.round((homeTurnovers / homePoss) * 100) : 14;

    const awayShots = match.events.filter((e) => e.type === 'shot' && e.teamId === match.awayTeam.id);
    const awayGoals = awayShots.filter((e) => e.shotOutcome === 'goal').length;
    const localSaves = awayShots.filter((e) => e.shotOutcome === 'save').length;
    const computedHomeSave = (awayGoals + localSaves) > 0 ? Math.round((localSaves / (awayGoals + localSaves)) * 100) : 32;

    setHomeShotEff(Math.min(85, Math.max(40, computedHomeEff)));
    setHomeTurnoverPct(Math.min(30, Math.max(5, computedHomeTo)));
    setHomeGkSavePct(Math.min(50, Math.max(15, computedHomeSave)));

    setTimeout(handleRunSimulation, 50);
  };

  const applyPreset = (preset: 'balanced' | 'fast' | 'defensive') => {
    if (preset === 'balanced') {
      setHomePace(54); setHomeShotEff(62); setHomeTurnoverPct(12); setHomeGkSavePct(33);
      setAwayPace(54); setAwayShotEff(60); setAwayTurnoverPct(14); setAwayGkSavePct(30);
    } else if (preset === 'fast') {
      setHomePace(62); setHomeShotEff(66); setHomeTurnoverPct(15);
      setAwayPace(62); setAwayShotEff(62); setAwayTurnoverPct(17);
    } else if (preset === 'defensive') {
      setHomePace(46); setHomeGkSavePct(40); setAwayGkSavePct(36);
      setHomeTurnoverPct(10); setAwayTurnoverPct(12);
    }
    setTimeout(handleRunSimulation, 50);
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const res = runMonteCarloSimulation(homeParams, awayParams, iterations);
      setResult(res);
      setIsSimulating(false);
    }, 200);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Header with compact sub-tabs for mobile */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="w-full md:w-auto text-left">
          <h2 className="text-sm sm:text-base md:text-lg font-black text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400 shrink-0" />
            <span>Simulador Monte Carlo & Potenciales</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
            Modelado matemático posesión a posesión y análisis multidimensional de habilidades.
          </p>
        </div>

        {/* Sub-tab segmented control */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setSubTab('monte_carlo')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all text-center ${
              subTab === 'monte_carlo'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🎲 Simulación
          </button>

          <button
            type="button"
            onClick={() => setSubTab('what_if')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all text-center ${
              subTab === 'what_if'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🧪 Escenarios
          </button>

          <button
            type="button"
            onClick={() => setSubTab('radar')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all text-center ${
              subTab === 'radar'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🕸️ Radar
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: MONTE CARLO SIMULATOR */}
      {subTab === 'monte_carlo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Tactical Inputs Column */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-400" /> Parámetros de Simulación:
              </h3>
            </div>

                        {/* 1-Click Fast Presets */}
            <div className="space-y-1.5 bg-slate-950 p-2.5 rounded-2xl border border-purple-500/30">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block">
                ⚡ Modo Rápido (1 Clic):
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={handleSyncWithMatch}
                  className="py-1.5 px-2 rounded-xl text-[11px] font-black bg-purple-600 hover:bg-purple-500 text-white shadow transition-all truncate text-center"
                >
                  📊 Datos del Partido
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('balanced')}
                  className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all text-center"
                >
                  ⚖️ Equilibrado
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('fast')}
                  className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all text-center"
                >
                  🏃 Ritmo Rápido
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('defensive')}
                  className="py-1.5 px-2 rounded-xl text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all text-center"
                >
                  🛡️ Defensivo
                </button>
              </div>
            </div>

            {/* Iterations selector */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1">Muestra de Partidos:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[1000, 2500, 5000].map((it) => (
                  <button
                    key={it}
                    type="button"
                    onClick={() => setIterations(it)}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      iterations === it
                        ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {it.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Team Switcher (Compact UX win for mobile screens) */}
            <div className="flex sm:hidden p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setMobileTeamTab('home')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mobileTeamTab === 'home'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team.primaryColor }} />
                <span>{team.shortName || 'Local'}</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTeamTab('away')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mobileTeamTab === 'away'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: match.awayTeam.primaryColor }} />
                <span>{match.awayTeam.shortName || 'Rival'}</span>
              </button>
            </div>

            {/* Home Team Inputs (Always shown on desktop, conditionally on mobile) */}
            <div
              className={`p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 ${
                mobileTeamTab !== 'home' ? 'hidden sm:block' : 'block'
              }`}
            >
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team.primaryColor }} />
                  {team.name} (Local)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Equipo Propio</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                  <span>Ritmo de Posesiones:</span>
                  <span className="font-mono text-blue-400 font-bold">{homePace}</span>
                </div>
                <input
                  type="range"
                  min="42"
                  max="68"
                  value={homePace}
                  onChange={(e) => setHomePace(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                  <span>Eficacia de tiro:</span>
                  <span className="font-mono text-emerald-400 font-bold">{homeShotEff}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="85"
                  value={homeShotEff}
                  onChange={(e) => setHomeShotEff(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                  <span>Ratio de pérdidas:</span>
                  <span className="font-mono text-rose-400 font-bold">{homeTurnoverPct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={homeTurnoverPct}
                  onChange={(e) => setHomeTurnoverPct(Number(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                  <span>Paradas del portero:</span>
                  <span className="font-mono text-blue-400 font-bold">{homeGkSavePct}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="50"
                  value={homeGkSavePct}
                  onChange={(e) => setHomeGkSavePct(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-900">
                <span className="text-[11px] text-slate-400 font-semibold">Táctica 7v6:</span>
                <button
                  type="button"
                  onClick={() => setHomeIs7v6(!homeIs7v6)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                    homeIs7v6
                      ? 'bg-amber-600 border-amber-400 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  {homeIs7v6 ? '7v6 ACTIVO (Portería vacía)' : 'Regular 6v6'}
                </button>
              </div>
            </div>

            {/* Away Team Inputs (Always shown on desktop, conditionally on mobile) */}
            <div
              className={`p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 ${
                mobileTeamTab !== 'away' ? 'hidden sm:block' : 'block'
              }`}
            >
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: match.awayTeam.primaryColor }} />
                  {match.awayTeam.name} (Rival)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Equipo Oponente</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                  <span>Ritmo de Posesiones:</span>
                  <span className="font-mono text-rose-400 font-bold">{awayPace}</span>
                </div>
                <input
                  type="range"
                  min="42"
                  max="68"
                  value={awayPace}
                  onChange={(e) => setAwayPace(Number(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                  <span>Eficacia de tiro:</span>
                  <span className="font-mono text-emerald-400 font-bold">{awayShotEff}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="85"
                  value={awayShotEff}
                  onChange={(e) => setAwayShotEff(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                  <span>Ratio de pérdidas:</span>
                  <span className="font-mono text-rose-400 font-bold">{awayTurnoverPct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={awayTurnoverPct}
                  onChange={(e) => setAwayTurnoverPct(Number(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                  <span>Paradas del portero:</span>
                  <span className="font-mono text-blue-400 font-bold">{awayGkSavePct}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="50"
                  value={awayGkSavePct}
                  onChange={(e) => setAwayGkSavePct(Number(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-900">
                <span className="text-[11px] text-slate-400 font-semibold">Táctica 7v6 Rival:</span>
                <button
                  type="button"
                  onClick={() => setAwayIs7v6(!awayIs7v6)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                    awayIs7v6
                      ? 'bg-amber-600 border-amber-400 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  {awayIs7v6 ? '7v6 ACTIVO' : 'Regular 6v6'}
                </button>
              </div>
            </div>

            {/* Run Button */}
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>{isSimulating ? 'Simulando...' : `Ejecutar ${iterations.toLocaleString()} Iteraciones`}</span>
            </button>
          </div>

          {/* Results Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {result && (
              <>
                {/* 1. Projected Score & Most Frequent Score */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl text-center space-y-1.5">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest block">
                      Marcador Promedio Proyectado
                    </span>
                    <div className="text-3xl sm:text-4xl font-black font-mono text-white flex items-center justify-center gap-3">
                      <span className="text-blue-400">{result.avgHomeScore}</span>
                      <span className="text-slate-600">:</span>
                      <span className="text-rose-400">{result.avgAwayScore}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      En {result.iterations.toLocaleString()} partidos simulados
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl text-center space-y-1.5">
                    <span className="text-[10px] sm:text-xs font-bold text-purple-400 uppercase tracking-widest block">
                      Marcador Más Repetido
                    </span>
                    <div className="text-3xl sm:text-4xl font-black font-mono text-white flex items-center justify-center gap-3">
                      <span className="text-blue-400">{result.mostFrequentScore.home}</span>
                      <span className="text-slate-600">:</span>
                      <span className="text-rose-400">{result.mostFrequentScore.away}</span>
                    </div>
                    <span className="text-[10px] text-purple-300 font-semibold block">
                      Ocurrió en {result.mostFrequentScore.count} partidos
                    </span>
                  </div>
                </div>

                {/* 2. Win Probability Cards */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-blue-950/40 border border-blue-500/50 shadow-xl text-center space-y-0.5">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-300 block">Victoria Local</span>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-blue-400">{result.homeWinPct}%</div>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {result.homeWins} partidos
                    </span>
                  </div>

                  <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-xl text-center space-y-0.5">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-300 block">Empate</span>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">{result.drawPct}%</div>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {result.draws} partidos
                    </span>
                  </div>

                  <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-rose-950/40 border border-rose-500/50 shadow-xl text-center space-y-0.5">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-300 block">Victoria Rival</span>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400">{result.awayWinPct}%</div>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {result.awayWins} partidos
                    </span>
                  </div>
                </div>

                {/* 3. Goal Range & Extremes */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Rango Extremo de Goles Simulado:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <span className="font-bold text-blue-400 block mb-0.5">{team.name}</span>
                      <div className="text-slate-300">
                        Mínimo: <strong className="text-white font-mono">{result.minHomeScore}</strong> • Máximo:{' '}
                        <strong className="text-white font-mono">{result.maxHomeScore}</strong>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <span className="font-bold text-rose-400 block mb-0.5">{match.awayTeam.name}</span>
                      <div className="text-slate-300">
                        Mínimo: <strong className="text-white font-mono">{result.minAwayScore}</strong> • Máximo:{' '}
                        <strong className="text-white font-mono">{result.maxAwayScore}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: WHAT-IF SCENARIOS */}
      {subTab === 'what_if' && (
        <TacticalScenarioTester baseHomeParams={homeParams} baseAwayParams={awayParams} />
      )}

      {/* SUB-TAB 3: PLAYER RADAR & POTENTIAL */}
      {subTab === 'radar' && <PlayerRadarChart players={players} />}
    </div>
  );
};
