import fs from 'fs';

let content = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');

const toReplace = `    // Safety check for contact_link
    const { error: columnCheckError } = await supabase.from('manifest_products').select('contact_link').limit(1);
    if (columnCheckError) {
      delete (finalProduct as any).contact_link;
    }

    // Remove image fields from products table payload
    delete (finalProduct as any).main_image;
    delete (finalProduct as any).front_image;
    delete (finalProduct as any).left_image;
    delete (finalProduct as any).right_image;
    delete (finalProduct as any).back_image;
    delete (finalProduct as any).video_url;
    delete (finalProduct as any).extra_details;
    
    let savedProductData = null;
    if (isNew) {
      delete (finalProduct as any).id;
      if (!finalProduct.code) finalProduct.code = \`NEW-\${Date.now()}\`;
      const { data, error } = await supabase
        .from('manifest_products')
        // @ts-ignore
        .insert(finalProduct as any)
        .select()
        .single();
      
      if (error) {
        alert('Error creating product: ' + error.message);
      } else if (data) {
        savedProductData = data;
      }
    } else {
      const { data, error } = await supabase
        .from('manifest_products')
        // @ts-ignore
        .update(finalProduct as any)
        .eq('id', product.id)
        .select()
        .single();
        
      if (error) {
        alert('Error saving product: ' + error.message);
      } else if (data) {
        savedProductData = data;
      }
    }`;

const newSave = `    // Handle new architecture: manifest_catalog + manifest_inventory
    let savedProductData = null;
    const catUpdate = {
       name: finalProduct.name,
       category: finalProduct.category,
       brand: finalProduct.brand || (finalProduct as any).brand_id,
       spec_sheet: {
          code: finalProduct.code,
          description_bullets: finalProduct.description_bullets,
          technical_specs: finalProduct.technical_specs,
          assurance_yn: (finalProduct as any).assurance_yn,
          assurance_text: (finalProduct as any).assurance_text,
          laggard_yn: (finalProduct as any).laggard_yn,
          laggard_promo_text: (finalProduct as any).laggard_promo_text,
          stock_status: (finalProduct as any).stock_status,
          search_keywords: (finalProduct as any).search_keywords
       }
    };
    
    if (isNew) {
       const { data, error } = await supabase.from('manifest_catalog').insert(catUpdate).select().single();
       if (error) {
          alert('Error creating catalog item: ' + error.message);
       } else if (data) {
          savedProductData = data;
          if ((finalProduct as any).client_id) {
             await supabase.from('manifest_inventory').insert({
                client_id: (finalProduct as any).client_id,
                catalog_id: data.id,
                price: finalProduct.price || 0
             });
          }
       }
    } else {
       const { data, error } = await supabase.from('manifest_catalog').update(catUpdate).eq('id', product.id).select().single();
       if (error) {
          alert('Error saving catalog item: ' + error.message);
       } else if (data) {
          savedProductData = data;
          if ((product as any).inventory_id) {
             await supabase.from('manifest_inventory').update({
                price: finalProduct.price || 0
             }).eq('id', (product as any).inventory_id);
          }
       }
    }`;

content = content.replace(toReplace, newSave);

fs.writeFileSync('src/components/ProductDetail.tsx', content);
