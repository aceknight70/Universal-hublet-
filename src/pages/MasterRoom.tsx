import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Client } from '../types';
import { AccountSettings } from '../components/AccountSettings';

function ThemeEditor({ clients, setClients }: { clients: Client[], setClients: any }) {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [themeDraft, setThemeDraft] = useState<{
     accent_color: string;
     background_color: string;
     header_background_color: string;
     header_text_color: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
     if (selectedClientId) {
        const client = clients.find(c => c.id === selectedClientId);
        if (client) {
           let parsed = {} as any;
           
              try { parsed = typeof client.theme === 'string' ? JSON.parse(client.theme) : (client.theme || {}); } catch(e) {}
           setThemeDraft({
              accent_color: parsed.accent_color || '#000000',
              background_color: parsed.background_color || '#f9fafb',
              header_background_color: parsed.header_background_color || '#ffffff',
              header_text_color: parsed.header_text_color || parsed.accent_color || '#000000'
           });
        }
     } else {
        setThemeDraft(null);
     }
  }, [selectedClientId, clients]);

  const handleSave = async () => {
     if (!selectedClientId || !themeDraft) return;
     setIsSaving(true);
     
        const client = clients.find(c => c.id === selectedClientId);
        if (!client) throw new Error("Client not found");

        const isFallback = client.id.startsWith('fallback');
        
        const newThemeStr = JSON.stringify(themeDraft);
        
      try {
        if (!isFallback) {
          // @ts-ignore
const { error } = await supabase.from('manifest_clients').update({ theme: themeDraft }).eq('id', selectedClientId);
          if (error) throw error;
        } else {
          
        }

        setClients(clients.map(c => c.id === selectedClientId ? { ...c, theme: themeDraft } : c));
        alert('Theme updated successfully.');
     } catch (err: any) {
        alert('Failed to save theme: ' + err.message);
     } finally {
        setIsSaving(false);
     }
  };

  return (
     <div className="bg-white p-6 rounded shadow-sm border">
        <h3 className="text-lg font-bold mb-4">Store Theme Editor</h3>
        
        <div className="mb-6">
           <label className="block text-sm font-medium text-gray-700 mb-2">Select Store to Edit</label>
           <select 
              value={selectedClientId} 
              onChange={e => setSelectedClientId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md border"
           >
              <option value="">-- Select a store --</option>
              {clients.map(c => (
                 <option key={c.id} value={c.id}>{c.name}</option>
              ))}
           </select>
        </div>

        {themeDraft && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Controls */}
              <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                   <div className="flex items-center space-x-2">
                     <input type="color" value={themeDraft.accent_color} onChange={e => setThemeDraft({...themeDraft, accent_color: e.target.value})} />
                     <span className="text-sm text-gray-500 font-mono">{themeDraft.accent_color}</span>
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                   <div className="flex items-center space-x-2">
                     <input type="color" value={themeDraft.background_color} onChange={e => setThemeDraft({...themeDraft, background_color: e.target.value})} />
                     <span className="text-sm text-gray-500 font-mono">{themeDraft.background_color}</span>
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Header Background Color</label>
                   <div className="flex items-center space-x-2">
                     <input type="color" value={themeDraft.header_background_color} onChange={e => setThemeDraft({...themeDraft, header_background_color: e.target.value})} />
                     <span className="text-sm text-gray-500 font-mono">{themeDraft.header_background_color}</span>
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Header Text Color</label>
                   <div className="flex items-center space-x-2">
                     <input type="color" value={themeDraft.header_text_color} onChange={e => setThemeDraft({...themeDraft, header_text_color: e.target.value})} />
                     <span className="text-sm text-gray-500 font-mono">{themeDraft.header_text_color}</span>
                   </div>
                 </div>
                 
                 <div className="pt-4">
                   <button 
                     onClick={handleSave} 
                     disabled={isSaving}
                     className="px-6 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700 disabled:opacity-50 font-medium"
                   >
                     {isSaving ? 'Saving...' : 'Save Theme Settings'}
                   </button>
                 </div>
              </div>

              {/* Live Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Live Preview</label>
                <div 
                  className="border rounded-lg overflow-hidden shadow-inner h-64 flex flex-col transition-colors"
                  style={{ backgroundColor: themeDraft.background_color }}
                >
                   <header 
                     className="px-4 py-3 flex items-center justify-between transition-colors shadow-sm"
                     style={{ backgroundColor: themeDraft.header_background_color }}
                   >
                      <div className="font-bold text-lg" style={{ color: themeDraft.header_text_color }}>
                        {clients.find(c => c.id === selectedClientId)?.name}
                      </div>
                      <div className="flex space-x-2 opacity-80">
                        <div className="w-16 h-4 rounded" style={{ backgroundColor: themeDraft.header_text_color }}></div>
                        <div className="w-16 h-4 rounded" style={{ backgroundColor: themeDraft.header_text_color }}></div>
                      </div>
                   </header>
                   <div className="p-4 flex-1">
                      <div className="flex space-x-2 mb-4">
                         <div className="w-24 h-8 rounded-full" style={{ backgroundColor: themeDraft.accent_color }}></div>
                         <div className="w-24 h-8 rounded-full bg-white bg-opacity-60 border border-gray-200"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="w-full h-16 rounded bg-white bg-opacity-80 border border-gray-200 flex items-center px-4 shadow-sm">
                           <div className="w-10 h-10 rounded bg-gray-200 mr-4"></div>
                           <div className="h-4 w-32 rounded bg-gray-200"></div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
           </div>
        )}
     </div>
  );
}

export function MasterRoom() {
  const [clients, setClients] = useState<Client[]>([]);
  
  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('manifest_clients').select('*');
      let loadedClients = data && data.length > 0 ? data : [
        { id: 'fallback-1', name: 'Ugomenz Electronics', slug: 'ugomenz', categories: [], theme: { accent_color: '#E8622C' }, created_at: new Date().toISOString() },
        { id: 'fallback-2', name: 'O Frank Electronics', slug: 'o-frank', categories: [], theme: { accent_color: '#2B5FD9' }, created_at: new Date().toISOString() },
        { id: 'fallback-3', name: 'AllSufficiency (ORB)', slug: 'allsufficiency', categories: [], theme: { accent_color: '#C0392B' }, created_at: new Date().toISOString() },
        { id: 'fallback-4', name: 'Linz Electronics', slug: 'linz', categories: [], theme: { accent_color: '#6F4E37' }, created_at: new Date().toISOString() }
      ] as any[];

     // Apply overrides
      setClients(loadedClients);
    }
    load();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="bg-purple-50 text-purple-800 px-4 py-2 rounded text-sm">
        <strong>Master Room</strong> • Manage stores, brands, and system settings.
      </div>
      
      <AccountSettings />

      <div className="bg-white p-6 rounded shadow-sm border">
        <h3 className="text-lg font-bold mb-4">Store Directory & Skin Switcher</h3>
        <p className="text-sm text-gray-500 mb-4">
          View and switch between stores to preview their skins. This only affects your current device view.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {clients.map(c => {
             let accent = '#000';
             
               try {
               const theme = typeof c.theme === 'string' ? JSON.parse(c.theme) : c.theme;
               accent = theme.accent_color || '#000';
             } catch(e) {}
             
             return (
               <a 
                 key={c.id} 
                 href={`/${c.slug}`}
                 className="block p-4 border rounded shadow-sm hover:shadow-md transition-all text-center"
                 style={{ borderTop: `4px solid ${accent}` }}
               >
                 <div className="font-bold text-gray-800">{c.name}</div>
                 <div className="text-xs text-gray-500 mt-1">/{c.slug}</div>
               </a>
             );
          })}
        </div>
      </div>
      
      {/* New Business Wizard Placeholder */}
      <div className="bg-white p-6 rounded shadow-sm border">
         <h3 className="text-lg font-bold mb-4">New Business Onboarding Wizard</h3>
         <p className="text-sm text-gray-500 mb-4">Step-by-step wizard to create and configure a new store.</p>
         <button className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700">
           + Start New Business Wizard
         </button>
      </div>

      <ThemeEditor clients={clients} setClients={setClients} />
    </div>
  );
}
