import fs from 'fs';

// Patch ProductDetail.tsx
let pd = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');
pd = pd.replace(
  `const [activePhoto, setActivePhoto] = useState<string | null>(product.main_image);`,
  `const [activePhoto, setActivePhoto] = useState<string | null>(product.main_image || product.front_image || product.left_image || product.right_image || product.back_image || null);`
);
pd = pd.replace(
  `  if (!activePhoto && availablePhotos.length > 0 && availablePhotos[0].url) {
    setActivePhoto(availablePhotos[0].url);
  }`,
  ``
);
fs.writeFileSync('src/components/ProductDetail.tsx', pd);

// Patch useStore.tsx
let us = fs.readFileSync('src/hooks/useStore.tsx', 'utf8');
us = us.replace(`.single();`, `.maybeSingle();`);
fs.writeFileSync('src/hooks/useStore.tsx', us);

// Patch useDeviceState.ts
let uds = fs.readFileSync('src/hooks/useDeviceState.ts', 'utf8');
uds = uds.replace(
  `setState(s => ({ ...s, viewMode: mode }));`,
  `setState(s => s.viewMode === mode ? s : { ...s, viewMode: mode });`
);
uds = uds.replace(
  `setState(s => ({ ...s, lastStoreSlug: slug }));`,
  `setState(s => s.lastStoreSlug === slug ? s : { ...s, lastStoreSlug: slug });`
);
fs.writeFileSync('src/hooks/useDeviceState.ts', uds);

console.log("Patched files.");
