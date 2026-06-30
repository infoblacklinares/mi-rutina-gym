"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

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
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background athlete image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=90"
          alt="Athlete"
          fill
          className="object-cover object-center"
          unoptimized
          priority
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative flex flex-col flex-1 px-6 pb-10">
        {/* Logo */}
        <div className="pt-16 mb-auto">
          <div className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D4FF00] flex items-center justify-center">
              <span className="text-black font-black text-lg">M</span>
            </div>
            <span className="text-white font-black text-xl tracking-tight">MI RUTINA</span>
          </div>
        </div>

        {/* Hero text */}
        <div className="mb-8">
          <p className="text-[#D4FF00] text-sm font-semibold mb-2">Bienvenido a</p>
          <h1 className="text-5xl font-black text-white leading-none mb-3">
            MI<br />RUTINA
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Tu entrenamiento personal, día a día.<br />Registrá tu progreso y superate.
          </p>
        </div>

        {!showForm ? (
          /* Initial CTAs */
          <div className="space-y-3">
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-between rounded-full bg-[#D4FF00] text-black font-bold text-base px-6 py-4"
            >
              <span>Empezar ahora</span>
              <span className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">→</span>
            </button>
            <Link
              href="/signup"
              className="block w-full text-center rounded-full border border-white/20 text-white font-semibold text-base py-4"
            >
              Crear cuenta
            </Link>
          </div>
        ) : (
          /* Login form */
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email" required placeholder="Email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-4 text-white placeholder-neutral-500 outline-none focus:border-[#D4FF00] transition-colors"
            />
            <input
              type="password" required placeholder="Contraseña"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-4 text-white placeholder-neutral-500 outline-none focus:border-[#D4FF00] transition-colors"
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-between rounded-full bg-[#D4FF00] text-black font-bold text-base px-6 py-4 disabled:opacity-50"
            >
              <span>{loading ? "Ingresando..." : "Ingresar"}</span>
              <span className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center">→</span>
            </button>
            <p className="text-center text-sm text-neutral-500">
              ¿No tenés cuenta?{" "}
              <Link href="/signup" className="text-[#D4FF00] font-semibold">Registrate</Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
