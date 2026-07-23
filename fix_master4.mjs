import fs from 'fs';
let content = fs.readFileSync('src/pages/MasterRoom.tsx', 'utf8');

content = content.replace(
  "             const theme = typeof c.theme === 'string' ? JSON.parse(c.theme) : c.theme;",
  "             try {\\n               const theme = typeof c.theme === 'string' ? JSON.parse(c.theme) : c.theme;"
);

fs.writeFileSync('src/pages/MasterRoom.tsx', content);
