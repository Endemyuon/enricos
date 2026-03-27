'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterCardPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [rfidInput, setRfidInput] = useState('');
  const [rfidMessage, setRfidMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');
    
    setUserEmail(email);
    setUserName(name);
    setIsLoggedIn(!!role);

    // Redirect if not logged in as customer
    if (!role || role !== 'customer') {
      router.push('/login');
    }
  }, [router]);

  const handleRegisterCard = async () => {
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
      // First, fetch customer's current points
      const customerResponse = await fetch('/api/customers');
      let currentPoints = 0;
      
      if (customerResponse.ok) {
        const customers = await customerResponse.json();
        const customer = customers.find((c: any) => c.email === userEmail);
        if (customer) {
          currentPoints = customer.points || 0;
        }
      }

      // Update customer with new RFID card and add 1 point
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateByEmail',
          email: userEmail,
          rfidCard: rfidInput,
          points: currentPoints + 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRfidMessage('✓ RFID card registered successfully! You earned 1 point!');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setRfidMessage(data.error || 'Error registering RFID card. Please try again.');
      }
    } catch (error) {
      console.error('Error registering RFID card:', error);
      setRfidMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-700 p-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Interactive Background Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-red-500 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-red-500 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-1/3 left-5 w-24 h-24 bg-white/10 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
      <div className="absolute bottom-10 right-1/4 w-28 h-28 bg-red-700 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s' }}></div>

      {/* Content */}
      <div className="w-full max-w-2xl relative z-10">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <Image
                src="/enricos.png"
                alt="Enrico's Logo"
                width={80}
                height={80}
                className="rounded-lg"
              />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Register Your Card</h1>
            <p className="text-slate-600 text-lg">
              Link your RFID card to unlock exclusive rewards and start earning points today
            </p>
          </div>

          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6 mb-8">
            <p className="text-slate-900 font-bold text-lg mb-2">Welcome, {userName || 'Guest'}! 👋</p>
            <p className="text-slate-700 text-sm">Account: <span className="font-semibold">{userEmail}</span></p>
          </div>

          {/* Card Number Input Section */}
          <div className="mb-8">
            <label className="block text-slate-900 font-bold text-lg mb-4">
              Your RFID Card Serial Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                placeholder="Enter your card's serial number"
                className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-200 text-slate-900 placeholder-slate-400 text-lg transition-all"
              />
            </div>
            <p className="text-slate-500 text-sm mt-3">
              Find your card serial number on the back of your loyalty card or ask our staff for assistance.
            </p>
          </div>

          {/* Message Display */}
          {rfidMessage && (
            <div
              className={`mb-8 p-5 rounded-2xl font-medium text-center ${
                rfidMessage.includes('✓')
                  ? 'bg-green-50 border-2 border-green-300 text-green-700'
                  : 'bg-red-50 border-2 border-red-300 text-red-700'
              }`}
            >
              {rfidMessage}
            </div>
          )}

          {/* Register Button */}
          <button
            onClick={handleRegisterCard}
            disabled={isLoading}
            className="w-full px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl hover:from-red-700 hover:to-red-800 disabled:from-red-400 disabled:to-red-500 transition font-bold text-lg shadow-lg hover:shadow-xl mb-6"
          >
            {isLoading ? 'Registering Card...' : 'Register My Card'}
          </button>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Benefits Card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Why Register?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold">•</span>
                  <span className="text-slate-700 text-sm">Earn 1 point per ₱600 spent</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold">•</span>
                  <span className="text-slate-700 text-sm">Unlock exclusive member rewards</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold">•</span>
                  <span className="text-slate-700 text-sm">Track your points anytime</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold">•</span>
                  <span className="text-slate-700 text-sm">Get birthday discounts</span>
                </li>
              </ul>
            </div>

            {/* How It Works Card */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">How It Works</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                  <span className="text-slate-700 text-sm">Register your card here</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                  <span className="text-slate-700 text-sm">Show card at checkout</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                  <span className="text-slate-700 text-sm">Earn points automatically</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
                  <span className="text-slate-700 text-sm">Redeem your rewards</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Back and Logout Actions */}
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-900 rounded-xl hover:bg-slate-200 transition font-semibold text-center"
            >
              ← Back to Home
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 px-6 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
