import fs from 'fs';
let content = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');

content = content.replace(
  '<div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative">',
  '<div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative">\n        {successMsg && (\n          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-50 text-green-700 px-4 py-2 rounded shadow border border-green-200 z-50 font-bold">\n            {successMsg}\n          </div>\n        )}'
);

fs.writeFileSync('src/components/ProductDetail.tsx', content);
console.log("ProductDetail JSX updated!");
