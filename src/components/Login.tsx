import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../hooks/useStore';
import { supabase } from '../lib/supabase';
import { listStaffNames } from '../lib/pinAuth';
import { Shield, Key, User, Lock, Loader2, Store } from 'lucide-react';

export function Login({ onSuccess }: { onSuccess?: () => void }) {
  const { loginWithMaster, loginWithManagerPin, loginWithStaffPin } = useAuth();
  const { client } = useStore();

  const [loginType, setLoginType] = useState<'pin' | 'master'>('pin');
  
  // PIN mode states
  const [pinRole, setPinRole] = useState<'manager' | 'staff'>('staff');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [stores, setStores] = useState<Array<{ id: string; name: string; slug?: string }>>([]);
  const [pin, setPin] = useState('');
  
  // Staff named PIN states
  const [staffNames, setStaffNames] = useState<string[]>([]);
  const [selectedStaffName, setSelectedStaffName] = useState<string>('');
  const [loadingStaffNames, setLoadingStaffNames] = useState(false);

  // Master mode states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // General UI states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load available stores if no client context
  useEffect(() => {
    if (client?.id) {
      setSelectedClientId(client.id);
    } else {
      supabase.from('manifest_clients').select('id, name, slug').then(({ data }) => {
        const clientList = (data as any[]) || [];
        if (clientList.length > 0) {
          setStores(clientList);
          setSelectedClientId(clientList[0].id);
        }
      });
    }
  }, [client]);

  // Load individual staff names when selected store changes or when switching to staff role
  useEffect(() => {
    if (loginType === 'pin' && pinRole === 'staff' && selectedClientId) {
      setLoadingStaffNames(true);
      listStaffNames(selectedClientId)
        .then((names) => {
          setStaffNames(names);
          if (names.length > 0) {
            setSelectedStaffName(names[0]);
          } else {
            setSelectedStaffName('');
          }
        })
        .finally(() => setLoadingStaffNames(false));
    }
  }, [loginType, pinRole, selectedClientId]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!selectedClientId) {
      setError('Please select a store/business');
      setLoading(false);
      return;
    }

    try {
      if (pinRole === 'manager') {
        await loginWithManagerPin(selectedClientId, pin);
      } else {
        await loginWithStaffPin(selectedClientId, pin, selectedStaffName || undefined);
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'PIN login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMasterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginWithMaster(email, password);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Master login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden my-6">
      {/* Top Tab Switcher */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        <button
          type="button"
          onClick={() => {
            setLoginType('pin');
            setError('');
          }}
          className={`flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
            loginType === 'pin'
              ? 'border-sky-600 text-sky-700 bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Key className="w-4 h-4" />
          Manager / Staff PIN
        </button>
        <button
          type="button"
          onClick={() => {
            setLoginType('master');
            setError('');
          }}
          className={`flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
            loginType === 'master'
              ? 'border-purple-600 text-purple-700 bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Shield className="w-4 h-4" />
          Master Login
        </button>
      </div>

      <div className="p-6">
        {loginType === 'pin' ? (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">PIN Access</h2>
              <p className="text-xs text-gray-500 mt-1">Enter your assigned store PIN to log in</p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              {/* Store selection if not in store context */}
              {!client?.id && stores.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5" /> Select Store / Hublet
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Role selector (Manager vs Staff) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Access Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPinRole('staff');
                      setPin('');
                      setError('');
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                      pinRole === 'staff'
                        ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-200'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPinRole('manager');
                      setPin('');
                      setError('');
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                      pinRole === 'manager'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-200'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Manager
                  </button>
                </div>
              </div>

              {/* Staff Named selection if applicable */}
              {pinRole === 'staff' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Staff Name
                  </label>
                  {loadingStaffNames ? (
                    <div className="p-2 text-xs text-gray-400 flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading staff list...
                    </div>
                  ) : staffNames.length > 0 ? (
                    <select
                      value={selectedStaffName}
                      onChange={(e) => setSelectedStaffName(e.target.value)}
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    >
                      {staffNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                      <option value="">Shared Staff PIN (Default)</option>
                    </select>
                  ) : (
                    <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded border border-gray-100">
                      Using Shared Store Staff PIN
                    </div>
                  )}
                </div>
              )}

              {/* PIN Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {pinRole === 'manager'
                    ? 'Manager PIN'
                    : selectedStaffName
                    ? `${selectedStaffName}'s PIN`
                    : 'Staff PIN'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    maxLength={8}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className="w-full p-2.5 text-center tracking-widest font-mono text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:bg-sky-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying PIN...
                  </>
                ) : (
                  `Log In as ${pinRole === 'manager' ? 'Manager' : selectedStaffName || 'Staff'}`
                )}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Master Sign In</h2>
              <p className="text-xs text-gray-500 mt-1">
                Authorized Master accounts only
              </p>
            </div>

            <form onSubmit={handleMasterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="master@example.com"
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:bg-purple-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                  </>
                ) : (
                  'Sign In as Master'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
