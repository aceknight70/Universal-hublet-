import fs from 'fs';
let content = fs.readFileSync('src/pages/Showroom.tsx', 'utf8');

const loadOld = `      const { data: invData, error } = await query;
      if (error) {
         console.error("Error fetching inventory", error);
      }`;

const loadNew = `      const { data: invData, error } = await query;
      if (error) {
         console.error("Error fetching inventory", error);
         if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
            alert('Database update required: Please run the provided SQL script in your Supabase SQL Editor to create the manifest_catalog and manifest_inventory tables.');
         }
      }`;

content = content.replace(loadOld, loadNew);
fs.writeFileSync('src/pages/Showroom.tsx', content);
