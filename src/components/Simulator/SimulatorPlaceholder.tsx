import React, { useState } from 'react';
import { useHandball } from '../../context/HandballContext';
import { Cpu, BarChart2, Zap, Sliders, Info } from 'lucide-react';

export const SimulatorPlaceholder: React.FC = () => {
  const { team, match } = useHandball();

  const [simIterations, setSimIterations] = useState(1000);
  const [homeEfficiency, setHomeEfficiency] = useState(62);
  const [awayEfficiency, setAwayEfficiency] = useState(58);
  const [homeTurnoverPct, setHomeTurnoverPct] = useState(14);
  const [awayTurnoverPct, setAwayTurnoverPct] = useState(16);
  const [pacePossessions, setPacePossessions] = useState(54);

  const [simResults, setSimResults] = useState<{
    homeWins: number;
    awayWins: number;
    draws: number;
    avgHomeScore: number;
    avgAwayScore: number;
  } | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);

  const runQuickSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      let homeWins = 0;
      let awayWins = 0;
      let draws = 0;
      let totalHomeGoals = 0;
      let totalAwayGoals = 0;

      for (let i = 0; i < simIterations; i++) {
        let hGoals = 0;
        let aGoals = 0;

        // Simulate possessions
        for (let p = 0; p < pacePossessions; p++) {
          // Home possession
          if (Math.random() * 100 > homeTurnoverPct) {
            if (Math.random() * 100 < homeEfficiency) {
              hGoals++;
            }
          }

          // Away possession
          if (Math.random() * 100 > awayTurnoverPct) {
            if (Math.random() * 100 < awayEfficiency) {
              aGoals++;
            }
          }
        }

        totalHomeGoals += hGoals;
        totalAwayGoals += aGoals;

        if (hGoals > aGoals) homeWins++;
        else if (aGoals > hGoals) awayWins++;
        else draws++;
      }

      setSimResults({
        homeWins,
        awayWins,
        draws,
        avgHomeScore: Math.round((totalHomeGoals / simIterations) * 10) / 10,
        avgAwayScore: Math.round((totalAwayGoals / simIterations) * 10) / 10,
      });
      setIsSimulating(false);
    }, 250);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-400" /> Motor de Simulación Monte Carlo de Balonmano
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Modela matemáticamente el flujo posesión a posesión del partido variando efectividad de tiro, ritmo de juego y pérdidas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" /> Parámetros del Partido
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Número de Iteraciones:</span>
                <span className="text-purple-400 font-mono">{simIterations} partidos</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[500, 1000, 2500].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSimIterations(n)}
                    className={`py-1 rounded-lg text-xs font-bold border transition-colors ${
                      simIterations === n
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Ritmo de Posesiones:</span>
                <span className="text-purple-400 font-mono">{pacePossessions} por equipo</span>
              </div>
              <input
                type="range"
                min="40"
                max="70"
                value={pacePossessions}
                onChange={(e) => setPacePossessions(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-blue-400 block mb-2">{team.name} (Local)</span>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Eficacia de tiro:</span>
                    <span className="font-mono text-slate-200">{homeEfficiency}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    value={homeEfficiency}
                    onChange={(e) => setHomeEfficiency(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Ratio de pérdidas:</span>
                    <span className="font-mono text-slate-200">{homeTurnoverPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    value={homeTurnoverPct}
                    onChange={(e) => setHomeTurnoverPct(Number(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-rose-400 block mb-2">{match.awayTeam.name} (Rival)</span>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Eficacia de tiro:</span>
                    <span className="font-mono text-slate-200">{awayEfficiency}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    value={awayEfficiency}
                    onChange={(e) => setAwayEfficiency(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Ratio de pérdidas:</span>
                    <span className="font-mono text-slate-200">{awayTurnoverPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="35"
                    value={awayTurnoverPct}
                    onChange={(e) => setAwayTurnoverPct(Number(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={runQuickSimulation}
              disabled={isSimulating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>{isSimulating ? 'Simulando...' : `Simular ${simIterations} Partidos`}</span>
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-400" /> Resultados de la Proyección
            </h3>

            {simResults ? (
              <div className="space-y-6">
                {/* Score projection */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold block mb-2">
                    Marcador Promedio Estimado
                  </span>
                  <div className="text-4xl font-black text-white font-mono flex items-center justify-center gap-4">
                    <span className="text-blue-400">{simResults.avgHomeScore}</span>
                    <span className="text-slate-600">-</span>
                    <span className="text-rose-400">{simResults.avgAwayScore}</span>
                  </div>
                </div>

                {/* Win Probabilities */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/40">
                    <span className="text-xs text-slate-400 block mb-1">Victoria Local</span>
                    <span className="text-2xl font-black text-blue-400">
                      {Math.round((simResults.homeWins / simIterations) * 100)}%
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">{simResults.homeWins} partidos</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">Empate</span>
                    <span className="text-2xl font-black text-amber-400">
                      {Math.round((simResults.draws / simIterations) * 100)}%
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">{simResults.draws} partidos</span>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/40">
                    <span className="text-xs text-slate-400 block mb-1">Victoria Rival</span>
                    <span className="text-2xl font-black text-rose-400">
                      {Math.round((simResults.awayWins / simIterations) * 100)}%
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">{simResults.awayWins} partidos</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Cpu className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Configura los parámetros y pulsa "Simular" para proyectar resultados.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              En la Fase 4 integraremos el motor con los datos reales registrados de partidos y jugadores del plantel.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
