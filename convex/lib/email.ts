/**
 * Sends email through Resend: account emails (verify address, reset
 * password) and order confirmations.
 *
 * Until RESEND_API_KEY and EMAIL_FROM are set on the Convex deployment,
 * nothing is sent and a note is written to the Convex logs instead.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /** Written to the logs when email isn't configured (e.g. the link to open). */
  logNote?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn(`[email not configured] "${input.subject}" for ${input.to}. ${input.logNote ?? ""}`.trim());
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend rejected the email (${response.status}): ${await response.text()}`);
  }
}

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** The shared email frame: brand line, then the given HTML content. */
export function emailLayout(content: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:32px 16px;background:#f6f3ee;font-family:Arial,sans-serif;color:#1c1917">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#78716c">African Fabric and Designs</p>
    ${content}
  </div>
</body></html>`;
}

export function emailButton(label: string, url: string): string {
  return `<a href="${escapeHtml(url)}" style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:bold;font-size:14px">${escapeHtml(label)}</a>`;
}

/** Verify-email and reset-password messages: a heading, a sentence and a button. */
export async function sendAccountEmail(input: {
  to: string;
  subject: string;
  heading: string;
  body: string;
  buttonLabel: string;
  url: string;
}): Promise<void> {
  await sendEmail({
    to: input.to,
    subject: input.subject,
    html: emailLayout(`
    <h1 style="margin:0 0 16px;font-size:24px">${escapeHtml(input.heading)}</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6">${escapeHtml(input.body)}</p>
    ${emailButton(input.buttonLabel, input.url)}
    <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#78716c">If you didn't ask for this, you can ignore this email.</p>`),
    text: `${input.heading}\n\n${input.body}\n\n${input.buttonLabel}: ${input.url}`,
    logNote: `Open this link to continue: ${input.url}`,
  });
}
