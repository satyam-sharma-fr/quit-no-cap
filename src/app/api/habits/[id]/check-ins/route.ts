import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: habitId } = await params;

    const { data: habit } = await supabase
      .from("habits")
      .select("id, user_id")
      .eq("id", habitId)
      .single();

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Allow viewing if own habit or buddy's habit
    if (habit.user_id !== session.id) {
      const { data: buddyLink } = await supabase
        .from("buddy_requests")
        .select("id")
        .eq("status", "accepted")
        .or(
          `and(from_user_id.eq.${session.id},to_user_id.eq.${habit.user_id}),and(from_user_id.eq.${habit.user_id},to_user_id.eq.${session.id})`
        )
        .limit(1);

      if (!buddyLink || buddyLink.length === 0) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }
    }

    const { data: checkIns, error } = await supabase
      .from("check_ins")
      .select("id, habit_id, user_id, date, status, note, created_at")
      .eq("habit_id", habitId)
      .order("date", { ascending: false })
      .limit(90);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch check-ins" },
        { status: 500 }
      );
    }

    return NextResponse.json({ check_ins: checkIns || [] });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
