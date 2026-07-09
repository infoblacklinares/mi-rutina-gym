import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getProfileByUsername,
  getProfileStats,
  getFollowCounts,
  isFollowing,
} from "@/lib/social";
import FollowButton from "@/components/FollowButton";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const profile = await getProfileByUsername(supabase, username);
  if (!profile) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const isOwn = user?.id === profile.id;

  const [stats, counts, followingHim, { data: routine }] = await Promise.all([
    getProfileStats(supabase, profile.id),
    getFollowCounts(supabase, profile.id),
    user && !isOwn ? isFollowing(supabase, user.id, profile.id) : Promise.resolve(false),
    supabase
      .from("routines")
      .select("share_code, title")
      .eq("owner_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <main className="flex-1 max-w-lg w-full mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-b-[32px] px-5 pt-12 pb-8 text-center" style={{ background: "linear-gradient(160deg, #1c1613 0%, #241a14 60%, #3a2315 100%)" }}>
        <div className="flex justify-start mb-4">
          <Link href={user ? "/" : "/login"} className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </Link>
        </div>

        <div className="w-20 h-20 mx-auto rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-white font-bold text-3xl capitalize mb-3">
          {profile.username[0]}
        </div>
        <h1 className="text-white text-2xl font-bold">@{profile.username}</h1>

        <div className="flex justify-center gap-6 mt-4 text-white">
          <div>
            <p className="text-xl font-bold">{counts.followers}</p>
            <p className="text-[11px] text-white/60">Seguidores</p>
          </div>
          <div>
            <p className="text-xl font-bold">{counts.following}</p>
            <p className="text-[11px] text-white/60">Siguiendo</p>
          </div>
          <div>
            <p className="text-xl font-bold">{stats.streak} 🔥</p>
            <p className="text-[11px] text-white/60">Racha</p>
          </div>
        </div>

        {!isOwn && (
          <div className="mt-5">
            <FollowButton
              targetId={profile.id}
              initialFollowing={followingHim}
              loggedIn={!!user}
            />
          </div>
        )}
      </div>

      {/* Stats cards */}
      <div className="px-5 pt-5 grid grid-cols-2 gap-3">
        <div className="bg-[#211b16] rounded-3xl card-shadow p-4 text-center">
          <p className="text-3xl font-bold text-[#f97316]">{stats.sessions}</p>
          <p className="text-xs text-[#8a7f76] mt-1">Entrenamientos</p>
        </div>
        <div className="bg-[#211b16] rounded-3xl card-shadow p-4 text-center">
          <p className="text-3xl font-bold text-[#f97316]">{stats.minutes}</p>
          <p className="text-xs text-[#8a7f76] mt-1">Minutos totales</p>
        </div>
      </div>

      {/* Su rutina */}
      {routine && (
        <div className="px-5 pt-4 pb-8">
          <Link
            href={`/r/${routine.share_code}`}
            className="flex items-center gap-4 bg-[#211b16] rounded-3xl card-shadow p-4 active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#262019] flex items-center justify-center text-2xl">
              📋
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#f2ede9]">{routine.title}</p>
              <p className="text-xs text-[#a1968e]">Ver rutina{isOwn ? "" : " y copiarla"}</p>
            </div>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#4a403a]">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
            </svg>
          </Link>
        </div>
      )}
    </main>
  );
}
