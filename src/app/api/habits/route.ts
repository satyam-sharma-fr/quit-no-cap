import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: habits, error } = await supabase
      .from("habits")
      .select("id, name, type, start_date, frequency_goal, cost_per_unit, created_at")
      .eq("user_id", session.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStr = today.toISOString().split("T")[0];

    const habitsWithStats = await Promise.all(
      (habits || []).map(async (habit) => {
        const startDate = new Date(habit.start_date);
        startDate.setHours(0, 0, 0, 0);
        const totalDays =
          Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

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
          user_id: session.id,
          total_days: Math.max(totalDays, 0),
          clean_days: count || 0,
          today_status: todayCheckIn?.status || null,
        };
      })
    );

    return NextResponse.json({ habits: habitsWithStats });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { name, type, start_date, cost_per_unit } = await request.json();

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    if (type !== "quit" && type !== "build") {
      return NextResponse.json(
        { error: "Type must be 'quit' or 'build'" },
        { status: 400 }
      );
    }

    const habitData: Record<string, unknown> = {
      user_id: session.id,
      name,
      type,
      start_date: start_date || new Date().toISOString().split("T")[0],
    };

    if (cost_per_unit !== undefined) {
      habitData.cost_per_unit = cost_per_unit;
    }

    const { data: habit, error } = await supabase
      .from("habits")
      .insert(habitData)
      .select("id, name, type, start_date, frequency_goal, cost_per_unit, created_at")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to create habit", details: error.message }, { status: 500 });
    }

    return NextResponse.json({ habit }, { status: 201 });
  } catch (e) {
    console.error("habits POST error:", e);
    return NextResponse.json(
      { error: "Internal server error", details: String(e) },
      { status: 500 }
    );
  }
}
