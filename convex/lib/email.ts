/**
 * Sends account emails (verify address, reset password) through Resend.
 *
 * Until RESEND_API_KEY is set on the Convex deployment, nothing is sent and
 * the link is written to the Convex logs instead, so accounts can be tested
 * locally. Set RESEND_API_KEY and EMAIL_FROM before going live.
 */
export async function sendAccountEmail(input: {
  to: string;
  subject: string;
  heading: string;
  body: string;
  buttonLabel: string;
  url: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn(
      `[email not configured] "${input.subject}" for ${input.to}. Open this link to continue: ${input.url}`,
    );
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: html(input),
      text: `${input.heading}\n\n${input.body}\n\n${input.buttonLabel}: ${input.url}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend rejected the email (${response.status}): ${await response.text()}`);
  }
}

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function html(input: { heading: string; body: string; buttonLabel: string; url: string }): string {
  const url = escape(input.url);
  return `<!doctype html>
<html><body style="margin:0;padding:32px 16px;background:#f6f3ee;font-family:Arial,sans-serif;color:#1c1917">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#78716c">African Fabric and Designs</p>
    <h1 style="margin:0 0 16px;font-size:24px">${escape(input.heading)}</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6">${escape(input.body)}</p>
    <a href="${url}" style="display:inline-block;background:#1c1917;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:bold;font-size:14px">${escape(input.buttonLabel)}</a>
    <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#78716c">If you didn't ask for this, you can ignore this email.</p>
  </div>
</body></html>`;
}
