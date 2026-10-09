import React, { useState } from 'react';
import type { Player, Position, Handedness } from '../../types/handball';
import { POSITION_LABELS } from '../../types/handball';
import { useHandball } from '../../context/HandballContext';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedPlayerRow {
  number: number;
  name: string;
  position: Position;
  handedness: Handedness;
  goals: number;
  shots: number;
  saves: number;
  shotsFaced: number;
  assists: number;
  twoMinutes: number;
  rawText: string;
  isValid: boolean;
  error?: string;
}

const NORMALIZE_POSITION = (pos: string): Position => {
  const p = pos.toUpperCase().trim();
  if (['GK', 'POR', 'ARQ', 'ARQUERO', 'PORTERO', 'GOALKEEPER', '1'].includes(p)) return 'GK';
  if (['LW', 'EI', 'EXTREMO IZQUIERDO', 'EXTREMO IZQ', 'EXT_IZQ', 'LEFT WING'].includes(p)) return 'LW';
  if (['LB', 'LI', 'LATERAL IZQUIERDO', 'LATERAL IZQ', 'LAT_IZQ', 'LEFT BACK'].includes(p)) return 'LB';
  if (['CB', 'CEN', 'CENTRAL', 'CENTER BACK'].includes(p)) return 'CB';
  if (['RB', 'LD', 'LATERAL DERECHO', 'LATERAL DER', 'LAT_DER', 'RIGHT BACK'].includes(p)) return 'RB';
  if (['RW', 'ED', 'EXTREMO DERECHO', 'EXTREMO DER', 'EXT_DER', 'RIGHT WING'].includes(p)) return 'RW';
  if (['PV', 'PIV', 'PIVOTE', 'PIVOT'].includes(p)) return 'PV';
  return 'CB'; // Default fallback
};

const NORMALIZE_HAND = (hand: string): Handedness => {
  const h = hand.toLowerCase().trim();
  if (['z', 'zurdo', 'zurda', 'left', 'izq', 'izquierda'].includes(h)) return 'left';
  return 'right';
};

