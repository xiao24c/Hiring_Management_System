import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send registration email with token
export const sendRegistrationEmail = async (email, name, registrationToken) => {
  const registrationLink = `${process.env.CLIENT_URL}/register?token=${registrationToken}`;

  const mailOptions = {
    from: `"HR Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome! Complete Your Registration',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1890ff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button {
              display: inline-block;
              background: #1890ff;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Our Company!</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>We're excited to have you join our team! Please click the button below to complete your registration:</p>

              <div style="text-align: center;">
                <a href="${registrationLink}" class="button">Complete Registration</a>
              </div>

              <p><strong>Important:</strong> This link will expire in 3 hours.</p>

              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #1890ff;">${registrationLink}</p>

              <div class="footer">
                <p>If you didn't expect this email, please ignore it.</p>
                <p>Best regards,<br>HR Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Registration email sent: ' + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Send notification reminder email
export const sendNotificationEmail = async (email, name, message) => {
  const mailOptions = {
    from: `"HR Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Action Required: Next Steps for Your Onboarding',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #52c41a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Onboarding Update</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>${message}</p>
              <p>Please log in to your account to complete the next steps.</p>
              <p>Best regards,<br>HR Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Notification email sent: ' + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export default transporter;
