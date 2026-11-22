import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onConfirmar: () => void;
  tituloMeta: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  abierto,
  onCerrar,
  onConfirmar,
  tituloMeta
}) => {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-bold text-white">¿Eliminar meta?</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Esta acción eliminará definitivamente <strong className="text-zinc-200">"{tituloMeta}"</strong> y todo su historial de progreso.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onCerrar}
            className="flex-1 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirmar();
              onCerrar();
            }}
            className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/30 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

