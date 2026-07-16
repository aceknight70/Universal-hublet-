import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace(/Update: Partial<Row>;/g, 'Update: any;');
content = content.replace(/Insert: Partial<Row>;/g, 'Insert: any;');

fs.writeFileSync('src/types.ts', content);

let master = fs.readFileSync('src/pages/MasterRoom.tsx', 'utf8');
master = master.replace(/const { error } = await supabase.from\('manifest_clients'\).update\(\{ theme: themeDraft \} as any\).eq\('id', selectedClientId\);/, 
`// @ts-ignore
const { error } = await supabase.from('manifest_clients').update({ theme: themeDraft }).eq('id', selectedClientId);`);
fs.writeFileSync('src/pages/MasterRoom.tsx', master);
