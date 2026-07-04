"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isHistory = pathname === "/history";
  const isProfile = pathname === "/profile";

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

      <Link href="/profile" className={item(isProfile)}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        <span className="text-[10px] font-semibold">Perfil</span>
      </Link>
    </nav>
  );
}
