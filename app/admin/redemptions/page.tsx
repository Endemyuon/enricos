'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, Check, X, Clock, Printer, Download, Calendar } from 'lucide-react';

interface RedemptionLog {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  rewardId: string;
  rewardTitle: string;
  pointsRedeemed: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  redeemedAt: string;
  completedAt?: string;
}

export default function RedempionsPage() {
  const router = useRouter();
  const [redemptions, setRedemptions] = useState<RedemptionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication FIRST
    const userRole = localStorage.getItem('userRole');
    console.log('Redemptions page loaded - userRole:', userRole);
    
    if (userRole !== 'admin') {
      console.log('❌ Not admin, redirecting immediately');
      router.push('/login');
      return;
    }

    console.log('✅ Admin verified, loading redemptions');
    setIsAuthorized(true);

    // Fetch redemptions
    const fetchRedemptions = async () => {
      try {
        console.log('Fetching redemptions...');
        const response = await fetch('/api/redemption-logs');
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Loaded', data.length, 'redemptions');
          setRedemptions(data);
        } else {
          console.error('❌ Failed to fetch redemptions:', response.status);
        }
      } catch (error) {
        console.error('❌ Error fetching redemptions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRedemptions();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const headers = ['Customer Name', 'Email', 'Reward Claimed', 'Points Redeemed', 'Status', 'Date Claimed', 'Date Completed'];
    const rows = filteredRedemptions.map((r) => [
      r.customerName,
      r.email,
      r.rewardTitle,
      r.pointsRedeemed,
      r.status,
      new Date(r.redeemedAt).toLocaleString(),
      r.completedAt ? new Date(r.completedAt).toLocaleString() : 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `redemptions-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateStatus = async (redemptionId: string, newStatus: 'completed' | 'cancelled') => {
    setProcessingId(redemptionId);
    try {
      const response = await fetch('/api/redemption-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: redemptionId,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setRedemptions(
          redemptions.map((r) => (r.id === redemptionId ? updated : r))
        );
      }
    } catch (error) {
      console.error('Error updating redemption:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRedemptions = redemptions.filter((r) => {
    const matchesStatus = filterStatus === 'all' ? true : r.status === filterStatus;
    const matchesSearch = 
      searchTerm === '' ||
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Content Container */}
      <div>
      <style>{`
        @media print {
          .no-print {
            display: none;
          }
          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #000;
          }
          .print-container {
            max-width: 100%;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #000;
            padding: 6px;
            text-align: left;
          }
          th {
            background-color: #fff;
            color: #000;
            font-weight: bold;
            border-bottom: 2px solid #000;
          }
          tr {
            background-color: #fff;
          }
          .print-header {
            text-align: center;
            margin-bottom: 10px;
            font-size: 14px;
            font-weight: bold;
          }
          .print-date {
            text-align: right;
            margin-bottom: 20px;
            font-size: 10px;
          }
          .no-border {
            border: none;
            padding: 2px;
          }
        }
      `}</style>
      <div className="p-6 max-w-7xl mx-auto">
        {!isAuthorized ? (
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center shadow-2xl">
              <div className="text-slate-900 text-2xl font-bold mb-2">Loading</div>
              <div className="text-slate-600 text-sm">Verifying admin access...</div>
              <div className="mt-4 flex justify-center gap-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center shadow-2xl">
              <div className="text-slate-900 text-2xl font-bold mb-2">Loading Redemptions</div>
              <div className="text-slate-600 text-sm">Fetching customer claims...</div>
              <div className="mt-4 flex justify-center gap-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="relative z-10">
              {/* Header */}
              <div className="flex justify-between items-center mb-8 bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                <div className="flex items-center gap-4">
                  <Image
                    src="/enricos.png"
                    alt="Enrico's Logo"
                    width={100}
                    height={100}
                  />
                  <div>
                    <h1 className="text-4xl font-bold text-slate-900">Redemptions</h1>
                    <p className="text-slate-600 mt-1">Manage Customer Reward Claims</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handlePrint}
                    className="no-print flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 px-6 py-3 rounded-xl transition font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Printer className="w-5 h-5" />
                    Print Report
                  </button>
                  <button
                    onClick={handleDownloadCSV}
                    className="no-print flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl transition font-semibold shadow-lg border-2 border-white hover:border-red-200 hover:shadow-xl hover:scale-105"
                  >
                    <Download className="w-5 h-5" />
                    Export CSV
                  </button>
                  <Link href="/admin" className="no-print flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl transition font-semibold shadow-lg border-2 border-white hover:border-red-200 hover:shadow-xl hover:scale-105">
                    Back to Admin
                  </Link>
                </div>
              </div>

              {/* Search Bar */}
              <div className="no-print mb-6">
                <input
                  type="text"
                  placeholder="Search by customer name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent bg-white text-slate-900 placeholder-slate-400 font-medium"
                />
              </div>

              {/* Stats Cards */}
              <div className="no-print grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-slate-200 hover:shadow-xl transition">
                  <p className="text-slate-600 text-xs font-bold uppercase">Total Claims</p>
                  <p className="text-4xl font-bold text-slate-900 mt-3">{filteredRedemptions.length}</p>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6 shadow-lg border-2 border-yellow-200 hover:shadow-xl transition">
                  <p className="text-yellow-700 text-xs font-bold uppercase">Pending</p>
                  <p className="text-4xl font-bold text-yellow-600 mt-3">{filteredRedemptions.filter((r) => r.status === 'pending').length}</p>
                </div>

                <div className="bg-green-50 rounded-xl p-6 shadow-lg border-2 border-green-200 hover:shadow-xl transition">
                  <p className="text-green-700 text-xs font-bold uppercase">Completed</p>
                  <p className="text-4xl font-bold text-green-600 mt-3">{filteredRedemptions.filter((r) => r.status === 'completed').length}</p>
                </div>

                <div className="bg-red-50 rounded-xl p-6 shadow-lg border-2 border-red-200 hover:shadow-xl transition">
                  <p className="text-red-700 text-xs font-bold uppercase">Cancelled</p>
                  <p className="text-4xl font-bold text-red-600 mt-3">{filteredRedemptions.filter((r) => r.status === 'cancelled').length}</p>
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="no-print mb-6 flex gap-2">
                {(['all', 'pending', 'completed', 'cancelled'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-6 py-2 rounded-xl font-semibold transition capitalize ${
                      filterStatus === status
                        ? 'bg-red-600 text-white shadow-lg hover:bg-red-700 hover:scale-105'
                        : 'bg-white/80 text-slate-900 border-2 border-white hover:bg-white hover:border-red-200 hover:shadow-lg'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Print Title */}
              <div className="hidden print:block">
                <div className="print-header">ENRICO'S RESTAURANT - REWARD CLAIMS REPORT</div>
                <div className="print-date">Generated: {new Date().toLocaleString()}</div>
              </div>

              {/* Print Table */}
              <div className="hidden print:block">
                <table>
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Email</th>
                      <th>Reward Claimed</th>
                      <th>Points</th>
                      <th>Status</th>
                      <th>Date Claimed</th>
                      <th>Date Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRedemptions.map((redemption) => (
                      <tr key={redemption.id}>
                        <td>{redemption.customerName}</td>
                        <td>{redemption.email}</td>
                        <td>{redemption.rewardTitle}</td>
                        <td>{redemption.pointsRedeemed}</td>
                        <td>{redemption.status}</td>
                        <td>{new Date(redemption.redeemedAt).toLocaleDateString()}</td>
                        <td>{redemption.completedAt ? new Date(redemption.completedAt).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Screen View - Redemptions Grid */}
              <div className="print:hidden space-y-4">
                {filteredRedemptions.length === 0 ? (
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/30">
                    <p className="text-slate-600 text-lg font-semibold">
                      {searchTerm 
                        ? 'No results found for that search'
                        : filterStatus === 'all'
                        ? 'No redemptions yet'
                        : `No ${filterStatus} redemptions`}
                    </p>
                  </div>
                ) : (
                  filteredRedemptions.map((redemption) => (
                    <div
                      key={redemption.id}
                      className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl hover:scale-105 transition"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{redemption.customerName}</h3>
                          <p className="text-sm text-slate-600 mb-3">{redemption.email}</p>

                          <div className="flex gap-4 mb-4">
                            <div>
                              <p className="text-xs text-slate-500 uppercase font-bold">Reward Claimed</p>
                              <p className="text-lg font-semibold text-slate-900">{redemption.rewardTitle}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase font-bold">Points Redeemed</p>
                              <p className="text-lg font-semibold text-slate-900">{redemption.pointsRedeemed} pts</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase font-bold">Date Claimed</p>
                              <p className="text-sm font-semibold text-slate-900">
                                {new Date(redemption.redeemedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="text-center">
                          {redemption.status === 'pending' && (
                            <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-semibold">
                              <Clock className="w-4 h-4" />
                              Pending
                            </div>
                          )}
                          {redemption.status === 'completed' && (
                            <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                              <Check className="w-4 h-4" />
                              Completed
                            </div>
                          )}
                          {redemption.status === 'cancelled' && (
                            <div className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold">
                              <X className="w-4 h-4" />
                              Cancelled
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {redemption.status === 'pending' && (
                        <div className="flex gap-3 pt-4 border-t border-slate-200">
                          <button
                            onClick={() => handleUpdateStatus(redemption.id, 'completed')}
                            disabled={processingId === redemption.id}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105"
                          >
                            <Check className="w-5 h-5" />
                            {processingId === redemption.id ? 'Completing...' : 'Mark Complete'}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(redemption.id, 'cancelled')}
                            disabled={processingId === redemption.id}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105"
                          >
                            <X className="w-5 h-5" />
                            {processingId === redemption.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        </div>
                      )}

                      {redemption.status === 'completed' && redemption.completedAt && (
                        <div className="text-xs text-slate-500 pt-4 border-t border-slate-200">
                          Completed on {new Date(redemption.completedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
