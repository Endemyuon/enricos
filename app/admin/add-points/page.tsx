
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, Search, X } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  rfidCard?: string;
  points: number;
  joinDate: string;
}

export default function AddPointsPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [rfidInput, setRfidInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [isProcessing, setIsProcessing] = useState(false);
  const rfidInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check authentication
    const userRole = localStorage.getItem('userRole');
    
    if (userRole !== 'admin') {
      router.push('/login');
      return;
    }

    setIsAuthorized(true);

    // Fetch customers
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        if (response.ok) {
          const data = await response.json();
          setCustomers(data);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();

    // Auto-focus RFID input on mount
    if (rfidInputRef.current) {
      rfidInputRef.current.focus();
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

  const handleRfidTap = async () => {
    if (!rfidInput.trim()) {
      setMessage('Please tap an RFID card');
      setMessageType('error');
      return;
    }

    setIsProcessing(true);

    // Find customer by RFID card
    const customer = customers.find(c => c.rfidCard === rfidInput.trim());
    
    if (!customer) {
      setMessage('RFID card not found. Please register it first.');
      setMessageType('error');
      setRfidInput('');
      setIsProcessing(false);
      if (rfidInputRef.current) {
        rfidInputRef.current.focus();
      }
      return;
    }

    // Automatically add 1 point
    const newPoints = customer.points + 1;

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          rfidCard: customer.rfidCard,
          points: newPoints,
          joinDate: customer.joinDate,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        
        // Update local state
        setCustomers(customers.map(c => c.id === updated.id ? updated : c));
        
        setMessage(`✓ ${customer.name} earned 1 point! Total: ${newPoints} points`);
        setMessageType('success');
        setSelectedCustomer(updated);
        setRfidInput('');
        
        // Keep focused for next tap
        if (rfidInputRef.current) {
          rfidInputRef.current.focus();
        }
      } else {
        setMessage('Failed to add point');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error adding point');
      setMessageType('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomerSelect = async (customer: Customer) => {
    setIsProcessing(true);
    
    // Automatically add 1 point when selected
    const newPoints = customer.points + 1;

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          rfidCard: customer.rfidCard,
          points: newPoints,
          joinDate: customer.joinDate,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setSelectedCustomer(updated);
        setCustomers(customers.map(c => c.id === updated.id ? updated : c));
        setMessage(`✓ ${customer.name} earned 1 point! Total: ${newPoints} points`);
        setMessageType('success');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error adding point');
      setMessageType('error');
    } finally {
      setSearchTerm('');
      setShowSearchDropdown(false);
      setIsProcessing(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-lg">
          <div className="text-slate-900 text-2xl font-bold mb-2">Loading...</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-lg">
          <div className="text-slate-900 text-2xl font-bold mb-2">Loading Data</div>
          <div className="mt-4 flex justify-center gap-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-600 p-6 relative overflow-hidden">
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -40px) scale(1.1); }
          50% { transform: translate(-20px, 30px) scale(0.9); }
          75% { transform: translate(40px, 20px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-40px, 30px) scale(1.05); }
          50% { transform: translate(30px, -40px) scale(1.1); }
          75% { transform: translate(-30px, -20px) scale(0.95); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(50px, 20px) scale(0.95); }
          50% { transform: translate(-30px, -30px) scale(1.1); }
          75% { transform: translate(20px, 40px) scale(1.05); }
        }
        @keyframes float4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-50px, -30px) scale(1.1); }
          50% { transform: translate(40px, 30px) scale(0.95); }
          75% { transform: translate(-20px, 50px) scale(1.05); }
        }
        @keyframes float5 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, 50px) scale(1.05); }
          50% { transform: translate(-40px, -30px) scale(1.1); }
          75% { transform: translate(50px, -20px) scale(0.95); }
        }
        @keyframes float6 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-30px, 40px) scale(0.95); }
          50% { transform: translate(50px, -20px) scale(1.05); }
          75% { transform: translate(-40px, 30px) scale(1.1); }
        }
        @keyframes float7 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(40px, -50px) scale(1.1); }
          50% { transform: translate(-30px, 40px) scale(0.95); }
          75% { transform: translate(30px, -30px) scale(1.05); }
        }
        @keyframes float8 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-50px, 20px) scale(1.05); }
          50% { transform: translate(30px, 50px) scale(1.1); }
          75% { transform: translate(-40px, -40px) scale(0.95); }
        }
        .circle1 { animation: float1 6s ease-in-out infinite; }
        .circle2 { animation: float2 7s ease-in-out infinite; }
        .circle3 { animation: float3 8s ease-in-out infinite; }
        .circle4 { animation: float4 7.5s ease-in-out infinite; }
        .circle5 { animation: float5 6.5s ease-in-out infinite; }
        .circle6 { animation: float6 8.5s ease-in-out infinite; }
        .circle7 { animation: float7 7s ease-in-out infinite; }
        .circle8 { animation: float8 6s ease-in-out infinite; }
      `}</style>
      
      {/* Interactive Bubble Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large dynamic circles with movement */}
        <div className="circle1 absolute top-10 left-5 w-96 h-96 bg-red-400 rounded-full opacity-50 blur-2xl"></div>
        <div className="circle2 absolute top-1/4 right-10 w-80 h-80 bg-red-500 rounded-full opacity-50 blur-2xl"></div>
        <div className="circle3 absolute -bottom-20 left-1/2 w-96 h-96 bg-red-400 rounded-full opacity-45 blur-2xl"></div>
        <div className="circle4 absolute bottom-1/4 right-1/4 w-72 h-72 bg-red-500 rounded-full opacity-50 blur-3xl"></div>
        <div className="circle5 absolute -top-20 right-1/3 w-96 h-96 bg-red-400 rounded-full opacity-45 blur-2xl"></div>
        <div className="circle6 absolute top-2/3 -left-40 w-80 h-80 bg-red-500 rounded-full opacity-50 blur-2xl"></div>
        <div className="circle7 absolute top-1/3 left-1/4 w-64 h-64 bg-red-400 rounded-full opacity-50 blur-2xl"></div>
        <div className="circle8 absolute -bottom-10 right-1/3 w-96 h-96 bg-red-500 rounded-full opacity-45 blur-3xl"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header with Navigation */}
        <div className="flex justify-start items-center mb-12">
          <Link href="/admin" className="text-white hover:text-red-100 font-semibold text-sm transition">
            ← Back
          </Link>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          {/* Logo - Large and Visible */}
          <div className="flex justify-center mb-8">
            <Image
              src="/enricos.png"
              alt="Enrico's Logo"
              width={120}
              height={120}
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-center text-slate-900 mb-2">Add Points</h1>
          <p className="text-center text-slate-600 mb-8">Tap RFID card</p>

          {/* RFID Tap Section */}
          <div className="mb-8">
            <input
              ref={rfidInputRef}
              type="text"
              value={rfidInput}
              onChange={(e) => setRfidInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isProcessing) {
                  e.preventDefault();
                  handleRfidTap();
                }
              }}
              placeholder="Tap RFID card here..."
              className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-center text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition border border-slate-200 text-lg font-semibold"
              autoFocus
              disabled={isProcessing}
            />
          </div>

          {/* Selected Customer Display */}
          {selectedCustomer && (
            <div className="mb-6 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 relative">
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setSearchTerm('');
                  if (rfidInputRef.current) {
                    rfidInputRef.current.focus();
                  }
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase mb-1">Name</p>
                  <p className="text-xl font-bold text-slate-900">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase mb-1">Points</p>
                  <p className="text-3xl font-bold text-red-600">{selectedCustomer.points}</p>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {message && (
            <div className={`p-4 rounded-2xl text-sm font-bold ${
              messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
              messageType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
