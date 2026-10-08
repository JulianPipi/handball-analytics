import React, { useState } from 'react';
import type { TeamTacticalParams } from '../../utils/monteCarloEngine';
import { runMonteCarloSimulation } from '../../utils/monteCarloEngine';
import { Sliders, Zap } from 'lucide-react';

interface TacticalScenarioTesterProps {
  baseHomeParams: TeamTacticalParams;
  baseAwayParams: TeamTacticalParams;
}

export const TacticalScenarioTester: React.FC<TacticalScenarioTesterProps> = ({
  baseHomeParams,
  baseAwayParams,
}) => {
  // Adjusted scenario parameters
  const [use7v6, setUse7v6] = useState<boolean>(false);
  const [turnoverDelta, setTurnoverDelta] = useState<number>(-4); // -4% fewer turnovers
  const [shotEffDelta, setShotEffDelta] = useState<number>(4); // +4% better shooting
  const [paceDelta, setPaceDelta] = useState<number>(4); // +4 more possessions (faster pace)

  // Simulation results
  const [comparison, setComparison] = useState<{
    base: { avgHome: number; avgAway: number; winPct: number };
    adjusted: { avgHome: number; avgAway: number; winPct: number };
  } | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);

  const runComparison = () => {
    setIsSimulating(true);

    setTimeout(() => {
      // 1. Run Base simulation
      const baseResult = runMonteCarloSimulation(baseHomeParams, baseAwayParams, 1500);

      // 2. Run Adjusted simulation
      const adjustedHome: TeamTacticalParams = {
        ...baseHomeParams,
        is7v6Active: use7v6,
        turnoverRatePct: Math.max(5, baseHomeParams.turnoverRatePct + turnoverDelta),
        shotEfficiencyPct: Math.min(90, baseHomeParams.shotEfficiencyPct + shotEffDelta),
        pacePossessions: Math.max(40, baseHomeParams.pacePossessions + paceDelta),
      };

      const adjustedResult = runMonteCarloSimulation(adjustedHome, baseAwayParams, 1500);

      setComparison({
        base: {
          avgHome: baseResult.avgHomeScore,
          avgAway: baseResult.avgAwayScore,
          winPct: baseResult.homeWinPct,
        },
        adjusted: {
          avgHome: adjustedResult.avgHomeScore,
          avgAway: adjustedResult.avgAwayScore,
          winPct: adjustedResult.homeWinPct,
        },
      });

      setIsSimulating(false);
    }, 200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      <div>
        <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
          🧪 Laboratorio de Escenarios Tácticos ("¿Qué pasaría si...?")
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Modifica variables tácticas clave del equipo y comprueba en 1.500 simulaciones el impacto directo en la victoria.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scenario Controls */}
        <div className="space-y-5 bg-slate-950 p-5 rounded-2xl border border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-purple-400" /> Ajustes Tácticos a Testear:
          </h4>

          {/* 7v6 toggle */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Ataque con 7 vs 6 (Portería Vacía)</span>
              <span className="text-[11px] text-slate-400">
                +6% acierto en tiro por superioridad • 55% gol rival si hay pérdida
              </span>
            </div>
            <button
              type="button"
              onClick={() => setUse7v6(!use7v6)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                use7v6
                  ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                  : 'bg-slate-950 border-slate-700 text-slate-400'
              }`}
            >
              {use7v6 ? 'ACTIVADO' : 'DESACTIVADO'}
            </button>
          </div>

          {/* Turnovers delta */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Variación en Pérdidas de Balón:</span>
              <span className={`font-mono font-bold ${turnoverDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {turnoverDelta > 0 ? `+${turnoverDelta}%` : `${turnoverDelta}%`}
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="10"
              step="1"
              value={turnoverDelta}
              onChange={(e) => setTurnoverDelta(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {turnoverDelta < 0 ? 'Menos pérdidas = Más ataques completados' : 'Más pérdidas = Contraataques rivales'}
            </span>
          </div>

          {/* Shot efficiency delta */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Variación en Eficacia de Tiro:</span>
              <span className={`font-mono font-bold ${shotEffDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {shotEffDelta > 0 ? `+${shotEffDelta}%` : `${shotEffDelta}%`}
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="15"
              step="1"
              value={shotEffDelta}
              onChange={(e) => setShotEffDelta(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Pace delta */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Ritmo de Juego (Posesiones):</span>
              <span className="font-mono font-bold text-blue-400">
                {paceDelta > 0 ? `+${paceDelta}` : paceDelta} posesiones
              </span>
            </div>
            <input
              type="range"
              min="-8"
              max="10"
              step="2"
              value={paceDelta}
              onChange={(e) => setPaceDelta(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={runComparison}
            disabled={isSimulating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>{isSimulating ? 'Simulando Escenarios...' : 'Comparar Escenario Base vs Táctico'}</span>
          </button>
        </div>

        {/* Results Comparison */}
        <div className="space-y-4 flex flex-col justify-between">
          {comparison ? (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Impacto Proyectado en el Resultado:
              </h4>

              <div className="grid grid-cols-2 gap-4">
                {/* Base Card */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Escenario Base
                  </span>
                  <div className="text-2xl font-black font-mono text-white">
                    {comparison.base.avgHome} - {comparison.base.avgAway}
                  </div>
                  <div className="text-sm font-bold text-blue-400">
                    {comparison.base.winPct}% Vic.
                  </div>
                </div>

                {/* Adjusted Card */}
                <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/50 text-center space-y-2 shadow-xl shadow-purple-900/20">
                  <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block">
                    Escenario Ajustado
                  </span>
                  <div className="text-2xl font-black font-mono text-white">
                    {comparison.adjusted.avgHome} - {comparison.adjusted.avgAway}
                  </div>
                  <div className="text-sm font-bold text-emerald-400">
                    {comparison.adjusted.winPct}% Vic.
                  </div>
                </div>
              </div>

              {/* Delta Callout */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">Diagnóstico de la Simulación:</span>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>
                    • Diferencia en Probabilidad de Victoria:{' '}
                    <strong
                      className={
                        comparison.adjusted.winPct >= comparison.base.winPct
                          ? 'text-emerald-400 font-mono'
                          : 'text-rose-400 font-mono'
                      }
                    >
                      {comparison.adjusted.winPct >= comparison.base.winPct ? '+' : ''}
                      {Math.round((comparison.adjusted.winPct - comparison.base.winPct) * 10) / 10}%
                    </strong>
                  </p>
                  <p>
                    • Goles a Favor:{' '}
                    <strong className="text-white font-mono">
                      {Math.round((comparison.adjusted.avgHome - comparison.base.avgHome) * 10) / 10 >= 0 ? '+' : ''}
                      {Math.round((comparison.adjusted.avgHome - comparison.base.avgHome) * 10) / 10} goles
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-slate-500 space-y-2 my-auto">
              <Zap className="w-8 h-8 mx-auto opacity-40 text-purple-400" />
              <p className="text-xs">
                Ajusta las opciones a la izquierda y pulsa "Comparar" para ver la proyección matemática.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
