import fs from 'fs';
const files = [
  'src/pages/StoreRouter.tsx',
  'src/pages/SpotlightManager.tsx',
  'src/hooks/useDeviceState.ts',
  'src/hooks/useCart.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // replace localStorage.getItem(...) with a safe wrapper
  content = content.replace(/localStorage\.getItem\((.*?)\)/g, '(function(){ try { return localStorage.getItem($1); } catch(e) { return null; } })()');
  
  // replace localStorage.setItem(...) with a safe wrapper
  content = content.replace(/localStorage\.setItem\((.*?),\s*(.*?)\)/g, 'try { localStorage.setItem($1, $2); } catch(e) {}');
  
  // replace localStorage.removeItem(...) with a safe wrapper
  content = content.replace(/localStorage\.removeItem\((.*?)\)/g, 'try { localStorage.removeItem($1); } catch(e) {}');

  fs.writeFileSync(file, content);
}
