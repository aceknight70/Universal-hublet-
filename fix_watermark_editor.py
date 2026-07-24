import re

with open('src/pages/MasterRoom.tsx', 'r') as f:
    code = f.read()

watermark_regex = re.compile(r'function WatermarkEditor\(\{ clients, setClients \}: \{ clients: Client\[\], setClients: any \}\) \{([\s\S]*?)\n\}\n\n', re.MULTILINE)

# I will write the replacement code for WatermarkEditor
new_code = """function WatermarkEditor({ clients, setClients }: { clients: Client[], setClients: any }) {
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
"""

with open('src/pages/MasterRoom.tsx', 'w') as f:
    f.write(watermark_regex.sub(new_code + "\n\n", code))
print("Updated WatermarkEditor")
