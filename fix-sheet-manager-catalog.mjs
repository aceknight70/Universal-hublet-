import fs from 'fs';
let content = fs.readFileSync('src/pages/SheetManager.tsx', 'utf8');

// Update catalog state type
content = content.replace(
  "const [catalog, setCatalog] = useState<{code: string, name: string, price: number}[]>([]);",
  "const [catalog, setCatalog] = useState<any[]>([]);"
);

// Update loadCatalog logic
const oldLoadCatalog = `  const loadCatalog = async () => {
    setLoadingCatalog(true);
    const { data } = await supabase.from('manifest_products').select('code, name, price').order('created_at', { ascending: false });
    if (data) setCatalog(data);
    setLoadingCatalog(false);
  };`;

const newLoadCatalog = `  const loadCatalog = async () => {
    setLoadingCatalog(true);
    const [{ data: prods }, { data: overrides }] = await Promise.all([
      supabase.from('manifest_products').select('id, code, name, price, stock_status, category, manifest_brands(name)').order('created_at', { ascending: false }),
      client?.id ? supabase.from('manifest_client_product_overrides').select('*').eq('client_id', client.id) : Promise.resolve({ data: [] })
    ]);
    
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
  };`;

content = content.replace(oldLoadCatalog, newLoadCatalog);

// Now update the table UI
const oldTable = `              <table className="w-full text-left text-sm">
                <thead className="bg-white sticky top-0 border-b z-10">
                  <tr>
                    <th className="p-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Code</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Product</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-gray-500 font-semibold text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {catalog.map((prod, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs text-gray-600">{prod.code}</td>
                      <td className="p-3">
                        <div className="font-medium text-gray-900 line-clamp-1">{prod.name}</div>
                      </td>
                      <td className="p-3 text-right text-gray-700">
                        ₦{prod.price?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>`;

const newTable = `              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white sticky top-0 border-b z-10 shadow-sm">
                  <tr>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold w-12 text-center" title="Display Floor">Floor</th>
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
                        <span className={\`px-2 py-0.5 rounded-full text-[10px] font-bold \${prod.stock_status === 'In Stock' ? 'bg-green-100 text-green-700' : prod.stock_status === 'Out of Stock' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}\`}>
                          {prod.stock_status || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-3 text-right text-gray-900 font-bold">
                        ₦{prod.price?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>`;

content = content.replace(oldTable, newTable);

// Ensure the panel takes up full width when we remove lg:w-1/3 and lg:w-2/3 if needed?
// Let's actually adjust the widths. It needs to be wider to show all those columns.
content = content.replace(
  '        <div className="w-full lg:w-1/3 flex flex-col bg-white rounded shadow-sm border overflow-hidden shrink-0 h-[45vh] lg:h-full min-h-[400px] lg:min-h-0">',
  '        <div className="w-full lg:w-2/3 flex flex-col bg-white rounded shadow-sm border overflow-hidden shrink-0 h-[45vh] lg:h-full min-h-[400px] lg:min-h-0">'
);
content = content.replace(
  '        {/* Right Panel: Add New Rows */}\n        <div className="w-full lg:w-2/3 flex flex-col h-[60vh] lg:h-full min-h-[500px] lg:min-h-0">',
  '        {/* Right Panel: Add New Rows */}\n        <div className="w-full lg:w-1/3 flex flex-col h-[60vh] lg:h-full min-h-[500px] lg:min-h-0">'
);


fs.writeFileSync('src/pages/SheetManager.tsx', content);
console.log("SheetManager updated!");
