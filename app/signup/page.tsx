"use client";

import { useState } from "react";
import Link from "next/link";
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

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4"
      >
        <h1 className="text-xl font-bold">Crear cuenta</h1>

        {done ? (
          <p className="text-sm text-emerald-400">
            Revisá tu email para confirmar la cuenta y luego iniciá sesión.
          </p>
        ) : (
          <>
            <div className="space-y-1">
              <label className="text-sm text-neutral-400">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-neutral-400">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 outline-none focus:border-emerald-500"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-emerald-500 text-black font-semibold py-2 disabled:opacity-50"
            >
              {loading ? "Creando..." : "Crear cuenta"}
            </button>
          </>
        )}

        <p className="text-sm text-neutral-400 text-center">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-emerald-400">
            Iniciá sesión
          </Link>
        </p>
      </form>
    </main>
  );
}
