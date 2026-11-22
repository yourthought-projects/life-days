import { useState } from 'react';
import { useMetas } from './hooks/useMetas';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { MetaCard } from './components/MetaCard';
import { MetaModal } from './components/MetaModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { EmptyState } from './components/EmptyState';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { AuthModal } from './components/AuthModal';
import { Meta } from './types/meta';

export function App() {
  const {
    metas,
    metasFiltradas,
    cargando,
    filtro,
    setFiltro,
    busqueda,
    setBusqueda,
    usuario,
    cerrarSesion,
    crearMeta,
    editarMeta,
    eliminarMeta,
    avanzarEnUnToque,
    recargar
  } = useMetas();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [authModalAbierto, setAuthModalAbierto] = useState(false);
  const [metaParaEditar, setMetaParaEditar] = useState<Meta | null>(null);
  const [metaParaEliminar, setMetaParaEliminar] = useState<Meta | null>(null);

  const handleAbrirCrear = () => {
    setMetaParaEditar(null);
    setModalAbierto(true);
  };

  const handleAbrirEditar = (meta: Meta) => {
    setMetaParaEditar(meta);
    setModalAbierto(true);
  };

  const handleGuardarMeta = async (metaData: Omit<Meta, 'id'>) => {
    if (metaParaEditar) {
      await editarMeta(metaParaEditar.id, metaData);
    } else {
      await crearMeta(metaData);
    }
  };

  const handleAbrirEliminar = (id: string) => {
    const meta = metas.find(m => m.id === id);
    if (meta) {
      setMetaParaEliminar(meta);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (metaParaEliminar) {
      await eliminarMeta(metaParaEliminar.id);
      setMetaParaEliminar(null);
    }
  };

  const handleToggleHito = async (meta: Meta, hitoId: string) => {
    const nuevosHitos = meta.hitos.map(h => 
      h.id === hitoId ? { ...h, completado: !h.completado } : h
    );
    const completados = nuevosHitos.filter(h => h.completado).length;
    await editarMeta(meta.id, {
      hitos: nuevosHitos,
      valor_actual: completados,
      valor_objetivo: nuevosHitos.length
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Banner de Instalación PWA si corresponde */}
      <PwaInstallBanner />

      {/* Header Fijo / Sticky */}
      <Header
        metas={metas}
        usuario={usuario}
        onOpenCrearModal={handleAbrirCrear}
        onOpenAuthModal={() => setAuthModalAbierto(true)}
        onCerrarSesion={cerrarSesion}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6">
        
        {/* Barra de Filtros y Búsqueda */}
        <FilterBar
          filtro={filtro}
          onCambiarFiltro={setFiltro}
          busqueda={busqueda}
          onCambiarBusqueda={setBusqueda}
          totalMetas={metasFiltradas.length}
        />

        {/* Dashboard Grid */}
        <div className="mt-6">
          {cargando ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-3xl bg-zinc-900/40 border border-zinc-800 animate-pulse p-6 flex flex-col justify-between"
                >
                  <div className="h-6 w-24 bg-zinc-800 rounded-full" />
                  <div className="space-y-3">
                    <div className="h-10 w-32 bg-zinc-800 rounded-xl" />
                    <div className="h-4 w-48 bg-zinc-800 rounded-lg" />
                  </div>
                  <div className="h-12 w-full bg-zinc-800 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : metasFiltradas.length === 0 ? (
            <EmptyState
              filtro={filtro}
              busqueda={busqueda}
              onCrearMeta={handleAbrirCrear}
              onResetFiltros={() => {
                setFiltro('todas');
                setBusqueda('');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metasFiltradas.map((meta) => (
                <MetaCard
                  key={meta.id}
                  meta={meta}
                  onAvanzarUnToque={avanzarEnUnToque}
                  onEditar={handleAbrirEditar}
                  onEliminar={handleAbrirEliminar}
                  onToggleHito={handleToggleHito}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Crear / Editar Meta */}
      <MetaModal
        abierto={modalAbierto}
        onCerrar={() => {
          setModalAbierto(false);
          setMetaParaEditar(null);
        }}
        onGuardar={handleGuardarMeta}
        metaParaEditar={metaParaEditar}
      />

      {/* Modal Confirmar Eliminación */}
      <DeleteConfirmModal
        abierto={!!metaParaEliminar}
        onCerrar={() => setMetaParaEliminar(null)}
        onConfirmar={handleConfirmarEliminar}
        tituloMeta={metaParaEliminar?.titulo || ''}
      />

      {/* Modal Autenticación Supabase */}
      <AuthModal
        abierto={authModalAbierto}
        onCerrar={() => setAuthModalAbierto(false)}
        onExito={() => recargar()}
      />
    </div>
  );
}

export default App;
