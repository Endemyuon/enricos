'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Loader, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifyingToken' | 'form' | 'success' | 'error'>('verifyingToken');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing reset token. Please request a password reset again.');
      return;
    }

    verifyToken(token);
  }, [token]);

  const verifyToken = async (resetToken: string) => {
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verifyPasswordResetToken',
          token: resetToken,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('form');
        setEmail(data.email);
      } else {
        setStatus('error');
        setMessage(data.error || 'Invalid or expired reset token. Please request a new password reset.');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      setStatus('error');
      setMessage('An error occurred. Please try requesting a password reset again.');
    }
  };

  const validatePasswordStrength = (pwd: string) => {
    let strength = 0;

    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;

    if (pwd.length >= 12) strength++;

    if (strength === 0) return { level: 'Weak', color: 'text-red-600', bgColor: 'bg-red-200' };
    if (strength <= 2) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-200' };
    if (strength <= 3) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-200' };
    return { level: 'Strong', color: 'text-green-600', bgColor: 'bg-green-200' };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'password') {
      const strength = validatePasswordStrength(value);
      setPasswordStrength(strength.level);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // Validation
    if (!formData.password || !formData.confirmPassword) {
      setMessage('Please fill in all fields');
      return;
    }

    if (formData.password.length < 8) {
      setMessage('Password must be at least 8 characters');
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setMessage('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      setMessage('Password must contain at least one number');
      return;
    }

    if (!/[!@#$%^&*]/.test(formData.password)) {
      setMessage('Password must contain at least one special character (!@#$%^&*)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resetPassword',
          token,
          newPassword: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setMessage(data.error || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-600 p-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-red-500 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-red-500 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '0.5s' }}></div>

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        {status === 'error' && (
          <Link href="/login" className="inline-flex items-center gap-2 text-white hover:text-red-100 mb-6 transition font-semibold">
            <ArrowLeft className="w-5 h-5" />
            Back to Login
          </Link>
        )}

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
            <h1 className="text-slate-900 text-3xl font-bold">Reset Password</h1>
          </div>

          {/* Status Messages */}
          {status === 'verifyingToken' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Loader className="w-12 h-12 text-red-600 animate-spin" />
              </div>
              <p className="text-slate-600">Verifying your reset link...</p>
            </div>
          )}

          {status === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-slate-600 text-sm mb-6">
                Enter your new password below. Make sure it's strong and meets all requirements.
              </p>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-full focus:outline-none focus:border-red-600 text-slate-900 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordStrength && (
                  <p className="text-sm mt-2">
                    Password Strength: <span className={`font-semibold ${validatePasswordStrength(formData.password).color}`}>
                      {passwordStrength}
                    </span>
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700 space-y-2">
                <p className="font-semibold">Password Requirements:</p>
                <ul className="space-y-1 ml-4">
                  <li>• At least 8 characters</li>
                  <li>• One uppercase letter</li>
                  <li>• One number</li>
                  <li>• One special character (!@#$%^&*)</li>
                </ul>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-full focus:outline-none focus:border-red-600 text-slate-900 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {message && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <p className="text-slate-600 mb-6">{message}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">
                  ✓ Your password has been successfully reset!
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
              <p className="text-slate-600 mb-6">{message}</p>
              <button
                onClick={() => router.push('/forgot-password')}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition"
              >
                Request New Reset Link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
