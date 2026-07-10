import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";
import ReactionButton from "@/components/ReactionButton";

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

function startOfWeek(): Date {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // A quién sigo (+ yo)
  const { data: followRows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  const userIds = [user.id, ...(followRows ?? []).map((f) => f.following_id)];

  // Sesiones completadas de ese grupo
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("id, user_id, day_number, day_title, started_at, completed_at, duration_minutes")
    .in("user_id", userIds)
    .not("completed_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(40);

  // Perfiles del grupo
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", userIds);
  const usernameOf = new Map((profiles ?? []).map((p) => [p.id, p.username]));

  // Reacciones de las sesiones visibles
  const sessionIds = (sessions ?? []).map((s) => s.id);
  const { data: reactions } = sessionIds.length
    ? await supabase
        .from("session_reactions")
        .select("session_id, user_id")
        .in("session_id", sessionIds)
    : { data: [] };

  const reactionCount = new Map<string, number>();
  const myReactions = new Set<string>();
  for (const r of reactions ?? []) {
    reactionCount.set(r.session_id, (reactionCount.get(r.session_id) ?? 0) + 1);
    if (r.user_id === user.id) myReactions.add(r.session_id);
  }

  // ─── Liga semanal ───
  const weekStart = startOfWeek();
  const weekCounts = new Map<string, number>();
  for (const s of sessions ?? []) {
    if (new Date(s.started_at) >= weekStart) {
      weekCounts.set(s.user_id, (weekCounts.get(s.user_id) ?? 0) + 1);
    }
  }
  const league = userIds
    .map((id) => ({ id, username: usernameOf.get(id) ?? "?", count: weekCounts.get(id) ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <>
      <main className="flex-1 max-w-lg md:max-w-2xl w-full mx-auto px-5 pt-8 pb-4">
        <div className="mb-5">
          <p className="text-[#9aa7b2] text-sm">Tu comunidad</p>
          <h1 className="text-2xl font-bold text-[#f8fafc]">Feed</h1>
        </div>

        {/* ─── Liga semanal ─── */}
        <div className="rounded-3xl overflow-hidden card-shadow mb-5 anim-rise glass" style={{ background: "linear-gradient(160deg, rgba(45,212,191,0.18) 0%, rgba(10,15,20,0.4) 100%)" }}>
          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
            <div>
              <p className="text-white/60 text-[11px] uppercase tracking-widest font-semibold">Liga semanal</p>
              <p className="text-white font-bold">¿Quién entrena más?</p>
            </div>
            <span className="text-2xl">🏆</span>
          </div>
          <div className="px-3 pb-3">
            {league.map((p, i) => (
              <Link
                key={p.id}
                href={`/u/${p.username}`}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 ${
                  p.id === user.id ? "bg-white/15" : ""
                }`}
              >
                <span className="w-6 text-center text-sm">
                  {medals[i] ?? <span className="text-white/50 font-semibold">{i + 1}</span>}
                </span>
                <div className="w-8 h-8 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-white text-xs font-bold capitalize">
                  {p.username[0]}
                </div>
                <p className="text-white text-sm font-semibold flex-1">
                  @{p.username} {p.id === user.id && <span className="text-white/50 font-normal">(vos)</span>}
                </p>
                <p className="text-white font-bold text-sm">{p.count}</p>
                <p className="text-white/50 text-[11px]">sesiones</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ─── Actividad ─── */}
        {(sessions ?? []).length === 0 ? (
          <div className="rounded-3xl glass card-shadow p-8 text-center">
            <p className="text-3xl mb-2">👥</p>
            <p className="text-[#9aa7b2] text-sm mb-1">Tu feed está vacío.</p>
            <p className="text-[#7d8a95] text-xs">
              Entrená o seguí amigos desde tu{" "}
              <Link href="/profile" className="text-[#5eead4] font-semibold">perfil</Link>{" "}
              para ver actividad acá.
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {(sessions ?? []).map((s) => {
              const username = usernameOf.get(s.user_id) ?? "?";
              const isMe = s.user_id === user.id;
              return (
                <div key={s.id} className="rounded-3xl glass card-shadow card-hover p-4 anim-rise">
                  <div className="flex items-center gap-3">
                    <Link href={`/u/${username}`} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-[#2dd4bf] capitalize flex-shrink-0">
                      {username[0]}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#f8fafc]">
                        <Link href={`/u/${username}`} className="font-bold">
                          {isMe ? "Vos" : `@${username}`}
                        </Link>{" "}
                        {isMe ? "completaste" : "completó"}{" "}
                        <span className="font-semibold">{s.day_title}</span> 💪
                      </p>
                      <p className="text-xs text-[#7d8a95] mt-0.5">
                        {timeAgo(s.started_at)}
                        {s.duration_minutes ? ` · ${s.duration_minutes} min` : ""}
                      </p>
                    </div>
                    <ReactionButton
                      sessionId={s.id}
                      initialCount={reactionCount.get(s.id) ?? 0}
                      initialReacted={myReactions.has(s.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
