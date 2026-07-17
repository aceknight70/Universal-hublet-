import fs from 'fs';
let content = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');

if (!content.includes("const [uploadingField, setUploadingField]")) {
  content = content.replace(
    "const [isEditing, setIsEditing] = useState(isNew || false);",
    "const [isEditing, setIsEditing] = useState(isNew || false);\n  const [uploadingField, setUploadingField] = useState<string | null>(null);"
  );
  fs.writeFileSync('src/components/ProductDetail.tsx', content);
}
