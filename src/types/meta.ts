export type TipoMeta = 'numerica' | 'hitos';

export interface Hito {
  id: string;
  texto: string;
  completado: boolean;
}

export interface Meta {
  id: string;
  titulo: string;
  tipo: TipoMeta;
  valor_actual: number;
  valor_objetivo: number;
  unidad: string;
  hitos: Hito[];
  fecha_inicio: string; // ISO string
  fecha_limite: string; // ISO string
  fondo: string; // URL, data URL o identificador/clase de degradado
}

export type RitmoEstado = 'a-tiempo' | 'en-riesgo' | 'atrasado';

export interface RitmoInfo {
  estado: RitmoEstado;
  porcentajeAvance: number;
  porcentajeTiempo: number;
  diferencia: number;
  etiqueta: string;
  color: string;
  badgeBg: string;
}

export type FiltroEstado = 'todas' | 'activas' | 'completadas' | 'proximas';

