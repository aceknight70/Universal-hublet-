import fs from 'fs';
let content = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');

const oldSaveLogicRegex = /if \(isNew\) \{[\s\S]*?setSaving\(false\);\s*\};/g;

const newSaveLogic = `    let savedProductData = null;
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
    }
    
    if (savedProductData) {
      // Save images to manifest_product_images
      const imageSlots = ['main_image', 'front_image', 'left_image', 'right_image', 'back_image'];
      for (const slot of imageSlots) {
        if ((editedProduct as any)[slot]) {
          await supabase.from('manifest_product_images').upsert({
            product_id: savedProductData.id,
            slot: slot,
            image_url: (editedProduct as any)[slot]
          }, { onConflict: 'product_id,slot' });
          savedProductData[slot] = (editedProduct as any)[slot];
        }
      }
      onUpdate(savedProductData);
      setIsEditing(false);
    }
    
    setSaving(false);
  };`;

content = content.replace(oldSaveLogicRegex, newSaveLogic);
fs.writeFileSync('src/components/ProductDetail.tsx', content);
