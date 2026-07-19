import fs from 'fs';
let content = fs.readFileSync('src/pages/PhotoMatchingBay.tsx', 'utf8');

content = content.replace(
  'md:h-full shrink-0 h-[45vh] md:h-auto min-h-[400px] md:min-h-0',
  'shrink-0 h-[45vh] md:h-full min-h-[400px] md:min-h-0'
);

fs.writeFileSync('src/pages/PhotoMatchingBay.tsx', content);
console.log('Fixed conflicting classes');
