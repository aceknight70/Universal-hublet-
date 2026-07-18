import fs from 'fs';

// 1. Update SheetManager.tsx
let sheet = fs.readFileSync('src/pages/SheetManager.tsx', 'utf8');

// remove stock count calculation and assignment
sheet = sheet.replace(/let stockCount = null;\s*if \(laggardPromoText && !isNaN\(Number\(laggardPromoText\)\)\) \{\s*stockCount = Number\(laggardPromoText\);\s*\}/g, "");
sheet = sheet.replace(/stock_count:\s*stockCount,\n/g, "");

// remove staff notes
sheet = sheet.replace(/staff_notes:\s*row\['Staff Notes'\]\s*\|\|\s*null,\n/g, "");

fs.writeFileSync('src/pages/SheetManager.tsx', sheet);

// 2. Update types.ts
let types = fs.readFileSync('src/types.ts', 'utf8');
types = types.replace(/\s*stock_count:\s*number\s*\|\s*null;\n/g, "\n");
types = types.replace(/\s*staff_notes:\s*string\s*\|\s*null;\n/g, "\n");

fs.writeFileSync('src/types.ts', types);

