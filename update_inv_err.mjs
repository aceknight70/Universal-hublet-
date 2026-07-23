import fs from 'fs';
let content = fs.readFileSync('src/pages/InventoryManager.tsx', 'utf8');

const loadOld = `    const [{ data: catData }, { data: invData }] = await Promise.all([
      supabase.from('manifest_catalog').select('*').order('name'),
      supabase.from('manifest_inventory').select('*').eq('client_id', client?.id)
    ]);`;

const loadNew = `    const [{ data: catData, error: catErr }, { data: invData, error: invErr }] = await Promise.all([
      supabase.from('manifest_catalog').select('*').order('name'),
      supabase.from('manifest_inventory').select('*').eq('client_id', client?.id)
    ]);
    
    if (catErr || invErr) {
       console.error("Inventory Load Error", catErr, invErr);
       const msg = catErr?.message || invErr?.message || '';
       if (msg.includes('relation') && msg.includes('does not exist')) {
          alert('Database update required: Please run the provided SQL script in your Supabase SQL Editor to create the manifest_catalog and manifest_inventory tables.');
       }
    }`;

content = content.replace(loadOld, loadNew);
fs.writeFileSync('src/pages/InventoryManager.tsx', content);
