import React, { useState, useEffect } from 'react';
import { Product, Brand, SHARED_CATEGORIES } from '../types';
import { X, Check, ImagePlus, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { compressImage } from '../lib/imageUtils';
import { cn } from '../lib/utils';
import { useStore } from '../hooks/useStore';

interface ProductDetailProps {
  product: Product;
  brand?: Brand;
  onClose: () => void;
  canEdit: boolean;
  onUpdate: (product: Product) => void;
  isNew?: boolean;
}

const PHOTO_SLOTS = [
  { key: 'main_image', label: 'Main' },
  { key: 'front_image', label: 'Front' },
  { key: 'left_image', label: 'Left' },
  { key: 'right_image', label: 'Right' },
  { key: 'back_image', label: 'Back' }
] as const;

export function ProductDetail({ product, brand, onClose, canEdit, onUpdate, isNew }: ProductDetailProps) {
  const { client } = useStore();
  const [isEditing, setIsEditing] = useState(isNew || false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [editedProduct, setEditedProduct] = useState<Product>(product);
  const [saving, setSaving] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>((product as any).main_image || (product as any).front_image || (product as any).left_image || (product as any).right_image || (product as any).back_image || null);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);

  useEffect(() => {
    if (isEditing) {
      supabase.from('manifest_brands').select('*').then(({ data }) => {
        if (data) setAllBrands(data);
      });
    }
  }, [isEditing]);
  
  // Prepare categories
  let clientCats: string[] = [];
  try {
    if (client && typeof client.categories === 'string') {
      clientCats = JSON.parse(client.categories);
    } else if (client && Array.isArray(client.categories)) {
      clientCats = client.categories;
    }
  } catch (e) {}
  const allCats = Array.from(new Set([...SHARED_CATEGORIES, ...clientCats]));
  
  const [showOtherCategory, setShowOtherCategory] = useState(!allCats.includes(product.category));
  const [otherCategoryValue, setOtherCategoryValue] = useState(showOtherCategory ? product.category : '');

  const handleSave = async () => {
    setSaving(true);
    const finalProduct = { ...editedProduct };
    if (showOtherCategory && otherCategoryValue.trim()) {
      finalProduct.category = otherCategoryValue.trim();
    }
    
    // Safety check for contact_link
    const { error: columnCheckError } = await supabase.from('manifest_products').select('contact_link').limit(1);
    if (columnCheckError) {
      delete (finalProduct as any).contact_link;
    }
    // Remove image fields from products table payload
    delete (finalProduct as any).main_image;
    delete (finalProduct as any).front_image;
    delete (finalProduct as any).left_image;
    delete (finalProduct as any).right_image;
    delete (finalProduct as any).back_image;
    delete (finalProduct as any).video_url;
    delete (finalProduct as any).extra_details;


    if (isNew) {
      delete (finalProduct as any).id;
      if (!finalProduct.code) finalProduct.code = `NEW-${Date.now()}`;
      const { data, error } = await supabase
        .from('manifest_products')
        // @ts-ignore
        .insert(finalProduct as any)
        .select()
        .single();

      if (error) {
        alert('Error creating product: ' + error.message);
      } else if (data) {
        onUpdate(data);
        setIsEditing(false);
      }
    } else {
      const { data, error } = await supabase
        .from('manifest_products')
        // @ts-ignore
        .update(finalProduct as any)
        .eq('id', product.id)
        .select()
        .single();

      if (error) {
        alert('Error saving product: ' + error.message);
      } else if (data) {
        onUpdate(data);
        setIsEditing(false);
      }
    }
    setSaving(false);
  };

  const availablePhotos = PHOTO_SLOTS.map(slot => ({
    ...slot,
    url: (editedProduct as any)[slot.key]
  })).filter(slot => slot.url || isEditing);



  const handlePhotoUpload = async (slotKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     // Simulate upload progress / fast upload as requested
     // Real implementation would upload to Supabase storage 'manifest_product_photos'
     // Since we can't reliably predict storage RLS here, we'll do the actual upload if possible
     try {
       const fileExt = file.name.split('.').pop();
       const folder = client?.id?.includes("fallback") ? "00000000-0000-0000-0000-000000000000" : (client?.id || "public");
      const fileName = `${folder}/${product.id}_${slotKey}_${Math.random()}.${fileExt}`;
       const filePath = `${fileName}`;

       const { error: uploadError } = await supabase.storage
         .from('manifest_product_photos')
         .upload(filePath, file, { upsert: true });

       if (uploadError) throw uploadError;

       const { data: publicUrlData } = supabase.storage
         .from('manifest_product_photos')
         .getPublicUrl(filePath);

       const newUrl = publicUrlData.publicUrl;
       setEditedProduct({ ...editedProduct, [slotKey]: newUrl });
       setActivePhoto(newUrl);
     } catch (err: any) {
       alert("Upload failed: " + err.message);
     }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-full flex flex-col overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-50 text-gray-500">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row h-full overflow-y-auto">
          {/* Left Column: Photos */}
          <div className="w-full md:w-1/2 bg-gray-50 p-6 flex flex-col border-r">
             <div className="aspect-square bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 relative overflow-hidden">
                {activePhoto ? (
                  <img src={activePhoto} alt={editedProduct.name} className="w-full h-full object-contain p-4 mix-blend-multiply" />
                ) : (
                  <div className="text-gray-400">No Image Available</div>
                )}
             </div>
             
             {/* Carousel Thumbnails */}
             <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {availablePhotos.map(slot => (
                  <div key={slot.key} className="flex-shrink-0 flex flex-col items-center">
                    <label className={cn(
                      "w-16 h-16 rounded-lg border-2 flex items-center justify-center overflow-hidden cursor-pointer bg-white transition-all",
                      activePhoto === slot.url && slot.url ? "border-[var(--theme-accent)] ring-2 ring-[var(--theme-accent)] ring-opacity-50" : "border-gray-200 hover:border-gray-300",
                      isEditing && !slot.url && "border-dashed border-gray-300 text-gray-400"
                    )}>
                      {slot.url ? (
                        <img src={slot.url} onClick={() => setActivePhoto(slot.url)} className="w-full h-full object-cover mix-blend-multiply" />
                      ) : (
                        <ImagePlus className="w-6 h-6" />
                      )}
                      {isEditing && (
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(slot.key, e)} />
                      )}
                    </label>
                    <span className="text-[10px] text-gray-500 mt-1 uppercase font-medium">{slot.label}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Right Column: Details */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
            {isEditing ? (
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Edit Product</h2>
                  <button onClick={() => setIsEditing(false)} className="text-sm text-gray-500 underline">Cancel</button>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Name</label>
                  <input type="text" value={editedProduct.name} onChange={e => setEditedProduct({...editedProduct, name: e.target.value})} className="w-full border rounded p-2 text-sm" />
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Brand</label>
                    <select 
                      value={editedProduct.brand_id || ''} 
                      onChange={e => setEditedProduct({...editedProduct, brand_id: e.target.value || null})} 
                      className="w-full border rounded p-2 text-sm"
                    >
                      <option value="">No Brand</option>
                      {allBrands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Product Code</label>
                    <input type="text" value={editedProduct.code || ''} onChange={e => setEditedProduct({...editedProduct, code: e.target.value})} className="w-full border rounded p-2 text-sm" />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Price (₦)</label>
                    <input type="number" value={editedProduct.price || ''} onChange={e => setEditedProduct({...editedProduct, price: parseFloat(e.target.value)})} className="w-full border rounded p-2 text-sm" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Stock Status</label>
                    <select value={editedProduct.stock_status || ''} onChange={e => setEditedProduct({...editedProduct, stock_status: e.target.value})} className="w-full border rounded p-2 text-sm">
                      <option value="In Stock">In Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                      <option value="Limited">Limited</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Category</label>
                  <select 
                    value={showOtherCategory ? 'Other' : editedProduct.category} 
                    onChange={e => {
                      if (e.target.value === 'Other') {
                        setShowOtherCategory(true);
                      } else {
                        setShowOtherCategory(false);
                        setEditedProduct({...editedProduct, category: e.target.value});
                      }
                    }} 
                    className="w-full border rounded p-2 text-sm mb-2"
                  >
                    {allCats.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="Other">Other...</option>
                  </select>
                  {showOtherCategory && (
                    <input type="text" placeholder="Custom category name..." value={otherCategoryValue} onChange={e => setOtherCategoryValue(e.target.value)} className="w-full border rounded p-2 text-sm" />
                  )}
                </div>

                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Description Headline</label>
                   <input type="text" value={editedProduct.description_headline || ''} onChange={e => setEditedProduct({...editedProduct, description_headline: e.target.value})} className="w-full border rounded p-2 text-sm" />
                </div>

                
              </div>
            ) : (
              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    {brand && <span className="bg-gray-100 text-gray-800 px-2 py-0.5 text-xs font-bold rounded">{brand.name}</span>}
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{product.category}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{product.name}</h1>
                  {product.description_headline && (
                    <p className="text-gray-600 text-sm">{product.description_headline}</p>
                  )}
                </div>

                <div>
                  <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    ₦{product.price?.toLocaleString()}
                  </div>
                  <div className={cn(
                    "text-sm font-medium mt-1 inline-flex items-center",
                    product.stock_status === 'In Stock' ? "text-green-600" : "text-red-500"
                  )}>
                    {product.stock_status === 'In Stock' && <Check className="w-4 h-4 mr-1" />}
                    {product.stock_status || 'Unknown Stock'}
                  </div>
                </div>

                {product.assurance_yn && (
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start space-x-3">
                    <div className="text-blue-500 mt-0.5">⭐</div>
                    <div>
                      <div className="text-sm font-bold text-blue-900">Store Assurance</div>
                      <div className="text-xs text-blue-800">{product.assurance_text || 'Backed by our premium guarantee.'}</div>
                    </div>
                  </div>
                )}

                {product.description_bullets && product.description_bullets.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Key Features</h3>
                    <ul className="space-y-1.5">
                      {(Array.isArray(product.description_bullets) ? product.description_bullets : typeof product.description_bullets === 'string' ? (String(product.description_bullets).includes('\n') ? String(product.description_bullets).split('\n') : [product.description_bullets]) : []).map((b: any, i: number) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start">
                          <span className="text-[var(--theme-accent)] mr-2 mt-0.5">•</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {(product as any).extra_details && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-1">Specs & Details</h3>
                    <div className="whitespace-pre-wrap">{(product as any).extra_details}</div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 pt-4 border-t flex space-x-3">
              {isEditing ? (
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="flex-1 bg-[var(--theme-accent)] text-white py-3 rounded-xl font-bold shadow hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Details'}
                </button>
              ) : (
                <>
                  <button className="flex-1 bg-[var(--theme-accent)] text-white py-3 rounded-xl font-bold shadow hover:opacity-90 transition-opacity">
                    Add to Invoice
                  </button>
                  {canEdit && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="px-4 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  <button 
                    onClick={onClose}
                    className="px-4 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
