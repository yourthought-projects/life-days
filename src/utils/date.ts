import { Meta, RitmoInfo } from '../types/meta';

/**
 * Calcula los días restantes hasta la fecha límite.
 * Retorna número de días (negativo si ya venció).
 */
export function calcularDiasRestantes(fechaLimiteISO: string): number {
  const ahora = new Date();
  const limite = new Date(fechaLimiteISO);
  // Normalizar a medianoche para cálculo de días enteros
  ahora.setHours(0, 0, 0, 0);
  limite.setHours(0, 0, 0, 0);
  
  const diffTime = limite.getTime() - ahora.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calcula el total de días entre inicio y límite
 */
export function calcularDiasTotales(fechaInicioISO: string, fechaLimiteISO: string): number {
  const inicio = new Date(fechaInicioISO);
  const limite = new Date(fechaLimiteISO);
  const diffTime = Math.max(1, limite.getTime() - inicio.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calcula el porcentaje de avance numérico (0 a 100)
 */
export function calcularPorcentajeAvance(meta: Meta): number {
  if (meta.tipo === 'numerica') {
    if (meta.valor_objetivo <= 0) return 0;
    const pct = (meta.valor_actual / meta.valor_objetivo) * 100;
    return Math.min(100, Math.max(0, Math.round(pct)));
  }

  if (meta.tipo === 'hitos') {
    if (!meta.hitos || meta.hitos.length === 0) return 0;
    const completados = meta.hitos.filter(h => h.completado).length;
    const pct = (completados / meta.hitos.length) * 100;
    return Math.min(100, Math.max(0, Math.round(pct)));
  }

  return 0;
}

/**
 * Calcula el porcentaje de tiempo transcurrido (0 a 100)
 */
export function calcularPorcentajeTiempo(fechaInicioISO: string, fechaLimiteISO: string): number {
  const inicio = new Date(fechaInicioISO).getTime();
  const limite = new Date(fechaLimiteISO).getTime();
  const ahora = Date.now();

  if (limite <= inicio) return 100;
  if (ahora <= inicio) return 0;
  if (ahora >= limite) return 100;

  const pct = ((ahora - inicio) / (limite - inicio)) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
}

/**
 * Indicador de Ritmo según especificación:
 * Comparar % de avance vs % de tiempo transcurrido:
 * - Verde: avance >= tiempo transcurrido
 * - Amarillo: diferencia menor al 15% (tiempoTranscurrido - avance < 15%)
 * - Rojo: atrasado más del 15% (tiempoTranscurrido - avance >= 15%)
 */
export function calcularRitmo(meta: Meta): RitmoInfo {
  const avance = calcularPorcentajeAvance(meta);
  const tiempo = calcularPorcentajeTiempo(meta.fecha_inicio, meta.fecha_limite);
  const diasRestantes = calcularDiasRestantes(meta.fecha_limite);

  if (avance >= 100) {
    return {
      estado: 'a-tiempo',
      porcentajeAvance: avance,
      porcentajeTiempo: tiempo,
      diferencia: 0,
      etiqueta: '¡Completada!',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    };
  }

  if (diasRestantes < 0) {
    return {
      estado: 'atrasado',
      porcentajeAvance: avance,
      porcentajeTiempo: 100,
      diferencia: 100 - avance,
      etiqueta: 'Vencida',
      color: 'text-red-400',
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
  }

  // Diferencia de retraso (si es positivo, el tiempo va más rápido que el avance)
  const lag = tiempo - avance;

  if (avance >= tiempo) {
    return {
      estado: 'a-tiempo',
      porcentajeAvance: avance,
      porcentajeTiempo: tiempo,
      diferencia: lag,
      etiqueta: 'A tiempo',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    };
  }

  if (lag < 15) {
    return {
      estado: 'en-riesgo',
      porcentajeAvance: avance,
      porcentajeTiempo: tiempo,
      diferencia: lag,
      etiqueta: 'En riesgo',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    };
  }

  return {
    estado: 'atrasado',
    porcentajeAvance: avance,
    porcentajeTiempo: tiempo,
    diferencia: lag,
    etiqueta: 'Atrasado',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  };
}

/**
 * Formatear fecha para inputs date (YYYY-MM-DD)
 */
export function formatoFechaInput(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/**
 * Formatear fecha humana legible (ej: 15 Oct 2026)
 */
export function formatoFechaCorta(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return isoString;
  }
}

