import fs from 'fs';
let content = fs.readFileSync('src/pages/SheetManager.tsx', 'utf8');

const oldHeader = `                <thead className="bg-white sticky top-0 border-b z-10 shadow-sm">
                  <tr>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold w-12 text-center" title="Display Floor">Floor</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold w-12 text-center" title="Hot Deals">Hot</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold w-12 text-center" title="New Arrivals">New</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Code</th>`;

const newHeader = `                <thead className="bg-white sticky top-0 border-b z-10 shadow-sm">
                  <tr>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold w-12 text-center" title="Display Floor">Floor</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold w-12 text-center" title="Showroom">Show</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold w-12 text-center" title="Price List">Price</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold w-12 text-center" title="Hot Deals">Hot</th>
                    <th className="p-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold w-12 text-center" title="New Arrivals">New</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Code</th>`;

content = content.replace(oldHeader, newHeader);

const oldRowStart = `                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
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
                      <td className="p-3 font-mono text-xs text-gray-600">{prod.code}</td>`;

const newRowStart = `                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
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
                      <td className="p-3 font-mono text-xs text-gray-600">{prod.code}</td>`;

content = content.replace(oldRowStart, newRowStart);

fs.writeFileSync('src/pages/SheetManager.tsx', content);
console.log("SheetManager extra columns added!");
