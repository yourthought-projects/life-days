# Proyecto: LIFE DAYS (PWA de Metas y Objetivos)

## Stack Técnico
- React + Vite + Tailwind CSS v4 + lucide-react
- PWA: `vite-plugin-pwa` (offline-first, instalable en móvil)
- Persistencia inicial: `localStorage` (con capa de servicio separada para migrar luego a FastAPI/PostgreSQL)

## Reglas de Diseño
- Mobile-first, diseño minimalista, modo oscuro por defecto.
- Tarjetas visuales estilo "Big Day" pero enfocadas en progreso: fondo personalizable (imagen local/URL o degradado), días restantes grandes y barra de progreso integrada.

## Modelo de Datos (Meta)
- `id`: string (UUID)
- `titulo`: string
- `tipo`: "numerica" | "hitos"
- `valor_actual`: number
- `valor_objetivo`: number
- `unidad`: string (ej. "libros", "km", "%")
- `hitos`: Array<{ id: string, texto: string, completado: boolean }>
- `fecha_inicio`: ISO string
- `fecha_limite`: ISO string
- `fondo`: string (URL, base64 o clase de degradado)

## Funciones del MVP (Fase 1)
1. **Dashboard principal:** Grid de tarjetas con filtros (Activas, Completadas, Próximas a vencer).
2. **Indicador de ritmo:** Comparar `% de avance` vs `% de tiempo transcurrido`:
   - Verde: avance >= tiempo transcurrido
   - Amarillo: diferencia menor al 15%
   - Rojo: atrasado más del 15%
3. **Avance en 1 toque:** Botón rápido `+1` (para numéricas) o check rápido del siguiente hito directamente desde la tarjeta.
4. **CRUD completo:** Modal para crear, editar y eliminar metas.

## Instrucción inicial
Inicializa el proyecto con Vite + React + Tailwind en esta carpeta, configura `.gitignore`, estructura las carpetas (`components/`, `hooks/`, `services/`, `utils/`) y construye la Fase 1 funcional con 2 metas de ejemplo precargadas.
