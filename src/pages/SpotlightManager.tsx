import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../hooks/useAuth';

export function SpotlightManager() {
  const { client } = useStore();
  const { profile } = useAuth();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    brand_name: '',
    tagline: '',
    description: '',
    cta_link: '',
    banner_image_url: ''
  });

  useEffect(() => {
    loadAds();
  }, [client]);

  async function loadAds() {
    if (!client) return;
    setLoading(true);
    const { data } = await supabase.from('manifest_brand_ads').select('*').eq('client_id', client.id);
    if (data) setAds(data);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!client) return;
    setSaving(true);
    
    const { data, error } = await supabase.from('manifest_brand_ads').insert({
      client_id: client.id,
      brand_name: form.brand_name,
      tagline: form.tagline,
      description: form.description,
      cta_link: form.cta_link,
      banner_image_url: form.banner_image_url
    }).select();
    
    if (error) {
      alert("Error saving: " + error.message);
    } else {
      setForm({
        brand_name: '',
        tagline: '',
        description: '',
        cta_link: '',
        banner_image_url: ''
      });
      loadAds();
      alert("Saved successfully!");
    }
    setSaving(false);
  }
  
  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    await supabase.from('manifest_brand_ads').delete().eq('id', id);
    loadAds();
  }

  if (profile?.role !== 'master' && profile?.role !== 'manager') {
    return <div className="p-8 text-center text-red-600">Access Denied. Master/Manager only.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded shadow-sm border mb-6">
        <h2 className="text-xl font-bold mb-2">Brand Spotlight Management</h2>
        <p className="text-sm text-gray-600 mb-6">Configure which business or brand ad appears in the top-right of this store's Showroom header. The CTA link should be the URL of their storefront (e.g. /o-frank).</p>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Business/Brand Name</label>
              <input 
                required 
                type="text" 
                value={form.brand_name} 
                onChange={e => setForm({...form, brand_name: e.target.value})}
                className="w-full border rounded p-2"
                placeholder="e.g. O Frank"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tagline</label>
              <input 
                type="text" 
                value={form.tagline} 
                onChange={e => setForm({...form, tagline: e.target.value})}
                className="w-full border rounded p-2"
                placeholder="e.g. Premium Furniture"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Target URL (CTA Link)</label>
              <input 
                required 
                type="text" 
                value={form.cta_link} 
                onChange={e => setForm({...form, cta_link: e.target.value})}
                className="w-full border rounded p-2"
                placeholder="e.g. /o-frank"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Banner Image URL</label>
              <input 
                type="text" 
                value={form.banner_image_url} 
                onChange={e => setForm({...form, banner_image_url: e.target.value})}
                className="w-full border rounded p-2"
                placeholder="https://..."
              />
            </div>
          </div>
          <button disabled={saving} type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
            {saving ? 'Saving...' : 'Add / Update Spotlight'}
          </button>
        </form>
      </div>

      <h3 className="font-bold mb-4">Active Spotlight for {client?.name}</h3>
      {loading ? <p>Loading...</p> : ads.length === 0 ? <p className="text-gray-500">No active spotlight.</p> : (
        <div className="space-y-4">
          {ads.map(ad => (
            <div key={ad.id} className="bg-white border rounded p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {ad.banner_image_url ? (
                  <img src={ad.banner_image_url} alt="Banner" className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">No Img</div>
                )}
                <div>
                  <h4 className="font-bold text-lg">{ad.brand_name}</h4>
                  <p className="text-sm text-gray-600">{ad.tagline}</p>
                  <a href={ad.cta_link} className="text-xs text-blue-600 hover:underline">{ad.cta_link}</a>
                </div>
              </div>
              <button onClick={() => handleDelete(ad.id)} className="text-red-600 text-sm hover:underline">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
