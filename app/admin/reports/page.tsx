'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, Printer, Download, Calendar } from 'lucide-react';

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

export default function ReportsPage() {
  const router = useRouter();
  const [redemptions, setRedemptions] = useState<RedemptionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    console.log('Reports page loaded - userRole:', userRole);
    
    if (userRole !== 'admin') {
      console.log('❌ Not admin, redirecting immediately');
      router.push('/login');
      return;
    }

    console.log('✅ Admin verified, loading reports');
    setIsAuthorized(true);

    const fetchRedemptions = async () => {
      try {
        console.log('Fetching redemptions for report...');
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

  const filteredRedemptions = redemptions.filter((r) => {
    const claimDate = new Date(r.redeemedAt);
    const matchesStatus = selectedStatus === 'all' ? true : r.status === selectedStatus;
    const matchesDateRange = 
      (!dateRange.start && !dateRange.end) ||
      (dateRange.start && dateRange.end && claimDate >= new Date(dateRange.start) && claimDate <= new Date(dateRange.end));
    
    return matchesStatus && matchesDateRange;
  });

  const totalPointsRedeemed = filteredRedemptions.reduce((sum, r) => sum + r.pointsRedeemed, 0);
  const completedCount = filteredRedemptions.filter((r) => r.status === 'completed').length;
  const pendingCount = filteredRedemptions.filter((r) => r.status === 'pending').length;
  const cancelledCount = filteredRedemptions.filter((r) => r.status === 'cancelled').length;

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @media print {
          .no-print {
            display: none;
          }
          body {
            margin: 0;
            padding: 20px;
          }
          .print-container {
            max-width: 100%;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #dc2626;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
        }
      `}</style>

      <div className="min-h-screen bg-white p-6">
        {!isAuthorized ? (
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-lg">
              <div className="text-slate-900 text-2xl font-bold mb-2">Loading</div>
              <div className="text-slate-600 text-sm">Verifying admin access...</div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-lg">
              <div className="text-slate-900 text-2xl font-bold mb-2">Loading Reports</div>
              <div className="text-slate-600 text-sm">Fetching claims data...</div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* Header - No Print */}
            <div className="no-print mb-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <Image
                    src="/enricos.png"
                    alt="Enrico's Logo"
                    width={50}
                    height={50}
                    className="rounded-lg"
                  />
                  <div>
                    <h1 className="text-4xl font-bold text-slate-900">Reports</h1>
                    <p className="text-slate-600 mt-1">Reward Claims & Redemption Log</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 px-4 py-3 rounded-xl transition font-semibold shadow-lg"
                  >
                    <Printer className="w-5 h-5" />
                    Print
                  </button>
                  <button
                    onClick={handleDownloadCSV}
                    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-3 rounded-xl transition font-semibold shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    Export CSV
                  </button>
                  <Link href="/admin" className="bg-white text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl transition font-semibold shadow-lg border border-red-600">
                    Back
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl transition font-semibold shadow-lg"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">From Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">To Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">Status Filter</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stats - No Print */}
            <div className="no-print grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/95 rounded-xl p-6 shadow-lg">
                <p className="text-slate-600 text-xs font-bold uppercase">Total Claims</p>
                <p className="text-4xl font-bold text-red-600 mt-3">{filteredRedemptions.length}</p>
              </div>
              <div className="bg-white/95 rounded-xl p-6 shadow-lg border-l-4 border-green-500">
                <p className="text-slate-600 text-xs font-bold uppercase">Completed</p>
                <p className="text-4xl font-bold text-green-600 mt-3">{completedCount}</p>
              </div>
              <div className="bg-white/95 rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
                <p className="text-slate-600 text-xs font-bold uppercase">Pending</p>
                <p className="text-4xl font-bold text-yellow-600 mt-3">{pendingCount}</p>
              </div>
              <div className="bg-white/95 rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
                <p className="text-slate-600 text-xs font-bold uppercase">Total Points Redeemed</p>
                <p className="text-4xl font-bold text-blue-600 mt-3">{totalPointsRedeemed.toLocaleString()}</p>
              </div>
            </div>

            {/* Report Title - Print Only */}
            <div className="hidden print:block mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Enrico's Restaurant</h2>
              <p className="text-lg font-semibold text-slate-600">Reward Claims & Redemption Report</p>
              <p className="text-sm text-slate-500">{new Date().toLocaleString()}</p>
            </div>

            {/* Table */}
            <div className="print-container bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-red-600">
                      <th className="px-4 py-3 text-white font-bold text-left">Customer Name</th>
                      <th className="px-4 py-3 text-white font-bold text-left">Email</th>
                      <th className="px-4 py-3 text-white font-bold text-left">Reward Claimed</th>
                      <th className="px-4 py-3 text-white font-bold text-center">Points</th>
                      <th className="px-4 py-3 text-white font-bold text-center">Status</th>
                      <th className="px-4 py-3 text-white font-bold text-left">Date Claimed</th>
                      <th className="px-4 py-3 text-white font-bold text-left">Date Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRedemptions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                          No redemptions found
                        </td>
                      </tr>
                    ) : (
                      filteredRedemptions.map((redemption, index) => (
                        <tr
                          key={redemption.id}
                          className={`border-b border-slate-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-red-50 transition`}
                        >
                          <td className="px-4 py-3 font-medium text-slate-900">{redemption.customerName}</td>
                          <td className="px-4 py-3 text-slate-700 text-sm">{redemption.email}</td>
                          <td className="px-4 py-3 text-slate-700">{redemption.rewardTitle}</td>
                          <td className="px-4 py-3 text-center font-bold text-red-600">{redemption.pointsRedeemed}</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                redemption.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : redemption.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {redemption.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700 text-sm">
                            {new Date(redemption.redeemedAt).toLocaleDateString()} {new Date(redemption.redeemedAt).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-3 text-slate-700 text-sm">
                            {redemption.completedAt
                              ? new Date(redemption.completedAt).toLocaleDateString() + ' ' + new Date(redemption.completedAt).toLocaleTimeString()
                              : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary - Print Only */}
              <div className="hidden print:block p-6 bg-slate-100 border-t border-slate-300">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-600">Total Claims</p>
                    <p className="text-xl font-bold text-slate-900">{filteredRedemptions.length}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-600">Completed</p>
                    <p className="text-xl font-bold text-green-700">{completedCount}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-600">Pending</p>
                    <p className="text-xl font-bold text-yellow-700">{pendingCount}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-600">Total Points Redeemed</p>
                    <p className="text-xl font-bold text-blue-700">{totalPointsRedeemed.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* No Print Footer */}
            <div className="no-print text-center mt-8 text-slate-500 text-sm">
              <p>Generated by Enrico's Rewards System</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
