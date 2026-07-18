import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../hooks/useStore';
import { compressImage } from '../lib/imageUtils';

export function PhotoMatchingBay() {
  const { client } = useStore();
  const [photos, setPhotos] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
    
    // Show instant preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSuccessMsg(null);
    setIsUploading(true);
    setErrorMsg(null);

    try {
      // Compress image
      const compressedFile = await compressImage(file, 1600);

      const fileExt = compressedFile.name.split('.').pop() || 'jpg';
      const folder = client?.id?.includes('fallback') ? '00000000-0000-0000-0000-000000000000' : (client?.id || '00000000-0000-0000-0000-000000000000');
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('manifest_gallery')
        .upload(fileName, compressedFile);

      if (uploadError) throw uploadError;
      
      setSuccessMsg("Photo saved successfully.");
      setTimeout(() => setSuccessMsg(null), 3000);
      setPreviewUrl(null); // clear preview on success
      
      await loadTray();
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
      // Clean up object URL to avoid memory leaks
      URL.revokeObjectURL(objectUrl);
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
        
        {previewUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <div className="relative inline-block">
              <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover rounded shadow-sm border" />
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center rounded">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white text-xs mt-2 font-medium">Uploading...</span>
                </div>
              )}
            </div>
          </div>
        )}
        {successMsg && <p className="text-sm text-green-600 mt-2 font-medium">✓ {successMsg}</p>}

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
              const url = supabase.storage.from('manifest_gallery').getPublicUrl(`${client?.id || '00000000-0000-0000-0000-000000000000'}/${photo.name}`).data.publicUrl;
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
