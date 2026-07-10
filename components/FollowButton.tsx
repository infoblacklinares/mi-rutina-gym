"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function FollowButton({
  targetId,
  initialFollowing,
  loggedIn,
}: {
  targetId: string;
  initialFollowing: boolean;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!loggedIn) { router.push("/signup"); return; }
    setBusy(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    if (following) {
      await supabase.from("follows").delete()
        .eq("follower_id", user.id).eq("following_id", targetId);
      setFollowing(false);
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: targetId });
      setFollowing(true);
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
        following
          ? "glass text-[#2dd4bf] border border-white/10"
          : "bg-[#2dd4bf] text-[#04211c]"
      }`}
    >
      {following ? "Siguiendo ✓" : "Seguir"}
    </button>
  );
}
