import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAccountsDatabase } from '@/lib/db';
import { sendVerificationEmail, sendPasswordResetEmail, generateToken, getTokenExpiry } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

const db = getAccountsDatabase();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, token, password, newPassword } = body;

    console.log('=== EMAIL API ===', action, email);

    // Send verification email
    if (action === 'sendVerificationEmail') {
      const { userName } = body;
      
      try {
        const verificationToken = generateToken();
        const expiresAt = getTokenExpiry(24);

        db.prepare('INSERT INTO emailVerificationTokens (id, email, token, expiresAt, createdAt) VALUES (?, ?, ?, ?, ?)').run(
          uuidv4(),
          email,
          verificationToken,
          expiresAt,
          new Date().toISOString()
        );

        await sendVerificationEmail(email, userName, verificationToken);

        return NextResponse.json({ 
          success: true, 
          message: 'Verification email sent' 
        });
      } catch (error) {
        console.error('Error sending verification email:', error);
        return NextResponse.json(
          { error: 'Failed to send verification email' }, 
          { status: 500 }
        );
      }
    }

    // Verify email token
    if (action === 'verifyEmail') {
      if (!token) {
        return NextResponse.json(
          { error: 'Token is required' }, 
          { status: 400 }
        );
      }

      const verificationRecord = db.prepare(
        'SELECT * FROM emailVerificationTokens WHERE token = ? AND verifiedAt IS NULL'
      ).get(token) as any;

      if (!verificationRecord) {
        return NextResponse.json(
          { error: 'Invalid or expired token' }, 
          { status: 400 }
        );
      }

      // Check if token is expired
      if (new Date(verificationRecord.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: 'Token has expired' }, 
          { status: 400 }
        );
      }

      try {
        // Mark email as verified
        const userEmail = verificationRecord.email;
        db.prepare('UPDATE users SET emailVerified = 1 WHERE email = ?').run(userEmail);
        
        // Mark token as verified
        db.prepare('UPDATE emailVerificationTokens SET verifiedAt = ? WHERE token = ?').run(
          new Date().toISOString(),
          token
        );

        return NextResponse.json({ 
          success: true, 
          message: 'Email verified successfully',
          email: userEmail
        });
      } catch (error) {
        console.error('Error verifying email:', error);
        return NextResponse.json(
          { error: 'Failed to verify email' }, 
          { status: 500 }
        );
      }
    }

    // Send password reset email
    if (action === 'sendPasswordReset') {
      const { userName } = body;

      // Check if user exists
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      if (!user) {
        // Don't reveal if email exists or not for security
        return NextResponse.json({ 
          success: true, 
          message: 'If the email exists, a password reset link will be sent' 
        });
      }

      try {
        const resetToken = generateToken();
        const expiresAt = getTokenExpiry(1); // 1 hour expiry for password reset

        db.prepare('INSERT INTO passwordResetTokens (id, email, token, userId, expiresAt, createdAt) VALUES (?, ?, ?, ?, ?, ?)').run(
          uuidv4(),
          email,
          resetToken,
          user.id,
          expiresAt,
          new Date().toISOString()
        );

        await sendPasswordResetEmail(email, userName || email.split('@')[0], resetToken);

        return NextResponse.json({ 
          success: true, 
          message: 'Password reset email sent' 
        });
      } catch (error) {
        console.error('Error sending password reset email:', error);
        return NextResponse.json(
          { error: 'Failed to send password reset email' }, 
          { status: 500 }
        );
      }
    }

    // Verify password reset token
    if (action === 'verifyPasswordResetToken') {
      if (!token) {
        return NextResponse.json(
          { error: 'Token is required' }, 
          { status: 400 }
        );
      }

      const resetRecord = db.prepare(
        'SELECT * FROM passwordResetTokens WHERE token = ? AND usedAt IS NULL'
      ).get(token) as any;

      if (!resetRecord) {
        return NextResponse.json(
          { error: 'Invalid or expired token' }, 
          { status: 400 }
        );
      }

      // Check if token is expired
      if (new Date(resetRecord.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: 'Token has expired' }, 
          { status: 400 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        email: resetRecord.email,
        message: 'Token is valid' 
      });
    }

    // Reset password
    if (action === 'resetPassword') {
      if (!token || !newPassword) {
        return NextResponse.json(
          { error: 'Token and new password are required' }, 
          { status: 400 }
        );
      }

      const resetRecord = db.prepare(
        'SELECT * FROM passwordResetTokens WHERE token = ? AND usedAt IS NULL'
      ).get(token) as any;

      if (!resetRecord) {
        return NextResponse.json(
          { error: 'Invalid or expired token' }, 
          { status: 400 }
        );
      }

      // Check if token is expired
      if (new Date(resetRecord.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: 'Token has expired' }, 
          { status: 400 }
        );
      }

      try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and verify email
        db.prepare('UPDATE users SET password = ?, emailVerified = 1 WHERE email = ?').run(
          hashedPassword,
          resetRecord.email
        );

        // Mark token as used
        db.prepare('UPDATE passwordResetTokens SET usedAt = ? WHERE token = ?').run(
          new Date().toISOString(),
          token
        );

        return NextResponse.json({ 
          success: true, 
          message: 'Password reset successfully. Email verified!',
          email: resetRecord.email,
          emailVerified: true
        });
      } catch (error) {
        console.error('Error resetting password:', error);
        return NextResponse.json(
          { error: 'Failed to reset password' }, 
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
