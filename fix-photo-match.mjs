import fs from 'fs';
let content = fs.readFileSync('src/pages/PhotoMatchingBay.tsx', 'utf8');

// 1. Update handleMatch signature and logic
const oldHandleMatch = `async function handleMatch(product: Product) {
    if (!selectedPhoto) return;
    setIsMatching(true);
    setErrorMsg(null);
    try {
      const folder = client?.id?.includes('fallback') ? '00000000-0000-0000-0000-000000000000' : (client?.id || '00000000-0000-0000-0000-000000000000');
      const oldPath = \`\${folder}/\${selectedPhoto.name}\`;
      const newPath = \`\${folder}/matched_\${selectedPhoto.name}\`;
      
      // Get the URL for the new path
      const { data: publicUrlData } = supabase.storage
        .from('manifest_gallery')
        .getPublicUrl(newPath);
      
      // Insert into product images
      // @ts-ignore
      const { error: dbError } = await supabase.from('manifest_product_images').upsert({
        product_id: product.id,
        slot: 'main_image',
        image_url: publicUrlData.publicUrl
      } as any, { onConflict: 'product_id,slot' });`;

const newHandleMatch = `async function handleMatch(product: Product, slot: string) {
    if (!selectedPhoto) return;
    setIsMatching(true);
    setErrorMsg(null);
    try {
      const folder = client?.id?.includes('fallback') ? '00000000-0000-0000-0000-000000000000' : (client?.id || '00000000-0000-0000-0000-000000000000');
      const oldPath = \`\${folder}/\${selectedPhoto.name}\`;
      const newPath = \`\${folder}/matched_\${Date.now()}_\${selectedPhoto.name}\`; // Add timestamp to avoid collisions
      
      // Get the URL for the new path
      const { data: publicUrlData } = supabase.storage
        .from('manifest_gallery')
        .getPublicUrl(newPath);
      
      // Insert into product images
      // @ts-ignore
      const { error: dbError } = await supabase.from('manifest_product_images').upsert({
        product_id: product.id,
        slot: slot,
        image_url: publicUrlData.publicUrl
      } as any, { onConflict: 'product_id,slot' });`;

content = content.replace(oldHandleMatch, newHandleMatch);

// 2. Update the product card rendering
const oldProductCard = `              <div 
                key={product.id}
                className={\`border rounded-lg p-3 flex gap-3 transition-all \${selectedPhoto ? 'hover:border-[var(--theme-accent)] hover:shadow-md cursor-pointer bg-white' : 'opacity-70 bg-gray-50 grayscale'}\`}
                onClick={() => selectedPhoto && handleMatch(product)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 truncate">{product.name}</div>
                  <div className="text-xs text-gray-500 font-mono mt-1">{product.code}</div>
                  <div className="text-xs text-gray-400 mt-1">{product.category}</div>
                </div>
                {selectedPhoto && (
                  <div className="flex items-center">
                    <button 
                      disabled={isMatching}
                      className="text-xs bg-[var(--theme-accent)] text-white px-3 py-1.5 rounded font-medium disabled:opacity-50"
                    >
                      {isMatching ? 'Matching...' : 'Match'}
                    </button>
                  </div>
                )}
              </div>`;

const newProductCard = `              <div 
                key={product.id}
                className={\`border rounded-lg p-3 flex flex-col gap-3 transition-all \${selectedPhoto ? 'hover:border-[var(--theme-accent)] hover:shadow-md bg-white' : 'opacity-70 bg-gray-50 grayscale'}\`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 truncate">{product.name}</div>
                  <div className="text-xs text-gray-500 font-mono mt-1">{product.code}</div>
                  <div className="text-xs text-gray-400 mt-1">{product.category}</div>
                </div>
                {selectedPhoto && (
                  <div className="flex flex-col gap-2 border-t pt-2 mt-1">
                    <div className="text-xs font-semibold text-gray-600">Select Slot to Match:</div>
                    <div className="flex flex-wrap gap-2">
                      {['main', 'front', 'left', 'right', 'back'].map(slot => (
                        <button 
                          key={slot}
                          disabled={isMatching}
                          onClick={() => handleMatch(product, slot)}
                          className="text-xs bg-gray-100 hover:bg-[var(--theme-accent)] hover:text-white text-gray-700 px-3 py-1.5 rounded font-medium disabled:opacity-50 transition-colors capitalize"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>`;

content = content.replace(oldProductCard, newProductCard);

fs.writeFileSync('src/pages/PhotoMatchingBay.tsx', content);
console.log("PhotoMatchingBay updated!");