const SAMPLE_CSV = `dorsal,nombre,posicion,mano,goles,tiros,paradas,recibidos
1,Gonzalo Pérez de Vargas,GK,diestro,0,0,18,42
7,Valero Rivera,LW,diestro,8,10,0,0
9,Dika Mem,RB,zurdo,7,11,0,0
10,Diego Simonet,CB,diestro,6,9,0,0
18,Ludovic Fabregas,PV,diestro,5,6,0,0
24,Aleix Gómez,RW,zurdo,6,7,0,0
33,Nikola Karabatic,LB,diestro,4,7,0,0
12,Rodrigo Corrales,GK,diestro,0,0,12,30`;

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose }) => {
  const { team, importPlayersBulk } = useHandball();
  const [inputText, setInputText] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parsedRows, setParsedRows] = useState<ParsedPlayerRow[]>([]);
  const [errorCount, setErrorCount] = useState(0);

  if (!isOpen) return null;

  // Process text whenever input changes
  const handleParse = (text: string) => {
    setInputText(text);
    if (!text.trim()) {
      setParsedRows([]);
      setErrorCount(0);
      return;
    }

    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const results: ParsedPlayerRow[] = [];
    let errors = 0;

    lines.forEach((line, index) => {
      // Check if it is a header row
      const lower = line.toLowerCase();
      if (
        index === 0 &&
        (lower.includes('nombre') || lower.includes('dorsal') || lower.includes('posicion') || lower.includes('name'))
      ) {
        return; // skip header
      }

      // Detect separator: Tab, Semicolon, or Comma
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else if (line.includes(';')) {
        parts = line.split(';');
      } else {
        parts = line.split(',');
      }
      parts = parts.map((p) => p.trim());

      if (parts.length < 2) {
        errors++;
        results.push({
          number: 0,
          name: line,
          position: 'CB',
          handedness: 'right',
          goals: 0,
          shots: 0,
          saves: 0,
          shotsFaced: 0,
          assists: 0,
          twoMinutes: 0,
          rawText: line,
          isValid: false,
          error: 'Faltan datos (mínimo dorsal y nombre)',
        });
        return;
      }

      // Check if part 0 is number or name
      let dorsalNum = parseInt(parts[0], 10);
      let playerName = '';
      let posStr = '';
      let handStr = 'diestro';
      let goals = 0;
      let shots = 0;
      let saves = 0;
      let faced = 0;

      if (!isNaN(dorsalNum)) {
        // Col 0 is dorsal, Col 1 is name
        playerName = parts[1] || 'Jugador';
        posStr = parts[2] || 'CB';
        handStr = parts[3] || 'diestro';
        goals = parseInt(parts[4] || '0', 10) || 0;
        shots = parseInt(parts[5] || '0', 10) || goals;
        saves = parseInt(parts[6] || '0', 10) || 0;
        faced = parseInt(parts[7] || '0', 10) || saves;
      } else {
        // Col 0 is name, Col 1 is dorsal
        playerName = parts[0];
        dorsalNum = parseInt(parts[1], 10);
        posStr = parts[2] || 'CB';
        handStr = parts[3] || 'diestro';
        goals = parseInt(parts[4] || '0', 10) || 0;
        shots = parseInt(parts[5] || '0', 10) || goals;
        saves = parseInt(parts[6] || '0', 10) || 0;
        faced = parseInt(parts[7] || '0', 10) || saves;
      }

      if (isNaN(dorsalNum) || dorsalNum <= 0 || dorsalNum > 99) {
        errors++;
        results.push({
          number: 0,
          name: playerName,
          position: 'CB',
          handedness: 'right',
          goals: 0,
          shots: 0,
          saves: 0,
          shotsFaced: 0,
          assists: 0,
          twoMinutes: 0,
          rawText: line,
          isValid: false,
          error: 'Dorsal inválido (debe ser 1 a 99)',
        });
        return;
      }

      const normalizedPos = NORMALIZE_POSITION(posStr);
      const normalizedHand = NORMALIZE_HAND(handStr);

      results.push({
        number: dorsalNum,
        name: playerName,
        position: normalizedPos,
        handedness: normalizedHand,
        goals,
        shots,
        saves,
        shotsFaced: faced,
        assists: 0,
        twoMinutes: 0,
        rawText: line,
        isValid: true,
      });
    });

    setParsedRows(results);
    setErrorCount(errors);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        handleParse(text);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_jugadores_handball.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadSample = () => {
    handleParse(SAMPLE_CSV);
  };

  const handleConfirmImport = () => {
    const validPlayers = parsedRows.filter((r) => r.isValid);
    if (validPlayers.length === 0) return;

    const finalPlayers: Player[] = validPlayers.map((r, i) => ({
      id: `bulk-${Date.now()}-${i}-${r.number}`,
      teamId: team.id,
      name: r.name,
      number: r.number,
      position: r.position,
      handedness: r.handedness,
      isActive: true,
      stats: {
        goals: r.goals,
        shots: r.shots,
        assists: r.assists,
        turnovers: 0,
        steals: 0,
        saves: r.saves,
        shotsFaced: r.shotsFaced,
        twoMinutes: r.twoMinutes,
        yellowCards: 0,
        redCards: 0,
        plusMinus: 0,
        timeOnCourtSeconds: 0,
      },
    }));

    importPlayersBulk(finalPlayers, importMode === 'replace');
    onClose();
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Carga Masiva de Jugadores</h2>
              <p className="text-xs text-slate-400">
                Importa planillas desde Excel, Google Sheets, archivos CSV o texto copiado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex flex-wrap items-center gap-2">
              <label className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-2 transition-all">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Subir archivo .CSV</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-2 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Descargar Plantilla CSV</span>
              </button>

              <button
                onClick={handleLoadSample}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center space-x-2 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Cargar Ejemplo de Prueba</span>
              </button>
            </div>

            <div className="text-xs text-slate-400">
              Formato: <code className="text-blue-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">Dorsal, Nombre, Posición, Mano</code>
            </div>
          </div>

          {/* Textarea Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Pegar texto o filas de Excel/Sheets:</span>
              </label>
              {parsedRows.length > 0 && (
                <span className="text-xs font-bold text-slate-400">
                  {validCount} válidos {errorCount > 0 && <span className="text-rose-400">({errorCount} con error)</span>}
                </span>
              )}
            </div>
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => handleParse(e.target.value)}
              placeholder="Pega aquí tus datos. Ejemplo:&#10;10, Diego Simonet, CB, diestro&#10;7, Valero Rivera, LW, diestro&#10;1, Gonzalo Pérez, GK, diestro"
              className="w-full bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-emerald-500 placeholder-slate-600 resize-y"
            />
          </div>

          {/* Preview Section */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Previsualización ({validCount} jugadores listos para importar)
                </h3>
                <div className="flex items-center space-x-4 text-xs font-semibold">
                  <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-emerald-500 focus:ring-0"
                    />
                    <span>Añadir al plantel actual</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer text-rose-300">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-rose-500 focus:ring-0"
                    />
                    <span>Reemplazar todo el plantel</span>
                  </label>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto bg-slate-950/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase font-black text-[10px] sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Nombre</th>
                      <th className="py-2 px-3">Puesto</th>
                      <th className="py-2 px-3">Mano</th>
                      <th className="py-2 px-3">Goles/Tiros</th>
                      <th className="py-2 px-3">Paradas</th>
                      <th className="py-2 px-3 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-slate-800/30' : 'bg-rose-950/20'}>
                        <td className="py-2 px-3 font-mono font-bold text-white">
                          {row.isValid ? `#${row.number}` : '-'}
                        </td>
                        <td className="py-2 px-3 font-medium text-white">{row.name}</td>
                        <td className="py-2 px-3">
                          {row.isValid ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-900/40 text-blue-300 border border-blue-800/40">
                              {POSITION_LABELS[row.position].short} ({POSITION_LABELS[row.position].name})
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {row.isValid ? (
                            <span className={`text-[10px] font-semibold ${row.handedness === 'left' ? 'text-amber-400' : 'text-slate-400'}`}>
                              {row.handedness === 'left' ? 'Zurdo' : 'Diestro'}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-400">
                          {row.goals}/{row.shots}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-400">
                          {row.position === 'GK' ? `${row.saves}/${row.shotsFaced}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {row.isValid ? (
                            <span className="inline-flex items-center text-emerald-400 gap-1 font-bold text-[10px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-rose-400 gap-1 font-bold text-[10px]" title={row.error}>
                              <AlertTriangle className="w-3.5 h-3.5" /> {row.error}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Guide / Instructions */}
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/70 text-xs text-slate-400 space-y-1.5">
            <h4 className="font-bold text-slate-300 flex items-center space-x-1.5">
              <span>💡 Puestos admitidos:</span>
            </h4>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800"><strong className="text-blue-400">GK / POR</strong> (Arquero)</span>
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800"><strong className="text-blue-400">CB / CEN</strong> (Central)</span>
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800"><strong className="text-blue-400">LB / LI</strong> (Lat. Izq)</span>
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800"><strong className="text-blue-400">RB / LD</strong> (Lat. Der)</span>
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800"><strong className="text-blue-400">LW / EI</strong> (Ext. Izq)</span>
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800"><strong className="text-blue-400">RW / ED</strong> (Ext. Der)</span>
              <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800"><strong className="text-blue-400">PV / PIV</strong> (Pivote)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={validCount === 0}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg flex items-center space-x-2 transition-all ${
              validCount > 0
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {importMode === 'replace' ? 'Reemplazar y Cargar' : 'Importar'} {validCount} Jugadores
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
