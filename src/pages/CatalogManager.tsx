import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CatalogItem } from '../types';

export function CatalogManager() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<CatalogItem>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadCatalog();
  }, []);

  async function loadCatalog() {
    setLoading(true);
    const { data, error } = await supabase.from('manifest_catalog').select('*').order('created_at', { ascending: false });
    if (error) {
       console.warn("Catalog Load Error (Expected if table not set up)", error?.message);
       if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          alert('Database update required: Please run the provided SQL script in your Supabase SQL Editor to create the manifest_catalog table.');
       }
    }
    if (!error && data) setCatalog(data);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (form.id) {
      await (supabase.from('manifest_catalog') as any).update(form as any).eq('id', form.id);
    } else {
      await (supabase.from('manifest_catalog') as any).insert([form as any]);
    }
    setForm({});
    setIsEditing(false);
    loadCatalog();
  }

  async function handleDelete(id: string) {
    await supabase.from('manifest_catalog').delete().eq('id', id);
    loadCatalog();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Global Catalog Manager</h1>
        <button 
          onClick={() => { setForm({}); setIsEditing(true); }}
          className="bg-black text-white px-4 py-2 rounded font-bold text-sm hover:bg-opacity-80"
        >
          + Add New Item
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow-sm border mb-8 grid grid-cols-2 gap-4">
          <div className="col-span-2 text-lg font-bold">{form.id ? 'Edit' : 'Add'} Catalog Item</div>
          <div>
            <label className="block text-sm font-bold mb-1">Name</label>
            <input required type="text" className="w-full p-2 border rounded" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Brand</label>
            <input type="text" className="w-full p-2 border rounded" value={form.brand || ''} onChange={e => setForm({...form, brand: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Category</label>
            <input type="text" className="w-full p-2 border rounded" value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Reference Photo URL</label>
            <input type="text" className="w-full p-2 border rounded" value={form.reference_photo_url || ''} onChange={e => setForm({...form, reference_photo_url: e.target.value})} />
          </div>
          <div className="col-span-2">
            <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded font-bold hover:bg-sky-700 mr-2">Save</button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 px-4 py-2 rounded font-bold hover:bg-gray-300">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
           <p>Loading...</p>
        ) : catalog.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-lg border shadow-sm">
            {item.reference_photo_url ? (
               <img src={item.reference_photo_url} alt={item.name} className="w-full h-32 object-contain bg-gray-50 mb-3 rounded" />
            ) : (
               <div className="w-full h-32 bg-gray-100 mb-3 rounded flex items-center justify-center text-sm text-gray-400">No Image</div>
            )}
            <div className="font-bold text-sm truncate" title={item.name}>{item.name}</div>
            <div className="text-xs text-gray-500 mb-2">{item.brand} • {item.category}</div>
            {item.exclusive_to_client_id && <div className="text-[10px] font-bold text-white bg-purple-600 px-1.5 py-0.5 rounded inline-block">Exclusive: {item.exclusive_to_client_id}</div>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setForm(item); setIsEditing(true); }} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">Edit</button>
              <button onClick={() => handleDelete(item.id)} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
