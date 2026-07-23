import fs from 'fs';
let content = fs.readFileSync('src/pages/CatalogManager.tsx', 'utf8');

const loadOld = `    const { data, error } = await supabase.from('manifest_catalog').select('*').order('created_at', { ascending: false });
    if (!error && data) setCatalog(data);`;

const loadNew = `    const { data, error } = await supabase.from('manifest_catalog').select('*').order('created_at', { ascending: false });
    if (error) {
       console.error("Catalog Load Error", error);
       if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          alert('Database update required: Please run the provided SQL script in your Supabase SQL Editor to create the manifest_catalog table.');
       }
    }
    if (!error && data) setCatalog(data);`;

content = content.replace(loadOld, loadNew);
fs.writeFileSync('src/pages/CatalogManager.tsx', content);
