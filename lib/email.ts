import { Resend } from 'resend';
import { EmailVerification } from '@/emails/email-verification';
import { PasswordResetEmail } from '@/emails/password-reset-email';
import React from 'react';
import * as localEmail from './email-local';

// Use Resend if API key is available, otherwise use local email driver
// Set USE_LOCAL_EMAIL=true to force local mode even if API key is present
const useLocalEmail = process.env.USE_LOCAL_EMAIL === 'true' && !process.env.RESEND_API_KEY;

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  userName: string,
  verificationToken: string
) {
  console.log(`\n🔧 Email Service: ${useLocalEmail ? 'LOCAL (Development Mode)' : 'RESEND (Production)'}`);
  
  if (useLocalEmail) {
    return await localEmail.sendVerificationEmail(email, userName, verificationToken);
  }

  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  console.log('📧 Email Service - Verification Email');
  console.log('  To:', email);
  console.log('  From:', fromEmail);
  console.log('  Link:', verificationLink);
  console.log('  API Key:', process.env.RESEND_API_KEY ? '✓ Set' : '✗ Missing');

  try {
    console.log('⏳ Sending email via Resend...');
    const response = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Verify Your Enrico\'s Restaurant Account',
      react: React.createElement(EmailVerification, {
        userName,
        verificationLink,
      }),
    });

    console.log('✅ Verification email sent successfully');
    console.log('   Response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  userName: string,
  resetToken: string
) {
  console.log(`\n🔧 Email Service: ${useLocalEmail ? 'LOCAL (Development Mode)' : 'RESEND (Production)'}`);

  if (useLocalEmail) {
    return await localEmail.sendPasswordResetEmail(email, userName, resetToken);
  }

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  console.log('📧 Email Service - Password Reset Email');
  console.log('  To:', email);
  console.log('  From:', fromEmail);
  console.log('  Link:', resetLink);

  try {
    console.log('⏳ Sending password reset email via Resend...');
    const response = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Reset Your Enrico\'s Restaurant Password',
      react: React.createElement(PasswordResetEmail, {
        userName,
        resetLink,
      }),
    });

    console.log('✅ Password reset email sent successfully');
    console.log('   Response:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }
}

export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function getTokenExpiry(hours: number = 24): string {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + hours);
  return expiryDate.toISOString();
}
