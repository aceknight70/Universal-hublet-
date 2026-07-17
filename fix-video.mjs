import fs from 'fs';
let sheet = fs.readFileSync('src/pages/SheetManager.tsx', 'utf8');

sheet = sheet.replace(/video_url:\s*row\[.*?\|\|\s*null,\n/g, "");

fs.writeFileSync('src/pages/SheetManager.tsx', sheet);
