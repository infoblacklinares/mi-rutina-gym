"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isFeed = pathname === "/feed";
  const isHistory = pathname === "/history";
  const isProfile = pathname === "/profile";

  const item = (active: boolean) =>
    `flex flex-col items-center gap-1 ${active ? "text-[#2dd4bf]" : "text-[#5d6a75]"}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around px-6 pt-3 pb-4 bg-[#0a0f14]/70 backdrop-blur-xl border-t border-white/10">
      <Link href="/" className={item(isHome)}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        <span className="text-[10px] font-semibold">Inicio</span>
      </Link>

      <Link href="/feed" className={item(isFeed)}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
        <span className="text-[10px] font-semibold">Feed</span>
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
