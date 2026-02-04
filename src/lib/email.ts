interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("sendEmail: RESEND_API_KEY not set, skipping email to", to);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: "Travel Itinerary <notifications@treducks.tech>",
    to,
    subject,
    html,
  });
}
