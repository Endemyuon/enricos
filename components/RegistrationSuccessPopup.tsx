'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Smartphone, CheckCircle2 } from 'lucide-react';

interface RegistrationSuccessPopupProps {
  email: string;
  firstName: string;
}

export function RegistrationSuccessPopup({ email, firstName }: RegistrationSuccessPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Popup Card */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full animate-in zoom-in duration-500">
        {/* Red Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-8 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-full opacity-20 -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-800 rounded-full opacity-20 -ml-12 -mb-12"></div>

          {/* Logo */}
          <div className="relative z-10 mb-4 flex justify-center">
            <div className="p-3 bg-white rounded-2xl shadow-lg">
              <Image
                src="/enricos.png"
                alt="Enrico's Logo"
                width={60}
                height={60}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Check Icon */}
          <div className="mt-4">
            <CheckCircle2 className="w-12 h-12 text-white mx-auto" />
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          {/* Welcome Message */}
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
            Welcome, {firstName}!
          </h2>
          <p className="text-slate-600 text-center text-sm mb-6">
            Your account has been created successfully. You can now login.
          </p>

          {/* Email Confirmation */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide mb-2">
              Account Email
            </p>
            <p className="text-slate-900 font-medium break-all text-sm">{email}</p>
          </div>

          {/* Card Registration Callout */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 mb-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <Smartphone className="w-6 h-6 text-red-600 mt-1" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Register Your Card</h3>
                <p className="text-slate-700 text-xs leading-relaxed">
                  Link your RFID card to start earning points and unlock exclusive rewards with every purchase!
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Preview */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
              Unlock These Benefits
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span className="text-sm text-slate-700">1 point per 600 pesos spent</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span className="text-sm text-slate-700">15% birthday discount</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span className="text-sm text-slate-700">Exclusive member rewards</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/register-card">
              <button className="w-full px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2">
                <Smartphone className="w-5 h-5" />
                Register Card Now
              </button>
            </Link>
            <Link href="/">
              <button className="w-full px-6 py-3 bg-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-300 transition-all duration-300 flex items-center justify-center">
                Continue to Home
              </button>
            </Link>
          </div>

          {/* Info Text */}
          <p className="text-center text-xs text-slate-500 mt-4">
            You can register your card later from your profile
          </p>
        </div>
      </div>
    </div>
  );
}
