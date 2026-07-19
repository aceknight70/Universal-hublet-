import fs from 'fs';
let content = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');

const oldImageSave = `    if (savedProductData) {
      // Save images to manifest_product_images
      const imageSlots = ['main_image', 'front_image', 'left_image', 'right_image', 'back_image'];
      for (const slot of imageSlots) {
        if ((editedProduct as any)[slot]) {
          // @ts-ignore
          await supabase.from('manifest_product_images').upsert({
            product_id: savedProductData.id,
            slot: slot,
            image_url: (editedProduct as any)[slot]
          } as any, { onConflict: 'product_id,slot' });
          savedProductData[slot] = (editedProduct as any)[slot];
        }
      }`;

const newImageSave = `    if (savedProductData) {
      // Save images to manifest_product_images
      const imageSlots = ['main_image', 'front_image', 'left_image', 'right_image', 'back_image'];
      for (const slot of imageSlots) {
        if ((editedProduct as any)[slot]) {
          const dbSlot = slot.replace('_image', '');
          // @ts-ignore
          await supabase.from('manifest_product_images').upsert({
            product_id: savedProductData.id,
            slot: dbSlot,
            image_url: (editedProduct as any)[slot]
          } as any, { onConflict: 'product_id,slot' });
          savedProductData[slot] = (editedProduct as any)[slot];
        }
      }`;

content = content.replace(oldImageSave, newImageSave);

fs.writeFileSync('src/components/ProductDetail.tsx', content);
console.log("ProductDetail updated!");
