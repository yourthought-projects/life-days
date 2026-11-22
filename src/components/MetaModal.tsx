import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Palette, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Meta, TipoMeta, Hito } from '../types/meta';
import { PRESET_GRADIENTS } from '../utils/constants';
import { formatoFechaInput } from '../utils/date';

interface MetaModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (metaData: Omit<Meta, 'id'>) => Promise<void>;
  metaParaEditar?: Meta | null;
}

export const MetaModal: React.FC<MetaModalProps> = ({
  abierto,
  onCerrar,
  onGuardar,
  metaParaEditar
}) => {
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<TipoMeta>('numerica');
  const [valorActual, setValorActual] = useState<number>(0);
  const [valorObjetivo, setValorObjetivo] = useState<number>(10);
  const [unidad, setUnidad] = useState('unidades');
  const [hitos, setHitos] = useState<Hito[]>([]);
  const [nuevoHitoTexto, setNuevoHitoTexto] = useState('');
  const [fechaInicio, setFechaInicio] = useState(formatoFechaInput(new Date().toISOString()));
  const [fechaLimite, setFechaLimite] = useState(
    formatoFechaInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
  );
  const [fondo, setFondo] = useState(PRESET_GRADIENTS[0].clase);
  const [esUrlPersonalizada, setEsUrlPersonalizada] = useState(false);
  const [urlPersonalizada, setUrlPersonalizada] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (metaParaEditar) {
      setTitulo(metaParaEditar.titulo);
      setTipo(metaParaEditar.tipo);
      setValorActual(metaParaEditar.valor_actual);
      setValorObjetivo(metaParaEditar.valor_objetivo);
      setUnidad(metaParaEditar.unidad || 'unidades');
      setHitos(metaParaEditar.hitos || []);
      setFechaInicio(formatoFechaInput(metaParaEditar.fecha_inicio));
      setFechaLimite(formatoFechaInput(metaParaEditar.fecha_limite));
      setFondo(metaParaEditar.fondo);

      const esUrl = metaParaEditar.fondo.startsWith('http') || metaParaEditar.fondo.startsWith('data:image');
      setEsUrlPersonalizada(esUrl);
      if (esUrl) {
        setUrlPersonalizada(metaParaEditar.fondo);
      }
    } else {
      // Valores por defecto al crear
      setTitulo('');
      setTipo('numerica');
      setValorActual(0);
      setValorObjetivo(10);
      setUnidad('veces');
      setHitos([
        { id: '1', texto: 'Primer paso clave', completado: false },
        { id: '2', texto: 'Etapa intermedia', completado: false }
      ]);
      setFechaInicio(formatoFechaInput(new Date().toISOString()));
      setFechaLimite(formatoFechaInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()));
      setFondo(PRESET_GRADIENTS[0].clase);
      setEsUrlPersonalizada(false);
      setUrlPersonalizada('');
    }
    setError(null);
  }, [metaParaEditar, abierto]);

  if (!abierto) return null;

  const handleAgregarHito = () => {
    if (!nuevoHitoTexto.trim()) return;
    const nuevo: Hito = {
      id: `hito-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      texto: nuevoHitoTexto.trim(),
      completado: false
    };
    setHitos([...hitos, nuevo]);
    setNuevoHitoTexto('');
  };

  const handleEliminarHito = (id: string) => {
    setHitos(hitos.filter(h => h.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titulo.trim()) {
      setError('Por favor ingresa un título para la meta.');
      return;
    }

    if (!fechaLimite) {
      setError('Por favor define la fecha límite.');
      return;
    }

    if (tipo === 'numerica' && valorObjetivo <= 0) {
      setError('El valor objetivo debe ser mayor a 0.');
      return;
    }

    if (tipo === 'hitos' && hitos.length === 0) {
      setError('Debes agregar al menos un hito para esta meta.');
      return;
    }

    const fondoFinal = esUrlPersonalizada && urlPersonalizada.trim()
      ? urlPersonalizada.trim()
      : fondo;

    try {
      setGuardando(true);
      await onGuardar({
        titulo: titulo.trim(),
        tipo,
        valor_actual: tipo === 'numerica' ? Number(valorActual) : hitos.filter(h => h.completado).length,
        valor_objetivo: tipo === 'numerica' ? Number(valorObjetivo) : hitos.length,
        unidad: tipo === 'numerica' ? (unidad.trim() || 'unidades') : 'hitos',
        hitos: tipo === 'hitos' ? hitos : [],
        fecha_inicio: new Date(fechaInicio || Date.now()).toISOString(),
        fecha_limite: new Date(fechaLimite).toISOString(),
        fondo: fondoFinal
      });
      onCerrar();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar la meta');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Cabecera Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">
              {metaParaEditar ? 'Editar Meta' : 'Crear Nueva Meta'}
            </h3>
          </div>
          <button
            onClick={onCerrar}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Título del Objetivo
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Correr 500 km, Leer 20 libros, Crear app..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          {/* Tipo de Meta */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Tipo de Seguimiento
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipo('numerica')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                  tipo === 'numerica'
                    ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 shadow-sm'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Numérica (Ej. 10/24 libros)
              </button>
              <button
                type="button"
                onClick={() => setTipo('hitos')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                  tipo === 'hitos'
                    ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 shadow-sm'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Por Hitos (Lista de pasos)
              </button>
            </div>
          </div>

          {/* Campos Numéricos */}
          {tipo === 'numerica' ? (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Actual
                </label>
                <input
                  type="number"
                  min="0"
                  value={valorActual}
                  onChange={(e) => setValorActual(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white text-center focus:outline-none focus:border-amber-500/80"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Objetivo
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={valorObjetivo}
                  onChange={(e) => setValorObjetivo(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white text-center focus:outline-none focus:border-amber-500/80"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Unidad
                </label>
                <input
                  type="text"
                  placeholder="km, libros, %"
                  value={unidad}
                  onChange={(e) => setUnidad(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white text-center focus:outline-none focus:border-amber-500/80"
                />
              </div>
            </div>
          ) : (
            /* Sección de Hitos */
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Hitos / Pasos ({hitos.length})
              </label>

              {/* Agregar nuevo hito */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Agregar siguiente hito o etapa..."
                  value={nuevoHitoTexto}
                  onChange={(e) => setNuevoHitoTexto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAgregarHito();
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAgregarHito}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </button>
              </div>

              {/* Lista de hitos actuales */}
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {hitos.map((hito, idx) => (
                  <div
                    key={hito.id}
                    className="flex items-center justify-between gap-2 p-2 bg-zinc-950/70 border border-zinc-800/80 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2 flex-1 truncate">
                      <span className="text-zinc-500 text-[10px] w-4">{idx + 1}.</span>
                      <span className={hito.completado ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                        {hito.texto}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEliminarHito(hito.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Fecha Inicio
              </label>
              <input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-500/80"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Fecha Límite
              </label>
              <input
                type="date"
                required
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-500/80"
              />
            </div>
          </div>

          {/* Estilo Visual / Fondo */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Fondo y Estilo Visual
              </label>
              <button
                type="button"
                onClick={() => setEsUrlPersonalizada(!esUrlPersonalizada)}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                {esUrlPersonalizada ? (
                  <>
                    <Palette className="w-3 h-3" />
                    <span>Usar degradados</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3 h-3" />
                    <span>Usar imagen URL</span>
                  </>
                )}
              </button>
            </div>

            {esUrlPersonalizada ? (
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={urlPersonalizada}
                onChange={(e) => setUrlPersonalizada(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {PRESET_GRADIENTS.map((p) => {
                  const seleccionado = fondo === p.clase;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFondo(p.clase)}
                      className={`h-12 rounded-xl bg-gradient-to-r ${p.clase} p-1 text-[10px] font-semibold text-white flex items-center justify-center transition-all ${
                        seleccionado ? 'ring-2 ring-white scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {p.nombre}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 rounded-xl shadow-lg shadow-rose-500/25 active:scale-95 transition-all disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : metaParaEditar ? 'Guardar Cambios' : 'Crear Meta'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

