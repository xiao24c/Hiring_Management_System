import nodemailer from "nodemailer";

/**
 * Lightweight email helper.
 * If SMTP config is missing, fallback to console.log to avoid crashing in dev.
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.log("📧 [dev] email not sent (missing SMTP config)", {
      to,
      subject,
      text,
    });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject,
    text,
    html,
  });
};
