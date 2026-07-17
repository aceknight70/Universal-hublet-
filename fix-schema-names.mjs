import fs from 'fs';
let sheet = fs.readFileSync('src/pages/SheetManager.tsx', 'utf8');

// Remove the image assignments
sheet = sheet.replace(/main_image:\s*row\[.*?\|\|\s*null,\n/g, "");
sheet = sheet.replace(/front_image:\s*row\[.*?\|\|\s*null,\n/g, "");
sheet = sheet.replace(/left_image:\s*row\[.*?\|\|\s*null,\n/g, "");
sheet = sheet.replace(/right_image:\s*row\[.*?\|\|\s*null,\n/g, "");
sheet = sheet.replace(/back_image:\s*row\[.*?\|\|\s*null,\n/g, "");

fs.writeFileSync('src/pages/SheetManager.tsx', sheet);
