export async function logActivity(
  action_type: string,
  action_details: Record<string, unknown> = {}
) {
  try {
    await fetch("/api/activity-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action_type, action_details }),
    });
  } catch {
    // Fire-and-forget — don't block the UI on logging failures
  }
}
