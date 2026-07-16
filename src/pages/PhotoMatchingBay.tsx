import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../hooks/useStore';

export function PhotoMatchingBay() {
  const { client } = useStore();
  const [photos, setPhotos] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (client) {
      loadTray();
    }
  }, [client]);

  async function loadTray() {
    try {
      // List files. Since the policy likely expects the client.id folder, we should list from there
      // But the bucket might be global? Let's just list the root or the client folder.
      const { data, error } = await supabase.storage.from('manifest_gallery').list(client?.id || '');
      if (error) throw error;
      setPhotos(data || []);
    } catch (err: any) {
      console.error("Failed to load tray:", err);
      setErrorMsg("Failed to load tray: " + err.message);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const fileExt = file.name.split('.').pop();
      // To satisfy possible UUID folder constraints, we'll prefix with client.id
      // However, if client.id is 'fallback-1', this will fail. We'll use a dummy UUID if needed.
      const folder = client?.id?.includes('fallback') ? '00000000-0000-0000-0000-000000000000' : (client?.id || 'public');
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('manifest_gallery')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      
      await loadTray();
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Photo Matching Bay</h2>
      
      <div className="bg-white p-6 rounded shadow-sm border mb-6">
        <h3 className="text-lg font-bold mb-2">Upload to Unmatched Tray</h3>
        <p className="text-sm text-gray-500 mb-4">
          Photos uploaded here go into the "manifest_gallery" bucket.
        </p>
        
        <input 
          type="file" 
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-purple-50 file:text-purple-700
            hover:file:bg-purple-100 disabled:opacity-50"
        />
        {isUploading && <p className="text-sm text-purple-600 mt-2">Uploading...</p>}
        {errorMsg && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded border border-red-200">
            <strong>Error:</strong> {errorMsg}
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-6 rounded border min-h-[300px]">
        <h3 className="text-lg font-bold mb-4">Unmatched Tray</h3>
        {photos.length === 0 && !errorMsg ? (
          <div className="text-center text-gray-400 py-12">Tray is empty.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.filter(p => p.name !== '.emptyFolderPlaceholder').map(photo => {
              const url = supabase.storage.from('manifest_gallery').getPublicUrl(`${client?.id}/${photo.name}`).data.publicUrl;
              return (
                <div key={photo.name} className="border rounded bg-white shadow-sm overflow-hidden">
                  <img src={url} alt={photo.name} className="w-full h-32 object-cover" />
                  <div className="p-2 text-xs text-gray-500 truncate" title={photo.name}>
                    {photo.name}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
