import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ensureProfile,
  getProfileStats,
  getFollowCounts,
  searchProfiles,
} from "@/lib/social";
import BottomNav from "@/components/BottomNav";
import LogoutButton from "@/components/LogoutButton";
import ShareButton from "@/components/ShareButton";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await ensureProfile(supabase, user.id, user.email ?? "atleta");
  const [stats, counts, results, { data: routine }] = await Promise.all([
    getProfileStats(supabase, user.id),
    getFollowCounts(supabase, user.id),
    q ? searchProfiles(supabase, q, user.id) : Promise.resolve([]),
    supabase
      .from("routines")
      .select("share_code")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <>
      <main className="flex-1 max-w-lg md:max-w-2xl w-full mx-auto">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-b-[32px] glass px-5 pt-12 pb-8 text-center" style={{ background: "linear-gradient(160deg, rgba(45,212,191,0.16) 0%, rgba(10,15,20,0.5) 55%, rgba(94,234,212,0.08) 100%)" }}>
          <div className="w-20 h-20 mx-auto rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-white font-bold text-3xl capitalize mb-3">
            {profile?.username[0] ?? "?"}
          </div>
          <h1 className="text-white text-2xl font-bold">@{profile?.username}</h1>
          <p className="text-white/50 text-xs mt-1">{user.email}</p>

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

          <div className="flex justify-center gap-2 mt-5">
            {routine && <ShareButton shareCode={routine.share_code} />}
            {profile && (
              <Link
                href={`/u/${profile.username}`}
                className="flex items-center rounded-full bg-white/15 border border-white/25 px-4 py-2 text-white text-xs font-semibold"
              >
                Ver mi perfil público
              </Link>
            )}
          </div>
        </div>

        {/* Buscador de usuarios */}
        <div className="px-5 pt-5">
          <h2 className="font-bold text-[#f8fafc] mb-3">Buscar amigos</h2>
          <form method="GET" className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Buscar por username..."
              className="flex-1 rounded-2xl glass card-shadow px-4 py-3 text-sm text-[#f8fafc] placeholder-[#5d6a75] outline-none focus:ring-2 focus:ring-[#2dd4bf]/20"
            />
            <button
              type="submit"
              className="rounded-2xl bg-[#2dd4bf] text-[#04211c] px-5 text-sm font-semibold"
            >
              Buscar
            </button>
          </form>

          {q && (
            <div className="mt-4 space-y-2">
              {results.length === 0 ? (
                <p className="text-sm text-[#7d8a95] text-center py-4">
                  No se encontró a nadie con “{q}”.
                </p>
              ) : (
                results.map((p) => (
                  <Link
                    key={p.id}
                    href={`/u/${p.username}`}
                    className="flex items-center gap-3 glass rounded-2xl card-shadow p-3 active:scale-[0.98] transition-transform"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-[#2dd4bf] capitalize">
                      {p.username[0]}
                    </div>
                    <p className="font-semibold text-sm text-[#f8fafc]">@{p.username}</p>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#3a4652] ml-auto">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                    </svg>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="px-5 pt-5 grid grid-cols-2 gap-3">
          <div className="glass rounded-3xl card-shadow p-4 text-center">
            <p className="text-3xl font-bold text-[#2dd4bf]">{stats.sessions}</p>
            <p className="text-xs text-[#7d8a95] mt-1">Entrenamientos</p>
          </div>
          <div className="glass rounded-3xl card-shadow p-4 text-center">
            <p className="text-3xl font-bold text-[#2dd4bf]">{stats.minutes}</p>
            <p className="text-xs text-[#7d8a95] mt-1">Minutos totales</p>
          </div>
        </div>

        {/* Logout */}
        <div className="px-5 pt-6 pb-8">
          <LogoutButton />
        </div>
      </main>
      <BottomNav />
    </>
  );
}
