import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../hooks/useStore';
import { compressImage } from '../lib/imageUtils';
import { Product } from '../types';
import { X, Search, Check } from 'lucide-react';

export function PhotoMatchingBay() {
  const { client } = useStore();
  const [photos, setPhotos] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    if (client) {
      loadTray();
      loadProducts();
    }
  }, [client]);

  async function loadProducts() {
    // Only load products since we might not have client_id in products, we filter in the app or just fetch all if fallback
    // Actually, products are global right now, or we filter by category if needed, but the showroom fetches all.
    const { data } = await supabase.from('manifest_products').select('*');
    if (data) setProducts(data);
  }

  async function loadTray() {
    try {
      const folder = client?.id?.includes('fallback') ? '00000000-0000-0000-0000-000000000000' : (client?.id || '00000000-0000-0000-0000-000000000000');
      const { data, error } = await supabase.storage.from('manifest_gallery').list(folder);
      if (error) throw error;
      // Filter out matched photos and placeholders
      setPhotos((data || []).filter(p => p.name !== '.emptyFolderPlaceholder' && !p.name.startsWith('matched_')));
    } catch (err: any) {
      console.error("Failed to load tray:", err);
      setErrorMsg("Failed to load tray: " + err.message);
    }
  }
  
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSuccessMsg(null);
    setIsUploading(true);
    setErrorMsg(null);

    try {
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
      setPreviewUrl(null); 
      
      await loadTray();
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function handleMatch(product: Product, slot: string) {
    if (!selectedPhoto) return;
    setIsMatching(true);
    setErrorMsg(null);
    try {
      const folder = client?.id?.includes('fallback') ? '00000000-0000-0000-0000-000000000000' : (client?.id || '00000000-0000-0000-0000-000000000000');
      const oldPath = `${folder}/${selectedPhoto.name}`;
      const newPath = `${folder}/matched_${Date.now()}_${selectedPhoto.name}`; // Add timestamp to avoid collisions
      
      // Get the URL for the new path
      const { data: publicUrlData } = supabase.storage
        .from('manifest_gallery')
        .getPublicUrl(newPath);
      
      // Insert into product images
      // Delete first to avoid constraint issues
      await supabase.from('manifest_product_images').delete().match({ product_id: product.id, slot: slot });
      const { error: dbError } = await supabase.from('manifest_product_images').insert({
        product_id: product.id,
        slot: slot,
        image_url: publicUrlData.publicUrl
      } as any);
      
      if (dbError) throw dbError;
      
      // Move file to mark as matched
      const { error: moveError } = await supabase.storage.from('manifest_gallery').move(oldPath, newPath);
      // We ignore move errors if it fails, at least the DB is updated, but ideally it succeeds.
      if (moveError) console.warn("Failed to mark file as matched in storage:", moveError);
      
      setSuccessMsg(`Photo matched to ${product.name}!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setSelectedPhoto(null);
      await loadTray();
    } catch (err: any) {
      console.error("Matching error:", err);
      setErrorMsg("Matching failed: " + err.message);
    } finally {
      setIsMatching(false);
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-4 md:gap-6 flex-1 min-h-0">
      {/* Left Sidebar: Upload & Unmatched Tray */}
      <div className="w-full md:w-1/3 flex flex-col gap-4 md:gap-6 shrink-0 h-[45vh] md:h-full min-h-[400px] md:min-h-0">
        <h2 className="text-2xl font-bold text-gray-800">Photo Bay</h2>
        
        <div className="bg-white p-4 rounded shadow-sm border">
          <h3 className="text-sm font-bold mb-2">Upload Photo</h3>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="block w-full text-xs text-gray-500
              file:mr-4 file:py-1.5 file:px-3
              file:rounded file:border-0
              file:font-semibold
              file:bg-[var(--theme-accent)] file:text-white
              hover:file:opacity-90 disabled:opacity-50"
          />
          {previewUrl && (
            <div className="mt-3 relative w-20 h-20">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded shadow-sm border" />
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-50 flex-1 rounded border overflow-hidden flex flex-col">
          <h3 className="text-sm font-bold p-3 border-b bg-white">Unmatched Tray</h3>
          <div className="p-3 flex-1 overflow-y-auto">
            {photos.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm">No unmatched photos.</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {photos.map(photo => {
                  const folder = client?.id?.includes('fallback') ? '00000000-0000-0000-0000-000000000000' : (client?.id || '00000000-0000-0000-0000-000000000000');
                  const url = supabase.storage.from('manifest_gallery').getPublicUrl(`${folder}/${photo.name}`).data.publicUrl;
                  const isSelected = selectedPhoto?.name === photo.name;
                  return (
                    <div 
                      key={photo.name} 
                      onClick={() => setSelectedPhoto(isSelected ? null : photo)}
                      className={`border-2 rounded shadow-sm overflow-hidden cursor-pointer transition-all relative ${isSelected ? 'border-[var(--theme-accent)] ring-2 ring-[var(--theme-accent)] ring-opacity-50' : 'border-transparent hover:border-gray-300 bg-white'}`}
                    >
                      <img src={url} alt={photo.name} className="w-full h-24 object-cover" />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-[var(--theme-accent)] text-white p-1 rounded-full shadow">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Content: Product Matching */}
      <div className="w-full md:w-2/3 flex flex-col bg-white rounded shadow-sm border overflow-hidden h-[60vh] md:h-full min-h-[500px] md:min-h-0">
        {selectedPhoto ? (
          <div className="p-4 border-b bg-blue-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-blue-900">Select a Product</h3>
              <p className="text-xs text-blue-700">Choose a product below to attach the selected photo.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded border-2 border-white shadow-sm overflow-hidden">
                <img 
                  src={supabase.storage.from('manifest_gallery').getPublicUrl(`${client?.id?.includes('fallback') ? '00000000-0000-0000-0000-000000000000' : (client?.id || '00000000-0000-0000-0000-000000000000')}/${selectedPhoto.name}`).data.publicUrl} 
                  className="w-full h-full object-cover"
                />
              </div>
              <button onClick={() => setSelectedPhoto(null)} className="p-2 hover:bg-blue-100 rounded-full text-blue-800">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-bold text-gray-500 text-center">Select a photo from the tray to match it</h3>
          </div>
        )}

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Search products by name or code..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {(successMsg || errorMsg) && (
            <div className={`p-3 mb-4 rounded text-sm font-medium ${successMsg ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {successMsg || errorMsg}
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                className={`border rounded-lg p-3 flex flex-col gap-3 transition-all ${selectedPhoto ? 'hover:border-[var(--theme-accent)] hover:shadow-md bg-white' : 'opacity-70 bg-gray-50 grayscale'}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 truncate">{product.name}</div>
                  <div className="text-xs text-gray-500 font-mono mt-1">{product.code}</div>
                  <div className="text-xs text-gray-400 mt-1">{product.category}</div>
                </div>
                {selectedPhoto && (
                  <div className="flex flex-col gap-2 border-t pt-2 mt-1">
                    <div className="text-xs font-semibold text-gray-600">Select Slot to Match:</div>
                    <div className="flex flex-wrap gap-2">
                      {['main', 'front', 'left', 'right', 'back'].map(slot => (
                        <button 
                          key={slot}
                          disabled={isMatching}
                          onClick={() => handleMatch(product, slot)}
                          className="text-xs bg-gray-100 hover:bg-[var(--theme-accent)] hover:text-white text-gray-700 px-3 py-1.5 rounded font-medium disabled:opacity-50 transition-colors capitalize"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-8 text-center text-gray-400">
                No products found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
