'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, Plus, PlusCircle, Trash2, Edit2, Search, X, Award } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  rfidCard?: string;
  points: number;
  joinDate: string;
}

interface EditingCustomer extends Customer {
  password?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<EditingCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    rfidCard: '',
    points: 0,
  });

  // Initialize data - fetch from API
  useEffect(() => {
    // Check authentication FIRST - synchronously
    const userRole = localStorage.getItem('userRole');
    console.log('Admin page loaded - userRole:', userRole);
    
    if (userRole !== 'admin') {
      console.log('❌ Not admin, redirecting immediately');
      // Redirect happens immediately
      router.push('/login');
      return; // Stop executing the rest
    }

    console.log('✅ Admin verified, loading customers');
    setIsAuthorized(true);

    // Only fetch if authorized
    const fetchCustomers = async () => {
      try {
        console.log('Fetching customers...');
        const response = await fetch('/api/customers');
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Loaded', data.length, 'customers');
          setCustomers(data);
        } else {
          console.error('❌ Failed to fetch customers:', response.status);
        }
      } catch (error) {
        console.error('❌ Error fetching customers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      alert('Please fill in name and email');
      return;
    }

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          rfidCard: newCustomer.rfidCard || undefined,
          points: newCustomer.points,
        }),
      });

      if (response.ok) {
        const customer = await response.json();
        setCustomers([...customers, customer]);
        setNewCustomer({ name: '', email: '', phone: '', rfidCard: '', points: 0 });
        setIsAddingCustomer(false);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to add customer'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add customer');
    }
  };

  const handleEditCustomer = async (updatedCustomer: Customer & { password?: string }) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id: updatedCustomer.id,
          name: updatedCustomer.name,
          email: updatedCustomer.email,
          phone: updatedCustomer.phone,
          rfidCard: updatedCustomer.rfidCard || undefined,
          points: updatedCustomer.points,
          joinDate: updatedCustomer.joinDate,
          ...(updatedCustomer.password && { password: updatedCustomer.password }),
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setCustomers(
          customers.map((c) => (c.id === updated.id ? updated : c))
        );
        setEditingCustomer(null);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update customer');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete',
            id,
          }),
        });

        if (response.ok) {
          setCustomers(customers.filter((c) => c.id !== id));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete customer');
      }
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm))
  );

  const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);
  const totalCustomers = customers.length;

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen bg-white p-6">
        {!isAuthorized ? (
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-lg">
              <div className="text-slate-900 text-2xl font-bold mb-2">Loading Admin Dashboard</div>
              <div className="text-slate-600 text-sm">Verifying admin access...</div>
            <div className="mt-4 flex justify-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
          <div className="text-slate-500 text-xs mt-4">Redirecting if not authorized...</div>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-lg">
            <div className="text-slate-900 text-2xl font-bold mb-2">Loading Data</div>
            <div className="text-slate-600 text-sm">Fetching customer list...</div>
            <div className="mt-4 flex justify-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <Image
              src="/enricos.png"
              alt="Enrico's Logo"
              width={100}
              height={100}
            />
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Enrico's Admin</h1>
              <p className="text-slate-600 mt-1">Loyalty Program Management</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/admin/add-points" className="bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl transition font-semibold shadow-lg border-2 border-white hover:border-red-200 hover:shadow-xl hover:scale-105">
              Add Points
            </Link>
            <Link href="/admin/rewards" className="bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl transition font-semibold shadow-lg border-2 border-white hover:border-red-200 hover:shadow-xl hover:scale-105">
              Rewards
            </Link>
            <Link href="/admin/redemptions" className="bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl transition font-semibold shadow-lg border-2 border-white hover:border-red-200 hover:shadow-xl hover:scale-105">
              Redemptions
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/95 rounded-xl p-6 shadow-lg">
            <p className="text-slate-600 text-xs font-bold uppercase">Total Customers</p>
            <p className="text-4xl font-bold text-red-600 mt-3">{totalCustomers}</p>
          </div>

          <div className="bg-white/95 rounded-xl p-6 shadow-lg">
            <p className="text-slate-600 text-xs font-bold uppercase">Total Points</p>
            <p className="text-4xl font-bold text-red-600 mt-3">{totalPoints}</p>
          </div>

          <div className="bg-white/95 rounded-xl p-6 shadow-lg">
            <p className="text-slate-600 text-xs font-bold uppercase">Avg Points</p>
            <p className="text-4xl font-bold text-red-600 mt-3">
              {totalCustomers > 0 ? Math.round(totalPoints / totalCustomers) : 0}
            </p>
          </div>

          <div className="bg-white/95 rounded-xl p-6 shadow-lg">
            <p className="text-slate-600 text-xs font-bold uppercase">Active Members</p>
            <p className="text-4xl font-bold text-red-600 mt-3">{filteredCustomers.length}</p>
          </div>
        </div>

        {/* Search and Add Customer */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition border-2 border-white/50"
            />
          </div>
          <button
            onClick={() => setIsAddingCustomer(!isAddingCustomer)}
            className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl transition font-bold shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Member
          </button>
        </div>

        {/* Add Customer Form */}
        {isAddingCustomer && (
          <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
            <div className="bg-red-600 px-8 py-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Add New Member</h3>
              <button
                onClick={() => setIsAddingCustomer(false)}
                className="text-white hover:bg-red-700 p-2 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-600 transition bg-slate-50 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-600 transition bg-slate-50 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+1-234-567-8900"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-600 transition bg-slate-50 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">RFID Card Serial (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., 001234567890"
                    value={newCustomer.rfidCard}
                    onChange={(e) => setNewCustomer({ ...newCustomer, rfidCard: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-600 transition bg-slate-50 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">Initial Points</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newCustomer.points}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, points: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-600 transition bg-slate-50 text-slate-900"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddCustomer}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition font-bold shadow-lg"
                >
                  Save Member
                </button>
                <button
                  onClick={() => setIsAddingCustomer(false)}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-xl transition font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customers Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-red-600 px-8 py-6">
            <h2 className="text-xl font-bold text-white">Members ({filteredCustomers.length})</h2>
          </div>
          <div className="admin-table-scrollable overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 sticky top-0">
                  <th className="text-left px-6 py-4 text-slate-900 font-bold">Name</th>
                  <th className="text-left px-6 py-4 text-slate-900 font-bold">Email</th>
                  <th className="text-left px-6 py-4 text-slate-900 font-bold">RFID Card</th>
                  <th className="text-left px-6 py-4 text-slate-900 font-bold">Phone</th>
                  <th className="text-center px-6 py-4 text-slate-900 font-bold">Points</th>
                  <th className="text-left px-6 py-4 text-slate-900 font-bold">Joined</th>
                  <th className="text-center px-6 py-4 text-slate-900 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-slate-200 hover:bg-red-50 transition">
                    <td className="px-6 py-4 text-slate-900 font-medium">{customer.name}</td>
                    <td className="px-6 py-4 text-slate-700 text-sm">{customer.email}</td>
                    <td className="px-6 py-4 text-slate-700 text-sm font-mono text-xs">{customer.rfidCard ? `📛 ${customer.rfidCard}` : '-'}</td>
                    <td className="px-6 py-4 text-slate-700 text-sm">{customer.phone || '-'}</td>
                    <td className="px-6 py-4 text-slate-900 text-center font-bold">
                      {customer.points || 0}
                    </td>
                    <td className="px-6 py-4 text-slate-700 text-sm">{customer.joinDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setEditingCustomer(customer)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                          title="Edit member"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
                          title="Delete member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg font-semibold">
                {searchTerm ? 'No members found matching your search.' : 'No members yet. Add one to get started!'}
              </p>
            </div>
          )}
        </div>

        {/* Edit Customer Modal */}
        {editingCustomer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="bg-red-600 px-8 py-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Edit Member</h2>
                <button
                  onClick={() => setEditingCustomer(null)}
                  className="text-white hover:bg-red-700 p-2 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                {/* Member Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editingCustomer.name}
                      onChange={(e) =>
                        setEditingCustomer({ ...editingCustomer, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-600 transition bg-slate-50 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">Email</label>
                    <input
                      type="email"
                      value={editingCustomer.email}
                      onChange={(e) =>
                        setEditingCustomer({ ...editingCustomer, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-600 transition bg-slate-50 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">Phone</label>
                    <input
                      type="tel"
                      value={editingCustomer.phone || ''}
                      onChange={(e) =>
                        setEditingCustomer({ ...editingCustomer, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-600 transition bg-slate-50 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">RFID Card Serial</label>
                    <input
                      type="text"
                      placeholder="e.g., 001234567890"
                      value={editingCustomer.rfidCard || ''}
                      onChange={(e) =>
                        setEditingCustomer({ ...editingCustomer, rfidCard: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-600 transition bg-slate-50 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">Password (Leave blank to keep current)</label>
                    <input
                      type="password"
                      placeholder="Enter new password or leave empty"
                      value={editingCustomer.password || ''}
                      onChange={(e) =>
                        setEditingCustomer({ ...editingCustomer, password: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-600 transition bg-slate-50 text-slate-900"
                    />
                    <p className="text-xs text-slate-500 mt-1">For customers who forgot their password</p>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">Join Date</label>
                    <input
                      type="date"
                      value={editingCustomer.joinDate}
                      onChange={(e) =>
                        setEditingCustomer({ ...editingCustomer, joinDate: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-600 transition bg-slate-50 text-slate-900"
                    />
                  </div>
                </div>

                {/* Points Management */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Points Management</h3>
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2">
                      Current Points: {editingCustomer.points.toLocaleString()}
                    </label>
                    <input
                      type="number"
                      value={editingCustomer.points}
                      onChange={(e) =>
                        setEditingCustomer({
                          ...editingCustomer,
                          points: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-red-600 transition bg-slate-50 text-slate-900"
                    />
                    <p className="text-xs text-slate-500 mt-2">Set exact point value</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end border-t border-slate-200 pt-6">
                  <button
                    onClick={() => setEditingCustomer(null)}
                    className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-xl transition font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEditCustomer(editingCustomer)}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition font-bold shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
        </>
        )}
      </div>
    </div>
  );
}
