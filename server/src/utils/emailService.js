import nodemailer from "nodemailer";

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error("Email credentials are missing. Please set EMAIL_USER and EMAIL_PASS.");
  }

  if (EMAIL_HOST) {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT) || 587,
      secure: EMAIL_SECURE === "true",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    });
  } else {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    });
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  if (!to || !subject || !html) {
    throw new Error("Email, subject, and html body are required to send an email.");
  }
  const { EMAIL_USER, EMAIL_FROM } = process.env;
  const fromAddress = EMAIL_FROM || `HR Department <${EMAIL_USER}>`;
  await getTransporter().sendMail({
    from: fromAddress,
    to,
    subject,
    html
  });
};

export const sendRegistrationEmail = async (to, link) =>
  sendEmail({
    to,
    subject: "Employee Registration Link",
    html: `<p>Welcome! Click below to register:</p>
           <a href="${link}">${link}</a>
           <p>This link will expire in 3 hours.</p>`
  });
