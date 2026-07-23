import fs from 'fs';
let content = fs.readFileSync('src/pages/MasterRoom.tsx', 'utf8');

content = content.replace("try {\\n               const theme =", "try {\n               const theme =");

fs.writeFileSync('src/pages/MasterRoom.tsx', content);
