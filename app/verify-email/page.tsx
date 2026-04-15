'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Loader, AlertCircle, Send } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'resend'>('verifying');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Get stored user name from registration
    const storedName = localStorage.getItem('registrationName') || '';
    const storedEmail = localStorage.getItem('registrationEmail') || email || '';
    setUserName(storedName);
    setResendEmail(storedEmail);

    // If token is provided, verify it
    if (token) {
      verifyEmail(token);
    } else if (!email) {
      setStatus('resend');
    }
  }, [token, email]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setStatus('verifying');
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verifyEmail',
          token: verificationToken,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage('Email verified successfully! Redirecting to login...');
        
        // Clear registration data from localStorage
        localStorage.removeItem('registrationName');
        localStorage.removeItem('registrationEmail');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('An error occurred during verification. Please try resending the email.');
    }
  };

  const handleResendEmail = async () => {
    if (!resendEmail) {
      setMessage('Please enter your email address');
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendVerificationEmail',
          email: resendEmail,
          userName: userName || resendEmail.split('@')[0],
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('Verification email sent! Please check your inbox.');
        setStatus('verifying');
      } else {
        setMessage(data.error || 'Failed to send verification email. Please try again.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-600 p-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-red-500 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-red-500 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-1/3 left-5 w-24 h-24 bg-white/10 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.3s' }}></div>

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/enricos.png"
                alt="Enrico's Logo"
                width={100}
                height={100}
              />
            </div>
            <h1 className="text-slate-900 text-3xl font-bold">Verify Your Email</h1>
          </div>

          {/* Status Messages */}
          {status === 'verifying' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Loader className="w-12 h-12 text-red-600 animate-spin" />
              </div>
              <p className="text-slate-600 mb-4">
                Verifying your email address...
              </p>
              {resendEmail && (
                <p className="text-sm text-slate-500">Verifying: {resendEmail}</p>
              )}
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <p className="text-slate-600 mb-6">
                {message}
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">
                  ✓ Your account is now active and ready to use!
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
                <p className="text-slate-600 mb-4">
                  {message}
                </p>
              </div>

              {/* Resend Email Form */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Resend Verification Email
                </label>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-full focus:outline-none focus:border-red-600 text-slate-900 placeholder-slate-400"
                />
                <button
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resendLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Resend Verification Email
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {status === 'resend' && (
            <div className="space-y-6">
              <p className="text-slate-600 text-center mb-4">
                Didn't receive a verification email? Enter your email below to resend it.
              </p>

              {/* Resend Email Form */}
              <div className="space-y-4">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-full focus:outline-none focus:border-red-600 text-slate-900 placeholder-slate-400"
                />
                <button
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resendLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Resend Verification Email
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-slate-600 text-sm mb-4">
              Already have an account?
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2 border-2 border-red-600 text-red-600 rounded-full font-semibold hover:bg-red-50 transition"
            >
              Go to Login
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-white text-sm">
            Need help? Contact us at{' '}
            <a href="tel:+639123456789" className="font-semibold hover:underline">
              0977 372 8945
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
