const FROM = process.env.RESEND_FROM_EMAIL ?? "Handshake Impact Engine <noreply@handshake.io>";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping send");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) console.error("[email] Resend error:", res.status, await res.text());
}

export async function sendApplicationSubmittedEmail(opts: {
  donorEmail: string;
  nonprofitName: string;
  rfpTitle: string;
  appUrl: string;
}) {
  await sendEmail({
    to: opts.donorEmail,
    subject: `New application: ${opts.nonprofitName} → "${opts.rfpTitle}"`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#0284c7;margin:0 0 16px">New Application Received</h2>
      <p><strong>${opts.nonprofitName}</strong> submitted an application for your RFP <strong>"${opts.rfpTitle}"</strong>.</p>
      <a href="${opts.appUrl}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#0284c7;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
        Review Application →
      </a>
      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
      <p style="color:#9ca3af;font-size:12px">Handshake Impact Engine</p>
    </div>`,
  });
}

const STATUS_LABEL: Record<string, string> = {
  UNDER_REVIEW: "Under Review",
  SHORTLISTED: "Shortlisted",
  APPROVED: "Approved",
  REJECTED: "Not Selected",
  FUNDED: "Funded",
};
const STATUS_COLOR: Record<string, string> = {
  UNDER_REVIEW: "#d97706",
  SHORTLISTED: "#7c3aed",
  APPROVED: "#16a34a",
  REJECTED: "#dc2626",
  FUNDED: "#059669",
};

export async function sendStatusChangedEmail(opts: {
  nonprofitEmail: string;
  nonprofitName: string;
  rfpTitle: string;
  newStatus: string;
  appUrl: string;
}) {
  const label = STATUS_LABEL[opts.newStatus] ?? opts.newStatus;
  const color = STATUS_COLOR[opts.newStatus] ?? "#374151";
  await sendEmail({
    to: opts.nonprofitEmail,
    subject: `Application update: "${opts.rfpTitle}" — ${label}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#0284c7;margin:0 0 16px">Application Status Update</h2>
      <p>Hi ${opts.nonprofitName},</p>
      <p>Your application for <strong>"${opts.rfpTitle}"</strong> has been updated to:</p>
      <p style="font-size:18px;font-weight:700;color:${color};margin:12px 0">${label}</p>
      <a href="${opts.appUrl}" style="display:inline-block;margin-top:8px;padding:10px 20px;background:#0284c7;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
        View Status →
      </a>
      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
      <p style="color:#9ca3af;font-size:12px">Handshake Impact Engine</p>
    </div>`,
  });
}
