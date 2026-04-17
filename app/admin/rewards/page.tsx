'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Edit, PlusCircle, LogOut, Plus } from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description?: string;
  imgUrl?: string;
  points: number;
}

export default function AdminRewardsPage() {
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [points, setPoints] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const loadRewards = async () => {
    try {
      const res = await fetch('/api/rewards');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setRewards(data);
        } else {
          console.warn('expected array from /api/rewards, got', data);
          setRewards([]);
        }
      } else {
        console.error('fetch /api/rewards failed', res.status);
        setRewards([]);
      }
    } catch (err) {
      console.error('error loading rewards', err);
      setRewards([]);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
      router.push('/');
    } else {
      loadRewards();
    }
  }, [router]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImgUrl('');
    setPreviewUrl('');
    setPoints(0);
    setEditingId(null);
    setError('');
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const action = editingId ? 'update' : 'create';
    const body: any = { action, title, description, imgUrl, points };
    if (editingId) body.id = editingId;

    const res = await fetch('/api/rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      await loadRewards();
      closeModal();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to save');
    }
  };

  const handleEdit = (reward: Reward) => {
    setTitle(reward.title || '');
    setDescription(reward.description || '');
    setImgUrl(reward.imgUrl || '');
    setPreviewUrl(reward.imgUrl || '');
    setPoints(reward.points || 0);
    setEditingId(reward.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reward?')) return;
    const res = await fetch('/api/rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    if (res.ok) {
      await loadRewards();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    router.push('/');
  };

  const handleBackToAdmin = () => {
    router.push('/admin');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImgUrl(data.url);
        setPreviewUrl(data.url);
        setError('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to upload image');
      }
    } catch (err) {
      setError('Error uploading file');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 max-w-7xl mx-auto">
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
              <h1 className="text-4xl font-bold text-slate-900">Rewards</h1>
              <p className="text-slate-600 mt-1">Manage Loyalty Rewards</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleBackToAdmin}
              className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl transition font-semibold shadow-lg border-2 border-white hover:border-red-200 hover:shadow-xl hover:scale-105"
            >
              Back to Admin
            </button>
          </div>
        </div>

        <section className="bg-gray-50 rounded-2xl p-8">
          <div className="mt-8">
            {rewards.length === 0 ? (
              <p className="text-center text-slate-600">No rewards defined yet.</p>
            ) : (
              <div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <div key={reward.id} className="border border-slate-200 rounded-lg overflow-hidden relative hover:shadow-lg transition">
                    {reward.imgUrl && (
                      <div className="h-40 relative">
                        <Image
                          src={reward.imgUrl}
                          alt={reward.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {reward.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-1">Cost: {reward.points} pts</p>
                      {reward.description && <p className="text-sm text-slate-600 mb-1">{reward.description}</p>}
                    </div>
                    {/* Bottom Right Icon */}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(reward)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition shadow-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(reward.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Add/Edit Reward Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Red Header */}
              <div className="bg-red-600 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  {editingId ? 'Edit Reward' : 'Add New Reward'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-red-100 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  {error && <p className="text-red-600 mb-4 font-semibold">{error}</p>}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-700">Title</label>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                        placeholder="Enter reward title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-700">Description</label>
                      <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                        placeholder="e.g., Delicious pasta dish"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-700">Points</label>
                      <input
                        type="number"
                        value={points}
                        onChange={(e) => setPoints(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-slate-700">Image</label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer border border-slate-300 rounded-lg bg-white"
                        />
                        {isUploading && <span className="text-sm text-slate-600">Uploading...</span>}
                      </div>
                      {previewUrl && (
                        <img src={previewUrl} alt="Preview" className="mt-3 h-20 w-20 object-cover rounded border border-slate-200" />
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition shadow-lg"
                    >
                      {editingId ? 'Update' : 'Create'}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                    )}
                    {!editingId && (
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Floating Create Button - Fixed Position */}
        <div className="fixed bottom-8 right-8 flex flex-col items-center gap-1 z-40">
          <button
            onClick={() => setShowModal(true)}
            className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition shadow-lg hover:shadow-xl hover:scale-110"
            title="Add New Reward"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
          <p className="text-red-600 font-semibold text-xs whitespace-nowrap">Create</p>
        </div>
      </div>
    </div>
  );
}
