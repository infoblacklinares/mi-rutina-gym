import { notFound } from "next/navigation";
import { getDay } from "@/lib/routines";
import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import WorkoutRunner from "@/components/WorkoutRunner";

export default async function DayPage({
  params,
}: {
  params: Promise<{ dayNumber: string }>;
}) {
  const { dayNumber } = await params;
  const day = getDay(Number(dayNumber));

  if (!day) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  return (
    <>
      <TopBar title={`Día ${day.day}`} />
      <main className="flex-1 max-w-2xl w-full mx-auto p-4">
        <WorkoutRunner day={day} userId={user.id} />
      </main>
    </>
  );
}
