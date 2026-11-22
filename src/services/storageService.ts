import { Meta } from '../types/meta';
import { METAS_INICIALES } from '../utils/constants';

const STORAGE_KEY = 'life_days_metas_v1';

/**
 * Contrato de la capa de servicio de almacenamiento.
 * Permite cambiar transparentemente de LocalStorage a FastAPI/PostgreSQL en el futuro.
 */
export interface MetaStorageService {
  obtenerMetas(): Promise<Meta[]>;
  guardarMetas(metas: Meta[]): Promise<void>;
  crearMeta(meta: Omit<Meta, 'id'>): Promise<Meta>;
  actualizarMeta(id: string, updates: Partial<Meta>): Promise<Meta>;
  eliminarMeta(id: string): Promise<void>;
}

class LocalStorageMetaService implements MetaStorageService {
  async obtenerMetas(): Promise<Meta[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        // Inicializar con las metas de ejemplo
        await this.guardarMetas(METAS_INICIALES);
        return METAS_INICIALES;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        await this.guardarMetas(METAS_INICIALES);
        return METAS_INICIALES;
      }
      return parsed;
    } catch (error) {
      console.error('Error al cargar metas desde localStorage:', error);
      return METAS_INICIALES;
    }
  }

  async guardarMetas(metas: Meta[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(metas));
    } catch (error) {
      console.error('Error al guardar metas en localStorage:', error);
      throw error;
    }
  }

  async crearMeta(nuevaMeta: Omit<Meta, 'id'>): Promise<Meta> {
    const metas = await this.obtenerMetas();
    const meta: Meta = {
      ...nuevaMeta,
      id: typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : `meta-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    // Si es por hitos, actualizar valor_actual y objetivo
    if (meta.tipo === 'hitos') {
      meta.valor_objetivo = meta.hitos.length;
      meta.valor_actual = meta.hitos.filter(h => h.completado).length;
    }

    const updated = [meta, ...metas];
    await this.guardarMetas(updated);
    return meta;
  }

  async actualizarMeta(id: string, updates: Partial<Meta>): Promise<Meta> {
    const metas = await this.obtenerMetas();
    const index = metas.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error(`Meta con id ${id} no encontrada`);
    }

    const metaActualizada = { ...metas[index], ...updates };

    if (metaActualizada.tipo === 'hitos' && updates.hitos) {
      metaActualizada.valor_objetivo = metaActualizada.hitos.length;
      metaActualizada.valor_actual = metaActualizada.hitos.filter(h => h.completado).length;
    }

    metas[index] = metaActualizada;
    await this.guardarMetas(metas);
    return metaActualizada;
  }

  async eliminarMeta(id: string): Promise<void> {
    const metas = await this.obtenerMetas();
    const filtered = metas.filter(m => m.id !== id);
    await this.guardarMetas(filtered);
  }
}

// Exportamos la instancia única del servicio actual (fácil de reemplazar por ApiMetaService)
export const metaService: MetaStorageService = new LocalStorageMetaService();

