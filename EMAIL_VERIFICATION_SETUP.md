# Email Verification & Password Reset Implementation Guide

This document explains the email verification system for user registration and password reset functionality.

## Overview

The system includes:
1. **Email Verification on Registration** - Users must verify their email before they can login
2. **Password Reset via Email** - Users can safely reset forgotten passwords with email verification

## Setup Instructions

### 1. Configure Environment Variables

Create a `.env.local` file in the root directory (copy from `.env.example`):

```env
# Resend Email API
RESEND_API_KEY=your_resend_api_key
RESEND_FROM=noreply@enricos-rewards.com

# Application URL (for verification and reset links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# For production:
# NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Create an account
3. Go to API Keys section
4. Create a new API key
5. Copy it to your `.env.local` file

### 3. Verify Database is Updated

The system automatically creates these new tables:
- `emailVerificationTokens` - Stores email verification tokens
- `passwordResetTokens` - Stores password reset tokens

The `users` table is updated with an `emailVerified` column (0 = not verified, 1 = verified)

## User Flows

### Registration Flow

1. User fills out registration form
2. User clicks "Register"
3. User account is created with `emailVerified = 0`
4. Verification email is sent to user's email
5. User is redirected to `/verify-email` page
6. User clicks verification link in email OR enters email to resend
7. Email is verified and user can now login

**Pages:**
- `/register` - Registration form
- `/verify-email` - Email verification page (with resend option)

### Password Reset Flow

1. User clicks "Forgot Password" on login page
2. User enters their email address
3. Password reset email is sent
4. User receives email with reset link
5. User clicks reset link directed to `/reset-password`
6. User enters and confirms new password
7. Password is updated and user can login with new password

**Pages:**
- `/forgot-password` - Password reset request form
- `/reset-password` - Password reset form (token-based)

### Login Flow

1. User enters email and password
2. If email is not verified:
   - Error: "Please verify your email before logging in"
   - User is redirected to `/verify-email` page
3. If email is verified:
   - User is logged in successfully
   - User is redirected to dashboard

## API Endpoints

### Email API (`/api/email`)

#### Send Verification Email
```json
POST /api/email
{
  "action": "sendVerificationEmail",
  "email": "user@example.com",
  "userName": "John Doe"
}
```

#### Verify Email Token
```json
POST /api/email
{
  "action": "verifyEmail",
  "token": "verification_token_from_email"
}
```

#### Send Password Reset Email
```json
POST /api/email
{
  "action": "sendPasswordReset",
  "email": "user@example.com",
  "userName": "John Doe"
}
```

#### Verify Password Reset Token
```json
POST /api/email
{
  "action": "verifyPasswordResetToken",
  "token": "reset_token_from_email"
}
```

#### Reset Password
```json
POST /api/email
{
  "action": "resetPassword",
  "token": "reset_token_from_email",
  "newPassword": "NewPassword123!"
}
```

### Auth API Updates

The login endpoint now checks `emailVerified` status:

```json
POST /api/auth (login action)

Response if email not verified:
{
  "error": "Email not verified",
  "requiresVerification": true,
  "email": "user@example.com"
}
```

## Email Templates

Two email templates are used:

### 1. Email Verification Template
- File: `/emails/email-verification.tsx`
- Sent when user registers
- Contains verification link (24-hour expiry)
- Link format: `https://yourdomain.com/verify-email?token=xyz`

### 2. Password Reset Template
- File: `/emails/password-reset-email.tsx`
- Sent when user requests password reset
- Contains reset link (1-hour expiry)
- Link format: `https://yourdomain.com/reset-password?token=xyz`

## Token Expiration

- **Email Verification Token**: 24 hours
- **Password Reset Token**: 1 hour

## Database Schema

### emailVerificationTokens Table
```sql
CREATE TABLE emailVerificationTokens (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  userId TEXT,
  expiresAt TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  verifiedAt TEXT
)
```

### passwordResetTokens Table
```sql
CREATE TABLE passwordResetTokens (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  userId TEXT,
  expiresAt TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  usedAt TEXT
)
```

### users Table (Updated)
```sql
ALTER TABLE users ADD COLUMN emailVerified INTEGER DEFAULT 0;
```

## Security Features

1. **Token-Based Authentication**: Uses cryptographically secure random tokens
2. **Token Expiration**: Tokens automatically expire after set time
3. **One-Time Use**: Password reset tokens can only be used once
4. **Email Confirmation**: Unverified users cannot access the application
5. **Secure Password Hashing**: Passwords are hashed with bcryptjs
6. **Password Requirements**: 
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one number
   - At least one special character

## Testing

### Test Email Registration
1. Go to `/register`
2. Fill out form with test email
3. Check email for verification link
4. Click link or use resend feature
5. Email should be marked as verified
6. Can now login

### Test Password Reset
1. Go to `/login`
2. Click "Forgot Your Password?"
3. Enter email
4. Check email for reset link
5. Click link and enter new password
6. Can now login with new password

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Troubleshooting

### Emails Not Sending
- Check `RESEND_API_KEY` is set correctly in `.env.local`
- Verify sender email domain is authorized in Resend
- Check Resend dashboard for delivery logs

### Verification Link Not Working
- Verify `NEXT_PUBLIC_APP_URL` matches your deployment domain
- Check token hasn't expired (24-hour limit)
- Ensure database tables are created

### Password Reset Issues
- Check token hasn't expired (1-hour limit)
- Verify password meets all requirements
- Token can only be used once

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Email change verification
- [ ] Account recovery options
- [ ] Login attempt tracking
- [ ] Session management
- [ ] Device fingerprinting
