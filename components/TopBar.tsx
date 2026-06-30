"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function TopBar({ title }: { title: string }) {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 bg-neutral-950/90 backdrop-blur border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
      <Link href="/" className="font-bold text-emerald-400">
        {title}
      </Link>
      <nav className="flex items-center gap-4 text-sm text-neutral-400">
        <Link href="/" className="hover:text-white">
          Rutina
        </Link>
        <Link href="/history" className="hover:text-white">
          Historial
        </Link>
        <button onClick={logout} className="hover:text-white">
          Salir
        </button>
      </nav>
    </header>
  );
}
