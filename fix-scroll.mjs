import fs from 'fs';
let content = fs.readFileSync('src/pages/PhotoMatchingBay.tsx', 'utf8');

content = content.replace(
  '<div className="p-6 max-w-6xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">',
  '<div className="p-4 md:p-6 w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-4 md:gap-6 flex-1 min-h-0">'
);

content = content.replace(
  '<div className="w-full md:w-1/3 flex flex-col gap-6 h-full">',
  '<div className="w-full md:w-1/3 flex flex-col gap-4 md:gap-6 md:h-full shrink-0 h-[45vh] md:h-auto min-h-[400px] md:min-h-0">'
);

content = content.replace(
  '<div className="w-full md:w-2/3 flex flex-col h-full bg-white rounded shadow-sm border overflow-hidden">',
  '<div className="w-full md:w-2/3 flex flex-col bg-white rounded shadow-sm border overflow-hidden h-[60vh] md:h-full min-h-[500px] md:min-h-0">'
);

fs.writeFileSync('src/pages/PhotoMatchingBay.tsx', content);
console.log('Fixed scrolling styles');
