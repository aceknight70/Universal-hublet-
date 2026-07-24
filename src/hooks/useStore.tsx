import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, ACTIVE_CLIENT_ID, ACTIVE_CLIENT_SLUG } from '../lib/supabase';
import { Client } from '../types';

interface StoreContextType {
  client: Client | null;
  loading: boolean;
  error: Error | null;
}

const StoreContext = createContext<StoreContextType>({ client: null, loading: true, error: null });

const ADANEHOUSE_DEFAULT: Client = {
  id: ACTIVE_CLIENT_ID,
  name: 'Adane House',
  slug: ACTIVE_CLIENT_SLUG,
  categories: [],
  theme: {
    accent_color: '#0ea5e9',
    background_color: '#f9fafb',
    header_background_color: '#ffffff',
    header_text_color: '#0ea5e9'
  },
  created_at: new Date().toISOString()
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Client | null>(ADANEHOUSE_DEFAULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadStore() {
      setLoading(true);
      setError(null);
      try {
        let { data, error: dbError } = await supabase
          .from('manifest_clients')
          .select('*')
          .or(`slug.eq.${ACTIVE_CLIENT_SLUG},id.eq.${ACTIVE_CLIENT_ID}`)
          .maybeSingle();

        if (dbError) console.warn("DB query for client failed, using default Adane House client:", dbError);
        
        if (!data) {
          data = ADANEHOUSE_DEFAULT as any;
        } else {
          // Force id & slug to match our deployment's hardcoded identifier
          (data as any).id = ACTIVE_CLIENT_ID;
          (data as any).slug = ACTIVE_CLIENT_SLUG;
        }
        
        // Parse JSON fields if they come as strings
        if (typeof (data as any).theme === 'string') {
          try {
             (data as any).theme = JSON.parse((data as any).theme);
          } catch(e) {}
        }

        setClient(data as any);
      } catch (err: any) {
        console.warn('Fallback to Adane House default due to error:', err);
        setClient(ADANEHOUSE_DEFAULT);
      } finally {
        setLoading(false);
      }
    }

    loadStore();
  }, []);

  return (
    <StoreContext.Provider value={{ client: client || ADANEHOUSE_DEFAULT, loading, error }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
