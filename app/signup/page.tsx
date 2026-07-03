"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
  }

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[#0b3557] via-[#14487a] to-[#2a6db3]">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=90"
          alt="Atleta" fill className="object-cover object-center opacity-30 mix-blend-luminosity" unoptimized priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b3557] via-transparent to-[#0b3557]/60" />
      </div>

      <div className="relative flex flex-col flex-1 px-6 pb-8">
        <div className="pt-14">
          <Link href="/login" className="inline-flex items-center gap-2 text-white/70 text-sm">
            ← Volver
          </Link>
        </div>

        <div className="mt-auto mb-6">
          <h1 className="text-4xl font-bold text-white tracking-tight">Crear cuenta</h1>
          <p className="text-white/60 text-sm mt-2">Empezá a registrar tu progreso hoy.</p>
        </div>

        {done ? (
          <div className="glass-dark rounded-3xl p-6 text-center">
            <p className="text-3xl mb-2">📧</p>
            <p className="text-white font-semibold mb-1">¡Cuenta creada!</p>
            <p className="text-white/60 text-sm">Revisá tu email para confirmar y luego iniciá sesión.</p>
            <Link href="/login" className="inline-block mt-4 text-sm text-white font-semibold underline underline-offset-2">
              Ir al login →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email" required placeholder="Email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl glass-dark px-4 py-4 text-white placeholder-white/50 outline-none transition-colors"
            />
            <input
              type="password" required minLength={6} placeholder="Contraseña (mín. 6 caracteres)"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl glass-dark px-4 py-4 text-white placeholder-white/50 outline-none transition-colors"
            />
            {error && <p className="text-red-300 text-sm text-center">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full rounded-2xl bg-white text-[#0b3557] font-semibold text-base py-4 disabled:opacity-60 card-shadow"
            >
              {loading ? "Creando..." : "Crear cuenta"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
