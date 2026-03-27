'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, Award, Check } from 'lucide-react';

interface RewardItem {
  id: string;
  title: string;
  description?: string;
  expiry?: string;
  imgUrl?: string;
  points: number;
  category?: string;
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
  const [claimingRewardId, setClaimingRewardId] = useState<string | null>(null);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimMessageType, setClaimMessageType] = useState<'success' | 'error' | 'info'>('info');

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

    // redirect admin users away from this page
    if (role === 'admin') {
      router.push('/admin');
    }

    if (role === 'customer' && email) {
      fetchCustomerData(email);
    }

    loadRewards();
  }, [router]);

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
    // Check if user has enough points
    if (userPoints < reward.points) {
      setClaimMessage(`You need ${reward.points - userPoints} more points to claim this reward.`);
      setClaimMessageType('error');
      setTimeout(() => setClaimMessage(''), 3000);
      return;
    }

    setClaimingRewardId(reward.id);
    setClaimMessage('');

    try {
      // Use current state values
      const claimUserId = userId || localStorage.getItem('userId');
      const claimEmail = userEmail || localStorage.getItem('userEmail');
      const claimName = userName || localStorage.getItem('userName');

      if (!claimUserId || !claimEmail || !claimName) {
        throw new Error('User data missing - please reload the page');
      }

      console.log('Attempting to claim:', { claimUserId, claimEmail, claimName, rewardId: reward.id, points: reward.points });

      // Step 1: Update customer points FIRST
      const newPoints = userPoints - reward.points;
      console.log(`Updating customer ${claimUserId}: ${userPoints} - ${reward.points} = ${newPoints} points`);
      
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

      console.log('✓ Points updated successfully');
      
      // Step 2: Create redemption log AFTER points are deducted
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

      console.log('✓ Redemption logged successfully');
      
      // Update local state
      setUserPoints(newPoints);
      setClaimMessage(`✓ Successfully claimed "${reward.title}"! Pending fulfillment.`);
      setClaimMessageType('success');
      setTimeout(() => setClaimMessage(''), 4000);
      
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

  return (
    <div className="min-h-screen bg-white">
      {/* content area */}
      {isLoggedIn ? (
        <>
          {/* Header */}
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8 bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center gap-4">
                <Image
                  src="/enricos.png"
                  alt="Enrico's Logo"
                  width={100}
                  height={100}
                />
                <div>
                  <h1 className="text-4xl font-bold text-slate-900">Loyalty Rewards</h1>
                  <p className="text-slate-600 mt-1">You have <span className="font-bold text-red-600">{userPoints}</span> points available</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/"
                  className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl transition font-semibold shadow-lg border-2 border-white hover:border-red-200 hover:shadow-xl hover:scale-105"
                >
                  Home
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 px-6 py-3 rounded-xl transition font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>

            {/* Claim Message */}
            {claimMessage && (
              <div className="mb-6">
                <div className={`p-4 rounded-lg text-sm font-semibold ${
                  claimMessageType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                  claimMessageType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {claimMessage}
                </div>
              </div>
            )}

            {/* rewards grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((item) => {
                  const isEligible = userPoints >= item.points;
                  const pointsNeeded = Math.max(0, item.points - userPoints);
                  
                  return (
                    <div key={item.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition flex flex-col">
                      {item.imgUrl && (
                        <Image src={item.imgUrl} alt={item.title} width={400} height={250} className="w-full h-48 object-cover" />
                      )}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                        )}
                        
                        <div className="mb-4">
                          <p className="text-sm font-bold text-slate-900">Cost: {item.points} pts</p>
                          {item.expiry && <p className="text-xs text-slate-500">{item.expiry}</p>}
                        </div>

                        {/* Centered Eligibility Tab */}
                        <div className="my-4 flex justify-center">
                          {isEligible ? (
                            <div className="bg-green-100 border-2 border-green-500 rounded-full px-6 py-3 text-center">
                              <p className="text-green-700 font-bold text-sm">✓ Eligible for Claim</p>
                            </div>
                          ) : (
                            <div className="bg-red-100 border-2 border-red-500 rounded-full px-6 py-3 text-center">
                              <p className="text-red-700 font-bold text-sm">Need {pointsNeeded} more pts</p>
                            </div>
                          )}
                        </div>

                        {/* Claim Button - Red/Green Design */}
                        <button
                          onClick={() => handleClaimReward(item)}
                          disabled={!isEligible || claimingRewardId === item.id}
                          className={`w-full mt-auto py-3 rounded-lg font-bold transition text-sm flex items-center justify-center gap-2 ${
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
        <div className="p-6 max-w-7xl mx-auto">
          <section className="py-16">
            <div className="text-center">
              <p className="text-lg">
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
    </div>
  );
}
