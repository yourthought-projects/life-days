import React from 'react';
import { Plus, Flame, CheckCircle2, Clock, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { Meta } from '../types/meta';
import { calcularPorcentajeAvance, calcularDiasRestantes } from '../utils/date';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
  metas: Meta[];
  usuario: User | null;
  onOpenCrearModal: () => void;
  onOpenAuthModal: () => void;
  onCerrarSesion: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metas,
  usuario,
  onOpenCrearModal,
  onOpenAuthModal,
  onCerrarSesion
}) => {
  const total = metas.length;
  const completadas = metas.filter(m => calcularPorcentajeAvance(m) >= 100).length;
  const activas = total - completadas;
  const enRiesgo = metas.filter(m => {
    const pct = calcularPorcentajeAvance(m);
    const dias = calcularDiasRestantes(m.fecha_limite);
    return pct < 100 && dias <= 7;
  }).length;

  return (
    <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 sm:py-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        {/* Marca & Título */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="h-full w-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  LIFE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">DAYS</span>
                </h1>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  PWA
                </span>
              </div>
              <p className="text-xs text-zinc-400">Metas, ritmo de vida y cuenta regresiva</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:hidden">
            {usuario ? (
              <button
                onClick={onCerrarSesion}
                className="p-2 text-zinc-400 hover:text-rose-400 rounded-xl hover:bg-zinc-900 border border-zinc-800/80 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="p-2 text-zinc-300 hover:text-amber-400 rounded-xl hover:bg-zinc-900 border border-zinc-800/80 transition-colors"
                title="Iniciar sesión"
              >
                <LogIn className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onOpenCrearModal}
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-rose-500/20 active:scale-95 transition-transform"
              aria-label="Nueva meta"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resumen de Métricas & Acciones Escritorio */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5">
          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <span className="font-semibold text-white">{activas}</span>
              <span>Activas</span>
            </div>
            <div className="w-px h-3 bg-zinc-800" />
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-semibold text-white">{completadas}</span>
              <span className="text-zinc-400">Logradas</span>
            </div>
            {enRiesgo > 0 && (
              <>
                <div className="w-px h-3 bg-zinc-800" />
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-semibold text-amber-300">{enRiesgo}</span>
                  <span className="text-zinc-400">Próximas</span>
                </div>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-3">
            {usuario ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                <div className="flex items-center gap-1.5 text-xs text-zinc-300 bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-zinc-800 max-w-[170px] truncate">
                  <UserIcon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{usuario.email}</span>
                </div>
                <button
                  onClick={onCerrarSesion}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 border border-zinc-800/80 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Iniciar Sesión</span>
              </button>
            )}

            <button
              onClick={onOpenCrearModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-medium text-sm shadow-lg shadow-rose-500/25 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Meta</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
