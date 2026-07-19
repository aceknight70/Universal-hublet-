import fs from 'fs';
let content = fs.readFileSync('src/pages/Showroom.tsx', 'utf8');

const oldFetch = `      // Load products
      let query = supabase.from('manifest_products').select('*');
      if (selectedBrandId) {
        query = query.eq('brand_id', selectedBrandId);
      }
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      
      const { data: prodData } = await query;
      if (prodData) {
        setProducts(prodData);
      }`;

const newFetch = `      // Load products
      let query = supabase.from('manifest_products').select('*, manifest_product_images(slot, image_url)');
      if (selectedBrandId) {
        query = query.eq('brand_id', selectedBrandId);
      }
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      
      const { data: prodData } = await query;
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
      }`;

content = content.replace(oldFetch, newFetch);

fs.writeFileSync('src/pages/Showroom.tsx', content);
console.log("Showroom updated!");
