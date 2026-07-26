import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Staff } from '../types';
import { verifyTierPin, verifyIndividualStaffPin } from '../lib/pinAuth';

export interface PinSession {
  role: 'manager' | 'staff';
  clientId: string;
  name?: string;
}

interface AuthContextType {
  user: any | null;
  profile: Staff | null;
  pinSession: PinSession | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithMaster: (email: string, pass: string) => Promise<void>;
  loginWithManagerPin: (clientId: string, pin: string) => Promise<void>;
  loginWithStaffPin: (clientId: string, pin: string, staffName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  pinSession: null,
  loading: true,
  login: async () => {},
  loginWithMaster: async () => {},
  loginWithManagerPin: async () => {},
  loginWithStaffPin: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [masterProfile, setMasterProfile] = useState<Staff | null>(null);
  const [pinSession, setPinSession] = useState<PinSession | null>(() => {
    try {
      const stored = sessionStorage.getItem('pin_session');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setMasterProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(uid: string) {
    try {
      const { data, error } = await supabase.from('manifest_staff').select('*').eq('id', uid).maybeSingle();
      if (error) {
        console.warn('Profile lookup warning:', error);
      }
      if (data) {
        setMasterProfile(data);
      } else {
        setMasterProfile({
          id: uid,
          client_id: null,
          name: 'Master User',
          role: 'master',
          email: user?.email
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  // Synthesize profile for PIN sessions or Master session
  const effectiveProfile: Staff | null = user
    ? (masterProfile || {
        id: user?.id || 'master-user',
        client_id: null,
        name: 'Master User',
        role: 'master',
        email: user?.email
      })
    : pinSession
    ? {
        id: `pin-${pinSession.role}-${pinSession.clientId}`,
        client_id: pinSession.clientId,
        name: pinSession.name || (pinSession.role === 'manager' ? 'Manager' : 'Staff'),
        role: pinSession.role,
        email: undefined
      }
    : null;

  const loginWithMaster = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    sessionStorage.removeItem('pin_session');
    setPinSession(null);
  };

  const loginWithManagerPin = async (clientId: string, pin: string) => {
    const isValid = await verifyTierPin(clientId, 'manager', pin);
    if (!isValid) {
      throw new Error('Invalid Manager PIN. Please check the PIN and try again.');
    }
    const session: PinSession = { role: 'manager', clientId, name: 'Manager' };
    sessionStorage.setItem('pin_session', JSON.stringify(session));
    setPinSession(session);
  };

  const loginWithStaffPin = async (clientId: string, pin: string, staffName?: string) => {
    let isValid = false;
    if (staffName && staffName.trim().length > 0) {
      isValid = await verifyIndividualStaffPin(clientId, staffName, pin);
      if (!isValid) {
        // Fallback check against shared staff PIN
        isValid = await verifyTierPin(clientId, 'staff', pin);
      }
    } else {
      isValid = await verifyTierPin(clientId, 'staff', pin);
    }

    if (!isValid) {
      throw new Error('Invalid Staff PIN. Please check your PIN and try again.');
    }

    const session: PinSession = {
      role: 'staff',
      clientId,
      name: staffName ? staffName.trim() : 'Staff Member'
    };
    sessionStorage.setItem('pin_session', JSON.stringify(session));
    setPinSession(session);
  };

  const logout = async () => {
    sessionStorage.removeItem('pin_session');
    setPinSession(null);
    if (user) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: effectiveProfile,
        pinSession,
        loading,
        login: loginWithMaster,
        loginWithMaster,
        loginWithManagerPin,
        loginWithStaffPin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
