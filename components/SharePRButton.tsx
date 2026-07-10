"use client";

import { useState } from "react";

export type PR = { name: string; weight: number; prev: number | null };

export default function SharePRButton({ prs }: { prs: PR[] }) {
  const [busy, setBusy] = useState(false);

  async function share() {
    setBusy(true);
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d")!;

    // Fondo degradado navy
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, "#2dd4bf");
    grad.addColorStop(0.6, "#14b8a6");
    grad.addColorStop(1, "#2dd4bf");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "600 40px system-ui, sans-serif";
    ctx.fillText("NUEVO RÉCORD PERSONAL", 540, 180);

    ctx.font = "120px system-ui, sans-serif";
    ctx.fillText("🏆", 540, 340);

    const pr = prs[0];
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 64px system-ui, sans-serif";
    ctx.fillText(pr.name, 540, 480);

    ctx.font = "900 160px system-ui, sans-serif";
    ctx.fillText(`${pr.weight} kg`, 540, 680);

    if (pr.prev != null) {
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "500 44px system-ui, sans-serif";
      ctx.fillText(`Anterior: ${pr.prev} kg  →  +${(pr.weight - pr.prev).toFixed(1).replace(/\.0$/, "")} kg`, 540, 780);
    }

    if (prs.length > 1) {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "600 40px system-ui, sans-serif";
      ctx.fillText(`+${prs.length - 1} récord${prs.length > 2 ? "s" : ""} más hoy 🔥`, 540, 880);
    }

    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "500 36px system-ui, sans-serif";
    ctx.fillText("mi-rutina-gym.vercel.app", 540, 1000);

    const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"));
    const file = new File([blob], "record.png", { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "¡Nuevo récord! 🏆" });
        setBusy(false);
        return;
      } catch {
        // canceló; cae a descarga
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "record.png";
    a.click();
    URL.revokeObjectURL(url);
    setBusy(false);
  }

  return (
    <button
      onClick={share}
      disabled={busy}
      className="w-full max-w-xs rounded-2xl glass text-[#2dd4bf] font-semibold py-4 text-base card-shadow disabled:opacity-50"
    >
      {busy ? "Generando..." : "Compartir récord 📸"}
    </button>
  );
}
