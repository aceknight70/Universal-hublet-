import fs from 'fs';

let content = fs.readFileSync('src/pages/SheetManager.tsx', 'utf8');

// Replace handleParse fetch from manifest_products to manifest_catalog
const toReplaceParse = `      const { data } = await supabase.from('manifest_products').select('code').in('code', codes);`;
// We actually want to match by name, since we use name to deduplicate now
const newParse = `      const { data } = await supabase.from('manifest_catalog').select('spec_sheet');
      if (data) {
        // Find existing codes
        const existingCodesArray = data.map((d:any) => d.spec_sheet?.code).filter(Boolean);
        existing = new Set(existingCodesArray);
      }
      // dummy assignment to avoid compiler complaining if we comment out the above line
      const _dummy = codes;`;

content = content.replace(toReplaceParse, newParse);

fs.writeFileSync('src/pages/SheetManager.tsx', content);
