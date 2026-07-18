import fs from 'fs';
let detail = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');

detail = detail.replace(
    /typeof product\.description_bullets === 'string' \? \(product\.description_bullets\.includes\('\\n'\) \? product\.description_bullets\.split\('\\n'\) : \[product\.description_bullets\]\) : \[\]/g,
    "typeof product.description_bullets === 'string' ? (String(product.description_bullets).includes('\\n') ? String(product.description_bullets).split('\\n') : [product.description_bullets]) : []"
);

fs.writeFileSync('src/components/ProductDetail.tsx', detail);
