import fs from 'fs';
let content = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');

// Add import for compressImage
if (!content.includes("compressImage")) {
  content = content.replace(
    "import { supabase } from '../lib/supabase';", 
    "import { supabase } from '../lib/supabase';\nimport { compressImage } from '../lib/imageUtils';"
  );
}

// Check where handleImageUpload is.
const uploadImageFuncRegex = /async function handleImageUpload\([\s\S]*?finally {[\s\S]*?}[\s\S]*?}/;
const handleImageUploadNew = `async function handleImageUpload(field: keyof Product, e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const objectUrl = URL.createObjectURL(file);
    
    // Optimistic preview + loading state
    setEditedProduct(prev => ({ ...prev, [field]: objectUrl }));
    setUploadingField(field);

    try {
      const compressedFile = await compressImage(file, 1600);
      const fileExt = compressedFile.name.split('.').pop() || 'jpg';
      const folder = client?.id?.includes('fallback') ? '00000000-0000-0000-0000-000000000000' : (client?.id || 'public');
      const fileName = \`\${folder}/\${Date.now()}_\${Math.random().toString(36).substring(7)}.\${fileExt}\`;
      
      const { data, error } = await supabase.storage.from('manifest_gallery').upload(fileName, compressedFile);
      if (error) throw error;
      
      const { data: publicUrlData } = supabase.storage.from('manifest_gallery').getPublicUrl(fileName);
      setEditedProduct(prev => ({ ...prev, [field]: publicUrlData.publicUrl }));
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("Failed to upload image: " + err.message);
      // Revert preview on failure
      setEditedProduct(prev => ({ ...prev, [field]: product[field] }));
    } finally {
      setUploadingField(null);
      URL.revokeObjectURL(objectUrl);
    }
  }`;

content = content.replace(uploadImageFuncRegex, handleImageUploadNew);

// Add uploadingField state if it doesn't exist
if (!content.includes("const [uploadingField, setUploadingField]")) {
  content = content.replace(
    "const [isEditing, setIsEditing] = useState(isNew);",
    "const [isEditing, setIsEditing] = useState(isNew);\n  const [uploadingField, setUploadingField] = useState<string | null>(null);"
  );
}

// Find ImageBox and update it to show progress
const imageBoxRegex = /const ImageBox = \(\{ field, label \}: \{ field: keyof Product, label: string \}\) => \([\s\S]*?\);/;
const imageBoxNew = `const ImageBox = ({ field, label }: { field: keyof Product, label: string }) => {
    const val = editedProduct[field] as string;
    const isUploading = uploadingField === field;
    return (
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg h-24 flex flex-col items-center justify-center overflow-hidden hover:bg-gray-50 transition-colors group">
        {val ? (
          <>
            <img src={val} alt={label} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center">
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-[var(--theme-accent)] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="bg-black bg-opacity-60 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">{label}</span>
              )}
            </div>
          </>
        ) : (
          <>
            {isUploading ? (
              <div className="w-6 h-6 border-2 border-[var(--theme-accent)] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
              </div>
            )}
          </>
        )}
        <input 
          type="file" 
          accept="image/*" 
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
          onChange={(e) => handleImageUpload(field, e)} 
          disabled={isUploading}
        />
      </div>
    );
  };`;

content = content.replace(imageBoxRegex, imageBoxNew);

fs.writeFileSync('src/components/ProductDetail.tsx', content);

