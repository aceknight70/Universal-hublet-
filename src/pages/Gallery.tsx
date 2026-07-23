import React, { useState, useEffect } from 'react';
import { supabase, ACTIVE_CLIENT_ID } from '../lib/supabase';
import { useStore } from '../hooks/useStore';
import { compressImage } from '../lib/imageUtils';
import {
  Plus,
  Upload,
  Image as ImageIcon,
  Loader2,
  Edit2,
  Trash2,
  X,
  Check,
  Tag,
  MessageCircle,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export interface GalleryRecord {
  id: string;
  client_id: string;
  photo_url: string;
  thumbnail_url?: string;
  caption: string; // JSON string containing { product_name, spec, price, thumbnail_url }
  created_at: string;
}

export interface ParsedGalleryItem {
  id: string;
  photo_url: string;
  thumbnail_url: string;
  product_name: string;
  spec: string;
  price: number | null;
  created_at: string;
  raw_record: GalleryRecord;
}

export function Gallery() {
  const { client } = useStore();
  const [items, setItems] = useState<ParsedGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ParsedGalleryItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Add/Edit Form State
  const [formName, setFormName] = useState('');
  const [formSpec, setFormSpec] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const folder = ACTIVE_CLIENT_ID;

  // Helper to parse caption field safely
  const parseRecord = (rec: GalleryRecord): ParsedGalleryItem => {
    let parsed: any = {};
    try {
      if (rec.caption && rec.caption.trim().startsWith('{')) {
        parsed = JSON.parse(rec.caption);
      } else if (rec.caption) {
        parsed = { spec: rec.caption };
      }
    } catch (e) {
      parsed = { spec: rec.caption || '' };
    }

    return {
      id: rec.id,
      photo_url: rec.photo_url,
      thumbnail_url: rec.thumbnail_url || parsed.thumbnail_url || rec.photo_url,
      product_name: parsed.product_name || 'O Frank Featured Item',
      spec: parsed.spec || '',
      price: typeof parsed.price === 'number' ? parsed.price : (parsed.price ? parseFloat(parsed.price) : null),
      created_at: rec.created_at,
      raw_record: rec
    };
  };

  async function fetchGallery() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await (supabase as any)
        .from('manifest_gallery')
        .select('*')
        .eq('client_id', folder)
        .order('created_at', { ascending: false });

      if (dbErr) throw dbErr;

      const parsedItems = (data || []).map(parseRecord);
      setItems(parsedItems);
    } catch (err: any) {
      console.error('Failed to load gallery rows:', err);
      setError('Failed to load gallery items: ' + (err.message || 'Database error'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGallery();
  }, [folder]);

  // Handle file input selection for Add/Edit
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormName('');
    setFormSpec('');
    setFormPrice('');
    setFormFile(null);
    setPreviewUrl(null);
    setIsAddOpen(true);
  };

  // Upload helper to upload both 600px grid thumbnail & 1200px full detail photo
  async function uploadDualImages(file: File): Promise<{ fullUrl: string; thumbUrl: string }> {
    // Generate thumbnail (600px max edge)
    const thumbFile = await compressImage(file, 600, 0.80);
    // Generate full size (1200px max edge), high quality to preserve sharpness
    const fullFile = await compressImage(file, 1200, 0.90);

    const timestamp = Date.now();
    const rand = Math.random().toString(36).substring(7);
    const ext = 'jpg';

    const thumbPath = `${folder}/thumb_${timestamp}_${rand}.${ext}`;
    const fullPath = `${folder}/full_${timestamp}_${rand}.${ext}`;

    // Try uploading to 'manifest-gallery-photos' storage bucket first
    let bucketName = 'manifest-gallery-photos';

    let { error: thumbErr } = await supabase.storage
      .from(bucketName)
      .upload(thumbPath, thumbFile, { upsert: true });

    if (thumbErr) {
      // Fallback to 'manifest_gallery' storage if manifest-gallery-photos bucket fails
      console.warn('Falling back storage bucket to manifest_gallery:', thumbErr);
      bucketName = 'manifest_gallery';
      const fallbackThumb = await supabase.storage
        .from(bucketName)
        .upload(thumbPath, thumbFile, { upsert: true });
      if (fallbackThumb.error) throw fallbackThumb.error;
    }

    const { error: fullErr } = await supabase.storage
      .from(bucketName)
      .upload(fullPath, fullFile, { upsert: true });

    if (fullErr) throw fullErr;

    const thumbUrl = supabase.storage.from(bucketName).getPublicUrl(thumbPath).data.publicUrl;
    const fullUrl = supabase.storage.from(bucketName).getPublicUrl(fullPath).data.publicUrl;

    return { fullUrl, thumbUrl };
  }

  // Handle Save New Photo
  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFile) {
      setError('Please select an image file to upload.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Upload dual sizes
      const { fullUrl, thumbUrl } = await uploadDualImages(formFile);

      // Create JSON payload (we'll keep thumbnail_url in here as well for fallback)
      const captionPayload = JSON.stringify({
        product_name: formName.trim() || 'O Frank Featured Item',
        spec: formSpec.trim(),
        price: formPrice ? parseFloat(formPrice) : null,
        thumbnail_url: thumbUrl
      });

      // Check if the thumbnail_url column exists in the database
      const { error: colCheckErr } = await (supabase as any).from('manifest_gallery').select('thumbnail_url').limit(1);
      const hasThumbnailColumn = !colCheckErr || colCheckErr.code !== '42703';

      const payload: any = {
        client_id: folder,
        photo_url: fullUrl,
        caption: captionPayload
      };

      if (hasThumbnailColumn) {
        payload.thumbnail_url = thumbUrl;
      }

      // Insert record into Supabase manifest_gallery
      const { error: insertErr } = await (supabase as any).from('manifest_gallery').insert(payload);

      if (insertErr) throw insertErr;

      setSuccess('Gallery photo uploaded and saved successfully.');
      setTimeout(() => setSuccess(null), 3000);

      setIsAddOpen(false);
      await fetchGallery();
    } catch (err: any) {
      console.error('Error saving new gallery photo:', err);
      setError('Failed to save gallery photo: ' + (err.message || 'Upload error'));
    } finally {
      setSaving(false);
    }
  };

  // Start Editing Selected Item
  const startEditing = () => {
    if (!selectedItem) return;
    setFormName(selectedItem.product_name);
    setFormSpec(selectedItem.spec);
    setFormPrice(selectedItem.price !== null ? String(selectedItem.price) : '');
    setFormFile(null);
    setPreviewUrl(selectedItem.photo_url);
    setIsEditing(true);
  };

  // Handle Save Edits
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSaving(true);
    setError(null);

    try {
      let fullUrl = selectedItem.photo_url;
      let thumbUrl = selectedItem.thumbnail_url;

      // If user provided a new file to replace the existing photo
      if (formFile) {
        const uploaded = await uploadDualImages(formFile);
        fullUrl = uploaded.fullUrl;
        thumbUrl = uploaded.thumbUrl;
      }

      const captionPayload = JSON.stringify({
        product_name: formName.trim() || 'O Frank Featured Item',
        spec: formSpec.trim(),
        price: formPrice ? parseFloat(formPrice) : null,
        thumbnail_url: thumbUrl
      });

      // Check if the thumbnail_url column exists in the database
      const { error: colCheckErr } = await (supabase as any).from('manifest_gallery').select('thumbnail_url').limit(1);
      const hasThumbnailColumn = !colCheckErr || colCheckErr.code !== '42703';

      const payload: any = {
        photo_url: fullUrl,
        caption: captionPayload
      };

      if (hasThumbnailColumn) {
        payload.thumbnail_url = thumbUrl;
      }

      // Commit changes back to manifest_gallery in Supabase
      const { error: updateErr } = await (supabase as any)
        .from('manifest_gallery')
        .update(payload)
        .eq('id', selectedItem.id);

      if (updateErr) throw updateErr;

      setSuccess('Gallery photo updated successfully.');
      setTimeout(() => setSuccess(null), 3000);

      setIsEditing(false);
      
      // Update selected item in local state
      const updatedItem: ParsedGalleryItem = {
        ...selectedItem,
        photo_url: fullUrl,
        thumbnail_url: thumbUrl,
        product_name: formName.trim() || 'O Frank Featured Item',
        spec: formSpec.trim(),
        price: formPrice ? parseFloat(formPrice) : null
      };
      setSelectedItem(updatedItem);

      await fetchGallery();
    } catch (err: any) {
      console.error('Error updating gallery photo:', err);
      setError('Failed to save edits: ' + (err.message || 'Database error'));
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Photo
  const handleDelete = async () => {
    if (!selectedItem) return;

    if (!window.confirm('Are you sure you want to delete this photo from the gallery?')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const { error: delErr } = await (supabase as any)
        .from('manifest_gallery')
        .delete()
        .eq('id', selectedItem.id);

      if (delErr) throw delErr;

      setSuccess('Photo deleted from O Frank Gallery.');
      setTimeout(() => setSuccess(null), 3000);

      setSelectedItem(null);
      setIsEditing(false);
      await fetchGallery();
    } catch (err: any) {
      console.error('Error deleting gallery photo:', err);
      setError('Failed to delete photo: ' + (err.message || 'Database error'));
    } finally {
      setDeleting(false);
    }
  };

  // Format currency
  const formatPrice = (val: number | null) => {
    if (val === null || isNaN(val)) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              O Frank Official Gallery
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              Verified Collection
            </span>
          </div>
          <p className="text-sm text-gray-500 max-w-xl">
            Browse high-resolution product showcases for {client?.name || 'O Frank Electronics'}. Tap any photo to inspect full details, specs, and pricing.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-accent)] hover:opacity-90 text-white rounded-xl shadow-md transition-all text-sm font-semibold cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Photo</span>
        </button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 text-sm rounded-xl border border-emerald-200 flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Gallery Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-9 h-9 animate-spin text-[var(--theme-accent)]" />
          <span className="text-sm font-medium">Loading O Frank Gallery...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 flex flex-col items-center justify-center p-8">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-[var(--theme-accent)] mb-4 shadow-inner">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg">No Gallery Photos Yet</h3>
          <p className="text-sm text-gray-500 max-w-md mt-1 mb-6">
            Upload your first photo to populate the official O Frank gallery. Clean photo grid loaded directly from your dedicated storage repository.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-accent)] text-white rounded-xl shadow-sm hover:opacity-90 text-sm font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload First Photo</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-8 sm:gap-12 max-w-[1000px] mx-auto w-full">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedItem(item);
                setIsEditing(false);
              }}
              className="group relative w-full bg-gray-100 rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/50 cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={item.photo_url}
                alt=""
                loading="lazy"
                className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      )}

      {/* FULL PHOTO CARD MODAL (Tap view) */}
      {selectedItem && !isEditing && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--theme-accent)]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  O Frank Product Showcase
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={startEditing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  title="Edit details or replace photo"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  title="Delete photo"
                >
                  {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200/50 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto p-6 space-y-6">
              {/* Full-size 1000–1200px photo */}
              <div className="relative aspect-4/3 bg-gray-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                <img
                  src={selectedItem.photo_url}
                  alt={selectedItem.product_name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Product Details Header & Price */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {selectedItem.product_name}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Added to O Frank Gallery on {new Date(selectedItem.created_at).toLocaleDateString()}
                  </p>
                </div>

                {selectedItem.price !== null && (
                  <div className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-lg border border-emerald-200/80 self-start sm:self-auto">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>{formatPrice(selectedItem.price)}</span>
                  </div>
                )}
              </div>

              {/* Specification & Description */}
              {selectedItem.spec && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Product Specs & Description
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {selectedItem.spec}
                  </p>
                </div>
              )}

              {/* Customer CTA Button */}
              <div className="pt-2">
                <a
                  href={`tel:08000000000`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[var(--theme-accent)] text-white rounded-xl font-semibold text-sm shadow-md hover:opacity-90 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire with O Frank Store</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {selectedItem && isEditing && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsEditing(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Gallery Photo</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Image Preview & Replacement */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Photo Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    <img
                      src={previewUrl || selectedItem.photo_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Replace Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Leaves existing photo if unchanged.
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. O Frank QLED 4K TV 65&quot;"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent outline-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="e.g. 1299.99"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent outline-none"
                />
              </div>

              {/* Specs / Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Spec / Description
                </label>
                <textarea
                  rows={4}
                  value={formSpec}
                  onChange={(e) => setFormSpec(e.target.value)}
                  placeholder="e.g. 120Hz Refresh Rate, HDR10+, Smart Hub integration..."
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-accent)] text-white rounded-xl text-sm font-semibold hover:opacity-90 shadow-sm transition-all cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW PHOTO MODAL */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[var(--theme-accent)]" />
                <h3 className="text-lg font-bold text-gray-900">Add Photo to Gallery</h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="space-y-4">
              {/* Photo Upload Box */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Upload Photo <span className="text-red-500">*</span>
                </label>
                {previewUrl ? (
                  <div className="relative aspect-16/9 bg-gray-900 rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setFormFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 hover:border-[var(--theme-accent)] bg-gray-50/50 hover:bg-blue-50/20 rounded-xl cursor-pointer transition-all">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm font-semibold text-gray-700">Click or drop photo here</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
                <p className="text-[11px] text-gray-400 mt-1">
                  Automatically generates 600px grid thumbnail &amp; 1200px full detail image on upload.
                </p>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. O Frank Premium Soundbar 5.1"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent outline-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="e.g. 499.99"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent outline-none"
                />
              </div>

              {/* Spec / Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Spec / Description
                </label>
                <textarea
                  rows={3}
                  value={formSpec}
                  onChange={(e) => setFormSpec(e.target.value)}
                  placeholder="e.g. Wireless Subwoofer, Dolby Digital Surround, Bluetooth 5.0..."
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formFile}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-accent)] disabled:opacity-50 text-white rounded-xl text-sm font-semibold hover:opacity-90 shadow-sm transition-all cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading &amp; Saving...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Save Photo</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
