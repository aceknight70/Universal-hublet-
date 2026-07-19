import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace(/Insert: any;/g, "Insert: Record<string, any>;");
content = content.replace(/Update: any;/g, "Update: Record<string, any>;");

fs.writeFileSync('src/types.ts', content);
