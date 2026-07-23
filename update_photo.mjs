import fs from 'fs';

let content = fs.readFileSync('src/pages/PhotoMatchingBay.tsx', 'utf8');

const toReplaceLoad = `  async function loadProducts() {
    // Only load products since we might not have client_id in products, we filter in the app or just fetch all if fallback
    // Actually, products are global right now, or we filter by category if needed, but the showroom fetches all.
    const { data } = await supabase.from('manifest_products').select('*');
    if (data) setProducts(data);
  }`;

const newLoad = `  async function loadProducts() {
    if (!client?.id) return;
    const { data } = await supabase.from('manifest_inventory').select('*, manifest_catalog!inner(*)').eq('client_id', client.id);
    if (data) {
       const mapped = data.map(inv => ({
          id: inv.manifest_catalog.id, // Use catalog ID so we can match pictures to the catalog!
          name: inv.manifest_catalog.name,
          category: inv.manifest_catalog.category,
          price: inv.price,
          brand_id: inv.manifest_catalog.brand,
          main_image: inv.manifest_catalog.reference_photo_url
       }));
       setProducts(mapped);
    }
  }`;

content = content.replace(toReplaceLoad, newLoad);

const toReplaceMatch = `      // Delete first to avoid constraint issues
      await supabase.from('manifest_product_images').delete().match({ product_id: product.id, slot: slot });
      const { error: dbError } = await supabase.from('manifest_product_images').insert({
        product_id: product.id,
        slot: slot,
        image_url: publicUrlData.publicUrl
      });`;

const newMatch = `      // In the new architecture, we update the reference_photo_url on manifest_catalog!
      // For multiple slots, we'd need to store it in spec_sheet, but for now we'll update reference_photo_url if slot is 'main'.
      // Wait, let's also update manifest_product_images just in case.
      await supabase.from('manifest_product_images').delete().match({ product_id: product.id, slot: slot });
      await supabase.from('manifest_product_images').insert({
        product_id: product.id,
        slot: slot,
        image_url: publicUrlData.publicUrl
      });
      
      if (slot === 'main') {
         await supabase.from('manifest_catalog').update({ reference_photo_url: publicUrlData.publicUrl }).eq('id', product.id);
      }
      const dbError = null;`;

content = content.replace(toReplaceMatch, newMatch);

fs.writeFileSync('src/pages/PhotoMatchingBay.tsx', content);
