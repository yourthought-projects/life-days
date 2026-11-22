import React, { useState } from 'react';
import { X, Lock, Mail, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onExito?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ abierto, onCerrar, onExito }) => {
  const [esRegistro, setEsRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  if (!abierto) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);

    if (!isSupabaseConfigured) {
      setError(
        'Supabase no está configurado en las variables de entorno. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env.'
      );
      return;
    }

    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setCargando(true);
      if (esRegistro) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password
        });
        if (signUpError) throw signUpError;
        setMensajeExito('¡Cuenta creada! Puedes iniciar sesión de inmediato.');
        setEsRegistro(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
        if (onExito) onExito();
        onCerrar();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar autenticación';
      if (msg.includes('Invalid login credentials')) {
        setError('Credenciales inválidas. Verifica tu correo y contraseña.');
      } else if (msg.includes('User already registered')) {
        setError('Este correo ya está registrado. Intenta iniciar sesión.');
      } else {
        setError(msg);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">
              {esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h3>
          </div>
          <button
            onClick={onCerrar}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificación si Supabase no está configurado */}
        {!isSupabaseConfigured && (
          <div className="m-6 mb-0 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="font-semibold block mb-0.5">Modo Local Activo</span>
              Para sincronizar en la nube, añade tus credenciales de Supabase en el archivo <code className="text-white font-mono bg-zinc-800 px-1 py-0.5 rounded">.env</code>.
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mensajeExito && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{mensajeExito}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 rounded-xl shadow-lg shadow-rose-500/25 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
          >
            {cargando ? 'Cargando...' : esRegistro ? 'Registrarse' : 'Iniciar Sesión'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setEsRegistro(!esRegistro);
                setError(null);
                setMensajeExito(null);
              }}
              className="text-xs text-zinc-400 hover:text-amber-400 transition-colors"
            >
              {esRegistro
                ? '¿Ya tienes una cuenta? Inicia sesión'
                : '¿No tienes cuenta? Regístrate gratis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

