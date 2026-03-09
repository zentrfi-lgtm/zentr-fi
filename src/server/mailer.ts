import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface BookingEmailData {
  to: string;
  confirmationId: string;
  fullLegalName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  residentialAddress: string;
  amount: number;
  currency: string;
  origin: string;
  destination: string;
  airline: string;
  duration: string;
}

function buildBookingEmail(data: BookingEmailData): string {
  const Z_BLUE = "#0000fe";
  const Z_DARK = "#08054b";
  const amountFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: data.currency || "USD",
  }).format(data.amount);

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 0;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:8px 0 8px 16px;color:#111827;font-size:13px;font-weight:500;vertical-align:top;">${value}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Booking Confirmation – Zentrfi</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td align="center" style="background:${Z_DARK};border-radius:16px 16px 0 0;padding:28px 32px 24px;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <img
                  src="https://pbs.twimg.com/profile_images/2024770639400251392/dTwUzCaT_400x400.jpg"
                  alt="Zentrfi"
                  width="40"
                  height="40"
                  style="border-radius:10px;display:inline-block;vertical-align:middle;"
                />
                <span style="font-size:22px;font-weight:700;color:#ffffff;vertical-align:middle;letter-spacing:0.5px;">
                  Zentrfi
                </span>
              </div>
              <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,0.65);letter-spacing:0.5px;">
                Zentra Finance · AI Travel Booking
              </p>
            </td>
          </tr>

          <!-- Blue accent bar -->
          <tr>
            <td style="height:4px;background:${Z_BLUE};"></td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="background:#ffffff;padding:32px 32px 24px;">
              <p style="margin:0 0 6px;font-size:13px;color:${Z_BLUE};font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                Booking Confirmed ✓
              </p>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${Z_DARK};">
                Your trip is booked, ${data.fullLegalName.split(" ")[0]}!
              </h1>
              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
                Thank you for booking with Zentrfi. Your payment is being scheduled
                and your reservation is confirmed. Details below for your records.
              </p>
            </td>
          </tr>

          <!-- Confirmation pill -->
          <tr>
            <td style="background:#ffffff;padding:0 32px 28px;">
              <div style="background:#f0f0ff;border:1px solid ${Z_BLUE}30;border-radius:12px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <p style="margin:0;font-size:11px;color:${Z_BLUE};font-weight:600;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
                      <p style="margin:4px 0 0;font-size:17px;font-weight:700;color:${Z_DARK};font-family:monospace,monospace;">${data.confirmationId}</p>
                    </td>
                    <td align="right">
                      <p style="margin:0;font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Total Charged</p>
                      <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:${Z_BLUE};">${amountFormatted}</p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="background:#ffffff;padding:0 32px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" /></td></tr>

          <!-- Flight details -->
          <tr>
            <td style="background:#ffffff;padding:24px 32px 8px;">
              <p style="margin:0 0 14px;font-size:12px;font-weight:700;color:${Z_DARK};text-transform:uppercase;letter-spacing:1px;">
                ✈ Flight Details
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row("Airline", data.airline || "—")}
                ${row("Route", `${data.origin} → ${data.destination}`)}
                ${row("Duration", data.duration || "—")}
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="background:#ffffff;padding:0 32px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" /></td></tr>

          <!-- Passenger details -->
          <tr>
            <td style="background:#ffffff;padding:24px 32px 8px;">
              <p style="margin:0 0 14px;font-size:12px;font-weight:700;color:${Z_DARK};text-transform:uppercase;letter-spacing:1px;">
                👤 Passenger Details
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row("Full name", data.fullLegalName)}
                ${row("Date of birth", data.dateOfBirth)}
                ${row("Email", data.email)}
                ${row("Phone", data.phone)}
                ${row("Address", data.residentialAddress)}
              </table>
            </td>
          </tr>

          <!-- Payment status banner -->
          <tr>
            <td style="background:#ffffff;padding:24px 32px 32px;">
              <div style="background:${Z_DARK};border-radius:12px;padding:18px 22px;">
                <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#ffffff;">
                  💳 Payment Scheduling in Progress
                </p>
                <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);line-height:1.5;">
                  Your payment of <strong style="color:#ffffff;">${amountFormatted}</strong> is being
                  scheduled and processed securely. You will receive a separate confirmation
                  once the payment settles. No further action is needed.
                </p>
              </div>
            </td>
          </tr>

          <!-- Blue accent bar -->
          <tr>
            <td style="height:4px;background:${Z_BLUE};border-radius:0;"></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${Z_DARK};border-radius:0 0 16px 16px;padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <!-- Social icons -->
                    <a href="https://x.com/ZentrFi" target="_blank" rel="noopener noreferrer"
                       style="display:inline-block;margin:0 8px;text-decoration:none;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                    <a href="https://farcaster.xyz/zentrfi" target="_blank" rel="noopener noreferrer"
                       style="display:inline-block;margin:0 8px;text-decoration:none;">
                      <!-- Farcaster "F" mark -->
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1000 1000" fill="rgba(255,255,255,0.7)">
                        <path d="M257.778 155.556H742.222V844.444H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.444H257.778V155.556Z"/>
                        <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.444H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z"/>
                        <path d="M675.556 746.667C663.283 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.444H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z"/>
                      </svg>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.6;">
                      © ${new Date().getFullYear()} Zentrfi (Zentra Finance) · AI-Powered Travel<br/>
                      This is a transactional email — please do not reply directly.<br/>
                      <a href="https://zentrfi.com/privacy" style="color:rgba(255,255,255,0.4);text-decoration:underline;">Privacy</a>
                      &nbsp;·&nbsp;
                      <a href="https://zentrfi.com/terms" style="color:rgba(255,255,255,0.4);text-decoration:underline;">Terms</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

export async function sendBookingConfirmationEmail(data: BookingEmailData): Promise<void> {
  const html = buildBookingEmail(data);

  await transporter.sendMail({
    from: `"Zentrfi" <${process.env.SMTP_USER}>`,
    to: data.to,
    subject: `✈ Booking Confirmed – ${data.origin} → ${data.destination} [${data.confirmationId}]`,
    html,
  });
}
