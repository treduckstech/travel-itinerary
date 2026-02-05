import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const today = new Date().toISOString().slice(0, 10);

  // Get all todos due today that are uncompleted and haven't been reminded
  const { data: todos, error } = await supabase
    .from("todos")
    .select("id, title, trip_id, due_date")
    .eq("due_date", today)
    .eq("completed", false)
    .eq("reminder_sent", false);

  if (error) {
    console.error("Failed to fetch todos:", error);
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 });
  }

  if (!todos || todos.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Get trip details for all affected trips
  const tripIds = [...new Set(todos.map((t) => t.trip_id))];
  const { data: trips } = await supabase
    .from("trips")
    .select("id, name, user_id")
    .in("id", tripIds);

  if (!trips || trips.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const tripMap = new Map(trips.map((t) => [t.id, t]));

  // Get user emails for all affected users
  const userIds = [...new Set(trips.map((t) => t.user_id))];
  const userEmails = new Map<string, string>();
  for (const userId of userIds) {
    const { data } = await supabase.auth.admin.getUserById(userId);
    if (data?.user?.email) {
      userEmails.set(userId, data.user.email);
    }
  }

  let sent = 0;

  for (const todo of todos) {
    const trip = tripMap.get(todo.trip_id);
    if (!trip) continue;

    const email = userEmails.get(trip.user_id);
    if (!email) continue;

    // Create notification
    await supabase.from("notifications").insert({
      recipient_id: trip.user_id,
      type: "todo_due",
      title: "To-do due today",
      body: `"${todo.title}" is due today for ${trip.name}`,
      data: { trip_id: todo.trip_id, todo_id: todo.id },
    });

    // Send email (fire-and-forget style, but we await to ensure delivery)
    try {
      await sendEmail({
        to: email,
        subject: `To-do due today: ${todo.title}`,
        html: `<p>Your to-do item <strong>"${todo.title}"</strong> is due today for your trip <strong>${trip.name}</strong>.</p><p><a href="https://travel.treducks.io/trips/${todo.trip_id}">View trip</a></p>`,
      });
    } catch (e) {
      console.error("Failed to send reminder email:", e);
    }

    // Mark as sent
    await supabase
      .from("todos")
      .update({ reminder_sent: true })
      .eq("id", todo.id);

    sent++;
  }

  return NextResponse.json({ sent });
}
