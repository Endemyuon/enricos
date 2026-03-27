'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MessageCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [selectedMethod, setSelectedMethod] = useState<'contact' | 'message' | null>(null);

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
            <p className="text-slate-600 mt-2">No problem! We're here to help you reset it.</p>
          </div>

          {/* Help Information */}
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <p className="text-slate-700 text-sm">
                If you've forgotten your password, our admin team can help you reset it. Please contact us using one of the methods below:
              </p>
            </div>

            {/* Contact Method 1: Call */}
            <div
              onClick={() => setSelectedMethod('contact')}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                selectedMethod === 'contact'
                  ? 'border-red-600 bg-red-50'
                  : 'border-slate-200 bg-white hover:border-red-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-lg mt-1">
                  <Phone className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-2">Call Our Admin Team</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Reach out directly and we'll help you reset your password immediately.
                  </p>
                  <a
                    href="tel:+639123456789"
                    className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
                  >
                    📞 +63 (912) 345-6789
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Method 2: Message on Facebook */}
            <div
              onClick={() => setSelectedMethod('message')}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                selectedMethod === 'message'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg mt-1">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-2">Message Us on Facebook</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Send us a private message and our team will respond as soon as possible.
                  </p>
                  <a
                    href="https://www.facebook.com/EnricosMarikina"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                  >
                    💬 Message on Facebook
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
                    href="mailto:admin@enricos.com"
                    className="inline-block px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-semibold text-sm"
                  >
                    ✉️ admin@enricos.com
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
