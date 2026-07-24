const fs = require('fs');
let code = fs.readFileSync('src/pages/MasterRoom.tsx', 'utf8');

const themeEditorRegex = /function ThemeEditor\(\{ clients, setClients \}: \{ clients: Client\[\], setClients: any \}\) \{([\s\S]*?)\n\}\nfunction WatermarkEditor/m;
const match = code.match(themeEditorRegex);

if (match) {
  let newThemeEditor = `function ThemeEditor({ clients, setClients }: { clients: Client[], setClients: any }) {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [themeDraft, setThemeDraft] = useState<{
     accent_color: string;
     background_color: string;
     header_background_color: string;
     header_text_color: string;
     logo_url?: string;
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
              logo_url: parsed.logo_url || ''
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
      const fileName = \`\${selectedClientId}/logo_\${Date.now()}.\${fileExt}\`;
      
      const { error: uploadError } = await supabase.storage
        .from('manifest_gallery')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage
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
                          <div className="font-bold" style={{ color: themeDraft.header_text_color }}>{clients.find(c => c.id === selectedClientId)?.name || 'Store Name'}</div>
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
\nfunction WatermarkEditor`;
  
  code = code.replace(themeEditorRegex, newThemeEditor);
  fs.writeFileSync('src/pages/MasterRoom.tsx', code);
  console.log('Replaced ThemeEditor successfully.');
} else {
  console.log('Regex match failed.');
}
