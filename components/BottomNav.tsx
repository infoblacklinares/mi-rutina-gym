"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const DUMBBELL = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/>
  </svg>
);

const CHART = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
  </svg>
);

const HOME = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);

const LOGOUT = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
  </svg>
);

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const active = "text-emerald-400";
  const inactive = "text-neutral-600";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-[#111111] border-t border-[#252525] flex items-center justify-around px-4 py-3 pb-safe">
      <Link href="/" className={`flex flex-col items-center gap-1 text-xs ${pathname === "/" ? active : inactive}`}>
        {HOME}
        <span>Inicio</span>
      </Link>
      <Link href="/history" className={`flex flex-col items-center gap-1 text-xs ${pathname === "/history" ? active : inactive}`}>
        {CHART}
        <span>Historial</span>
      </Link>
      <Link href="/routines" className={`flex flex-col items-center gap-1 text-xs ${pathname.startsWith("/day") ? active : inactive}`}>
        {DUMBBELL}
        <span>Rutinas</span>
      </Link>
      <button onClick={logout} className={`flex flex-col items-center gap-1 text-xs ${inactive}`}>
        {LOGOUT}
        <span>Salir</span>
      </button>
    </nav>
  );
}
