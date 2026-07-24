import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export function ManagerRoom() {
  const [newStaffPin, setNewStaffPin] = useState('');
  const [managerPin, setManagerPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { client } = useStore();
  const { profile } = useAuth();

  async function handleSetStaffPin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await (supabase as any).rpc('set_staff_pin_by_manager', {
        p_client_id: client?.id,
        p_manager_pin: managerPin,
        p_new_staff_pin: newStaffPin
      });
      if (error) throw error;
      if (data === false) {
         alert("Authentication failed. Manager PIN is incorrect.");
      } else {
         alert("Staff PIN updated successfully!");
         setNewStaffPin('');
         setManagerPin('');
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Manager Room</h1>
      <p className="text-sm text-gray-500">Welcome, {profile?.name || 'Manager'}. You can manage staff settings here.</p>
      
      <div className="bg-white p-6 rounded shadow-sm border mt-6">
        <h3 className="text-lg font-bold mb-4">Change Staff PIN</h3>
        <p className="text-sm text-gray-500 mb-4">You must enter your current Manager PIN to authorize this change.</p>
        
        <form onSubmit={handleSetStaffPin} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-bold mb-1">Your Manager PIN</label>
            <input 
              required
              type="password"
              maxLength={6}
              className="w-full p-2 border rounded"
              value={managerPin}
              onChange={e => setManagerPin(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">New Staff PIN</label>
            <input 
              required
              type="password"
              maxLength={6}
              className="w-full p-2 border rounded"
              value={newStaffPin}
              onChange={e => setNewStaffPin(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white px-4 py-2 rounded shadow hover:bg-opacity-80 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Staff PIN
          </button>
        </form>
      </div>
    </div>
  );
}
