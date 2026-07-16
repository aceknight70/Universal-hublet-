import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export function AccountSettings() {
  const { user, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (profile?.role !== 'master') return null;

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data, error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      setMessage('Confirmation link sent to both old and new email addresses. Please verify to complete the change.');
    } catch (err: any) {
      setError(err.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-sm border mb-6">
      <h3 className="text-lg font-bold mb-4">Account Settings (Master Only)</h3>
      <p className="text-sm text-gray-500 mb-4">
        Change the email address associated with your Master account. 
        You will need to confirm this change via email.
      </p>

      <form onSubmit={handleUpdateEmail} className="max-w-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">New Email Address</label>
          <input
            type="email"
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            placeholder="new-email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
        <button
          type="submit"
          disabled={loading || !email || email === user?.email}
          className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Email'}
        </button>
      </form>
    </div>
  );
}
