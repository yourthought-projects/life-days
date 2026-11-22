import React from 'react';
import { Target, Plus } from 'lucide-react';
import { FiltroEstado } from '../types/meta';

interface EmptyStateProps {
  filtro: FiltroEstado;
  busqueda: string;
  onCrearMeta: () => void;
  onResetFiltros: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  filtro,
  busqueda,
  onCrearMeta,
  onResetFiltros
}) => {
  if (busqueda) {
    return (
      <div className="text-center py-16 px-4 bg-zinc-900/40 rounded-3xl border border-zinc-800/80">
        <Target className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">Sin resultados</h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
          No encontramos metas que coincidan con "{busqueda}".
        </p>
        <button
          onClick={onResetFiltros}
          className="mt-4 px-4 py-2 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-colors"
        >
          Limpiar búsqueda
        </button>
      </div>
    );
  }

  if (filtro === 'completadas') {
    return (
      <div className="text-center py-16 px-4 bg-zinc-900/40 rounded-3xl border border-zinc-800/80">
        <Target className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">Aún no hay metas completadas</h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
          ¡Sigue avanzando paso a paso en tus metas activas para verlas aquí!
        </p>
      </div>
    );
  }

  if (filtro === 'proximas') {
    return (
      <div className="text-center py-16 px-4 bg-zinc-900/40 rounded-3xl border border-zinc-800/80">
        <Target className="w-12 h-12 text-emerald-500/70 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">¡Todo bajo control!</h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
          No tienes metas que venzan en los próximos 14 días.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-16 px-4 bg-zinc-900/40 rounded-3xl border border-zinc-800/80">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-4">
        <Target className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-white">Empieza a medir tus días</h3>
      <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
        Crea tu primera meta con cuenta regresiva visual y mantén el ritmo diario.
      </p>
      <button
        onClick={onCrearMeta}
        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-500/25 active:scale-95 transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>Crear mi primera meta</span>
      </button>
    </div>
  );
};

