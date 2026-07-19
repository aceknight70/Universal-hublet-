import fs from 'fs';

let pb = fs.readFileSync('src/pages/PhotoMatchingBay.tsx', 'utf8');
pb = pb.replace(
  "image_url: publicUrlData.publicUrl\n      }, { onConflict: 'product_id,slot' });",
  "image_url: publicUrlData.publicUrl\n      } as any, { onConflict: 'product_id,slot' });"
);
fs.writeFileSync('src/pages/PhotoMatchingBay.tsx', pb);

let pd = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');
pd = pd.replace(
  "image_url: (editedProduct as any)[slot]\n          }, { onConflict: 'product_id,slot' });",
  "image_url: (editedProduct as any)[slot]\n          } as any, { onConflict: 'product_id,slot' });"
);
fs.writeFileSync('src/components/ProductDetail.tsx', pd);
