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
    <header
      className="sticky top-0 z-30 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 px-4 pb-3 sm:pb-4 safe-top transition-all w-full"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))' }}
    >
      <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        {/* Fila Principal: Logo y Acciones Rápidas */}
        <div className="flex items-center justify-between gap-2">
          {/* Marca / Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
              <div className="h-full w-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-2xl font-bold tracking-tight text-white whitespace-nowrap">
                  LIFE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">DAYS</span>
                </h1>
                <span className="hidden sm:inline-flex text-[9px] uppercase font-semibold px-1 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  PWA
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 truncate hidden xs:block">
                Metas, ritmo y cuenta regresiva
              </p>
            </div>
          </div>

          {/* Botones Móviles (< 640px): Ultra Compactos y shrink-0 para evitar desbordes */}
          <div className="flex items-center gap-1.5 sm:hidden shrink-0">
            {usuario ? (
              <button
                onClick={onCerrarSesion}
                className="flex items-center justify-center p-2 text-zinc-300 hover:text-rose-400 rounded-xl bg-zinc-900 border border-zinc-800 transition-colors shrink-0"
                title={`Cerrar sesión (${usuario.email})`}
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline text-[11px] font-medium ml-1">Salir</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-zinc-300 hover:text-amber-400 rounded-xl bg-zinc-900 border border-zinc-800 transition-colors shrink-0"
                title="Iniciar sesión"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px] font-medium">Entrar</span>
              </button>
            )}

            <button
              onClick={onOpenCrearModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-500/20 active:scale-95 transition-transform shrink-0"
              aria-label="Nueva meta"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">Nueva</span>
            </button>
          </div>
        </div>

        {/* Resumen de Métricas & Acciones Escritorio */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5">
          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-400 whitespace-nowrap">
              <span className="font-semibold text-white">{activas}</span>
              <span>Activas</span>
            </div>
            <div className="w-px h-3 bg-zinc-800" />
            <div className="flex items-center gap-1.5 text-emerald-400 whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-semibold text-white">{completadas}</span>
              <span className="text-zinc-400">Logradas</span>
            </div>
            {enRiesgo > 0 && (
              <>
                <div className="w-px h-3 bg-zinc-800" />
                <div className="flex items-center gap-1.5 text-amber-400 whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-semibold text-amber-300">{enRiesgo}</span>
                  <span className="text-zinc-400">Próximas</span>
                </div>
              </>
            )}
          </div>

          {/* Acciones de Escritorio (>= 640px) */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {usuario ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                <div className="flex items-center gap-1.5 text-xs text-zinc-300 bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-zinc-800 max-w-[170px] truncate">
                  <UserIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{usuario.email}</span>
                </div>
                <button
                  onClick={onCerrarSesion}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 border border-zinc-800/80 transition-colors shrink-0"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Iniciar Sesión</span>
              </button>
            )}

            <button
              onClick={onOpenCrearModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-medium text-sm shadow-lg shadow-rose-500/25 active:scale-95 transition-all shrink-0"
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
