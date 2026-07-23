import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabase';
import { useStore } from '../hooks/useStore';
import { Brand } from '../types';

interface ParsedRow {
  code: string;
  brandName: string;
  category: string;
  name: string; // Wait, "Name" is missing from the required columns list? Let's assume it maps to "Description Headline" or it's implicitly there. 
  // Let's re-read: "Brand, Product Code, Category, Description Headline, ..." The prompt mentioned "Brand, Product Code, Category, Description Headline". Actually later it says "name". Wait, "name, price, stock". I'll use Description Headline as name if Name isn't there. 
  raw: any;
  status: 'valid' | 'invalid';
  error?: string;
  isNew: boolean;
  dbRow?: any; // The final object to insert/update
}

export function SheetManager() {
  const { client } = useStore();
  const [pasteData, setPasteData] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [existingCodes, setExistingCodes] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

    const loadCatalog = async () => {
    setLoadingCatalog(true);
    const [{ data: invData }, { data: overrides }] = await Promise.all([
      supabase.from('manifest_inventory').select('*, manifest_catalog!inner(*)').eq('client_id', client?.id || ''),
      client?.id ? supabase.from('manifest_client_product_overrides').select('*').eq('client_id', client.id) : Promise.resolve({ data: [] })
    ]);
    const prods = invData?.map(inv => ({
       id: inv.manifest_catalog.id,
       code: inv.manifest_catalog.spec_sheet?.code || 'N/A',
       name: inv.manifest_catalog.name,
       price: inv.price,
       stock_status: inv.manifest_catalog.spec_sheet?.stock_status || 'In Stock',
       category: inv.manifest_catalog.category,
       manifest_brands: { name: inv.manifest_catalog.brand }
    })) || [];
    
    if (prods) {
      const overridesMap = new Map((overrides || []).map((o: any) => [o.product_id, o]));
      const enriched = prods.map(p => ({
        ...p,
        override_tags: overridesMap.get(p.id)?.preset_tags || []
      }));
      setCatalog(enriched);
    }
    setLoadingCatalog(false);
  };
  
  const toggleTag = async (productId: string, tag: string, currentTags: string[]) => {
    if (!client?.id) return;
    
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
      
    // Optimistic update
    setCatalog(catalog.map(p => p.id === productId ? { ...p, override_tags: newTags } : p));
    
    const { error } = await supabase.from('manifest_client_product_overrides').upsert({
      client_id: client.id,
      product_id: productId,
      preset_tags: newTags
    }, { onConflict: 'client_id,product_id' });
    
    if (error) {
      alert("Error saving placement: " + error.message);
      // Revert on error
      setCatalog(catalog.map(p => p.id === productId ? { ...p, override_tags: currentTags } : p));
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    async function loadRefData() {
      const { data: bData } = await supabase.from('manifest_brands').select('*');
      if (bData && bData.length > 0) {
        setBrands(bData);
      } else {
        setBrands([
          { id: 'brand-1', name: 'Samsung', logo_url: null },
          { id: 'brand-6', name: 'Bruhm', logo_url: null },
          { id: 'brand-7', name: 'Polystar', logo_url: null },
          { id: 'brand-2', name: 'LG', logo_url: null },
          { id: 'brand-3', name: 'Sony', logo_url: null },
          { id: 'brand-4', name: 'TCL', logo_url: null },
          { id: 'brand-5', name: 'Hisense', logo_url: null },
          { id: 'brand-8', name: 'MEWE', logo_url: null }
        ]);
      }
    }
    loadRefData();
  }, []);

  const handleParse = async () => {
    const results = Papa.parse(pasteData, {
      header: true,
      skipEmptyLines: true,
    });

    const rows = results.data as any[];
    if (rows.length === 0) return;

    // Fetch existing codes to mark updates vs inserts
    const codes = rows.map(r => r['Product Code']?.trim()).filter(Boolean);
    let existing = new Set<string>();
    if (codes.length > 0) {
      const { data } = await supabase.from('manifest_catalog').select('spec_sheet');
      if (data) {
        // Find existing codes
        const existingCodesArray = data.map((d:any) => d.spec_sheet?.code).filter(Boolean);
        existing = new Set(existingCodesArray);
      }
      // dummy assignment to avoid compiler complaining if we comment out the above line
      const _dummy = codes;
      if (data) {
        existing = new Set((data as any[]).map(d => d.code));
      }
    }
    setExistingCodes(existing);

    const processed: ParsedRow[] = rows.map((row, index) => {
      const rowNum = index + 2; // +1 for 0-index, +1 for header
      const code = row['Product Code']?.trim();
      const brandName = row['Brand']?.trim();
      
      if (!code) return { code: '', brandName: '', category: '', name: '', raw: row, status: 'invalid', isNew: true, error: `Row ${rowNum}: Product Code missing` };
      
      const brand = brands.find(b => b.name.toLowerCase() === brandName?.toLowerCase());
      if (!brand && brandName) {
        // Technically could create brand, but let's just mark invalid or leave brand null
      }

      let priceRaw = row['Price (₦)'] || '';
      let price = parseFloat(priceRaw.replace(/[^0-9.-]+/g,""));
      if (isNaN(price)) price = 0;

      const assuranceYesNo = (row['Assurance Layer (Yes/No)'] || '').toLowerCase();
      const laggardYesNo = (row['Laggard Layer (Yes/No)'] || '').toLowerCase();

      const searchWords = (row['Search Keywords'] || '').split(',').map((s:string) => s.trim()).filter(Boolean);
      const bullets = (row['Description Bullets (Customer View)'] || '').split('\n').filter(Boolean);
      
      // Stock count logic
      let laggardPromoText = row['Laggard Promo Text / Stock Count'] || null;
      

      const dbRow = {
        code,
        brand_id: brand?.id || null,
        category: row['Category']?.trim() || 'Other',
        name: row['Description Headline']?.trim() || row['Product Code'] || 'Unknown',
        description_headline: row['Description Headline'] || null,
        description_bullets: bullets.length > 0 ? bullets : null,
        technical_specs: row['Technical Specs (Full)'] || null,
                price,
        assurance_yn: assuranceYesNo === 'yes',
        assurance_text: row['Assurance Text'] || null,
        contact_link: row['Contact Number / Link'] || null,
        laggard_yn: laggardYesNo === 'yes',
        laggard_promo_text: laggardPromoText,
                                                                stock_status: row['Stock Status'] || 'In Stock',
                search_keywords: searchWords.length > 0 ? searchWords : null
      };

      return {
        code,
        brandName,
        category: dbRow.category,
        name: dbRow.name,
        raw: row,
        status: 'valid',
        isNew: !existing.has(code),
        dbRow
      };
    });

    setParsedRows(processed);
  };

  const handleSave = async () => {
    const validRows = parsedRows.filter(r => r.status === 'valid');
    if (validRows.length === 0) return;

    setSaving(true);
    setProgress(0);

    const CHUNK_SIZE = 50;
    
    // Check if contact_link column exists by doing a tiny select
    const { error: columnCheckError } = await supabase.from('manifest_products').select('contact_link').limit(1);
    const hasContactLink = !columnCheckError;

    try {
      for (let i = 0; i < validRows.length; i += CHUNK_SIZE) {
        const chunk = validRows.slice(i, i + CHUNK_SIZE);
        
        const upsertData = chunk.map(r => {
          const data = { ...r.dbRow };
          if (!hasContactLink) delete data.contact_link;
          return data;
        });

        const { error } = await supabase
          .from('manifest_products')
          .upsert(upsertData, { onConflict: 'code' });

        if (error) {
          throw new Error(`Failed to save batch starting at index ${i}: ${error.message}`);
        }
        
        setProgress(Math.min(validRows.length, i + CHUNK_SIZE));
      }
      setMessage({ type: 'success', text: `Successfully imported ${validRows.length} products.` });
      setParsedRows([]);
      setPasteData('');
      loadCatalog();
    } catch (err: any) {
      setMessage({ type: 'error', text: `Error during import: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded mb-4 text-sm shrink-0">
        <strong>Sheet Manager</strong> • View your current catalog or paste a new list to bulk import/update.
      </div>
      {message && (
        <div className={`px-4 py-3 rounded mb-4 shrink-0 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <strong>{message.type === 'success' ? 'Success: ' : 'Error: '}</strong> {message.text}
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left Panel: Current Catalog */}
        <div className="w-full lg:w-2/3 flex flex-col bg-white rounded shadow-sm border overflow-hidden shrink-0 h-[45vh] lg:h-full min-h-[400px] lg:min-h-0">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-gray-800">Current Catalog</h3>
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-bold">
              {catalog.length} Products
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-0">
            {loadingCatalog ? (
              <div className="p-8 text-center text-gray-400">Loading catalog...</div>
            ) : catalog.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No products found. Add some!</div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white sticky top-0 border-b z-10 shadow-sm">
                  <tr>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold w-12 text-center" title="Display Floor">Floor</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold w-12 text-center" title="Showroom">Show</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold w-12 text-center" title="Price List">Price</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold w-12 text-center" title="Hot Deals">Hot</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold w-12 text-center" title="New Arrivals">New</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Code</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Brand</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-gray-500 font-semibold min-w-[200px]">Product</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Category</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Stock</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-gray-500 font-semibold text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {catalog.map((prod, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-center border-r bg-gray-50/50">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded text-[var(--theme-accent)] focus:ring-[var(--theme-accent)] cursor-pointer"
                          checked={prod.override_tags?.includes('default')}
                          onChange={() => toggleTag(prod.id, 'default', prod.override_tags || [])}
                        />
                      </td>
                      <td className="p-3 text-center border-r bg-gray-50/50">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded text-teal-500 focus:ring-teal-500 cursor-pointer"
                          checked={prod.override_tags?.includes('showroom')}
                          onChange={() => toggleTag(prod.id, 'showroom', prod.override_tags || [])}
                        />
                      </td>
                      <td className="p-3 text-center border-r bg-gray-50/50">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 cursor-pointer"
                          checked={prod.override_tags?.includes('pricelist')}
                          onChange={() => toggleTag(prod.id, 'pricelist', prod.override_tags || [])}
                        />
                      </td>
                      <td className="p-3 text-center border-r bg-gray-50/50">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
                          checked={prod.override_tags?.includes('seasonal')}
                          onChange={() => toggleTag(prod.id, 'seasonal', prod.override_tags || [])}
                        />
                      </td>
                      <td className="p-3 text-center border-r bg-gray-50/50">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500 cursor-pointer"
                          checked={prod.override_tags?.includes('new')}
                          onChange={() => toggleTag(prod.id, 'new', prod.override_tags || [])}
                        />
                      </td>
                      <td className="p-3 font-mono text-xs text-gray-600">{prod.code}</td>
                      <td className="p-3 text-xs font-bold text-gray-700">{prod.manifest_brands?.name || '-'}</td>
                      <td className="p-3">
                        <div className="font-medium text-gray-900 truncate max-w-[250px]" title={prod.name}>{prod.name}</div>
                      </td>
                      <td className="p-3 text-xs text-gray-600 truncate max-w-[120px]">{prod.category}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${prod.stock_status === 'In Stock' ? 'bg-green-100 text-green-700' : prod.stock_status === 'Out of Stock' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                          {prod.stock_status || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-3 text-right text-gray-900 font-bold">
                        ₦{prod.price?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        {/* Right Panel: Add New Rows */}
        <div className="w-full lg:w-1/3 flex flex-col h-[60vh] lg:h-full min-h-[500px] lg:min-h-0">
          <div className="bg-white rounded shadow-sm border overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-800">Add New Rows</h3>
              <p className="text-xs text-gray-500 mt-1">Paste from Excel/Sheets. Existing codes will UPDATE, new codes will INSERT.</p>
            </div>
            <div className="p-4 flex flex-col flex-1 min-h-0">
              <textarea
                className="w-full flex-1 border rounded-lg p-4 text-sm font-mono focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent outline-none resize-none mb-4"
                placeholder="Paste your product list here (CSV/TSV format from Excel/Sheets)..."
                value={pasteData}
                onChange={e => setPasteData(e.target.value)}
              />
              <button
                onClick={handleParse}
                disabled={!pasteData.trim()}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-bold shadow hover:bg-gray-700 disabled:opacity-50 shrink-0"
              >
                Preview Import
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {parsedRows.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h3 className="font-bold">Preview ({parsedRows.filter(r => r.status === 'valid').length} valid rows)</h3>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-[var(--theme-accent)] text-white rounded shadow disabled:opacity-50"
            >
              {saving ? `Saving ${progress} of ${parsedRows.filter(r => r.status === 'valid').length}...` : 'Add these products to my store'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-2">Code</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Brand</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Issues</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.map((row, i) => (
                  <tr key={i} className={`border-b ${row.status === 'invalid' ? 'bg-red-50' : ''}`}>
                    <td className="p-2 font-mono">{row.code}</td>
                    <td className="p-2">
                      {row.status === 'invalid' ? (
                         <span className="text-red-600 font-bold">Error</span>
                      ) : row.isNew ? (
                        <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs">New</span>
                      ) : (
                        <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs">Update</span>
                      )}
                    </td>
                    <td className="p-2">{row.brandName}</td>
                    <td className="p-2">{row.category}</td>
                    <td className="p-2 truncate max-w-xs">{row.name}</td>
                    <td className="p-2">₦{row.dbRow?.price}</td>
                    <td className="p-2 text-red-600">{row.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button onClick={() => setParsedRows([])} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
