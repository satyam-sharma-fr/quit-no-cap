import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: habit_id } = await params;
    const { status, note } = await request.json();

    if (!status || (status !== "clean" && status !== "slip")) {
      return NextResponse.json(
        { error: "Status must be 'clean' or 'slip'" },
        { status: 400 }
      );
    }

    const { data: habit } = await supabase
      .from("habits")
      .select("id")
      .eq("id", habit_id)
      .eq("user_id", session.id)
      .single();

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("check_ins")
      .select("id")
      .eq("habit_id", habit_id)
      .eq("date", today)
      .single();

    let checkIn;
    let error;

    if (existing) {
      const result = await supabase
        .from("check_ins")
        .update({ status, note: note || null })
        .eq("id", existing.id)
        .select("id, habit_id, user_id, date, status, note, created_at")
        .single();
      checkIn = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from("check_ins")
        .insert({
          habit_id,
          user_id: session.id,
          date: today,
          status,
          note: note || null,
        })
        .select("id, habit_id, user_id, date, status, note, created_at")
        .single();
      checkIn = result.data;
      error = result.error;
    }

    if (error) {
      return NextResponse.json(
        { error: "Failed to save check-in" },
        { status: 500 }
      );
    }

    return NextResponse.json({ check_in: checkIn }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
