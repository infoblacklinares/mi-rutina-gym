"use client";

import { useState } from "react";

export default function ShareButton({ shareCode }: { shareCode: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/r/${shareCode}`;
    const text = "Esta es mi rutina de gimnasio 💪 Copiala y entrenemos juntos:";

    // Menú nativo solo en celular; en desktop el share de Windows es poco confiable
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      try {
        await navigator.share({ title: "Mi Rutina", text, url });
        return;
      } catch {
        // usuario canceló o falló; cae al clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={share}
      className="flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-4 py-2 text-white text-xs font-semibold active:scale-95 transition-transform"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
      </svg>
      {copied ? "¡Link copiado!" : "Compartir rutina"}
    </button>
  );
}
