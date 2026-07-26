import React, { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../hooks/useAuth';
import { listStaffNames, setIndividualStaffPin, deleteIndividualStaffPin } from '../lib/pinAuth';
import { Loader2, User, Key, Shield, Trash2, Plus, Check, AlertCircle } from 'lucide-react';

export function ManagerRoom() {
  const [staffName, setStaffName] = useState('');
  const [newStaffPin, setNewStaffPin] = useState('');
  const [managerPin, setManagerPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [staffList, setStaffList] = useState<string[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const { client } = useStore();
  const { profile } = useAuth();

  useEffect(() => {
    if (client?.id) {
      loadNamedStaffList();
    }
  }, [client?.id]);

  async function loadNamedStaffList() {
    if (!client?.id) return;
    setLoadingList(true);
    try {
      const names = await listStaffNames(client.id);
      setStaffList(names);
    } catch (err) {
      console.error('Error loading named staff:', err);
    } finally {
      setLoadingList(false);
    }
  }

  async function handleSetNamedStaffPin(e: React.FormEvent) {
    e.preventDefault();
    if (!client?.id) {
      setMessage({ type: 'error', text: 'Store context not resolved.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const res = await setIndividualStaffPin(client.id, staffName, newStaffPin, managerPin);

    if (res.success) {
      setMessage({ type: 'success', text: `Individual PIN set successfully for ${staffName}! ✓` });
      setStaffName('');
      setNewStaffPin('');
      setManagerPin('');
      loadNamedStaffList();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update individual staff PIN.' });
    }
    setLoading(false);
  }

  async function handleDeleteNamedStaff(name: string) {
    if (!client?.id) return;
    if (!confirm(`Remove named staff PIN access for ${name}?`)) return;

    setLoading(true);
    const res = await deleteIndividualStaffPin(client.id, name);
    if (res.success) {
      setMessage({ type: 'success', text: `Removed named PIN entry for ${name}.` });
      loadNamedStaffList();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to delete staff PIN.' });
    }
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-600" />
          Manager Room
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome, <span className="font-semibold text-gray-800">{profile?.name || 'Manager'}</span>.
          Manage individual staff PIN access for <span className="font-semibold">{client?.name || 'your store'}</span>.
        </p>
      </div>

      {/* Info notice */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-xs text-indigo-900 leading-relaxed">
        <strong>Note on PIN Authorization:</strong> Master sets the store-wide Manager PIN and default Shared Staff PIN. As Manager, you can create and manage <strong>named individual staff PINs</strong> for your store team members.
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form to add/update named staff PIN */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Plus className="w-4 h-4 text-sky-600" /> Add / Edit Named Staff PIN
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Assign a personal PIN to a staff member. They will select their name on the login screen.
          </p>

          <form onSubmit={handleSetNamedStaffPin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Staff Member Name</label>
              <div className="relative">
                <input
                  required
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg pl-8 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                />
                <User className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">New Individual Staff PIN</label>
              <div className="relative">
                <input
                  required
                  type="password"
                  maxLength={8}
                  placeholder="••••"
                  className="w-full p-2.5 text-sm font-mono tracking-wider border border-gray-300 rounded-lg pl-8 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  value={newStaffPin}
                  onChange={(e) => setNewStaffPin(e.target.value)}
                />
                <Key className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Your Manager PIN (Authorization)</label>
              <div className="relative">
                <input
                  required
                  type="password"
                  maxLength={8}
                  placeholder="••••"
                  className="w-full p-2.5 text-sm font-mono tracking-wider border border-gray-300 rounded-lg pl-8 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={managerPin}
                  onChange={(e) => setManagerPin(e.target.value)}
                />
                <Shield className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:bg-indigo-300"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Individual Staff PIN
            </button>
          </form>
        </div>

        {/* Existing Named Staff Members List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" /> Active Named Staff
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Staff members currently registered with individual PINs for this store.
          </p>

          {loadingList ? (
            <div className="p-8 text-center text-gray-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading team list...
            </div>
          ) : staffList.length > 0 ? (
            <div className="divide-y divide-gray-100 border rounded-lg overflow-hidden flex-1 overflow-y-auto max-h-72">
              {staffList.map((name) => (
                <div key={name} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setStaffName(name);
                        setNewStaffPin('');
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 rounded hover:bg-indigo-50"
                      title="Edit PIN"
                    >
                      Edit PIN
                    </button>
                    <button
                      onClick={() => handleDeleteNamedStaff(name)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                      title="Remove PIN"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center border rounded-lg bg-gray-50/50 flex-1 flex flex-col items-center justify-center">
              <User className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-xs text-gray-500 font-medium">No named staff PINs set yet.</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Staff can log in using the store's default shared Staff PIN until added above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
