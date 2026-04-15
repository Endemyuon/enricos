'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogIn } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-hide loading after 3 seconds
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if email verification is required
        if (data.requiresVerification) {
          setError('Please verify your email before logging in');
          // Store email for verify-email page
          localStorage.setItem('registrationEmail', email);
          localStorage.setItem('verifyAfterLogin', 'true');
          // Redirect to verify-email page
          setTimeout(() => {
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          }, 1500);
          return;
        }
        setError('Invalid email or password');
        return;
      }

      console.log('✅ Login successful');
      console.log('Role:', data.user?.role);
      
      if (data.success) {
        console.log('Setting localStorage with role:', data.user.role);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userEmail', data.user.email);
        
        // Store user ID and name for customer
        if (data.user.id) {
          localStorage.setItem('userId', data.user.id);
        }
        if (data.user.name) {
          localStorage.setItem('userName', data.user.name);
        }
        
        console.log('Verify - localStorage now has:', {
          userRole: localStorage.getItem('userRole'),
          userEmail: localStorage.getItem('userEmail'),
          userId: localStorage.getItem('userId'),
          userName: localStorage.getItem('userName'),
        });
        
        if (data.user.role === 'admin') {
          console.log('Admin login detected - redirecting to /admin');
          router.push('/admin');
        } else {
          console.log('Customer login detected - redirecting');
          // Redirect to the specified URL or home
          router.push(redirectUrl || '/');
        }
      } else {
        console.error('Login response was not successful:', data);
        setError('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-600 p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Loading Spinner */}
      {loading && <LoadingSpinner />}

      {/* Interactive Background Elements */}
      <div className="absolute top-10 right-10 w-24 sm:w-32 h-24 sm:h-32 bg-red-500 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-32 sm:w-40 h-32 sm:h-40 bg-red-500 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-1/3 left-5 w-20 sm:w-24 h-20 sm:h-24 bg-white/10 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
      <div className="absolute bottom-10 right-1/4 w-20 sm:w-28 h-20 sm:h-28 bg-red-700 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s' }}></div>

      {/* Content */}
      <div className="w-full max-w-md relative z-10 px-2 sm:px-0">
        {/* Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden p-4 sm:p-6 md:p-8">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4 sm:mb-6">
              <Image
                src="/enricos.png"
                alt="Enrico's Logo"
                width={100}
                height={100}
                className="rounded-lg w-20 sm:w-24 md:w-[100px] h-20 sm:h-24 md:h-[100px]"
              />
            </div>
            <h1 className="text-slate-900 text-xl sm:text-2xl md:text-3xl font-bold">Welcome to Enrico's!</h1>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-200 rounded-full focus:outline-none focus:border-red-600 transition bg-slate-50 text-slate-900 placeholder-slate-400 text-sm sm:text-base"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-slate-200 rounded-full focus:outline-none focus:border-red-600 transition bg-slate-50 text-slate-900 placeholder-slate-400 text-sm sm:text-base"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-200 font-medium">
                {error}
              </div>
            )}

            <div className="text-center">
              <Link href="/forgot-password" className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-semibold transition">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white font-bold py-2 sm:py-3 rounded-full hover:bg-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-6 text-sm sm:text-base"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Bottom Links */}
          <div className="mt-6 sm:mt-8 space-y-2 sm:space-y-3">
            {/* Register Button */}
            <Link href="/register" className="w-full block">
              <button className="w-full bg-white text-red-600 font-bold py-2 sm:py-3 rounded-full border-2 border-red-600 hover:bg-red-50 transition-all shadow-lg text-sm sm:text-base">
                Register
              </button>
            </Link>

            {/* Home Button */}
            <Link href="/" className="w-full block">
              <button className="w-full bg-white text-red-600 font-bold py-2 sm:py-3 rounded-full border-2 border-red-600 hover:bg-red-50 transition-all shadow-lg text-sm sm:text-base">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LoginForm />
    </Suspense>
  );
}
