import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Brand } from '../types';
import { useStore } from '../hooks/useStore';
import { Loader2 } from 'lucide-react';

export function BrandManager() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { client } = useStore();

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    setLoading(true);
    const { data, error } = await supabase
      .from('manifest_brands')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true });
    
    if (!error && data) {
      setBrands(data);
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Upsert all brands
      const { error } = await (supabase as any)
        .from('manifest_brands')
        .upsert(brands);
      if (error) throw error;
      alert("Saved brand positioning.");
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  function updateBrand(id: string, field: keyof Brand, value: any) {
    setBrands(brands.map(b => b.id === id ? { ...b, [field]: value } : b));
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Brand Positioning</h1>
          <p className="text-sm text-gray-500">Manage the order of brands and their exclusivity.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-black text-white px-4 py-2 rounded shadow hover:bg-opacity-80 flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>

      {loading ? (
        <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>
      ) : (
        <div className="bg-white border rounded shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-sm font-semibold text-gray-600">Brand Name</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Sort Order (Lowest first)</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Exclusive to Client ID</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {brands.map(brand => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{brand.name}</td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      value={brand.sort_order ?? 1000} 
                      onChange={e => updateBrand(brand.id, 'sort_order', parseInt(e.target.value) || 1000)}
                      className="w-24 p-1 border rounded"
                    />
                  </td>
                  <td className="p-3">
                    <input 
                      type="text" 
                      placeholder="Blank for Universal"
                      value={(brand as any).exclusive_to_client_id || ''} 
                      onChange={e => updateBrand(brand.id, 'exclusive_to_client_id', e.target.value || null)}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
