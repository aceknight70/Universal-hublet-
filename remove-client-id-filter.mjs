import fs from 'fs';
let content = fs.readFileSync('src/pages/Showroom.tsx', 'utf8');

const oldCode = `      let query = supabase.from('manifest_products').select('*, manifest_product_images(slot, image_url)').eq('client_id', client.id);`;
const newCode = `      // Load products (global across all skins)
      let query = supabase.from('manifest_products').select('*, manifest_product_images(slot, image_url)');`;

content = content.replace(oldCode, newCode);
fs.writeFileSync('src/pages/Showroom.tsx', content);
