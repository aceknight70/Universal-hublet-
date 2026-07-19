import fs from 'fs';
let content = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');

content = content.replace(
  'const [saving, setSaving] = useState(false);',
  'const [saving, setSaving] = useState(false);\n  const [successMsg, setSuccessMsg] = useState<string | null>(null);'
);

content = content.replace(
  'onUpdate(savedProductData);\n      setIsEditing(false);\n    }\n    \n    setSaving(false);',
  'onUpdate(savedProductData);\n      setIsEditing(false);\n      setSuccessMsg("Photo saved successfully.");\n      setTimeout(() => setSuccessMsg(null), 3000);\n    }\n    \n    setSaving(false);'
);

content = content.replace(
  '<div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">',
  '<div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">\n        {successMsg && (\n          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-50 text-green-700 px-4 py-2 rounded shadow border border-green-200 z-50 font-bold">\n            {successMsg}\n          </div>\n        )}'
);

fs.writeFileSync('src/components/ProductDetail.tsx', content);
console.log("ProductDetail message added!");
