"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import GoogleButton from "@/components/GoogleButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[#0a0f14] via-[#0d141b] to-[#10312a]">
      {/* Athlete image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=90"
          alt="Atleta"
          fill
          className="object-cover object-center opacity-40 mix-blend-luminosity"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f14] via-transparent to-[#0a0f14]/60" />
      </div>

      <div className="relative flex flex-col flex-1 px-6 pb-8">
        {/* Logo */}
        <div className="pt-14 flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3c3 3 3 15 0 18M3 12h18" strokeLinecap="round" />
          </svg>
          <span className="text-white font-semibold text-xl tracking-tight">Mi Rutina</span>
        </div>

        {/* Hero text */}
        <div className="mt-auto mb-6">
          <h1 className="text-[42px] leading-[1.05] font-bold text-white tracking-tight">
            ENTRENÁ<br />CON MÉTODO
          </h1>
          <p className="text-white/60 text-sm mt-2">Tu compañero de entrenamiento definitivo</p>
        </div>

        {/* Glass stat cards */}
        <div className="flex gap-3 mb-6">
          <div className="glass-dark rounded-3xl px-5 py-4 flex-1">
            <p className="text-3xl font-bold text-white">6</p>
            <p className="text-white/70 text-xs mt-1">Días de rutina</p>
          </div>
          <div className="glass-dark rounded-3xl px-5 py-4 flex-1">
            <p className="text-3xl font-bold text-white">36+</p>
            <p className="text-white/70 text-xs mt-1">Ejercicios guiados</p>
          </div>
        </div>

        {!showForm ? (
          <div className="space-y-3">
            <GoogleButton />
            <button
              onClick={() => setShowForm(true)}
              className="w-full rounded-full bg-[#2dd4bf] text-[#04211c] font-bold text-base py-4 card-shadow"
            >
              Entrar con email
            </button>
            <Link
              href="/signup"
              className="block w-full text-center rounded-2xl border border-white/30 text-white font-medium text-base py-4"
            >
              Crear cuenta
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email" required placeholder="Email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl glass-dark px-4 py-4 text-white placeholder-white/50 outline-none focus:border-white/60 transition-colors"
            />
            <input
              type="password" required placeholder="Contraseña"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl glass-dark px-4 py-4 text-white placeholder-white/50 outline-none focus:border-white/60 transition-colors"
            />
            {error && <p className="text-red-300 text-sm text-center">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full rounded-full bg-[#2dd4bf] text-[#04211c] font-bold text-base py-4 disabled:opacity-60 card-shadow"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
            <p className="text-center text-sm text-white/60">
              ¿No tenés cuenta?{" "}
              <Link href="/signup" className="text-white font-semibold underline underline-offset-2">Registrate</Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
