import fs from 'fs';
let content = fs.readFileSync('src/pages/StoreRouter.tsx', 'utf8');

content = content.replace(
  'className="px-4 md:px-6 pb-3 pt-1 overflow-x-auto scrollbar-hide border-t border-black/5 w-full"',
  'className="px-4 md:px-6 pb-3 pt-2 border-t border-black/5 w-full"'
);

fs.writeFileSync('src/pages/StoreRouter.tsx', content);
