import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Client } from '../types';
import { AccountSettings } from '../components/AccountSettings';
import { useStore } from '../hooks/useStore';
import { setTierPin, setIndividualStaffPin, deleteIndividualStaffPin, listStaffNames } from '../lib/pinAuth';
import { Settings, Upload, Loader2, Image as ImageIcon, Copy, Check, Key, Shield, User, Trash2 } from 'lucide-react';

function DomainSkinControl({ clients }: { clients: Client[] }) {
  const [currentDomain] = useState(window.location.hostname);
  const [assignedClientId, setAssignedClientId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { refreshClient } = useStore();

  useEffect(() => {
    async function loadDomainConfig() {
      const { data, error } = await (supabase as any)
        .from('manifest_domain_config')
        .select('client_id')
        .eq('domain', currentDomain)
        .maybeSingle();
      if (data && !error) {
        setAssignedClientId(data.client_id);
      }
    }
    loadDomainConfig();
  }, [currentDomain]);

  async function handleSelectChange(newClientId: string) {
    if (!newClientId) return;
    setAssignedClientId(newClientId);
    setIsSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('manifest_domain_config')
        .upsert({ domain: currentDomain, client_id: newClientId });
      
      if (error) throw error;
      if (refreshClient) {
        await refreshClient();
      }
    } catch (err: any) {
      alert("Failed to update domain configuration: " + err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow-sm border relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Domain Skin Control</h3>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-gray-50 text-sm">
          <span className="text-gray-500">Current Domain:</span>
          <strong className="font-mono">{currentDomain}</strong>
          <span className={`w-2.5 h-2.5 rounded-full ml-1 ${
            ['universal-hublet.vercel.app', 'allsufficiencyhublet-1.vercel.app', 'adanehousehublet.vercel.app'].includes(currentDomain) 
              ? 'bg-green-500' 
              : 'bg-red-500'
          }`} title={
            ['universal-hublet.vercel.app', 'allsufficiencyhublet-1.vercel.app', 'adanehousehublet.vercel.app'].includes(currentDomain)
              ? "Real deployed domain"
              : "Preview or local domain - locks applied here will not affect the live site"
          } />
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Instantly switch the identity of this domain. Changes take effect immediately.
        {!['universal-hublet.vercel.app', 'allsufficiencyhublet-1.vercel.app', 'adanehousehublet.vercel.app'].includes(currentDomain) && (
          <span className="block mt-2 text-red-600 font-medium">
            ⚠️ You are in a preview environment. Skin locks applied here will only affect this preview address.
          </span>
        )}
      </p>
      
      <div className="relative max-w-sm">
        <select 
          value={assignedClientId} 
          onChange={e => handleSelectChange(e.target.value)}
          disabled={isSaving}
          className="appearance-none block w-full pl-3 pr-10 py-3 text-base border-gray-300 bg-gray-50 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md border font-medium cursor-pointer"
        >
          <option value="" disabled>-- Select a business --</option>
          {clients.map(c => (
             <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}


function WatermarkEditor({ clients, setClients }: { clients: Client[], setClients: any }) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

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
       setUploadSuccess('');
    } else {
       setSettings(null);
       setUploadSuccess('');
    }
  }, [selectedClientId, clients]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
     if (!e.target.files || !e.target.files[0] || !selectedClientId) return;
     setIsUploading(true);
     setUploadSuccess('');
     try {
       const file = e.target.files[0];
       const filename = `watermarks/${selectedClientId}-${Date.now()}`;
       
       const { error } = await (supabase as any).storage.from('manifest_gallery').upload(filename, file);
       if (error) throw error;
       
       const { data: urlData } = supabase.storage.from('manifest_gallery').getPublicUrl(filename);
       
       const newSettings = { ...settings, url: urlData.publicUrl };
       setSettings(newSettings);
       
       // Auto-save the client theme so it's immediate
       const client = clients.find(c => c.id === selectedClientId);
       if (client && !client.id.startsWith('fallback')) {
          let themeObj = client.theme;
          if (typeof themeObj === 'string') {
             try { themeObj = JSON.parse(themeObj); } catch(e) { themeObj = {}; }
          }
          themeObj = themeObj || {};
          themeObj.watermark = newSettings;
          
          await (supabase as any).from('manifest_clients').update({ theme: themeObj }).eq('id', selectedClientId);
          setClients(clients.map(c => c.id === selectedClientId ? { ...c, theme: themeObj } : c));
       }
       
       setUploadSuccess('Watermark uploaded and saved ✓');
       setTimeout(() => setUploadSuccess(''), 5000);
     } catch(err: any) {
        alert("Upload failed: " + err.message);
     } finally {
        setIsUploading(false);
     }
  }

  async function handleSave() {
     if (!selectedClientId || !settings) return;
     setIsSaving(true);
     setUploadSuccess('');
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
       setUploadSuccess('Watermark settings updated ✓');
       setTimeout(() => setUploadSuccess(''), 5000);
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
                         <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                         </svg>
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
                {uploadSuccess && (
                  <div className="mt-2 text-sm font-medium text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {uploadSuccess}
                  </div>
                )}
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

              <div className="pt-2">
                 <button
                   onClick={handleSave}
                   disabled={isSaving}
                   className="px-6 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700 disabled:opacity-50 font-medium flex items-center gap-2"
                 >
                   {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                   Save Settings
                 </button>
              </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Live Preview</label>
               <div className="aspect-video bg-gray-200 rounded overflow-hidden relative flex items-center justify-center border border-gray-300 shadow-inner">
                  <span className="text-gray-400 font-medium">Sample Photo</span>
                  {settings.url && settings.placement !== 'diagonal' && (
                     <img 
                        src={settings.url} 
                        className={`absolute ${
                          settings.placement === 'bottom-right' ? 'bottom-4 right-4' :
                          settings.placement === 'bottom-left' ? 'bottom-4 left-4' :
                          'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                        } pointer-events-none`}
                        style={{
                          width: `${settings.size}%`,
                          opacity: settings.opacity / 100
                        }}
                     />
                  )}
                  {settings.url && settings.placement === 'diagonal' && (
                     <div className="absolute inset-0 pointer-events-none opacity-20" style={{ opacity: settings.opacity / 100 }}>
                       {/* Simplified diagonal pattern for preview */}
                       <div className="w-full h-full flex flex-wrap gap-12 items-center justify-center transform -rotate-12 scale-150">
                         {Array.from({length: 12}).map((_, i) => (
                           <img key={i} src={settings.url} style={{ width: `${settings.size}%` }} />
                         ))}
                       </div>
                     </div>
                  )}
               </div>
               <p className="text-xs text-gray-500 mt-2">
                 This preview shows how the watermark will appear on high-resolution gallery downloads.
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
     logo_url?: string;
     display_name?: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

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
              header_text_color: parsed.header_text_color || parsed.accent_color || '#000000',
              logo_url: parsed.logo_url || '',
              display_name: parsed.display_name || client.name || ''
           });
        }
     } else {
        setThemeDraft(null);
     }
  }, [selectedClientId, clients]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedClientId || !themeDraft) return;
    setIsUploadingLogo(true);
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${selectedClientId}/logo_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await (supabase as any).storage
        .from('manifest_gallery')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = (supabase as any).storage
        .from('manifest_gallery')
        .getPublicUrl(fileName);
        
      setThemeDraft({ ...themeDraft, logo_url: publicUrlData.publicUrl });
    } catch (err: any) {
      alert('Failed to upload logo: ' + err.message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async () => {
     if (!selectedClientId || !themeDraft) return;
     setIsSaving(true);
     try {
        const client = clients.find(c => c.id === selectedClientId);
        if (!client) throw new Error("Client not found");
        const isFallback = client.id.startsWith('fallback');
        
        if (!isFallback) {
          const { error } = await (supabase as any).from('manifest_clients').update({ theme: themeDraft }).eq('id', selectedClientId);
          if (error) throw error;
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
        <h3 className="text-lg font-bold mb-4">Store Theme & Logo Editor</h3>
        
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
              <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                   <div className="flex items-start gap-4">
                     <div className="w-24 h-24 border rounded flex items-center justify-center bg-gray-50 overflow-hidden">
                       {themeDraft.logo_url ? (
                         <img src={themeDraft.logo_url} className="w-full h-full object-contain" alt="Logo" />
                       ) : (
                         <ImageIcon className="w-8 h-8 text-gray-300" />
                       )}
                     </div>
                     <div className="flex-1 space-y-2">
                       <label className="flex items-center justify-center gap-2 px-3 py-2 border rounded cursor-pointer hover:bg-gray-50 text-sm">
                         {isUploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                         {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                         <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                       </label>
                       {themeDraft.logo_url && (
                         <button onClick={() => setThemeDraft({...themeDraft, logo_url: ''})} className="text-xs text-red-600 hover:underline">
                           Remove Logo
                         </button>
                       )}
                     </div>
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Business Display Name</label>
                   <input
                     type="text"
                     className="mt-1 block w-full pl-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md border"
                     placeholder="E.g., Adane House Electronics"
                     value={themeDraft.display_name || ''}
                     onChange={e => setThemeDraft({...themeDraft, display_name: e.target.value})}
                   />
                 </div>
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
              </div>

              <div className="bg-gray-50 p-4 rounded border flex flex-col justify-between">
                 <div>
                   <h4 className="font-bold text-sm text-gray-500 mb-4 uppercase tracking-wider">Preview</h4>
                   <div 
                     className="w-full rounded shadow-sm border overflow-hidden flex flex-col h-48"
                     style={{ backgroundColor: themeDraft.background_color }}
                   >
                     <div 
                       className="px-4 py-3 border-b flex items-center justify-between"
                       style={{ backgroundColor: themeDraft.header_background_color }}
                     >
                        {themeDraft.logo_url ? (
                          <img src={themeDraft.logo_url} className="h-6 object-contain" alt="Logo" />
                        ) : (
                          <div className="font-bold" style={{ color: themeDraft.header_text_color }}>{themeDraft.display_name || clients.find(c => c.id === selectedClientId)?.name || 'Store Name'}</div>
                        )}
                        <div className="px-3 py-1 rounded text-xs font-bold text-white" style={{ backgroundColor: themeDraft.accent_color }}>
                          Action
                        </div>
                     </div>
                     <div className="p-4 flex-1">
                        <div className="w-3/4 h-4 rounded mb-2" style={{ backgroundColor: themeDraft.accent_color, opacity: 0.2 }}></div>
                        <div className="w-1/2 h-4 rounded" style={{ backgroundColor: themeDraft.accent_color, opacity: 0.2 }}></div>
                     </div>
                   </div>
                 </div>
                 <div className="mt-4 pt-4 border-t">
                    <button 
                       onClick={handleSave} 
                       disabled={isSaving}
                       className="w-full bg-purple-600 text-white rounded py-2 font-bold hover:bg-purple-700 disabled:opacity-50"
                    >
                       {isSaving ? 'Saving...' : 'Save Theme Settings'}
                    </button>
                 </div>
              </div>
           </div>
        )}
     </div>
  );
}

function BrandExclusionsEditor({ clients }: { clients: Client[] }) {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [brands, setBrands] = useState<{name: string, isExcluded: boolean}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedClientId) {
      loadBrands();
    } else {
      setBrands([]);
    }
  }, [selectedClientId]);

  async function loadBrands() {
    setIsLoading(true);
    try {
      const { data: allBrands } = await (supabase as any).from('manifest_brands').select('name').order('name');
      const { data: exclusions } = await (supabase as any)
        .from('manifest_brand_exclusions')
        .select('brand_name')
        .eq('client_id', selectedClientId);
        
      const excludedNames = new Set((exclusions || []).map((e: any) => e.brand_name));
      const merged = (allBrands || []).map((b: any) => ({
        name: b.name,
        isExcluded: excludedNames.has(b.name)
      }));
      setBrands(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleExclusion(brandName: string, currentlyExcluded: boolean) {
    if (!selectedClientId) return;
    
    // Optimistic UI
    setBrands(brands.map(b => b.name === brandName ? { ...b, isExcluded: !currentlyExcluded } : b));
    
    try {
      if (currentlyExcluded) {
        // Remove exclusion
        await (supabase as any)
          .from('manifest_brand_exclusions')
          .delete()
          .eq('client_id', selectedClientId)
          .eq('brand_name', brandName);
      } else {
        // Add exclusion
        await (supabase as any)
          .from('manifest_brand_exclusions')
          .insert({ client_id: selectedClientId, brand_name: brandName });
      }
    } catch (err: any) {
      alert("Error updating exclusion: " + err.message);
      // Revert on error
      setBrands(brands.map(b => b.name === brandName ? { ...b, isExcluded: currentlyExcluded } : b));
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow-sm border mt-8">
      <h3 className="text-lg font-bold mb-4">Brand Exclusions</h3>
      <p className="text-sm text-gray-500 mb-6">Hide universal brands that a specific store doesn't carry.</p>
      
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

      {selectedClientId && (
        isLoading ? <div className="p-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div> :
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map(brand => (
            <label key={brand.name} className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <input 
                type="checkbox" 
                checked={brand.isExcluded} 
                onChange={() => toggleExclusion(brand.name, brand.isExcluded)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className={`text-sm ${brand.isExcluded ? 'text-gray-400 line-through' : 'text-gray-900 font-medium'}`}>
                {brand.name}
              </span>
            </label>
          ))}
          {brands.length === 0 && <div className="text-sm text-gray-500 col-span-full">No brands found.</div>}
        </div>
      )}
    </div>
  );
}

function MasterPinControl({ clients }: { clients: Client[] }) {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [managerPin, setManagerPin] = useState('');
  const [sharedStaffPin, setSharedStaffPin] = useState('');

  // Named staff state
  const [staffList, setStaffList] = useState<string[]>([]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPin, setNewStaffPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  useEffect(() => {
    if (selectedClientId) {
      loadStaffList();
    }
  }, [selectedClientId]);

  async function loadStaffList() {
    if (!selectedClientId) return;
    const names = await listStaffNames(selectedClientId);
    setStaffList(names);
  }

  async function handleSetManagerPin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClientId) return;
    setLoading(true);
    setMessage(null);
    const res = await setTierPin(selectedClientId, 'manager', managerPin);
    if (res.success) {
      setMessage({ type: 'success', text: 'Manager PIN updated successfully! ✓' });
      setManagerPin('');
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update Manager PIN.' });
    }
    setLoading(false);
  }

  async function handleSetSharedStaffPin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClientId) return;
    setLoading(true);
    setMessage(null);
    const res = await setTierPin(selectedClientId, 'staff', sharedStaffPin);
    if (res.success) {
      setMessage({ type: 'success', text: 'Default Shared Staff PIN updated successfully! ✓' });
      setSharedStaffPin('');
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update Shared Staff PIN.' });
    }
    setLoading(false);
  }

  async function handleAddNamedStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClientId || !newStaffName || !newStaffPin) return;
    setLoading(true);
    setMessage(null);
    const res = await setIndividualStaffPin(selectedClientId, newStaffName, newStaffPin);
    if (res.success) {
      setMessage({ type: 'success', text: `Individual PIN set for ${newStaffName}! ✓` });
      setNewStaffName('');
      setNewStaffPin('');
      loadStaffList();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to set named staff PIN.' });
    }
    setLoading(false);
  }

  async function handleDeleteNamedStaff(name: string) {
    if (!selectedClientId) return;
    if (!confirm(`Remove individual PIN access for ${name}?`)) return;
    setLoading(true);
    const res = await deleteIndividualStaffPin(selectedClientId, name);
    if (res.success) {
      setMessage({ type: 'success', text: `Removed individual PIN entry for ${name}.` });
      loadStaffList();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to delete PIN.' });
    }
    setLoading(false);
  }

  const selectedClientName = clients.find((c) => c.id === selectedClientId)?.name || 'Store';

  return (
    <div className="bg-white p-6 rounded shadow-sm border space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-600" /> Store PIN Administration
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage Manager PINs, default shared Staff PINs, and named individual staff PINs across all stores.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <label className="block text-xs font-bold text-gray-700 mb-1">Select Target Store</label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.slug})
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <Shield className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tier PINs (Manager & Default Shared Staff) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={handleSetManagerPin} className="p-4 bg-purple-50/50 rounded-lg border border-purple-100 space-y-3">
          <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
            <Shield className="w-4 h-4 text-purple-700" />
            Set Manager PIN — {selectedClientName}
          </div>
          <p className="text-xs text-gray-600">
            Used by Manager to log in and authorize adding named staff PINs.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              required
              maxLength={8}
              placeholder="New Manager PIN"
              value={managerPin}
              onChange={(e) => setManagerPin(e.target.value)}
              className="flex-1 p-2 text-sm font-mono border rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !managerPin}
              className="px-3 py-2 bg-purple-700 text-white font-bold text-xs rounded shadow hover:bg-purple-800 disabled:bg-purple-300"
            >
              Update Manager PIN
            </button>
          </div>
        </form>

        <form onSubmit={handleSetSharedStaffPin} className="p-4 bg-sky-50/50 rounded-lg border border-sky-100 space-y-3">
          <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
            <Key className="w-4 h-4 text-sky-700" />
            Set Shared Staff PIN — {selectedClientName}
          </div>
          <p className="text-xs text-gray-600">
            Default fallback PIN for staff members who don't have an individual name entry.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              required
              maxLength={8}
              placeholder="New Shared Staff PIN"
              value={sharedStaffPin}
              onChange={(e) => setSharedStaffPin(e.target.value)}
              className="flex-1 p-2 text-sm font-mono border rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={loading || !sharedStaffPin}
              className="px-3 py-2 bg-sky-700 text-white font-bold text-xs rounded shadow hover:bg-sky-800 disabled:bg-sky-300"
            >
              Update Shared PIN
            </button>
          </div>
        </form>
      </div>

      {/* Named Individual Staff PINs */}
      <div className="pt-2 border-t">
        <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-purple-600" /> Named Individual Staff PINs ({selectedClientName})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
          <form onSubmit={handleAddNamedStaff} className="p-4 border rounded-lg space-y-3 bg-gray-50/50">
            <span className="text-xs font-bold text-gray-700 block">Add or Update Named Staff Entry</span>
            <input
              type="text"
              required
              placeholder="Staff Name (e.g. Sarah Connor)"
              value={newStaffName}
              onChange={(e) => setNewStaffName(e.target.value)}
              className="w-full p-2 text-sm border rounded"
            />
            <input
              type="password"
              required
              maxLength={8}
              placeholder="Individual PIN"
              value={newStaffPin}
              onChange={(e) => setNewStaffPin(e.target.value)}
              className="w-full p-2 text-sm font-mono border rounded"
            />
            <button
              type="submit"
              disabled={loading || !newStaffName || !newStaffPin}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded transition-colors disabled:bg-purple-300"
            >
              Save Named Staff PIN
            </button>
          </form>

          <div className="border rounded-lg p-4 bg-white flex flex-col">
            <span className="text-xs font-bold text-gray-700 block mb-2">Registered Individual Staff Names</span>
            {staffList.length > 0 ? (
              <div className="divide-y max-h-48 overflow-y-auto flex-1">
                {staffList.map((name) => (
                  <div key={name} className="py-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800">{name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteNamedStaff(name)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Remove PIN"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic py-4 text-center">No individual staff names registered for this store.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MasterRoom() {
  const [clients, setClients] = useState<Client[]>([]);
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  useEffect(() => {
    async function load() {
      const { data } = await (supabase as any).from('manifest_clients').select('*');
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
      <div className="bg-purple-50 text-purple-800 px-4 py-2 rounded text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <strong>Master Room</strong> • Manage stores, brands, and system settings.
        </div>
        {user?.id && (
          <div className="flex items-center gap-2 bg-purple-100 px-2 py-1 rounded text-xs font-mono">
            <span className="opacity-70">Master ID:</span>
            <strong>{user.id}</strong>
            <button 
              onClick={handleCopy}
              className="p-1 hover:bg-purple-200 rounded transition-colors text-purple-700"
              title="Copy ID"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
      
      <AccountSettings />
      
      <MasterPinControl clients={clients} />

      {/* New Business Wizard Placeholder */}
      <div className="bg-white p-6 rounded shadow-sm border">
         <h3 className="text-lg font-bold mb-4">New Business Onboarding Wizard</h3>
         <p className="text-sm text-gray-500 mb-4">Step-by-step wizard to create and configure a new store.</p>
         <button className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700">
           + Start New Business Wizard
         </button>
      </div>

      <DomainSkinControl clients={clients} />
      <ThemeEditor clients={clients} setClients={setClients} />
      <BrandExclusionsEditor clients={clients} />
      <WatermarkEditor clients={clients} setClients={setClients} />
    </div>
  );
}
