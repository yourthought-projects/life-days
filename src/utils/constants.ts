import { Meta } from '../types/meta';

export const PRESET_GRADIENTS = [
  {
    id: 'gradient-sunset',
    nombre: 'Atardecer Dorado',
    clase: 'from-amber-600 via-rose-600 to-purple-800'
  },
  {
    id: 'gradient-neon',
    nombre: 'Cyber Indigo',
    clase: 'from-indigo-600 via-purple-600 to-pink-600'
  },
  {
    id: 'gradient-ocean',
    nombre: 'Océano Profundo',
    clase: 'from-cyan-600 via-blue-600 to-indigo-900'
  },
  {
    id: 'gradient-emerald',
    nombre: 'Esmeralda Aurora',
    clase: 'from-emerald-600 via-teal-700 to-slate-900'
  },
  {
    id: 'gradient-crimson',
    nombre: 'Fuego Carmesí',
    clase: 'from-orange-600 via-red-600 to-zinc-900'
  },
  {
    id: 'gradient-midnight',
    nombre: 'Medianoche Minimal',
    clase: 'from-zinc-800 via-zinc-900 to-black'
  }
];

export const METAS_INICIALES: Meta[] = [
  {
    id: 'meta-ejemplo-1',
    titulo: 'Leer 24 Libros este Año',
    tipo: 'numerica',
    valor_actual: 14,
    valor_objetivo: 24,
    unidad: 'libros',
    hitos: [],
    fecha_inicio: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    fecha_limite: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    fondo: 'from-amber-600 via-rose-600 to-purple-800'
  },
  {
    id: 'meta-ejemplo-2',
    titulo: 'Lanzar MVP de Startup SaaS',
    tipo: 'hitos',
    valor_actual: 3,
    valor_objetivo: 5,
    unidad: 'hitos',
    hitos: [
      { id: 'hito-1', texto: 'Definir propuesta de valor y modelo', completado: true },
      { id: 'hito-2', texto: 'Diseñar arquitectura y UI/UX', completado: true },
      { id: 'hito-3', texto: 'Construir Core funcional y Auth', completado: true },
      { id: 'hito-4', texto: 'Primeros 50 usuarios de prueba', completado: false },
      { id: 'hito-5', texto: 'Lanzamiento público en redes', completado: false }
    ],
    fecha_inicio: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    fecha_limite: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    fondo: 'from-indigo-600 via-purple-600 to-pink-600'
  }
];

