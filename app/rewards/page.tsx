'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, Award, Check, Copy, Download, Bell, X, FileText } from 'lucide-react';

interface RewardItem {
  id: string;
  title: string;
  description?: string;
  expiry?: string;
  imgUrl?: string;
  points: number;
  category?: string;
}

interface PendingClaim {
  id: string;
  rewardId: string;
  rewardTitle: string;
  pointsRedeemed: number;
  status: 'pending' | 'completed' | 'cancelled';
  verificationCode: string;
  redeemedAt: string;
  createdAt: string;
}

interface NotificationItem {
  id: string; 
  message: string;
  type: 'success' | 'info' | 'warning';
}

export default function RewardsPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [pendingClaims, setPendingClaims] = useState<PendingClaim[]>([]);
  const [claimingRewardId, setClaimingRewardId] = useState<string | null>(null);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimMessageType, setClaimMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showClaimHistoryModal, setShowClaimHistoryModal] = useState(false);
  const [toastNotifications, setToastNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');
    const id = localStorage.getItem('userId');
    
    setUserRole(role);
    setUserEmail(email);
    setUserName(name);
    if (id) setUserId(id);
    setIsLoggedIn(!!role);

    if (role === 'admin') {
      router.push('/admin');
    }

    if (role === 'customer' && email) {
      fetchCustomerData(email);
      const custId = id || localStorage.getItem('userId');
      if (custId) loadPendingClaims(custId);
    }

    loadRewards();
  }, [router]);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString();
    const notification = { id, message, type };
    setToastNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setToastNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const loadPendingClaims = async (customerId: string) => {
    try {
      const response = await fetch(`/api/redemption-logs?customerId=${customerId}`);
      if (response.ok) {
        const logs = await response.json();
        setPendingClaims(logs.map((log: any) => ({
          id: log.id,
          rewardId: log.rewardId,
          rewardTitle: log.rewardTitle,
          pointsRedeemed: log.pointsRedeemed,
          status: log.status,
          verificationCode: log.id,
          redeemedAt: log.redeemedAt,
          createdAt: log.createdAt,
        })));
      }
    } catch (error) {
      console.error('Error loading pending claims:', error);
    }
  };

  const fetchCustomerData = async (email: string) => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const customers = await response.json();
        const customer = customers.find((c: any) => c.email === email);
        if (customer) {
          setUserPoints(customer.points || 0);
          setUserId(customer.id);
          localStorage.setItem('userId', customer.id);
        }
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };

  const loadRewards = async () => {
    try {
      const res = await fetch('/api/rewards');
      if (res.ok) {
        const data = await res.json();
        setRewards(data);
      }
    } catch (err) {
      console.error('Error loading rewards', err);
    }
  };

  // Poll for admin approvals
  useEffect(() => {
    const custId = userId || localStorage.getItem('userId');
    if (!custId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/redemption-logs?customerId=${custId}`);
        if (response.ok) {
          const logs = await response.json();
          
          // Check for status changes
          logs.forEach((log: any) => {
            const existingClaim = pendingClaims.find(c => c.id === log.id);
            if (existingClaim && existingClaim.status !== log.status) {
              if (log.status === 'completed') {
                addToast(`✅ Claim Approved! ID: ${log.id.substring(0, 8)}`, 'success');
              } else if (log.status === 'cancelled') {
                addToast(`❌ Claim Rejected. ID: ${log.id.substring(0, 8)}`, 'warning');
              }
            }
          });

          // Update claims
          const newClaims = logs.map((log: any) => ({
            id: log.id,
            rewardId: log.rewardId,
            rewardTitle: log.rewardTitle,
            pointsRedeemed: log.pointsRedeemed,
            status: log.status,
            verificationCode: log.id,
            redeemedAt: log.redeemedAt,
            createdAt: log.createdAt,
          }));
          
          setPendingClaims(newClaims);
        }
      } catch (error) {
        console.error('Error polling claims:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [userId, pendingClaims]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setUserRole(null);
    router.push('/');
  };

  const handleClaimReward = async (reward: RewardItem) => {
    if (userPoints < reward.points) {
      setClaimMessage(`You need ${reward.points - userPoints} more points to claim this reward.`);
      setClaimMessageType('error');
      setTimeout(() => setClaimMessage(''), 3000);
      return;
    }

    setClaimingRewardId(reward.id);
    setClaimMessage('');

    try {
      const claimUserId = userId || localStorage.getItem('userId');
      const claimEmail = userEmail || localStorage.getItem('userEmail');
      const claimName = userName || localStorage.getItem('userName');

      if (!claimUserId || !claimEmail || !claimName) {
        throw new Error('User data missing - please reload the page');
      }

      const newPoints = userPoints - reward.points;
      
      const customerResponse = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: claimUserId,
          name: claimName,
          email: claimEmail,
          points: newPoints,
          joinDate: new Date().toISOString().split('T')[0],
        }),
      });

      if (!customerResponse.ok) {
        const error = await customerResponse.json().catch(() => ({ error: 'Unknown' }));
        throw new Error(`Failed to update points: ${error.error || customerResponse.statusText}`);
      }

      const redemptionResponse = await fetch('/api/redemption-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          customerId: claimUserId,
          customerName: claimName,
          email: claimEmail,
          rewardId: reward.id,
          rewardTitle: reward.title,
          pointsRedeemed: reward.points,
          status: 'pending',
          redeemedAt: new Date().toISOString(),
        }),
      });

      if (!redemptionResponse.ok) {
        const error = await redemptionResponse.json().catch(() => ({ error: 'Unknown' }));
        throw new Error(`Failed to log redemption: ${error.error || redemptionResponse.statusText}`);
      }

      setUserPoints(newPoints);
      setClaimMessage(`✓ Successfully claimed "${reward.title}"! View your verification code below.`);
      setClaimMessageType('success');
      addToast(`🎉 Claim submitted! ID: ${reward.id.substring(0, 8)}`, 'success');
      
      const notificationId = Math.random().toString(36).substr(2, 9);
      setNotifications(prev => [...prev, {
        id: notificationId,
        message: `Claim verified! Show code to admin at the restaurant.`,
        type: 'success'
      }]);
      
      loadPendingClaims(claimUserId);
      setTimeout(() => setClaimMessage(''), 5000);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }, 6000);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error claiming reward:', error);
      setClaimMessage(`Error: ${errorMsg}`);
      setClaimMessageType('error');
      setTimeout(() => setClaimMessage(''), 5000);
    } finally {
      setClaimingRewardId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    const notificationId = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, {
      id: notificationId,
      message: 'Verification code copied!',
      type: 'success'
    }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }, 3000);
  };

  const downloadCode = (claim: PendingClaim) => {
    const content = `VERIFICATION CODE
================
Reward: ${claim.rewardTitle}
Code: ${claim.verificationCode}
Points: ${claim.pointsRedeemed}
Date: ${new Date(claim.redeemedAt).toLocaleDateString()}
Status: ${claim.status.toUpperCase()}

Please show this code to the admin for verification.`;
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `verification-${claim.verificationCode}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-white">
      {isLoggedIn ? (
        <>
          {/* Toast Notifications */}
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
            {toastNotifications.map(notif => (
              <div key={notif.id} className={`px-6 py-3 rounded-lg shadow-xl text-sm font-bold max-w-md animate-bounce ${
                notif.type === 'success' ? 'bg-green-500 text-white' : 
                notif.type === 'warning' ? 'bg-yellow-500 text-slate-900' :
                'bg-blue-500 text-white'
              }`}>
                {notif.message}
              </div>
            ))}
          </div>

          {/* Notifications */}
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map(notif => (
              <div key={notif.id} className={`p-4 rounded-lg shadow-lg text-sm font-semibold max-w-xs ${
                notif.type === 'success' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {notif.message}
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 bg-white rounded-lg sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-slate-200 gap-4 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Image
                  src="/enricos.png"
                  alt="Enrico's Logo"
                  width={100}
                  height={100}
                  className="w-16 sm:w-[100px] h-16 sm:h-[100px]"
                />
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-slate-900">Loyalty Rewards</h1>
                  <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-1">You have <span className="font-bold text-red-600">{userPoints}</span> points available</p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-4 w-full sm:w-auto flex-wrap">
                <button
                  onClick={() => setShowClaimHistoryModal(true)}
                  className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition font-semibold shadow-lg hover:shadow-xl hover:scale-105 text-xs sm:text-sm relative"
                >
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  Claims
                  {pendingClaims.filter(c => c.status === 'pending').length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-slate-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingClaims.filter(c => c.status === 'pending').length}
                    </span>
                  )}
                </button>
                <Link
                  href="/"
                  className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition font-semibold shadow-lg border-2 border-white hover:border-red-200 hover:shadow-xl hover:scale-105 text-xs sm:text-sm"
                >
                  Home
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition font-semibold shadow-lg hover:shadow-xl hover:scale-105 text-xs sm:text-sm"
                >
                  <LogOut className="w-4 sm:w-5 h-4 sm:h-5" />
                  Logout
                </button>
              </div>
            </div>

            {/* Claim Message */}
            {claimMessage && (
              <div className="mb-4 sm:mb-6">
                <div className={`p-3 sm:p-4 rounded-lg text-xs sm:text-sm font-semibold ${
                  claimMessageType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                  claimMessageType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {claimMessage}
                </div>
              </div>
            )}

            {/* Pending Claims Section */}
            {pendingClaims.filter(c => c.status === 'pending').length > 0 && (
              <div className="mb-8 p-4 sm:p-6 bg-blue-50 border-2 border-blue-300 rounded-lg sm:rounded-xl">
                <h2 className="text-lg sm:text-xl font-bold text-blue-900 mb-4">Your Verification Codes</h2>
                <div className="space-y-3">
                  {pendingClaims.filter(c => c.status === 'pending').map(claim => (
                    <div key={claim.id} className="bg-white p-4 rounded-lg border border-blue-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{claim.rewardTitle}</p>
                          <p className="text-sm text-slate-600 mt-1">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                              claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              claim.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {claim.status === 'pending' ? 'PENDING' :
                               claim.status === 'completed' ? 'APPROVED' :
                               'REJECTED'}
                            </span>
                          </p>
                        </div>
                        <div className="bg-slate-100 p-3 rounded font-mono text-sm sm:text-base font-bold text-slate-900 break-all">
                          {claim.verificationCode}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(claim.verificationCode)}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition text-xs sm:text-sm font-semibold"
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </button>
                          <button
                            onClick={() => downloadCode(claim)}
                            className="flex items-center gap-1 bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded transition text-xs sm:text-sm font-semibold"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {rewards.map((item) => {
                const isEligible = userPoints >= item.points;
                const pointsNeeded = Math.max(0, item.points - userPoints);
                
                return (
                  <div key={item.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition flex flex-col">
                    {item.imgUrl && (
                      <Image src={item.imgUrl} alt={item.title} width={400} height={250} className="w-full h-32 sm:h-40 md:h-48 object-cover" />
                    )}
                    <div className="p-3 sm:p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">{item.title}</h3>
                      {item.description && (
                        <p className="text-xs sm:text-sm text-slate-600 mb-2">{item.description}</p>
                      )}
                      
                      <div className="mb-3 sm:mb-4">
                        <p className="text-xs sm:text-sm font-bold text-slate-900">Cost: {item.points} pts</p>
                        {item.expiry && <p className="text-xs text-slate-500">{item.expiry}</p>}
                      </div>

                      <div className="my-3 sm:my-4 flex justify-center">
                        {isEligible ? (
                          <div className="bg-green-100 border-2 border-green-500 rounded-full px-4 sm:px-6 py-2 sm:py-3 text-center">
                            <p className="text-green-700 font-bold text-xs sm:text-sm">✓ Eligible for Claim</p>
                          </div>
                        ) : (
                          <div className="bg-red-100 border-2 border-red-500 rounded-full px-4 sm:px-6 py-2 sm:py-3 text-center">
                            <p className="text-red-700 font-bold text-xs sm:text-sm">Need {pointsNeeded} more pts</p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleClaimReward(item)}
                        disabled={!isEligible || claimingRewardId === item.id}
                        className={`w-full mt-auto py-2 sm:py-3 rounded-lg font-bold transition text-xs sm:text-sm flex items-center justify-center gap-2 ${
                          isEligible
                            ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer shadow-lg'
                            : 'bg-red-600 hover:bg-red-700 text-white cursor-not-allowed shadow-lg'
                        } ${claimingRewardId === item.id ? 'opacity-60' : ''}`}
                      >
                        {claimingRewardId === item.id ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Processing...
                          </>
                        ) : isEligible ? (
                          <>
                            ✓ Claim Reward
                          </>
                        ) : (
                          <>
                            Need More Points
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {rewards.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-600">No rewards available at the moment.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
          <section className="py-12 sm:py-16 md:py-20">
            <div className="text-center">
              <p className="text-base sm:text-lg md:text-xl">
                Please{' '}
                <Link href="/login" className="text-red-600 font-medium">
                  log in
                </Link>{' '}
                to view your rewards and points balance.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* Claim History Modal */}
      {showClaimHistoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <style>{`
            .modal-scrollbar::-webkit-scrollbar {
              width: 10px;
            }
            .modal-scrollbar::-webkit-scrollbar-track {
              background: #f1f5f9;
            }
            .modal-scrollbar::-webkit-scrollbar-thumb {
              background: #dc2626;
              border-radius: 5px;
            }
            .modal-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #b91c1c;
            }
          `}</style>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex justify-between items-center border-b border-red-200 z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Claim History</h2>
              <button
                onClick={() => setShowClaimHistoryModal(false)}
                className="text-white hover:bg-red-700 p-2 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto modal-scrollbar" style={{ maxHeight: 'calc(80vh - 180px)' }}>
              {pendingClaims.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600 text-lg">No claims yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingClaims.slice(0, 3).map((claim) => (
                    <div
                      key={claim.id}
                      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-lg">{claim.rewardTitle}</p>
                          <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">ID: {claim.id.substring(0, 8)}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">
                          {new Date(claim.redeemedAt).toLocaleDateString()} • {claim.pointsRedeemed} pts
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-block px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${
                            claim.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : claim.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {claim.status === 'pending'
                            ? '⏳ Pending'
                            : claim.status === 'completed'
                            ? '✓ Approved'
                            : '✕ Rejected'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {pendingClaims.length > 3 && (
                    <div className="text-center pt-4 text-sm text-slate-600">
                      <p>Showing 3 of {pendingClaims.length} claims</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3 z-10">
              <button
                onClick={() => setShowClaimHistoryModal(false)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
