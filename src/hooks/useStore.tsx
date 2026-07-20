import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Client } from '../types';

interface StoreContextType {
  client: Client | null;
  loading: boolean;
  error: Error | null;
}

const StoreContext = createContext<StoreContextType>({ client: null, loading: true, error: null });

export function StoreProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);
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
          .eq('slug', slug)
          .maybeSingle();

        if (dbError) throw dbError;
        if (!data) {
          // Fallback to mock data if the database is empty/unseeded
          const fallbackClients: Record<string, any> = {
            'ugomenz': { id: '11111111-1111-1111-1111-111111111111', name: 'Ugomenz Electronics', slug: 'ugomenz', categories: [], theme: { accent_color: '#E8622C' }, created_at: new Date().toISOString() },
            'o-frank': { id: '22222222-2222-2222-2222-222222222222', name: 'O Frank Electronics', slug: 'o-frank', categories: [], theme: { accent_color: '#2B5FD9' }, created_at: new Date().toISOString() },
            'allsufficiency': { id: '33333333-3333-3333-3333-333333333333', name: 'AllSufficiency (ORB)', slug: 'allsufficiency', categories: [], theme: { accent_color: '#C0392B' }, created_at: new Date().toISOString() },
            'linz': { id: '44444444-4444-4444-4444-444444444444', name: 'Linz Electronics', slug: 'linz', categories: [], theme: { accent_color: '#6F4E37' }, created_at: new Date().toISOString() }
          };
          if (fallbackClients[slug]) {
            data = fallbackClients[slug];
          } else {
            throw new Error(`Store not found: ${slug}. Please ensure the store exists in the database.`);
          }
        }
        
        // Parse JSON fields if they come as strings
        if (typeof (data as any).theme === 'string') {
          try {
             (data as any).theme = JSON.parse((data as any).theme);
          } catch(e) {}
        }

        // Apply local overrides (used when saving fallback store themes in MasterRoom)
        try {
          const overridesStr = localStorage.getItem('manifest_theme_overrides');
          if (overridesStr) {
            const overrides = JSON.parse(overridesStr);
            if (overrides[slug]) {
              (data as any).theme = { ...((data as any).theme || {}), ...overrides[slug] };
            }
          }
        } catch(e) {}

        setClient(data as any);
      } catch (err: any) {
        console.error('Failed to load store:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadStore();
    }
  }, [slug]);

  return (
    <StoreContext.Provider value={{ client, loading, error }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
