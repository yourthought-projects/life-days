import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Palette, Image as ImageIcon, Sparkles, Upload, Loader2, Check } from 'lucide-react';
import { Meta, TipoMeta, Hito } from '../types/meta';
import { PRESET_GRADIENTS } from '../utils/constants';
import { formatoFechaInput } from '../utils/date';
import { subirImagenFondo } from '../services/storageService';

interface MetaModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (metaData: Omit<Meta, 'id'>) => Promise<void>;
  metaParaEditar?: Meta | null;
}

type ModoFondo = 'degradado' | 'subir' | 'url';

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
  
  // Gestión de fondo
  const [modoFondo, setModoFondo] = useState<ModoFondo>('degradado');
  const [fondo, setFondo] = useState(PRESET_GRADIENTS[0].clase);
  const [urlPersonalizada, setUrlPersonalizada] = useState('');
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [imagenSubidaUrl, setImagenSubidaUrl] = useState<string | null>(null);
  
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (esUrl) {
        setModoFondo('url');
        setUrlPersonalizada(metaParaEditar.fondo);
        setImagenSubidaUrl(metaParaEditar.fondo);
      } else {
        setModoFondo('degradado');
      }
    } else {
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
      setModoFondo('degradado');
      setUrlPersonalizada('');
      setImagenSubidaUrl(null);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      return;
    }

    try {
      setSubiendoImagen(true);
      setError(null);
      const url = await subirImagenFondo(file);
      setImagenSubidaUrl(url);
      setFondo(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setSubiendoImagen(false);
    }
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

    let fondoFinal = fondo;
    if (modoFondo === 'url') {
      if (!urlPersonalizada.trim()) {
        setError('Por favor ingresa una URL de imagen válida o selecciona un degradado.');
        return;
      }
      fondoFinal = urlPersonalizada.trim();
    } else if (modoFondo === 'subir') {
      if (!imagenSubidaUrl) {
        setError('Por favor sube una imagen desde tu dispositivo o selecciona otra opción.');
        return;
      }
      fondoFinal = imagenSubidaUrl;
    }

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
            </div>

            {/* Selector de Modos de Fondo */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setModoFondo('degradado')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-[11px] font-medium transition-all ${
                  modoFondo === 'degradado'
                    ? 'bg-amber-500/15 border-amber-500/60 text-amber-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Degradados</span>
              </button>

              <button
                type="button"
                onClick={() => setModoFondo('subir')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-[11px] font-medium transition-all ${
                  modoFondo === 'subir'
                    ? 'bg-amber-500/15 border-amber-500/60 text-amber-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Subir Foto</span>
              </button>

              <button
                type="button"
                onClick={() => setModoFondo('url')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-[11px] font-medium transition-all ${
                  modoFondo === 'url'
                    ? 'bg-amber-500/15 border-amber-500/60 text-amber-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>URL Imagen</span>
              </button>
            </div>

            {/* Contenido según modo de fondo */}
            {modoFondo === 'degradado' && (
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

            {modoFondo === 'subir' && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => !subiendoImagen && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[100px] ${
                    subiendoImagen
                      ? 'border-amber-500/50 bg-amber-500/5'
                      : imagenSubidaUrl
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/60'
                  }`}
                >
                  {subiendoImagen ? (
                    <div className="flex flex-col items-center gap-2 text-amber-400">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-xs">Subiendo imagen al bucket de Supabase...</span>
                    </div>
                  ) : imagenSubidaUrl ? (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-xl bg-cover bg-center border border-zinc-700 flex-shrink-0"
                        style={{ backgroundImage: `url(${imagenSubidaUrl})` }}
                      />
                      <div className="text-left">
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Foto lista en Supabase Storage</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Haz clic para cambiar imagen</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-zinc-400">
                      <Upload className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-medium text-zinc-300">
                        Seleccionar imagen desde tu dispositivo
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        PNG, JPG o WebP (se almacena en el bucket goal-backgrounds)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {modoFondo === 'url' && (
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={urlPersonalizada}
                onChange={(e) => setUrlPersonalizada(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
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
              disabled={guardando || subiendoImagen}
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
