"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="w-full rounded-2xl bg-[#211b16] card-shadow py-3.5 text-sm font-semibold text-red-500"
    >
      Cerrar sesión
    </button>
  );
}
