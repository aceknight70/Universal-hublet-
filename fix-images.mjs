import fs from 'fs';
let showroom = fs.readFileSync('src/pages/Showroom.tsx', 'utf8');

const loadProds = `      const { data: prodData } = await query;
      
      if (prodData) {
        setProducts(prodData);
      }`;

const newLoadProds = `      const { data: prodData } = await query;
      
      if (prodData) {
        const { data: imgData } = await supabase.from('manifest_product_images').select('*');
        if (imgData) {
          const imgMap = new Map();
          imgData.forEach(img => {
            if (!imgMap.has(img.product_id)) imgMap.set(img.product_id, {});
            imgMap.get(img.product_id)[img.slot] = img.image_url;
          });
          prodData.forEach(p => {
            const imgs = imgMap.get(p.id);
            if (imgs) {
              p.main_image = imgs.main_image || p.main_image;
              p.front_image = imgs.front_image || p.front_image;
              p.left_image = imgs.left_image || p.left_image;
              p.right_image = imgs.right_image || p.right_image;
              p.back_image = imgs.back_image || p.back_image;
            }
          });
        }
        setProducts(prodData);
      }`;

showroom = showroom.replace(loadProds, newLoadProds);
fs.writeFileSync('src/pages/Showroom.tsx', showroom);
