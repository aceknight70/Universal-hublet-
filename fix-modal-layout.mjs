import fs from 'fs';
let detail = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');

detail = detail.replace(
    'max-w-5xl max-h-full flex flex-col',
    'max-w-5xl max-h-[90vh] flex flex-col'
);

fs.writeFileSync('src/components/ProductDetail.tsx', detail);
