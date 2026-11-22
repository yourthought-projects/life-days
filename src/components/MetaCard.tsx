import React, { useState } from 'react';
import { 
  Plus, 
  Check, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Calendar,
  Activity,
  Award
} from 'lucide-react';
import { Meta } from '../types/meta';
import { 
  calcularDiasRestantes, 
  calcularPorcentajeAvance, 
  calcularPorcentajeTiempo,
  calcularRitmo,
  formatoFechaCorta 
} from '../utils/date';

interface MetaCardProps {
  meta: Meta;
  onAvanzarUnToque: (meta: Meta) => void;
  onEditar: (meta: Meta) => void;
  onEliminar: (id: string) => void;
  onToggleHito?: (meta: Meta, hitoId: string) => void;
}

export const MetaCard: React.FC<MetaCardProps> = ({
  meta,
  onAvanzarUnToque,
  onEditar,
  onEliminar,
  onToggleHito
}) => {
  const [mostrarHitos, setMostrarHitos] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const diasRestantes = calcularDiasRestantes(meta.fecha_limite);
  const pctAvance = calcularPorcentajeAvance(meta);
  const pctTiempo = calcularPorcentajeTiempo(meta.fecha_inicio, meta.fecha_limite);
  const ritmo = calcularRitmo(meta);
  const completada = pctAvance >= 100;
  const vencida = diasRestantes < 0 && !completada;

  // Determinar el estilo del fondo: URL de imagen vs Clase degradado
  const esUrlImagen = meta.fondo.startsWith('http') || meta.fondo.startsWith('data:image');
  const estiloFondo = esUrlImagen
    ? { backgroundImage: `url(${meta.fondo})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;
  const claseFondo = !esUrlImagen ? `bg-gradient-to-br ${meta.fondo}` : 'bg-zinc-900';

  // Siguiente hito pendiente (para avance rápido)
  const siguienteHito = meta.tipo === 'hitos' 
    ? meta.hitos.find(h => !h.completado) 
    : null;

  return (
    <div className="relative group rounded-3xl overflow-hidden border border-zinc-800/80 shadow-2xl transition-all duration-300 hover:border-zinc-700/80 hover:shadow-amber-500/5 flex flex-col justify-between">
      {/* Capa de Fondo Dinámico */}
      <div 
        className={`absolute inset-0 ${claseFondo} transition-transform duration-500 group-hover:scale-105`} 
        style={estiloFondo}
      />
      {/* Overlay oscuro para garantizar alto contraste y legibilidad impecable */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/75 via-zinc-950/85 to-zinc-950/95 backdrop-blur-[2px]" />

      {/* Contenido Principal de la Tarjeta */}
      <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-between h-full min-h-[340px]">
        
        {/* Cabecera de la Tarjeta: Ritmo & Menú */}
        <div className="flex items-start justify-between gap-3">
          {/* Badge de Indicador de Ritmo */}
          <div className="flex flex-wrap items-center gap-2">
            <span 
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-sm ${ritmo.badgeBg}`}
              title={`Avance: ${pctAvance}% | Tiempo transcurrido: ${pctTiempo}%`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{ritmo.etiqueta}</span>
            </span>

            <span className="text-[11px] text-zinc-400 bg-zinc-900/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-zinc-800">
              {meta.tipo === 'numerica' ? 'Métrica Numérica' : `${meta.hitos.length} Hitos`}
            </span>
          </div>

          {/* Menú de Opciones */}
          <div className="relative">
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/80 transition-colors"
              aria-label="Opciones"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuAbierto && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setMenuAbierto(false)} 
                />
                <div className="absolute right-0 top-8 z-30 w-36 py-1 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-xl animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      setMenuAbierto(false);
                      onEditar(meta);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800 transition-colors text-left"
                  >
                    <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuAbierto(false);
                      onEliminar(meta.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Núcleo Estilo 'Big Day': Días Restantes y Título */}
        <div className="my-4">
          <div className="flex items-baseline gap-2">
            {completada ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <Award className="w-8 h-8" />
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">LOGRADA</span>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl sm:text-5xl font-black tracking-tight ${
                    vencida ? 'text-rose-500' : diasRestantes <= 7 ? 'text-amber-400' : 'text-white'
                  }`}>
                    {Math.abs(diasRestantes)}
                  </span>
                  <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                    {vencida ? 'Días Vencida' : diasRestantes === 0 ? 'Hoy es el día límite' : diasRestantes === 1 ? 'Día restante' : 'Días restantes'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Título de la Meta */}
          <h2 className="text-lg sm:text-xl font-bold text-white mt-2 line-clamp-2 leading-snug">
            {meta.titulo}
          </h2>

          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>Hasta el {formatoFechaCorta(meta.fecha_limite)}</span>
          </div>
        </div>

        {/* Sección de Progreso & Indicadores */}
        <div className="space-y-3">
          {/* Métricas de Avance */}
          <div className="flex items-center justify-between text-xs">
            <div className="text-zinc-300 font-medium">
              {meta.tipo === 'numerica' ? (
                <span>
                  <strong className="text-white text-sm">{meta.valor_actual}</strong>
                  <span className="text-zinc-400"> / {meta.valor_objetivo} {meta.unidad}</span>
                </span>
              ) : (
                <span>
                  <strong className="text-white text-sm">{meta.valor_actual}</strong>
                  <span className="text-zinc-400"> / {meta.valor_objetivo} hitos</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-amber-400">
                {pctAvance}%
              </span>
            </div>
          </div>

          {/* Barra de Progreso Integrada con Marcador de Tiempo */}
          <div className="relative w-full h-3 bg-zinc-800/90 rounded-full overflow-hidden p-0.5 border border-zinc-700/60">
            {/* Barra de Avance */}
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                completada 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                  : ritmo.estado === 'a-tiempo'
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-400'
                  : ritmo.estado === 'en-riesgo'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-rose-500 to-amber-600'
              }`}
              style={{ width: `${pctAvance}%` }}
            />

            {/* Marcador de Tiempo Transcurrido (Punto de Referencia Visual de Ritmo) */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white/70 shadow-sm pointer-events-none transform -translate-x-1/2"
              style={{ left: `${pctTiempo}%` }}
              title={`Tiempo transcurrido: ${pctTiempo}%`}
            />
          </div>

          {/* Comparativa Avance vs Tiempo */}
          <div className="flex justify-between text-[11px] text-zinc-400 pt-0.5">
            <span>Ritmo: Avance {pctAvance}%</span>
            <span>Tiempo transcurrido: {pctTiempo}%</span>
          </div>
        </div>

        {/* Sección de Acción Rápida (1 Toque) */}
        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex flex-col gap-2">
          {meta.tipo === 'numerica' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAvanzarUnToque(meta)}
                disabled={completada}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] ${
                  completada
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-lg shadow-amber-500/20'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>+1 {meta.unidad}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Siguiente Hito Rápido */}
              {siguienteHito ? (
                <div className="flex items-center justify-between gap-2 bg-zinc-900/90 border border-zinc-800/80 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <button
                      onClick={() => onAvanzarUnToque(meta)}
                      className="flex-shrink-0 w-6 h-6 rounded-lg border-2 border-amber-500/80 hover:bg-amber-500/20 flex items-center justify-center text-amber-400 transition-colors"
                      title="Marcar completado en 1 toque"
                    >
                      <Check className="w-3.5 h-3.5 opacity-0 hover:opacity-100" />
                    </button>
                    <div className="truncate">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block">Siguiente hito</span>
                      <p className="text-xs text-zinc-200 truncate">{siguienteHito.texto}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onAvanzarUnToque(meta)}
                    className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
                  >
                    Listo ✓
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Todos los hitos han sido completados</span>
                </div>
              )}

              {/* Botón para ver/ocultar todos los hitos */}
              {meta.hitos.length > 0 && (
                <button
                  onClick={() => setMostrarHitos(!mostrarHitos)}
                  className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 py-1 transition-colors"
                >
                  <span>{mostrarHitos ? 'Ocultar hitos' : `Ver todos (${meta.hitos.length})`}</span>
                  {mostrarHitos ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}

              {/* Lista Desplegable de Hitos con Checkbox individual */}
              {mostrarHitos && (
                <div className="space-y-1.5 pt-1 max-h-40 overflow-y-auto pr-1">
                  {meta.hitos.map((hito) => (
                    <div
                      key={hito.id}
                      onClick={() => onToggleHito && onToggleHito(meta, hito.id)}
                      className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs border transition-colors ${
                        hito.completado
                          ? 'bg-zinc-900/40 border-zinc-800/40 text-zinc-500 line-through'
                          : 'bg-zinc-900/80 border-zinc-800 text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                        hito.completado
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'border-zinc-600'
                      }`}>
                        {hito.completado && <Check className="w-3 h-3" />}
                      </div>
                      <span className="truncate flex-1">{hito.texto}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

