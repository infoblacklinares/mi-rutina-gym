"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const isHome = pathname === "/";
  const isHistory = pathname === "/history";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around px-6 py-4 bg-[#0d0d0d] border-t border-[#1c1c1c]">
      {/* Home */}
      <Link href="/" className="flex flex-col items-center gap-1">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${isHome ? "bg-[#D4FF00]" : "bg-[#1a1a1a]"}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${isHome ? "text-black" : "text-[#555]"}`}>
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        </div>
        <span className={`text-[10px] font-semibold ${isHome ? "text-[#D4FF00]" : "text-[#555]"}`}>Inicio</span>
      </Link>

      {/* Historial */}
      <Link href="/history" className="flex flex-col items-center gap-1">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${isHistory ? "bg-[#D4FF00]" : "bg-[#1a1a1a]"}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${isHistory ? "text-black" : "text-[#555]"}`}>
            <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
          </svg>
        </div>
        <span className={`text-[10px] font-semibold ${isHistory ? "text-[#D4FF00]" : "text-[#555]"}`}>Progreso</span>
      </Link>

      {/* Stats placeholder */}
      <Link href="/history" className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#555]">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
          </svg>
        </div>
        <span className="text-[10px] font-semibold text-[#555]">Stats</span>
      </Link>

      {/* Perfil / Logout */}
      <button onClick={logout} className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#555]">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <span className="text-[10px] font-semibold text-[#555]">Perfil</span>
      </button>
    </nav>
  );
}
