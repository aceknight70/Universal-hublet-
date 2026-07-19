import fs from 'fs';

let pb = fs.readFileSync('src/pages/PhotoMatchingBay.tsx', 'utf8');
pb = pb.replace(
  "const { error: dbError } = await supabase.from('manifest_product_images').upsert({",
  "// @ts-ignore\n      const { error: dbError } = await supabase.from('manifest_product_images').upsert({"
);
fs.writeFileSync('src/pages/PhotoMatchingBay.tsx', pb);

let pd = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');
pd = pd.replace(
  "await supabase.from('manifest_product_images').upsert({",
  "// @ts-ignore\n          await supabase.from('manifest_product_images').upsert({"
);
fs.writeFileSync('src/components/ProductDetail.tsx', pd);
