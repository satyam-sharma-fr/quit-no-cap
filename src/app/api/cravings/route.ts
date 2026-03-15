import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { habit_id, intensity, note } = await request.json();

    if (!habit_id || !intensity) {
      return NextResponse.json(
        { error: "habit_id and intensity are required" },
        { status: 400 }
      );
    }

    if (typeof intensity !== "number" || intensity < 1 || intensity > 5) {
      return NextResponse.json(
        { error: "Intensity must be a number between 1 and 5" },
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

    const { data: craving, error } = await supabase
      .from("cravings")
      .insert({
        habit_id,
        user_id: session.id,
        intensity,
        note: note || null,
      })
      .select("id, habit_id, user_id, intensity, note, created_at")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to log craving" },
        { status: 500 }
      );
    }

    return NextResponse.json({ craving }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: cravings, error } = await supabase
      .from("cravings")
      .select("id, habit_id, intensity, note, created_at")
      .eq("user_id", session.id)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch cravings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ cravings: cravings || [] });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
