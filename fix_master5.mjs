import fs from 'fs';
let content = fs.readFileSync('src/pages/MasterRoom.tsx', 'utf8');

content = content.replace("try {\\n        if (!isFallback) {", "try {\n        if (!isFallback) {");

fs.writeFileSync('src/pages/MasterRoom.tsx', content);
