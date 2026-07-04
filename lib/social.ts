import type { SupabaseClient } from "@supabase/supabase-js";
import { computeStreak } from "@/lib/data";

export type Profile = {
  id: string;
  username: string;
};

export type ProfileStats = {
  sessions: number;
  streak: number;
  minutes: number;
};

function sanitizeUsername(email: string): string {
  const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
  return base || "atleta";
}

/** Perfil del usuario; si no existe se crea con username derivado del email. */
export async function ensureProfile(
  supabase: SupabaseClient,
  userId: string,
  email: string
): Promise<Profile | null> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", userId)
    .maybeSingle();

  if (existing) return existing;

  const base = sanitizeUsername(email);
  // Intentar el username base y variantes con sufijo si está tomado
  for (let attempt = 0; attempt < 5; attempt++) {
    const username =
      attempt === 0 ? base : `${base}${Math.floor(1000 + Math.random() * 9000)}`;
    const { data, error } = await supabase
      .from("profiles")
      .insert({ id: userId, username })
      .select("id, username")
      .single();
    if (!error && data) return data;
  }
  return null;
}

export async function getProfileByUsername(
  supabase: SupabaseClient,
  username: string
): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  return data;
}

export async function getProfileStats(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileStats> {
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("started_at, completed_at, duration_minutes")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(200);

  const completed = (sessions ?? []).filter((s) => s.completed_at);
  return {
    sessions: completed.length,
    streak: computeStreak(completed.map((s) => s.started_at)),
    minutes: completed.reduce((acc, s) => acc + (s.duration_minutes ?? 0), 0),
  };
}

export async function getFollowCounts(supabase: SupabaseClient, userId: string) {
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
  ]);
  return { followers: followers ?? 0, following: following ?? 0 };
}

export async function isFollowing(
  supabase: SupabaseClient,
  followerId: string,
  followingId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  return !!data;
}

export async function searchProfiles(
  supabase: SupabaseClient,
  query: string,
  excludeId?: string
): Promise<Profile[]> {
  let q = supabase
    .from("profiles")
    .select("id, username")
    .ilike("username", `%${query.toLowerCase()}%`)
    .limit(10);
  if (excludeId) q = q.neq("id", excludeId);
  const { data } = await q;
  return data ?? [];
}
