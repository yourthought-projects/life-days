import { useState, useEffect, useCallback } from 'react';
import { Meta, FiltroEstado } from '../types/meta';
import { metaService } from '../services/storageService';
import { calcularDiasRestantes, calcularPorcentajeAvance } from '../utils/date';
import confetti from 'canvas-confetti';

export function useMetas() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [filtro, setFiltro] = useState<FiltroEstado>('todas');
  const [busqueda, setBusqueda] = useState<string>('');

  const cargarMetas = useCallback(async () => {
    try {
      setCargando(true);
      const data = await metaService.obtenerMetas();
      setMetas(data);
    } catch (err) {
      console.error('Error cargando metas:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarMetas();
  }, [cargarMetas]);

  const dispararConfeti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const crearMeta = async (nueva: Omit<Meta, 'id'>) => {
    const creada = await metaService.crearMeta(nueva);
    setMetas(prev => [creada, ...prev]);
    return creada;
  };

  const editarMeta = async (id: string, updates: Partial<Meta>) => {
    const actualizada = await metaService.actualizarMeta(id, updates);
    setMetas(prev => prev.map(m => m.id === id ? actualizada : m));
    
    // Disparar confeti si se completó
    if (calcularPorcentajeAvance(actualizada) >= 100) {
      dispararConfeti();
    }
    return actualizada;
  };

  const eliminarMeta = async (id: string) => {
    await metaService.eliminarMeta(id);
    setMetas(prev => prev.filter(m => m.id !== id));
  };

  /**
   * Avance en 1 toque (+1 para numéricas o marcar próximo hito)
   */
  const avanzarEnUnToque = async (meta: Meta) => {
    if (meta.tipo === 'numerica') {
      const nuevoValor = meta.valor_actual + 1;
      const actualizada = await editarMeta(meta.id, { valor_actual: nuevoValor });
      if (nuevoValor >= meta.valor_objetivo) {
        dispararConfeti();
      }
      return actualizada;
    }

    if (meta.tipo === 'hitos') {
      // Encontrar el primer hito incompleto
      const indexPrimerIncompleto = meta.hitos.findIndex(h => !h.completado);
      if (indexPrimerIncompleto !== -1) {
        const nuevosHitos = [...meta.hitos];
        nuevosHitos[indexPrimerIncompleto] = {
          ...nuevosHitos[indexPrimerIncompleto],
          completado: true
        };
        const completados = nuevosHitos.filter(h => h.completado).length;
        const actualizada = await editarMeta(meta.id, {
          hitos: nuevosHitos,
          valor_actual: completados,
          valor_objetivo: nuevosHitos.length
        });
        if (completados >= nuevosHitos.length) {
          dispararConfeti();
        }
        return actualizada;
      }
    }
  };

  // Metas filtradas
  const metasFiltradas = metas.filter(meta => {
    const coincideBusqueda = meta.titulo.toLowerCase().includes(busqueda.toLowerCase());
    if (!coincideBusqueda) return false;

    const pct = calcularPorcentajeAvance(meta);
    const dias = calcularDiasRestantes(meta.fecha_limite);

    if (filtro === 'activas') {
      return pct < 100 && dias >= 0;
    }
    if (filtro === 'completadas') {
      return pct >= 100;
    }
    if (filtro === 'proximas') {
      // Próximas a vencer: no completadas y faltan 14 días o menos (o vencidas)
      return pct < 100 && dias <= 14;
    }
    return true;
  });

  return {
    metas,
    metasFiltradas,
    cargando,
    filtro,
    setFiltro,
    busqueda,
    setBusqueda,
    crearMeta,
    editarMeta,
    eliminarMeta,
    avanzarEnUnToque,
    recargar: cargarMetas
  };
}

