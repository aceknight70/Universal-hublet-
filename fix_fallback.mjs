import fs from 'fs';

let content = fs.readFileSync('src/pages/Showroom.tsx', 'utf8');

const toReplace = `         const { data: prodData } = await fallbackQuery;
         if (prodData) {`;

const replacement = `         const { data: prodData, error: fallbackError } = await fallbackQuery;
         if (fallbackError) console.error("Fallback query failed:", fallbackError);
         if (prodData) {`;

content = content.replace(toReplace, replacement);
fs.writeFileSync('src/pages/Showroom.tsx', content);
