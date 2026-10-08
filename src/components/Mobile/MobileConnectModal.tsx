import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Smartphone, Copy, Check, Globe } from 'lucide-react';

interface MobileConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileConnectModal: React.FC<MobileConnectModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [networkIp, setNetworkIp] = useState('192.168.1.8');
  const [port, setPort] = useState('5173');

  const mobileUrl = `http://${networkIp}:${port}`;

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        mobileUrl,
        {
          width: 220,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [isOpen, mobileUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Smartphone className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-black text-white">Conectar con tu Celular</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Controla la consola de juego, estadísticas y simulación en tiempo real desde la comodidad de tu móvil o tablet.
        </p>

        {/* QR Code Container */}
        <div className="my-5 p-4 bg-white rounded-2xl inline-block shadow-2xl mx-auto border-4 border-slate-800">
          <canvas ref={canvasRef} className="mx-auto block" />
        </div>

        {/* URL Box */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-left truncate mr-2">
            <Globe className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-mono text-xs font-bold text-slate-200 truncate">{mobileUrl}</span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 flex items-center gap-1 shrink-0 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Steps */}
        <div className="text-left bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 space-y-2 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <span>Asegúrate de que tu celular esté conectado a la <strong>misma red Wi-Fi</strong>.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <span>Abre la cámara de tu celular y <strong>escanea el código QR</strong> (o escribe la dirección en Chrome/Safari).</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <span>(Opcional) En el navegador de tu móvil, toca <em>"Añadir a pantalla de inicio"</em> para usarla a pantalla completa como una App nativa.</span>
          </div>
        </div>

        {/* Custom IP accordion */}
        <details className="mt-4 text-left">
          <summary className="text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer select-none">
            ⚙️ ¿Usas otra IP de red o zona Wi-Fi móvil?
          </summary>
          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800">
            <div className="col-span-2">
              <label className="text-[10px] text-slate-400 block mb-0.5">Dirección IP Local</label>
              <input
                type="text"
                value={networkIp}
                onChange={(e) => setNetworkIp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Puerto</label>
              <input
                type="text"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
              />
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};
