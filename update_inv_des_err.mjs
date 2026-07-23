import fs from 'fs';
let content = fs.readFileSync('src/pages/InvoiceDesignManager.tsx', 'utf8');

const loadOld = `    const [{ data: cData }, { data: dData }] = await Promise.all([
      supabase.from('manifest_clients').select('*'),
      supabase.from('manifest_invoice_design').select('*')
    ]);`;

const loadNew = `    const [{ data: cData }, { data: dData, error }] = await Promise.all([
      supabase.from('manifest_clients').select('*'),
      supabase.from('manifest_invoice_design').select('*')
    ]);
    if (error) {
       console.error("Invoice Design Load Error", error);
       if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          alert('Database update required: Please run the provided SQL script to create the manifest_invoice_design table.');
       }
    }`;

content = content.replace(loadOld, loadNew);
fs.writeFileSync('src/pages/InvoiceDesignManager.tsx', content);
