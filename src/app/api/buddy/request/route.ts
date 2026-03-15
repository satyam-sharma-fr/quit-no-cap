import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { to_username } = await request.json();

    if (!to_username) {
      return NextResponse.json(
        { error: "to_username is required" },
        { status: 400 }
      );
    }

    const { data: toUser } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("username", to_username)
      .single();

    if (!toUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (toUser.id === session.id) {
      return NextResponse.json(
        { error: "Cannot send buddy request to yourself" },
        { status: 400 }
      );
    }

    // Check for existing request in either direction
    const { data: existing } = await supabase
      .from("buddy_requests")
      .select("id, status")
      .or(
        `and(from_user_id.eq.${session.id},to_user_id.eq.${toUser.id}),and(from_user_id.eq.${toUser.id},to_user_id.eq.${session.id})`
      )
      .in("status", ["pending", "accepted"]);

    if (existing && existing.length > 0) {
      const accepted = existing.find((r) => r.status === "accepted");
      if (accepted) {
        return NextResponse.json(
          { error: "You are already buddies with this user" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "A buddy request is already pending" },
        { status: 409 }
      );
    }

    const { data: buddyRequest, error } = await supabase
      .from("buddy_requests")
      .insert({
        from_user_id: session.id,
        to_user_id: toUser.id,
        status: "pending",
      })
      .select("id, from_user_id, to_user_id, status, created_at")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to send buddy request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ buddy_request: buddyRequest }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
