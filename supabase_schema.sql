-- ========================================================
-- ESQUEMA SUPABASE: LIFE DAYS
-- ========================================================

-- 1. Crear tabla de metas (goals) compatible con el tipo Meta
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('numerica', 'hitos')),
  valor_actual NUMERIC NOT NULL DEFAULT 0,
  valor_objetivo NUMERIC NOT NULL DEFAULT 1,
  unidad TEXT NOT NULL DEFAULT 'unidades',
  hitos JSONB NOT NULL DEFAULT '[]'::jsonb,
  fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_limite TIMESTAMPTZ NOT NULL,
  fondo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices de consulta frecuente
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_fecha_limite ON public.goals(fecha_limite);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_goals_updated_at ON public.goals;
CREATE TRIGGER trigger_goals_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 2. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: cada usuario solo interactúa con sus propias metas
CREATE POLICY "Los usuarios pueden ver sus propias metas"
ON public.goals
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propias metas"
ON public.goals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias metas"
ON public.goals
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias metas"
ON public.goals
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 3. Configuración del Bucket de Storage: goal-backgrounds (Público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('goal-backgrounds', 'goal-backgrounds', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage para goal-backgrounds
-- Lectura pública para cualquier persona con el link
CREATE POLICY "Acceso público de lectura a fondos de metas"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'goal-backgrounds');

-- Los usuarios autenticados pueden subir fotos al bucket
CREATE POLICY "Usuarios autenticados pueden subir fondos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'goal-backgrounds');

-- Los usuarios autenticados pueden actualizar y eliminar archivos
CREATE POLICY "Usuarios autenticados pueden modificar sus fondos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'goal-backgrounds' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuarios autenticados pueden eliminar sus fondos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'goal-backgrounds' AND auth.uid()::text = (storage.foldername(name))[1]);

