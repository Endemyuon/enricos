'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'sent' | 'error'>('email');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendPasswordReset',
          email,
          userName: email.split('@')[0],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('sent');
        setMessage(data.message || 'Password reset email sent successfully!');
      } else {
        setStep('error');
        setMessage(data.error || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Error sending reset email:', error);
      setStep('error');
      setMessage('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-600 p-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Interactive Background Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-red-500 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-red-500 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-1/3 left-5 w-24 h-24 bg-white/10 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
      <div className="absolute bottom-10 right-1/4 w-28 h-28 bg-red-700 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s' }}></div>

      {/* Content */}
      <div className="w-full max-w-2xl relative z-10">
        {/* Back Button */}
        <Link href="/login" className="inline-flex items-center gap-2 text-white hover:text-red-100 mb-6 transition font-semibold">
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </Link>

        {/* Card */}
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
            <h1 className="text-slate-900 text-3xl font-bold">Forgot Your Password?</h1>
            <p className="text-slate-600 mt-2">No problem! We'll help you reset it.</p>
          </div>

          {/* Email Input Step */}
          {step === 'email' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <p className="text-slate-700 text-sm">
                  Enter your email address and we'll send you a link to reset your password. The link will expire in 1 hour for security.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-full focus:outline-none focus:border-red-600 text-slate-900 placeholder-slate-400 transition"
                />
              </div>

              {message && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          {/* Success Step */}
          {step === 'sent' && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Check Your Email</h2>
                <p className="text-slate-600">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-3">
                <p className="font-semibold text-slate-900">Next steps:</p>
                <ul className="text-sm text-slate-700 space-y-2 text-left">
                  <li>1. Check your email inbox for our message</li>
                  <li>2. Click the "Reset Your Password" button in the email</li>
                  <li>3. Create a new password (must be strong)</li>
                  <li>4. Log in with your new password</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
                <p>
                  ⏱️ <strong>The reset link will expire in 1 hour.</strong> If you don't receive the email, check your spam folder or request a new link.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setStep('email');
                    setEmail('');
                    setMessage('');
                  }}
                  className="w-full px-4 py-3 border-2 border-red-600 text-red-600 rounded-full font-semibold hover:bg-red-50 transition"
                >
                  Try Another Email
                </button>
                <Link
                  href="/login"
                  className="block px-4 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition text-center"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <AlertCircle className="w-16 h-16 text-red-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
                <p className="text-slate-600">{message}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setStep('email');
                    setEmail('');
                    setMessage('');
                  }}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition"
                >
                  Try Again
                </button>
                <Link
                  href="/login"
                  className="block px-4 py-3 border-2 border-red-600 text-red-600 rounded-full font-semibold hover:bg-red-50 transition"
                >
                  Back to Login
                </Link>
              </div>

              {/* Contact Support */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <p className="text-sm text-slate-700 mb-3">Need more help?</p>
                <p className="text-slate-900 font-semibold">
                  <a href="tel:+639123456789" className="hover:text-red-600 transition">Phone: 0977 372 8945</a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                  >
                    Message on Facebook
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Method 3: Email */}
            <div className="p-6 border-2 border-slate-200 rounded-xl bg-white">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-100 rounded-lg mt-1">
                  <Mail className="w-6 h-6 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-2">Send an Email</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Include your full name and email address, and we'll help you reset your password.
                  </p>
                  <a
                    href="mailto:admin@enricos.shop"
                    className="inline-block px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-semibold text-sm"
                  >
                    admin@enricos.shop
                  </a>
                </div>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-yellow-800 text-sm font-semibold">
                ⚠️ For security purposes, please provide:
              </p>
              <ul className="text-yellow-700 text-sm mt-2 space-y-1 ml-4 list-disc">
                <li>Your full name</li>
                <li>Email address associated with your account</li>
                <li>Any additional info we can use to verify your identity</li>
              </ul>
            </div>

            {/* Back to Login Button */}
            <div className="pt-4">
              <Link href="/login" className="block text-center">
                <button className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 rounded-full transition-all shadow-lg">
                  Return to Login
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 text-white">
          <p className="text-sm">
            Our team typically responds within 24 hours. Thank you for your patience!
          </p>
        </div>
      </div>
    </div>
  );
}
