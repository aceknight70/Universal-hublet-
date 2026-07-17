import fs from 'fs';
let content = fs.readFileSync('src/components/Navigation.tsx', 'utf8');

// Replace the overflow container
content = content.replace(
  'className="flex items-center gap-4 md:gap-6 overflow-x-auto pb-2 scrollbar-hide max-w-full"',
  'className="flex flex-wrap items-center gap-3 md:gap-6 pb-1 max-w-full"'
);

// We need to ensure absolute positioning doesn't get clipped. We removed overflow-x-auto, so we're good.
// Also let's adjust z-index if needed, but it's 50.

fs.writeFileSync('src/components/Navigation.tsx', content);
