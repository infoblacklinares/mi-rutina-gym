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
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=90"
          alt="Athlete" fill className="object-cover object-center" unoptimized priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
      </div>

      <div className="relative flex flex-col flex-1 px-6 pb-10">
        <div className="pt-14 mb-auto">
          <Link href="/login" className="inline-flex items-center gap-2 text-neutral-400 text-sm">
            ← Volver
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Crear cuenta</h1>
          <p className="text-neutral-400 text-sm">Empezá a registrar tu progreso hoy.</p>
        </div>

        {done ? (
          <div className="rounded-3xl bg-[#D4FF00]/10 border border-[#D4FF00]/30 p-6 text-center">
            <p className="text-2xl mb-2">📧</p>
            <p className="text-[#D4FF00] font-bold mb-1">¡Cuenta creada!</p>
            <p className="text-neutral-400 text-sm">Revisá tu email para confirmar y luego iniciá sesión.</p>
            <Link href="/login" className="block mt-4 text-sm text-[#D4FF00] font-semibold">
              Ir al login →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email" required placeholder="Email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-4 text-white placeholder-neutral-500 outline-none focus:border-[#D4FF00] transition-colors"
            />
            <input
              type="password" required minLength={6} placeholder="Contraseña (mín. 6 caracteres)"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-4 text-white placeholder-neutral-500 outline-none focus:border-[#D4FF00] transition-colors"
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-between rounded-full bg-[#D4FF00] text-black font-bold text-base px-6 py-4 disabled:opacity-50"
            >
              <span>{loading ? "Creando..." : "Crear cuenta"}</span>
              <span className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">→</span>
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
