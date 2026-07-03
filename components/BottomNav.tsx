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

  const item = (active: boolean) =>
    `flex flex-col items-center gap-1 ${active ? "text-[#0b3557]" : "text-[#9db0c3]"}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around px-6 pt-3 pb-4 bg-white/85 backdrop-blur-xl border-t border-[#e2e9f1]">
      <Link href="/" className={item(isHome)}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        <span className="text-[10px] font-semibold">Inicio</span>
      </Link>

      <Link href="/history" className={item(isHistory)}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
        </svg>
        <span className="text-[10px] font-semibold">Progreso</span>
      </Link>

      <button onClick={logout} className={item(false)}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
        </svg>
        <span className="text-[10px] font-semibold">Salir</span>
      </button>
    </nav>
  );
}
