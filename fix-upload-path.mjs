import fs from 'fs';
let detail = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');

detail = detail.replace(
    /const folder = client\?\.id\?\.includes\("fallback"\) \? "00000000-0000-0000-0000-000000000000" : \(client\?\.id \|\| "public"\);/g,
    "const folder = client?.id?.includes(\"fallback\") ? \"00000000-0000-0000-0000-000000000000\" : (client?.id || \"00000000-0000-0000-0000-000000000000\");"
);

fs.writeFileSync('src/components/ProductDetail.tsx', detail);
