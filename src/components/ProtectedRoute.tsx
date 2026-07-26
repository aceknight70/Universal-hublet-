import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Login } from './Login';
import { Role } from '../types';
import { useStore } from '../hooks/useStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roleRequired?: Role; // minimum role required: 'staff' (all staff+), 'manager' (manager+), 'master' (master only)
}

const roleLevels = {
  staff: 1,
  manager: 2,
  master: 3
};

export function ProtectedRoute({ children, roleRequired }: ProtectedRouteProps) {
  const { profile, loading } = useAuth();
  const { client } = useStore();

  if (loading) return <div className="p-8 text-center text-gray-500">Checking authorization...</div>;

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Restricted Access</h2>
        <p className="text-center text-gray-600 mb-6">Please log in to access this area.</p>
        <Login />
      </div>
    );
  }

  // If a role is required, check hierarchy
  if (roleRequired) {
    const userLevel = roleLevels[profile.role] || 0;
    const requiredLevel = roleLevels[roleRequired] || 0;
    
    if (userLevel < requiredLevel) {
      return (
        <div className="p-8 text-center max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-700">You don't have permission to view this area. Required: {roleRequired}</p>
        </div>
      );
    }
  }

  // If this is a specific client store, make sure the user belongs to it (or is master)
  if (client && profile.role !== 'master') {
    if (profile.client_id && profile.client_id !== client.id) {
      return (
        <div className="p-8 text-center max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-red-600 mb-2">Wrong Store</h2>
          <p className="text-gray-700">You are logged in, but for a different store than this hublet.</p>
        </div>
      );
    }
  }

  return <>{children}</>;
}
