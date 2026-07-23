import fs from 'fs';
let content = fs.readFileSync('src/pages/Showroom.tsx', 'utf8');

const loadOld = `      const { data: invData, error } = await query;
      if (error) {
         console.error("Error fetching inventory", error);
         if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
            alert('Database update required: Please run the provided SQL script in your Supabase SQL Editor to create the manifest_catalog and manifest_inventory tables.');
         }
      }`;

const loadNew = `      const { data: invData, error } = await query;
      if (error) {
         console.warn("Inventory fetch failed, falling back to legacy products", error);
         
         // FALLBACK to old manifest_products table if inventory fails
         let fallbackQuery = supabase.from('manifest_products').select('*, manifest_product_images(slot, image_url)');
         if (selectedBrandIds.length > 0) {
           fallbackQuery = fallbackQuery.in('brand_id', selectedBrandIds);
         }
         if (selectedCategory) {
           fallbackQuery = fallbackQuery.eq('category', selectedCategory);
         }
         const { data: prodData } = await fallbackQuery;
         if (prodData) {
           const productsWithImages = prodData.map((p: any) => {
             const formatted = { ...p };
             if (p.manifest_product_images) {
                p.manifest_product_images.forEach((img: any) => {
                   if (img.slot === 'main') formatted.main_image = img.image_url;
                   if (img.slot === 'front') formatted.front_image = img.image_url;
                   if (img.slot === 'left') formatted.left_image = img.image_url;
                   if (img.slot === 'right') formatted.right_image = img.image_url;
                   if (img.slot === 'back') formatted.back_image = img.image_url;
                });
                delete formatted.manifest_product_images;
             }
             return formatted;
           });
           setProducts(productsWithImages);
         }
         setLoading(false);
         return; // Skip the rest of inventory logic
      }`;

content = content.replace(loadOld, loadNew);
fs.writeFileSync('src/pages/Showroom.tsx', content);
