import fs from 'fs';

let content = fs.readFileSync('src/pages/PhotoMatchingBay.tsx', 'utf8');

// Add imports
content = content.replace("import { useStore } from '../hooks/useStore';", "import { useStore } from '../hooks/useStore';\nimport { compressImage } from '../lib/imageUtils';");

// Add state for preview and success
content = content.replace("const [errorMsg, setErrorMsg] = useState<string | null>(null);", "const [errorMsg, setErrorMsg] = useState<string | null>(null);\n  const [previewUrl, setPreviewUrl] = useState<string | null>(null);\n  const [successMsg, setSuccessMsg] = useState<string | null>(null);");

// Update handleFileUpload
const handleFileUploadNew = `  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Show instant preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSuccessMsg(null);
    setIsUploading(true);
    setErrorMsg(null);

    try {
      // Compress image
      const compressedFile = await compressImage(file, 1600);

      const fileExt = compressedFile.name.split('.').pop() || 'jpg';
      const folder = client?.id?.includes('fallback') ? '00000000-0000-0000-0000-000000000000' : (client?.id || 'public');
      const fileName = \`\${folder}/\${Date.now()}_\${Math.random().toString(36).substring(7)}.\${fileExt}\`;
      
      const { error: uploadError } = await supabase.storage
        .from('manifest_gallery')
        .upload(fileName, compressedFile);

      if (uploadError) throw uploadError;
      
      setSuccessMsg("Photo saved successfully.");
      setTimeout(() => setSuccessMsg(null), 3000);
      setPreviewUrl(null); // clear preview on success
      
      await loadTray();
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
      // Clean up object URL to avoid memory leaks
      URL.revokeObjectURL(objectUrl);
    }
  }`;

content = content.replace(/async function handleFileUpload[\s\S]*?finally {\s*setIsUploading\(false\);\s*}\s*}/, handleFileUploadNew);

// Add UI for preview and progress
const uploadUIOld = `{isUploading && <p className="text-sm text-purple-600 mt-2">Uploading...</p>}`;
const uploadUINew = `
        {previewUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <div className="relative inline-block">
              <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover rounded shadow-sm border" />
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center rounded">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white text-xs mt-2 font-medium">Uploading...</span>
                </div>
              )}
            </div>
          </div>
        )}
        {successMsg && <p className="text-sm text-green-600 mt-2 font-medium">✓ {successMsg}</p>}
`;
content = content.replace(uploadUIOld, uploadUINew);

fs.writeFileSync('src/pages/PhotoMatchingBay.tsx', content);
