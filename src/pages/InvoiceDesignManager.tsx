import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { InvoiceDesign, Client } from '../types';
import { uploadImageFileWithFallback } from './MasterRoom';
import { Upload, Loader2 } from 'lucide-react';

export function InvoiceDesignManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [designs, setDesigns] = useState<Record<string, InvoiceDesign>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [{ data: cData }, { data: dData, error }] = await Promise.all([
      supabase.from('manifest_clients').select('*'),
      supabase.from('manifest_invoice_design').select('*')
    ]);
    if (error) {
       console.warn("Invoice Design Load Error (Expected if table not set up)", error?.message);
       if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          alert('Database update required: Please run the provided SQL script to create the manifest_invoice_design table.');
       }
    }
    
    if (cData) setClients(cData);
    if (dData) {
      const dMap: Record<string, InvoiceDesign> = {};
      (dData as any[]).forEach(d => dMap[d.client_id] = d);
      setDesigns(dMap);
    }
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6">Master Invoice Design Control</h1>
      <p className="text-gray-600 mb-8">Manage visual identity and banking details for each business's invoices and receipts.</p>

      <div className="space-y-8">
        {loading ? <p>Loading...</p> : clients.map(client => (
          <DesignEditor key={client.id} client={client} initialDesign={designs[client.id]} onSaved={loadData} />
        ))}
      </div>
    </div>
  );
}

function DesignEditor({ client, initialDesign, onSaved }: { client: Client, initialDesign?: InvoiceDesign, onSaved: () => void, key?: React.Key }) {
  const [form, setForm] = useState<Partial<InvoiceDesign>>(initialDesign || { client_id: client.id });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0]) return;
    setUploadingLogo(true);
    try {
      const file = e.target.files[0];
      const filename = `invoice_logos/${client.id}-${Date.now()}`;
      const url = await uploadImageFileWithFallback(file, filename);
      setForm(prev => ({ ...prev, logo_url: url }));
    } catch (err: any) {
      alert("Failed to upload logo: " + err.message);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (initialDesign?.id) {
      await (supabase.from('manifest_invoice_design') as any).update(form as any).eq('id', initialDesign.id);
    } else {
      await (supabase.from('manifest_invoice_design') as any).insert([{ ...form, client_id: client.id }]);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSaved();
  }

  return (
    <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row gap-8">
      <div className="md:w-1/3">
        <h2 className="text-xl font-bold mb-2">{client.name}</h2>
        <p className="text-sm text-gray-500 mb-4">Slug: {client.slug}</p>
        <div className="aspect-video bg-gray-50 rounded border p-4 flex flex-col items-center justify-center relative overflow-hidden" style={{ borderColor: form.primary_color || client.theme?.accent_color }}>
          {form.logo_url ? (
             <img src={form.logo_url} alt="Logo" className="max-h-16 mb-4 object-contain" />
          ) : (
             <div className="h-16 w-16 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-xs text-gray-500">Logo</div>
          )}
          <div className="w-full h-2 rounded-full mb-2" style={{ backgroundColor: form.primary_color || client.theme?.accent_color || '#000' }}></div>
          <div className="w-3/4 h-2 bg-gray-200 rounded-full"></div>
        </div>
      </div>
      
      <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1">Logo URL or Upload</label>
          <div className="flex gap-2">
            <input type="text" className="w-full p-2 border rounded text-sm flex-1" value={form.logo_url || ''} onChange={e => setForm({...form, logo_url: e.target.value})} placeholder="https://..." />
            <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border rounded cursor-pointer flex items-center justify-center text-sm gap-1 shrink-0">
              {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span className="hidden sm:inline">Upload</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Primary Color (Hex)</label>
          <input type="text" className="w-full p-2 border rounded text-sm" value={form.primary_color || ''} onChange={e => setForm({...form, primary_color: e.target.value})} placeholder="#000000" />
        </div>
        <div className="col-span-1 sm:col-span-2 mt-4 pt-4 border-t">
          <h3 className="font-bold text-gray-700 mb-4">Banking Details (Locked to Master)</h3>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Bank Name</label>
          <input type="text" className="w-full p-2 border rounded text-sm" value={form.bank_name || ''} onChange={e => setForm({...form, bank_name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Account Name</label>
          <input type="text" className="w-full p-2 border rounded text-sm" value={form.account_name || ''} onChange={e => setForm({...form, account_name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Account Number</label>
          <input type="text" className="w-full p-2 border rounded text-sm" value={form.account_number || ''} onChange={e => setForm({...form, account_number: e.target.value})} />
        </div>
        <div className="col-span-1 sm:col-span-2 flex justify-end mt-2">
          <button type="submit" disabled={saving} className="bg-black text-white px-6 py-2 rounded font-bold hover:bg-gray-800 transition-colors">
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </form>
  );
}
