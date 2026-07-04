"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ReactionButton({
  sessionId,
  initialCount,
  initialReacted,
}: {
  sessionId: string;
  initialCount: number;
  initialReacted: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [reacted, setReacted] = useState(initialReacted);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }

    if (reacted) {
      setReacted(false);
      setCount((c) => Math.max(0, c - 1));
      await supabase.from("session_reactions").delete()
        .eq("session_id", sessionId).eq("user_id", user.id);
    } else {
      setReacted(true);
      setCount((c) => c + 1);
      await supabase.from("session_reactions").insert({ session_id: sessionId, user_id: user.id });
    }
    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-all active:scale-90 flex-shrink-0 ${
        reacted
          ? "bg-[#0b3557] text-white"
          : "bg-[#eef3f8] text-[#5f7185]"
      }`}
    >
      💪 {count > 0 && <span className="text-xs">{count}</span>}
    </button>
  );
}
