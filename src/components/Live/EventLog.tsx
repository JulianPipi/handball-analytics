import React from 'react';
import { useHandball } from '../../context/HandballContext';
import { Undo2, History } from 'lucide-react';

export const EventLog: React.FC = () => {
  const { match, undoLastEvent } = useHandball();

  const formatMatchTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-full max-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-blue-400" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Línea de Tiempo ({match.events.length} eventos)
          </h4>
        </div>

        {match.events.length > 0 && (
          <button
            type="button"
            onClick={undoLastEvent}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 transition-colors border border-slate-700"
            title="Deshacer el último evento registrado"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Deshacer</span>
          </button>
        )}
      </div>

      {/* Events Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {match.events.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500">
            Aún no se han registrado eventos en este partido.
          </div>
        ) : (
          match.events.map((ev) => {
            const isHome = ev.teamId === match.homeTeam.id;
            const teamColor = isHome ? match.homeTeam.primaryColor : match.awayTeam.primaryColor;

            return (
              <div
                key={ev.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  {/* Timestamp */}
                  <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    {formatMatchTime(ev.matchTimeSeconds)}
                  </span>

                  {/* Team Dot */}
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: teamColor }}
                  />

                  {/* Description */}
                  <span className="text-slate-200 font-medium">{ev.description}</span>
                </div>

                {/* Score at that moment */}
                <div className="font-mono font-bold text-slate-400 ml-2 whitespace-nowrap bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                  {ev.scoreHomeAfter} - {ev.scoreAwayAfter}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
