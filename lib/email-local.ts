/**
 * Local Email Driver for Development
 * Logs emails to console instead of sending via Resend
 * Useful for testing without email service setup
 */

interface EmailLog {
  to: string;
  from: string;
  subject: string;
  html: string;
  timestamp: string;
}

const emailLogs: EmailLog[] = [];

export async function sendVerificationEmail(
  email: string,
  userName: string,
  verificationToken: string
) {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@enricos.shop';

  const subject = 'Verify Your Enrico\'s Restaurant Account';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome ${userName}!</h2>
      <p>Please verify your email address to complete your registration at Enrico's Restaurant.</p>
      <p>
        <a href="${verificationLink}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Verify Email
        </a>
      </p>
      <p>Or copy this link: <a href="${verificationLink}">${verificationLink}</a></p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">This link expires in 24 hours.</p>
    </div>
  `;

  const emailLog = {
    to: email,
    from: fromEmail,
    subject,
    html,
    timestamp: new Date().toISOString(),
  };

  emailLogs.push(emailLog);

  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                        📧 EMAIL (LOCAL MODE)                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`To:       ${email}`);
  console.log(`From:     ${fromEmail}`);
  console.log(`Subject:  ${subject}`);
  console.log('─'.repeat(64));
  console.log('HTML Content:');
  console.log(html);
  console.log('─'.repeat(64));
  console.log(`Verification Link: ${verificationLink}`);
  console.log(`Token:             ${verificationToken}`);
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  return {
    id: 'local-' + Date.now(),
    from: fromEmail,
    to: email,
    created_at: new Date().toISOString(),
  };
}

export async function sendPasswordResetEmail(
  email: string,
  userName: string,
  resetToken: string
) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@enricos.shop';

  const subject = 'Reset Your Enrico\'s Restaurant Password';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hi ${userName},</p>
      <p>We received a request to reset your password. Click the link below to create a new password.</p>
      <p>
        <a href="${resetLink}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Reset Password
        </a>
      </p>
      <p>Or copy this link: <a href="${resetLink}">${resetLink}</a></p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>
  `;

  const emailLog = {
    to: email,
    from: fromEmail,
    subject,
    html,
    timestamp: new Date().toISOString(),
  };

  emailLogs.push(emailLog);

  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                        📧 EMAIL (LOCAL MODE)                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`To:       ${email}`);
  console.log(`From:     ${fromEmail}`);
  console.log(`Subject:  ${subject}`);
  console.log('─'.repeat(64));
  console.log('HTML Content:');
  console.log(html);
  console.log('─'.repeat(64));
  console.log(`Reset Link: ${resetLink}`);
  console.log(`Token:      ${resetToken}`);
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  return {
    id: 'local-' + Date.now(),
    from: fromEmail,
    to: email,
    created_at: new Date().toISOString(),
  };
}

export function getAllEmailLogs() {
  return emailLogs;
}
