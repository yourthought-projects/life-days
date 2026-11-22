import { Meta } from '../types/meta';
import { METAS_INICIALES } from '../utils/constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'life_days_metas_v1';

/**
 * Contrato de la capa de servicio de almacenamiento.
 */
export interface MetaStorageService {
  obtenerMetas(): Promise<Meta[]>;
  guardarMetas(metas: Meta[]): Promise<void>;
  crearMeta(meta: Omit<Meta, 'id'>): Promise<Meta>;
  actualizarMeta(id: string, updates: Partial<Meta>): Promise<Meta>;
  eliminarMeta(id: string): Promise<void>;
}

/**
 * Implementación con LocalStorage (Modo Offline / Invitado)
 */
export class LocalStorageMetaService implements MetaStorageService {
  async obtenerMetas(): Promise<Meta[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
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

/**
 * Implementación con Supabase (PostgreSQL + RLS + Storage)
 */
export class SupabaseMetaService implements MetaStorageService {
  async obtenerMetas(): Promise<Meta[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('fecha_limite', { ascending: true });

    if (error) {
      console.error('Error al obtener metas de Supabase:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(row => ({
      id: row.id,
      titulo: row.titulo,
      tipo: row.tipo,
      valor_actual: Number(row.valor_actual),
      valor_objetivo: Number(row.valor_objetivo),
      unidad: row.unidad,
      hitos: Array.isArray(row.hitos) ? row.hitos : [],
      fecha_inicio: row.fecha_inicio,
      fecha_limite: row.fecha_limite,
      fondo: row.fondo || ''
    }));
  }

  async guardarMetas(_metas: Meta[]): Promise<void> {
    // En Supabase cada operación se persiste individualmente mediante RLS
  }

  async crearMeta(nuevaMeta: Omit<Meta, 'id'>): Promise<Meta> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Debes iniciar sesión para crear metas sincronizadas en la nube.');
    }

    let actual = nuevaMeta.valor_actual;
    let objetivo = nuevaMeta.valor_objetivo;

    if (nuevaMeta.tipo === 'hitos') {
      objetivo = nuevaMeta.hitos.length;
      actual = nuevaMeta.hitos.filter(h => h.completado).length;
    }

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        titulo: nuevaMeta.titulo,
        tipo: nuevaMeta.tipo,
        valor_actual: actual,
        valor_objetivo: objetivo,
        unidad: nuevaMeta.unidad,
        hitos: nuevaMeta.hitos,
        fecha_inicio: nuevaMeta.fecha_inicio,
        fecha_limite: nuevaMeta.fecha_limite,
        fondo: nuevaMeta.fondo
      })
      .select()
      .single();

    if (error) {
      console.error('Error al insertar meta en Supabase:', error);
      throw error;
    }

    return {
      id: data.id,
      titulo: data.titulo,
      tipo: data.tipo,
      valor_actual: Number(data.valor_actual),
      valor_objetivo: Number(data.valor_objetivo),
      unidad: data.unidad,
      hitos: data.hitos || [],
      fecha_inicio: data.fecha_inicio,
      fecha_limite: data.fecha_limite,
      fondo: data.fondo
    };
  }

  async actualizarMeta(id: string, updates: Partial<Meta>): Promise<Meta> {
    const payload: Record<string, unknown> = {};

    if (updates.titulo !== undefined) payload.titulo = updates.titulo;
    if (updates.tipo !== undefined) payload.tipo = updates.tipo;
    if (updates.unidad !== undefined) payload.unidad = updates.unidad;
    if (updates.fecha_inicio !== undefined) payload.fecha_inicio = updates.fecha_inicio;
    if (updates.fecha_limite !== undefined) payload.fecha_limite = updates.fecha_limite;
    if (updates.fondo !== undefined) payload.fondo = updates.fondo;

    if (updates.hitos !== undefined) {
      payload.hitos = updates.hitos;
      payload.valor_objetivo = updates.hitos.length;
      payload.valor_actual = updates.hitos.filter(h => h.completado).length;
    } else {
      if (updates.valor_actual !== undefined) payload.valor_actual = updates.valor_actual;
      if (updates.valor_objetivo !== undefined) payload.valor_objetivo = updates.valor_objetivo;
    }

    const { data, error } = await supabase
      .from('goals')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar meta en Supabase:', error);
      throw error;
    }

    return {
      id: data.id,
      titulo: data.titulo,
      tipo: data.tipo,
      valor_actual: Number(data.valor_actual),
      valor_objetivo: Number(data.valor_objetivo),
      unidad: data.unidad,
      hitos: data.hitos || [],
      fecha_inicio: data.fecha_inicio,
      fecha_limite: data.fecha_limite,
      fondo: data.fondo
    };
  }

  async eliminarMeta(id: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar meta en Supabase:', error);
      throw error;
    }
  }
}

/**
 * Sube una imagen de fondo al bucket público 'goal-backgrounds'
 * Retorna la URL pública de la imagen o una representación en base64 si no hay sesión activa.
 */
export async function subirImagenFondo(archivo: File): Promise<string> {
  if (!isSupabaseConfigured) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(archivo);
    });
  }

  const { data: { user } } = await supabase.auth.getUser();

  // Si no está autenticado, usar base64 para previsualización local
  if (!user) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(archivo);
    });
  }

  // Nombre de archivo seguro y único por usuario
  const extension = archivo.name.split('.').pop() || 'jpg';
  const nombreLimpio = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
  const rutaArchivo = `${user.id}/${nombreLimpio}`;

  const { error: uploadError } = await supabase.storage
    .from('goal-backgrounds')
    .upload(rutaArchivo, archivo, {
      cacheControl: '3600',
      upsert: true
    });

  if (uploadError) {
    console.error('Error subiendo imagen a Supabase Storage:', uploadError);
    throw new Error(`Error al subir la imagen: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from('goal-backgrounds')
    .getPublicUrl(rutaArchivo);

  return data.publicUrl;
}

// Instancias de servicios
const localService = new LocalStorageMetaService();
const supabaseService = new SupabaseMetaService();

/**
 * Servicio unificado que selecciona automáticamente Supabase cuando el usuario está autenticado
 * o LocalStorage para modo offline / invitado.
 */
class UnifiedMetaService implements MetaStorageService {
  private async getActiveService(): Promise<MetaStorageService> {
    if (!isSupabaseConfigured) {
      return localService;
    }
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ? supabaseService : localService;
  }

  async obtenerMetas(): Promise<Meta[]> {
    const service = await this.getActiveService();
    return service.obtenerMetas();
  }

  async guardarMetas(metas: Meta[]): Promise<void> {
    const service = await this.getActiveService();
    return service.guardarMetas(metas);
  }

  async crearMeta(meta: Omit<Meta, 'id'>): Promise<Meta> {
    const service = await this.getActiveService();
    return service.crearMeta(meta);
  }

  async actualizarMeta(id: string, updates: Partial<Meta>): Promise<Meta> {
    const service = await this.getActiveService();
    return service.actualizarMeta(id, updates);
  }

  async eliminarMeta(id: string): Promise<void> {
    const service = await this.getActiveService();
    return service.eliminarMeta(id);
  }
}

export const metaService: MetaStorageService = new UnifiedMetaService();
