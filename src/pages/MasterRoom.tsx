import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Client } from '../types';
import { AccountSettings } from '../components/AccountSettings';
import { Settings, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

function WatermarkEditor({ clients, setClients }: { clients: Client[], setClients: any }) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (selectedClientId) {
       const client = clients.find(c => c.id === selectedClientId);
       let theme = client?.theme;
       if (typeof theme === 'string') {
          try { theme = JSON.parse(theme); } catch(e) { theme = {}; }
       }
       theme = theme || {};
       setSettings({
          url: theme.watermark?.url || '',
          placement: theme.watermark?.placement || 'bottom-right',
          opacity: theme.watermark?.opacity ?? 50,
          size: theme.watermark?.size ?? 15,
       });
    } else {
       setSettings(null);
    }
  }, [selectedClientId, clients]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
     if (!e.target.files || !e.target.files[0] || !selectedClientId) return;
     setIsUploading(true);
     try {
       const file = e.target.files[0];
       const filename = `watermarks/${selectedClientId}-${Date.now()}`;
       
       // Note: uploading to manifest_gallery for convenience, as it's a public bucket
       const { error } = await supabase.storage.from('manifest_gallery').upload(filename, file);
       if (error) throw error;
       
       const { data: urlData } = supabase.storage.from('manifest_gallery').getPublicUrl(filename);
       setSettings({ ...settings, url: urlData.publicUrl });
     } catch(err: any) {
        alert("Upload failed: " + err.message);
     } finally {
        setIsUploading(false);
     }
  }

  async function handleSave() {
     if (!selectedClientId || !settings) return;
     setIsSaving(true);
     try {
       const client = clients.find(c => c.id === selectedClientId);
       if (!client) throw new Error("Client not found");
       const isFallback = client.id.startsWith('fallback');
       let themeObj = client.theme;
       if (typeof themeObj === 'string') {
          try { themeObj = JSON.parse(themeObj); } catch(e) { themeObj = {}; }
       }
       themeObj = themeObj || {};
       themeObj.watermark = settings;

       if (!isFallback) {
          const { error } = await (supabase as any).from('manifest_clients').update({ theme: themeObj }).eq('id', selectedClientId);
          if (error) throw error;
       }
       setClients(clients.map(c => c.id === selectedClientId ? { ...c, theme: themeObj } : c));
       alert('Watermark settings updated successfully.');
     } catch (err: any) {
        alert('Failed to save watermark settings: ' + err.message);
     } finally {
        setIsSaving(false);
     }
  }

  return (
    <div className="bg-white p-6 rounded shadow-sm border mt-8">
        <h3 className="text-lg font-bold mb-4">Gallery Watermark Settings</h3>
        
        <div className="mb-6">
           <label className="block text-sm font-medium text-gray-700 mb-2">Select Store</label>
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

        {settings && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Watermark Image (Logo/Stamp)</label>
                <div className="flex items-center gap-4">
                   {settings.url ? (
                     <div className="relative w-24 h-24 bg-gray-100 rounded border flex items-center justify-center p-2">
                       <img src={settings.url} alt="Watermark" className="max-w-full max-h-full object-contain" />
                       <button 
                         onClick={() => setSettings({...settings, url: ''})}
                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow"
                       >
                         <Settings className="w-3 h-3" />
                       </button>
                     </div>
                   ) : (
                     <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-purple-500 bg-gray-50">
                        {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-purple-500" /> : <Upload className="w-6 h-6 text-gray-400" />}
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                     </label>
                   )}
                   <div className="text-xs text-gray-500 flex-1">
                     Upload a PNG with transparent background for best results.
                   </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
                <select
                  value={settings.placement}
                  onChange={e => setSettings({...settings, placement: e.target.value})}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md border"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="center">Center</option>
                  <option value="diagonal">Diagonal Pattern</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opacity: {settings.opacity}%</label>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={settings.opacity} 
                  onChange={e => setSettings({...settings, opacity: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size (Percentage of photo width): {settings.size}%</label>
                <input 
                  type="range" 
                  min="5" max="100" 
                  value={settings.size} 
                  onChange={e => setSettings({...settings, size: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>

              <div className="pt-4">
                <button
                   onClick={handleSave}
                   disabled={isSaving || !settings.url}
                   className="px-6 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700 disabled:opacity-50 font-medium flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Watermark Settings
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Placement Preview</label>
              <div className="relative w-full aspect-video bg-gray-200 rounded border overflow-hidden flex items-center justify-center">
                 <ImageIcon className="w-12 h-12 text-gray-300 absolute" />
                 {settings.url && settings.placement !== 'diagonal' && (
                    <img 
                      src={settings.url} 
                      className="absolute"
                      style={{
                        width: `${settings.size}%`,
                        opacity: settings.opacity / 100,
                        ...(settings.placement === 'bottom-right' ? { bottom: '5%', right: '5%' } : {}),
                        ...(settings.placement === 'bottom-left' ? { bottom: '5%', left: '5%' } : {}),
                        ...(settings.placement === 'center' ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } : {})
                      }}
                      alt="Watermark preview"
                    />
                 )}
                 {settings.url && settings.placement === 'diagonal' && (
                    <div className="absolute inset-0 flex flex-wrap items-center justify-center overflow-hidden opacity-50" style={{ opacity: settings.opacity / 100 }}>
                      <div className="w-[150%] h-[150%] -rotate-45 flex flex-wrap gap-8 items-center justify-center">
                        {Array.from({length: 12}).map((_, i) => (
                           <img key={i} src={settings.url} style={{ width: `${settings.size}%` }} />
                        ))}
                      </div>
                    </div>
                 )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This setting is applied automatically to all future Gallery photo uploads.
              </p>
            </div>
          </div>
        )}
    </div>
  );
}

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
        { id: 'fallback-2', name: 'Adane House Electronics', slug: 'adanehouse', categories: [], theme: { accent_color: '#0ea5e9' }, created_at: new Date().toISOString() },
        { id: 'fallback-3', name: 'Adane House (ORB)', slug: 'adanehouse', categories: [], theme: { accent_color: '#0284c7' }, created_at: new Date().toISOString() },
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
      
      {/* New Business Wizard Placeholder */}
      <div className="bg-white p-6 rounded shadow-sm border">
         <h3 className="text-lg font-bold mb-4">New Business Onboarding Wizard</h3>
         <p className="text-sm text-gray-500 mb-4">Step-by-step wizard to create and configure a new store.</p>
         <button className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700">
           + Start New Business Wizard
         </button>
      </div>

      <ThemeEditor clients={clients} setClients={setClients} />
      <WatermarkEditor clients={clients} setClients={setClients} />
    </div>
  );
}
