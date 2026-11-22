import React from 'react';
import { Search, SlidersHorizontal, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { FiltroEstado } from '../types/meta';

interface FilterBarProps {
  filtro: FiltroEstado;
  onCambiarFiltro: (filtro: FiltroEstado) => void;
  busqueda: string;
  onCambiarBusqueda: (busqueda: string) => void;
  totalMetas: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filtro,
  onCambiarFiltro,
  busqueda,
  onCambiarBusqueda,
  totalMetas
}) => {
  const tabs: { id: FiltroEstado; label: string; icon: React.ReactNode }[] = [
    { id: 'todas', label: 'Todas', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
    { id: 'activas', label: 'Activas', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'proximas', label: 'Próximas a vencer', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'completadas', label: 'Completadas', icon: <CheckCircle2 className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar meta u objetivo..."
            value={busqueda}
            onChange={(e) => onCambiarBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/50 transition-all"
          />
          {busqueda && (
            <button
              onClick={() => onCambiarBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Contador */}
        <div className="text-xs text-zinc-500 px-1 self-end sm:self-center">
          Mostrando <span className="text-zinc-300 font-medium">{totalMetas}</span> {totalMetas === 1 ? 'meta' : 'metas'}
        </div>
      </div>

      {/* Tabs de Filtro horizontales con scroll en móviles */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => {
          const activo = filtro === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onCambiarFiltro(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activo
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'bg-zinc-900/70 text-zinc-400 border border-zinc-800/80 hover:bg-zinc-800/60 hover:text-zinc-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

