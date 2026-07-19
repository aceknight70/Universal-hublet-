import fs from 'fs';
let content = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');

const oldImageSave = `    if (savedProductData) {
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
      }
      onUpdate(savedProductData);
      setIsEditing(false);
      setSuccessMsg("Photo saved successfully.");
      setTimeout(() => setSuccessMsg(null), 3000);
    }`;

const newImageSave = `    if (savedProductData) {
      // Save images to manifest_product_images
      let imageError = null;
      const imageSlots = ['main_image', 'front_image', 'left_image', 'right_image', 'back_image'];
      for (const slot of imageSlots) {
        if ((editedProduct as any)[slot]) {
          const dbSlot = slot.replace('_image', '');
          // @ts-ignore
          const { error } = await supabase.from('manifest_product_images').upsert({
            product_id: savedProductData.id,
            slot: dbSlot,
            image_url: (editedProduct as any)[slot]
          } as any, { onConflict: 'product_id,slot' });
          
          if (error) {
            imageError = error;
            console.error("Image Upsert Error for slot", dbSlot, error);
            alert("Error saving " + dbSlot + " photo: " + error.message);
          } else {
            savedProductData[slot] = (editedProduct as any)[slot];
          }
        }
      }
      
      if (!imageError) {
        onUpdate(savedProductData);
        setIsEditing(false);
        setSuccessMsg("Photo saved successfully.");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    }`;

content = content.replace(oldImageSave, newImageSave);

fs.writeFileSync('src/components/ProductDetail.tsx', content);
console.log("ProductDetail upsert updated!");
