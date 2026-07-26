import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Client } from '../types';

interface StoreContextType {
  client: Client | null;
  loading: boolean;
  error: Error | null;
  refreshClient: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType>({ client: null, loading: true, error: null, refreshClient: async () => {} });

export function StoreProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function loadStore() {
    setLoading(true);
    setError(null);
    try {
      const hostname = window.location.hostname;
      // Default to adanehouse if we can't find a mapping or running locally on localhost
      let resolvedClientId = 'adanehouse';
      
      const { data: domainData, error: domainError } = await supabase
        .from('manifest_domain_config')
        .select('client_id')
        .eq('domain', hostname)
        .maybeSingle();
      
      if (!domainError && domainData && (domainData as any).client_id) {
        resolvedClientId = (domainData as any).client_id;
      } else if (domainError && domainError.code !== '42P01') {
        console.error("Error looking up domain:", domainError);
      }

      // Generate candidate IDs/slugs to handle variations like ofrank vs o-frank
      const candidates = Array.from(new Set([
        resolvedClientId,
        resolvedClientId.includes('-') ? resolvedClientId.replace(/-/g, '') : resolvedClientId,
        resolvedClientId === 'ofrank' ? 'o-frank' : resolvedClientId === 'o-frank' ? 'ofrank' : resolvedClientId
      ]));

      const orConditions = candidates.map(c => `id.eq.${c},slug.eq.${c}`).join(',');

      let { data, error: dbError } = await supabase
        .from('manifest_clients')
        .select('*')
        .or(orConditions)
        .maybeSingle();

      if (dbError) {
         console.warn("DB query for client failed:", dbError);
         throw dbError;
      }
      
      if (data) {
        if (typeof (data as any).theme === 'string') {
          try { 
             (data as any).theme = JSON.parse((data as any).theme);
          } catch(e) {}
        }
        setClient(data as any);
      } else {
        // Fallback default if completely missing
        setClient({
          id: resolvedClientId,
          name: 'Store',
          slug: resolvedClientId,
          categories: [],
          theme: {},
          created_at: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.warn('Fallback due to error:', err);
      setClient({
        id: 'adanehouse',
        name: 'Adane House',
        slug: 'adanehouse',
        categories: [],
        theme: {},
        created_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStore();
  }, []);

  return (
    <StoreContext.Provider value={{ client, loading, error, refreshClient: loadStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
