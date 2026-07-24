import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../hooks/useStore';
import { CatalogItem, InventoryItem } from '../types';

export function InventoryManager() {
  const { client } = useStore();
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<{ catalog_id: string, price: string, tag: string } | null>(null);

  useEffect(() => {
    if (client) loadData();
  }, [client]);
async function loadData() {
    if (!client?.id) return;
    setLoading(true);
    
    const { data: exclusions } = await supabase.from('manifest_brand_exclusions').select('brand_name').eq('client_id', client.id);
    const excludedBrandNames = new Set((exclusions || []).map((e: any) => e.brand_name));

    const [{ data: catData, error: catErr }, { data: invData, error: invErr }] = await Promise.all([
      supabase.from('manifest_catalog').select('*').or(`exclusive_to_client_id.is.null,exclusive_to_client_id.eq.${client?.id}`).order('name'),
      supabase.from('manifest_inventory').select('*').eq('client_id', client?.id)
    ]);    
    if (catErr || invErr) {
       console.warn("Inventory Load Error (Expected if tables not set up)", catErr?.message, invErr?.message);
       const msg = catErr?.message || invErr?.message || '';
       if (msg.includes('relation') && msg.includes('does not exist')) {
          alert('Database update required: Please run the provided SQL script in your Supabase SQL Editor to create the manifest_catalog and manifest_inventory tables.');
       }
    }
    
    if (catData) setCatalog(catData.filter((item: any) => !excludedBrandNames.has(item.brand)));
    if (invData) setInventory(invData);
    setLoading(false);
  }

  const getInv = (catalogId: string) => inventory.find(i => i.catalog_id === catalogId);

  async function handleSave(catalogId: string) {
    if (!client || !editingItem) return;
    
    const existing = getInv(catalogId);
    if (existing) {
      await (supabase.from('manifest_inventory') as any).update({
        price: Number(editingItem.price) || null,
        tag: editingItem.tag || null
      }).eq('id', existing.id);
    } else {
      await (supabase.from('manifest_inventory') as any).insert([{
        client_id: client.id,
        catalog_id: catalogId,
        price: Number(editingItem.price) || null,
        tag: editingItem.tag || null
      }]);
    }
    
    setEditingItem(null);
    loadData();
  }

  async function handleRemove(id: string) {
    await supabase.from('manifest_inventory').delete().eq('id', id);
    loadData();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6">Inventory Manager: Add to My Store</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? <p>Loading catalog...</p> : catalog.map(item => {
          const inv = getInv(item.id);
          const isEditing = editingItem?.catalog_id === item.id;
          
          return (
            <div key={item.id} className={`bg-white p-4 rounded-lg border shadow-sm flex flex-col ${inv ? 'border-[var(--theme-accent)] ring-1 ring-[var(--theme-accent)]' : ''}`}>
              {item.reference_photo_url ? (
                <img src={item.reference_photo_url} alt={item.name} className="w-full h-32 object-contain bg-gray-50 mb-3 rounded" />
              ) : (
                <div className="w-full h-32 bg-gray-100 mb-3 rounded flex items-center justify-center text-sm text-gray-400">No Image</div>
              )}
              <div className="font-bold text-sm truncate" title={item.name}>{item.name}</div>
              <div className="text-xs text-gray-500 mb-2">{item.brand} • {item.category}</div>
              
              <div className="mt-auto pt-4 border-t border-gray-100">
                {isEditing ? (
                  <div className="space-y-2">
                    <input 
                      type="number" 
                      placeholder="Price (₦)" 
                      className="w-full p-2 border rounded text-sm"
                      value={editingItem.price}
                      onChange={e => setEditingItem({...editingItem, price: e.target.value})}
                    />
                    <select 
                      className="w-full p-2 border rounded text-sm"
                      value={editingItem.tag}
                      onChange={e => setEditingItem({...editingItem, tag: e.target.value})}
                    >
                      <option value="">No special tag (Showroom only)</option>
                      <option value="hot_deal">Hot Deal</option>
                      <option value="display_floor">Display Floor</option>
                      <option value="arcade">Arcade</option>
                      <option value="live_sheet">Live Sheet</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => handleSave(item.id)} className="flex-1 bg-black text-white py-1.5 rounded text-xs font-bold">Save</button>
                      <button onClick={() => setEditingItem(null)} className="flex-1 bg-gray-200 py-1.5 rounded text-xs font-bold">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {inv ? (
                      <div>
                        <div className="font-bold text-lg mb-1">₦{inv.price?.toLocaleString() || '0'}</div>
                        <div className="text-xs text-gray-500 mb-3 uppercase font-bold tracking-wider">{inv.tag ? inv.tag.replace('_', ' ') : 'Standard'}</div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingItem({ catalog_id: item.id, price: String(inv.price || ''), tag: inv.tag || '' })} className="flex-1 bg-gray-100 py-1.5 rounded text-xs font-bold">Edit Price/Tag</button>
                          <button onClick={() => handleRemove(inv.id)} className="flex-1 bg-red-50 text-red-600 py-1.5 rounded text-xs font-bold">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setEditingItem({ catalog_id: item.id, price: '', tag: '' })} className="w-full bg-[var(--theme-accent)] text-white py-2 rounded text-sm font-bold opacity-90 hover:opacity-100">
                        + Add to My Store
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
