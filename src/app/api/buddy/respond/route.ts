import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { request_id, action } = await request.json();

    if (!request_id || !action) {
      return NextResponse.json(
        { error: "request_id and action are required" },
        { status: 400 }
      );
    }

    if (action !== "accept" && action !== "reject") {
      return NextResponse.json(
        { error: "Action must be 'accept' or 'reject'" },
        { status: 400 }
      );
    }

    const { data: buddyRequest } = await supabase
      .from("buddy_requests")
      .select("id, from_user_id, to_user_id, status")
      .eq("id", request_id)
      .single();

    if (!buddyRequest) {
      return NextResponse.json(
        { error: "Buddy request not found" },
        { status: 404 }
      );
    }

    if (buddyRequest.to_user_id !== session.id) {
      return NextResponse.json(
        { error: "Only the recipient can respond to this request" },
        { status: 403 }
      );
    }

    if (buddyRequest.status !== "pending") {
      return NextResponse.json(
        { error: "This request has already been responded to" },
        { status: 400 }
      );
    }

    const { data: updated, error } = await supabase
      .from("buddy_requests")
      .update({ status: action === "accept" ? "accepted" : "rejected" })
      .eq("id", request_id)
      .select("id, from_user_id, to_user_id, status, created_at")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to respond to buddy request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ buddy_request: updated });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
