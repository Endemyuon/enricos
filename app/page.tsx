'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, Coffee, LogOut, Download, ArrowRight, Utensils, Flame, Award, Smartphone, Facebook, Menu, X, User, UserPlus, Zap } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface Reward {
  id: string;
  title: string;
  expiry?: string;
  imgUrl?: string;
  points: number;
}

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [userRfidCard, setUserRfidCard] = useState<string | null>(null);
  const [rfidInput, setRfidInput] = useState('');
  const [rfidMessage, setRfidMessage] = useState('');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTopButtons, setShowTopButtons] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowTopButtons(currentScrollY < lastScrollY || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Auto-hide loading spinner after 3 seconds
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  useEffect(() => {
    // Load Facebook SDK
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    
    // Parse XFBML after script loads
    script.onload = () => {
      if ((window as any).FB) {
        (window as any).FB.XFBML.parse();
      }
    };
    
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');
    setUserRole(role);
    setUserEmail(email);
    setUserName(name);
    setIsLoggedIn(!!role);

    // Auto-redirect admin users to admin dashboard
    if (role === 'admin') {
      router.push('/admin');
    }

    // Fetch customer data if logged in
    if (role === 'customer' && email) {
      fetchCustomerData(email);
    }

    // Load rewards for non-logged-in users
    loadRewards();
  }, [router]);

  const fetchCustomerData = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const customers = await response.json();
        const customer = customers.find((c: any) => c.email === email);
        if (customer) {
          setUserPoints(customer.points || 0);
          setUserRfidCard(customer.rfidCard || null);
        }
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  const loadRewards = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/rewards');
      if (res.ok) {
        const data = await res.json();
        setRewards(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading rewards', err);
    }
  };

  const handleRegisterRfidCard = async () => {
    if (!rfidInput.trim()) {
      setRfidMessage('Please enter an RFID card serial number');
      return;
    }

    if (!userEmail) {
      setRfidMessage('Email not found. Please log in again.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateByEmail',
          email: userEmail,
          rfidCard: rfidInput,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserRfidCard(rfidInput);
        setRfidInput('');
        setRfidMessage('✓ RFID card registered successfully!');
        setTimeout(() => setRfidMessage(''), 3000);
      } else {
        setRfidMessage(data.error || 'Error registering RFID card. Please try again.');
      }
    } catch (error) {
      console.error('Error registering RFID card:', error);
      setRfidMessage('Network error. Please check your connection and try again.');
    }
  };

  const handleLogout = () => {
    setIsLoading(true);
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setUserRole(null);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Loading Spinner */}
      {isLoading && <LoadingSpinner />}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-red-600 to-red-700 z-50 overflow-hidden shadow-2xl transition-all duration-700 ${
          sidebarOpen ? 'w-72' : 'w-0'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Interactive Background Elements */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-red-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-5 w-50 h-50 bg-red-500 rounded-full opacity-15 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/3 right-5 w-32 h-32 bg-white/10 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
        <div className="absolute bottom-10 left-1/4 w-36 h-36 bg-red-700 rounded-full opacity-15 animate-bounce" style={{ animationDelay: '1s' }}></div>

        {/* Close Button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-6 right-6 z-10 text-3xl text-white/80 hover:text-white transition-all duration-300 hover:scale-110"
          style={{
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          ×
        </button>

        {/* Sidebar Content */}
        <div className="relative z-10 p-8 mt-12">
          {/* Logo */}
          <Link href="/" onClick={() => setSidebarOpen(false)} className="flex justify-center mb-12 hover:opacity-85 transition-opacity duration-500" style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <Image
              src="/enricos.png"
              alt="Enrico's Logo"
              width={150}
              height={150}
              className="rounded-lg"
            />
          </Link>

          {/* User Profile Section */}
          {isLoggedIn && (
            <div className="mb-10 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-500" style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-white/20 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{userName || 'User'}</p>
                  <p className="text-xs text-white/70 truncate">{userEmail}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-2 mb-10">
            {isLoggedIn && (
              <>
                {userRole === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setSidebarOpen(false)}
                    className="block px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-500 text-sm font-medium"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                  >
                    Admin Dashboard
                  </Link>
                )}
                {userRole === 'customer' && (
                  <>
                    <Link
                      href="/rewards"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-500 text-sm font-medium"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                    >
                      <Gift className="w-5 h-5 text-white" />
                      Redeem Rewards
                    </Link>
                    {!userRfidCard && (
                      <Link
                        href="/register-card"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-500 text-sm font-medium"
                        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                      >
                        <Smartphone className="w-5 h-5 text-white" />
                        Register Card
                      </Link>
                    )}
                  </>
                )}
              </>
            )}
            {!isLoggedIn && (
              <>
                <Link
                  href="/login"
                  onClick={() => setSidebarOpen(false)}
                  className="block px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-500 text-sm font-medium"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setSidebarOpen(false)}
                  className="w-full px-4 py-3 text-white bg-white/25 hover:bg-white/35 rounded-lg transition-all duration-500 text-sm font-medium mt-3 text-center"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Logout Button */}
          {isLoggedIn && (
            <button
              onClick={() => {
                handleLogout();
                setSidebarOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/25 text-white hover:bg-white/35 rounded-lg transition-all duration-500 text-sm font-medium mt-10"
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Overlay - Only shown when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed top-0 bottom-0 right-0 z-40 bg-black/5 backdrop-blur-sm transition-opacity duration-700"
          onClick={() => setSidebarOpen(false)}
          style={{ 
            left: sidebarOpen ? '18rem' : 'auto', 
            opacity: sidebarOpen ? 1 : 0,
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        ></div>
      )}

      {/* Main Content with Transition */}
      <div className={`transition-all duration-700 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Open Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className={`fixed top-4 left-4 z-30 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-500 hover:shadow-xl hover:scale-110 ${
            showTopButtons ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Login Button (Top Right) */}
        {!isLoggedIn && (
          <Link href="/login">
            <button className={`fixed top-4 right-4 z-30 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:from-red-700 hover:to-red-800 transition-all duration-500 flex items-center gap-2 border border-red-500/30 backdrop-blur-sm ${
              showTopButtons ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}>
              <User className="w-5 h-5" />
              <span>Sign In</span>
            </button>
          </Link>
        )}

      {/* Hero Section */}
      {isLoggedIn ? (
        // Logged In Dashboard Section
        <section className="bg-white text-slate-900 py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Welcome Card */}
              <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-widest mb-2">Welcome Back</p>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">{userName || 'Guest'}</h2>
                <span className="inline-block bg-red-100 text-red-700 text-sm font-semibold px-4 py-2 rounded-full border border-red-200">Customer</span>
              </div>

              {/* Points Card */}
              <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-8 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image src="/enricos.png" alt="Enricos" width={60} height={60} className="rounded" />
                  <div>
                    <p className="text-slate-600 text-sm font-semibold uppercase tracking-widest">Your Points</p>
                    <p className="text-5xl font-bold text-red-600">{userPoints}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 items-stretch">
                  <Link href="/rewards">
                    <button className="w-full px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-lg">
                      Redeem Rewards
                    </button>
                  </Link>
                  <a href="https://www.facebook.com/EnricosMarikina" target="_blank" rel="noopener noreferrer" className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2">
                    <Facebook className="w-5 h-5" />
                    Find us on Facebook
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition">
                <div style={{ width: '100%', height: '280px' }}>
                  <iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FEnricosMarikina%2Fposts%2Fpfbid029Co54bkMDCQZidFyCCBN45kCtGNF4xBpAAqvRU2aENqcrmxCqSNxErZYfmgDDQW2l&show_text=false&width=500" width="100%" height="100%" style={{ border: 'none', margin: 0, padding: 0, display: 'block' }} scrolling="no" frameBorder="0" allowFullScreen={true} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition">
                <div style={{ width: '100%', height: '280px' }}>
                  <iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FEnricosMarikina%2Fposts%2Fpfbid06nnjDEiYK8D6gxtd6Gjq1FzQ4QrqYSQRrYTyBpyT1MmtqJKi8GSsqKCHbdqk8eckl&show_text=false&width=500" width="100%" height="100%" style={{ border: 'none', margin: 0, padding: 0, display: 'block' }} scrolling="no" frameBorder="0" allowFullScreen={true} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition">
                <div style={{ width: '100%', height: '280px' }}>
                  <iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FEnricosMarikina%2Fposts%2Fpfbid032H1ZgzpS9dpTaMbc96E9Grj39qkikgrBs4Xr6sETzscV4qCEWCDJqYrZr8ydADi6l&show_text=false&width=500" width="100%" height="100%" style={{ border: 'none', margin: 0, padding: 0, display: 'block' }} scrolling="no" frameBorder="0" allowFullScreen={true} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
                </div>
              </div>
            </div>

            {/* RFID Card Registration Section */}
            {!userRfidCard && (
              <div className="mt-12 bg-white border border-slate-200 rounded-2xl p-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <Smartphone className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Register Your RFID Card</h3>
                    <p className="text-slate-600 mb-6">Link your Enrico's Loyalty Card </p>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={rfidInput}
                        onChange={(e) => setRfidInput(e.target.value)}
                        placeholder="Enter RFID card serial number"
                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 transition"
                      />
                      <button
                        onClick={handleRegisterRfidCard}
                        className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-lg"
                      >
                        Register
                      </button>
                    </div>
                    {rfidMessage && (
                      <p className={`mt-3 text-sm ${
                        rfidMessage.includes('✓')
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {rfidMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {userRfidCard && (
              <div className="mt-12 bg-white border border-slate-200 rounded-2xl p-8 shadow-lg text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Smartphone className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Your RFID Card Registered</h3>
                <p className="text-slate-600 text-sm">Card Serial: <span className="font-mono text-slate-900">📛 {userRfidCard}</span></p>
              </div>
            )}
          </div>
        </section>
      ) : (
        // Non-Logged In Marketing Section
        <section className="bg-white text-slate-900 py-12 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <Image
                src="/enricos.png"
                alt="Enrico's Logo"
                width={280}
                height={280}
                className="rounded-lg"
              />
            </div>
            <div className="mb-6 inline-block">
              <span className="text-sm font-semibold text-red-600 uppercase tracking-widest"></span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight mitr-semibold">
              Earn Rewards for <span className="text-red-600">Every Bite</span>
            </h1>
            <p className="text-xl text-slate-900 font-bold mb-8 max-w-2xl mx-auto mitr-semibold">
              Welcome to Enrico's It's All About Food! 
            </p>
          </div>
        </section>
      )}

      {/* Premium Register Section */}
      {!isLoggedIn && (
        <section className="bg-white py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-start">
              {/* Left Side - Available Rewards */}
              <div>
                <div className="mb-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 rounded-full mb-4">
                    <Gift className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-bold text-red-600">AVAILABLE REWARDS</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                    Exclusive Perks Await
                  </h2>
                  <p className="text-slate-600 mt-3">
                    Join now to unlock these amazing rewards and start earning points on every purchase.
                  </p>
                </div>

                {rewards.length > 0 ? (
                  <div className="space-y-4 rewards-scrollable max-h-[500px] overflow-y-auto pr-2">
                    {rewards.map((reward) => (
                      <div
                        key={reward.id}
                        className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-red-300 hover:shadow-md transition duration-300"
                      >
                        <div className="flex gap-4 p-4">
                          {reward.imgUrl && (
                            <div className="relative w-24 h-24 flex-shrink-0">
                              <Image
                                src={reward.imgUrl}
                                alt={reward.title}
                                fill
                                className="object-cover rounded-lg"
                              />
                            </div>
                          )}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 group-hover:text-red-600 transition">
                                {reward.title}
                              </h3>
                              {reward.expiry && (
                                <p className="text-xs text-slate-500 mt-1">{reward.expiry}</p>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-red-600">{reward.points} pts</span>
                              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-600">
                    <Gift className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm">Rewards coming soon...</p>
                  </div>
                )}
              </div>

              {/* Right Side - Registration & Benefits */}
              <div>
                <div className="mb-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 rounded-full mb-4">
                    <span className="text-xs font-bold text-red-600">EXCLUSIVE PERKS</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                    Unlock Your <span className="text-red-600">Rewards</span>
                  </h2>
                  <p className="text-slate-600 text-lg">
                    Enjoy exclusive perks, special discounts, and so much more with your Enrico's loyalty card.
                  </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="space-y-2">
                    <div className="text-2xl">🎁</div>
                    <h4 className="font-semibold text-slate-900 text-sm">Earn Points</h4>
                    <p className="text-xs text-slate-600">1 point per 600 pesos</p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-2xl">☕</div>
                    <h4 className="font-semibold text-slate-900 text-sm">Exclusive Perks</h4>
                    <p className="text-xs text-slate-600">Free meals & treats</p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-2xl">🎂</div>
                    <h4 className="font-semibold text-slate-900 text-sm">Birthday Special</h4>
                    <p className="text-xs text-slate-600">15% discount</p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-2xl">�️</div>
                    <h4 className="font-semibold text-slate-900 text-sm">Free Exclusive Voucher</h4>
                    <p className="text-xs text-slate-600">Special dining rewards</p>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </section>
      )}

      {/* Three Benefits Section */}
      {!isLoggedIn && (
        <section className="py-20 px-6 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-slate-900 mb-4 mitr-semibold"> </h2>
              <br></br>
              <a href="https://www.facebook.com/EnricosMarikina" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg">
                <Facebook className="w-5 h-5" />
                Like & Follow Us on Facebook
              </a>
            </div>
            <div id="fb-root"></div>
            <style>{`
              .facebook-post-container {
                display: flex;
                justify-content: center;
                width: 100%;
              }
              .fb-post {
                max-width: 500px !important;
              }
            `}</style>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Photo 1 */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 border border-slate-100">
                <div className="facebook-post-container p-4">
                  <div className="fb-post" data-href="https://www.facebook.com/photo/?fbid=898297172929935"></div>
                </div>
              </div>

              {/* Photo 2 */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 border border-slate-100">
                <div className="facebook-post-container p-4">
                  <div className="fb-post" data-href="https://www.facebook.com/photo?fbid=908365841923068"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      {!isLoggedIn && (
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-black mitr-semibold">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: UserPlus, title: 'Create Your Account', desc: 'Join our rewards program in seconds' },
              { icon: Utensils, title: 'Dine & Earn', desc: 'Earn 1 point per 600 pesos on every purchase' },
              { icon: Gift, title: 'Redeem Rewards', desc: 'Exchange points for meals, drinks & more' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-red-100 rounded-full">
                      <Icon className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">{item.title}</h3>
                  <p className="text-black">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-slate-900 mitr-semibold">Order Now! Rewards Await!</h2>
          <p className="text-slate-600 text-lg mb-8">   </p>
          <div className="flex gap-4 justify-center mb-16">

            <Link
              href="/login"
              className="px-8 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-semibold"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
            >
              Create Account
            </Link>
          </div>

          {/* Location Section */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Visit Us Today!</h3>
            <div className="mx-auto max-w-2xl rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-500">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3862.6823898892267!2d121.07814972346887!3d14.63225934248699!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b93f3cd7ea99%3A0x4f05b490b335ae63!2sEnrico%E2%80%99s!5e0!3m2!1sen!2sph!4v1678901234567"
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: '8px' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <p className="text-slate-600 text-sm mt-4">📍 62 A Bonifacio Ave, Barangka Marikina, Metro Manila</p>
          </div>
        </div>
      </section>
      )}

      {/* Footer */}
      <footer className="bg-black text-slate-200 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Premium Footer Content */}
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src="/enricos.png"
                  alt="Enrico's Logo"
                  width={36}
                  height={36}
                  className="rounded-lg"
                />
                <span className="text-2xl font-bold text-white">Enrico's</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed font-semibold italic mb-4">"It's All About Food!"</p>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">A family restaurant dedicated to delivering authentic, delicious meals with heart and tradition.</p>
              <div className="bg-red-600/20 rounded-lg p-3 text-xs">
                <p className="text-red-400 font-semibold mb-2">Free Delivery!</p>
                <p className="text-slate-300">Within Barangka, Marikina</p>
              </div>
            </div>

            {/* Restaurant Links */}
            <div>
              <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1 h-5 bg-red-600 rounded-full"></div>
                About Us
              </h4>
              <ul className="text-sm space-y-3">
                <li><a href="https://www.facebook.com/EnricosMarikina" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition duration-300">Our Story</a></li>
                <li><a href="https://www.facebook.com/EnricosMarikina" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition duration-300">Our Menu</a></li>
                <li><a href="https://www.facebook.com/EnricosMarikina" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition duration-300">Quality & Taste</a></li>
                <li><a href="https://www.facebook.com/EnricosMarikina" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition duration-300">Family Values</a></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1 h-5 bg-red-600 rounded-full"></div>
                Services
              </h4>
              <ul className="text-sm space-y-3">
                <li><a href="https://www.facebook.com/EnricosMarikina" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition duration-300">Dine In</a></li>
                <li><a href="https://www.facebook.com/EnricosMarikina" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition duration-300">Delivery</a></li>
                <li><a href="https://www.facebook.com/EnricosMarikina" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition duration-300">Catering</a></li>
                <li><a href="https://www.facebook.com/EnricosMarikina" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition duration-300">Rewards Program</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-1 h-5 bg-red-600 rounded-full"></div>
                Contact Us
              </h4>
              <ul className="text-sm space-y-4">
                <li>
                  <p className="text-slate-400 mb-1">📞 Phone</p>
                  <a href="tel:09773728945" className="text-red-500 font-semibold hover:text-red-400 transition duration-300">0977 372 8945</a>
                </li>
                <li>
                  <p className="text-slate-400 mb-1">📍 Location</p>
                  <p className="text-slate-300 text-xs">62 A Bonifacio Ave, Barangka Marikina, Metro Manila</p>
                </li>
                <li>
                  <p className="text-slate-400 mb-1">🕐 Hours</p>
                  <p className="text-slate-300 text-xs">Open 10AM to 9PM Daily</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Premium Divider */}
          <div className="border-t border-slate-800 my-8"></div>

          {/* Copyright & Social */}
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-4">© 2026 <span className="text-red-500 font-bold">Enrico's Restaurant</span> - Bringing Families Together</p>
            <div className="flex justify-center gap-4 pt-3">
              <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center hover:bg-red-600/30 transition cursor-pointer">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center hover:bg-red-600/30 transition cursor-pointer">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center hover:bg-red-600/30 transition cursor-pointer">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}