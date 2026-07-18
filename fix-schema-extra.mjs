import fs from 'fs';

// 1. Update SheetManager.tsx
let sheet = fs.readFileSync('src/pages/SheetManager.tsx', 'utf8');
sheet = sheet.replace(/extra_details:\s*row\['Extra Details \(From Box\/Label\)'\]\s*\|\|\s*null,\n/g, "");
fs.writeFileSync('src/pages/SheetManager.tsx', sheet);

// 2. Update types.ts
let types = fs.readFileSync('src/types.ts', 'utf8');
types = types.replace(/\s*extra_details:\s*string\s*\|\s*null;\n/g, "\n");
fs.writeFileSync('src/types.ts', types);

// 3. Update ProductDetail.tsx
let detail = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');
detail = detail.replace(/delete \(finalProduct as any\)\.video_url;/, "delete (finalProduct as any).video_url;\n    delete (finalProduct as any).extra_details;");

// Remove extra_details render
const renderDetailsRegex = /\{\s*product\.extra_details\s*&&\s*\([\s\S]*?\}\s*\)/;
detail = detail.replace(renderDetailsRegex, "");

// Remove extra_details input
const inputDetailsRegex = /<div>\s*<label[^>]*>Specs \/ Extra Details<\/label>[\s\S]*?<\/div>/;
detail = detail.replace(inputDetailsRegex, "");

fs.writeFileSync('src/components/ProductDetail.tsx', detail);

