import re

with open('src/pages/MasterRoom.tsx', 'r') as f:
    code = f.read()

start_idx = code.find('export function MasterRoom')

if start_idx != -1:
  brand_exclusions_editor = """function BrandExclusionsEditor({ clients }: { clients: Client[] }) {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [brands, setBrands] = useState<{name: string, isExcluded: boolean}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedClientId) {
      loadBrands();
    } else {
      setBrands([]);
    }
  }, [selectedClientId]);

  async function loadBrands() {
    setIsLoading(true);
    try {
      const { data: allBrands } = await (supabase as any).from('manifest_brands').select('name').order('name');
      const { data: exclusions } = await (supabase as any)
        .from('manifest_brand_exclusions')
        .select('brand_name')
        .eq('client_id', selectedClientId);
        
      const excludedNames = new Set((exclusions || []).map((e: any) => e.brand_name));
      const merged = (allBrands || []).map((b: any) => ({
        name: b.name,
        isExcluded: excludedNames.has(b.name)
      }));
      setBrands(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleExclusion(brandName: string, currentlyExcluded: boolean) {
    if (!selectedClientId) return;
    
    // Optimistic UI
    setBrands(brands.map(b => b.name === brandName ? { ...b, isExcluded: !currentlyExcluded } : b));
    
    try {
      if (currentlyExcluded) {
        // Remove exclusion
        await (supabase as any)
          .from('manifest_brand_exclusions')
          .delete()
          .eq('client_id', selectedClientId)
          .eq('brand_name', brandName);
      } else {
        // Add exclusion
        await (supabase as any)
          .from('manifest_brand_exclusions')
          .insert({ client_id: selectedClientId, brand_name: brandName });
      }
    } catch (err: any) {
      alert("Error updating exclusion: " + err.message);
      // Revert on error
      setBrands(brands.map(b => b.name === brandName ? { ...b, isExcluded: currentlyExcluded } : b));
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow-sm border mt-8">
      <h3 className="text-lg font-bold mb-4">Brand Exclusions</h3>
      <p className="text-sm text-gray-500 mb-6">Hide universal brands that a specific store doesn't carry.</p>
      
      <div className="mb-6">
         <label className="block text-sm font-medium text-gray-700 mb-2">Select Store</label>
         <select 
            value={selectedClientId} 
            onChange={e => setSelectedClientId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md border"
         >
            <option value="">-- Select a store --</option>
            {clients.map(c => (
               <option key={c.id} value={c.id}>{c.name}</option>
            ))}
         </select>
      </div>

      {selectedClientId && (
        isLoading ? <div className="p-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div> :
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map(brand => (
            <label key={brand.name} className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <input 
                type="checkbox" 
                checked={brand.isExcluded} 
                onChange={() => toggleExclusion(brand.name, brand.isExcluded)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className={`text-sm ${brand.isExcluded ? 'text-gray-400 line-through' : 'text-gray-900 font-medium'}`}>
                {brand.name}
              </span>
            </label>
          ))}
          {brands.length === 0 && <div className="text-sm text-gray-500 col-span-full">No brands found.</div>}
        </div>
      )}
    </div>
  );
}

"""
  
  new_code = code[:start_idx] + brand_exclusions_editor + code[start_idx:]
  with open('src/pages/MasterRoom.tsx', 'w') as f:
      f.write(new_code)
  print('Added BrandExclusionsEditor successfully.')
else:
  print('Could not find start index.')
