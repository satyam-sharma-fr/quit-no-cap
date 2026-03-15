import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Find accepted buddy request where user is either side
    const { data: acceptedRequests } = await supabase
      .from("buddy_requests")
      .select("id, from_user_id, to_user_id")
      .eq("status", "accepted")
      .or(`from_user_id.eq.${session.id},to_user_id.eq.${session.id}`);

    let buddy: { id: string; username: string } | null = null;
    let habits: Array<Record<string, unknown>> = [];
    const checkIns: Array<Record<string, unknown>> = [];

    if (acceptedRequests && acceptedRequests.length > 0) {
      const req = acceptedRequests[0];
      const buddyId =
        req.from_user_id === session.id ? req.to_user_id : req.from_user_id;

      const { data: buddyProfile } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("id", buddyId)
        .single();

      if (buddyProfile) {
        buddy = buddyProfile;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split("T")[0];

        const { data: rawHabits } = await supabase
          .from("habits")
          .select("id, name, type, start_date, frequency_goal, cost_per_unit, created_at")
          .eq("user_id", buddyId);

        habits = await Promise.all(
          (rawHabits || []).map(async (habit) => {
            const startDate = new Date(habit.start_date);
            startDate.setHours(0, 0, 0, 0);
            const totalDays = Math.max(
              Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
              0
            );

            const { count } = await supabase
              .from("check_ins")
              .select("*", { count: "exact", head: true })
              .eq("habit_id", habit.id)
              .eq("status", "clean");

            const { data: todayCheckIn } = await supabase
              .from("check_ins")
              .select("status")
              .eq("habit_id", habit.id)
              .eq("date", todayStr)
              .single();

            return {
              ...habit,
              user_id: buddyId,
              total_days: totalDays,
              clean_days: count || 0,
              today_status: todayCheckIn?.status || null,
            };
          })
        );
      }
    }

    // Get pending requests TO the current user
    const { data: pendingRequests } = await supabase
      .from("buddy_requests")
      .select("id, from_user_id, status, created_at")
      .eq("to_user_id", session.id)
      .eq("status", "pending");

    let pendingWithUsernames: Array<Record<string, unknown>> = [];
    if (pendingRequests && pendingRequests.length > 0) {
      const fromIds = pendingRequests.map((r) => r.from_user_id);
      const { data: senders } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", fromIds);

      const senderMap = new Map(
        (senders || []).map((s) => [s.id, s.username])
      );

      pendingWithUsernames = pendingRequests.map((r) => ({
        ...r,
        from_username: senderMap.get(r.from_user_id) || "unknown",
      }));
    }

    return NextResponse.json({
      buddy,
      habits,
      check_ins: checkIns,
      pending_requests: pendingWithUsernames,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
