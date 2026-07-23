import fs from 'fs';

let content = fs.readFileSync('src/pages/Showroom.tsx', 'utf8');

const toReplace = `      const { data: invData, error } = await query;
      if (error) {
         console.warn("Inventory fetch failed, falling back to legacy products", error);`;

const replacement = `      const { data: invData, error } = await query;
      if (error || !invData || invData.length === 0) {
         console.warn("Inventory empty or fetch failed, falling back to legacy products", error);`;

content = content.replace(toReplace, replacement);
fs.writeFileSync('src/pages/Showroom.tsx', content);
