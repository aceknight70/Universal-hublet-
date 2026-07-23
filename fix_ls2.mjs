import fs from 'fs';

let content = fs.readFileSync('src/hooks/useCart.tsx', 'utf8');
content = content.replace('try { localStorage.setItem(`manifest_cart_${storeSlug}`, JSON.stringify(items); } catch(e) {});', 'try { localStorage.setItem(`manifest_cart_${storeSlug}`, JSON.stringify(items)); } catch(e) {}');
fs.writeFileSync('src/hooks/useCart.tsx', content);

let devState = fs.readFileSync('src/hooks/useDeviceState.ts', 'utf8');
devState = devState.replace('try { localStorage.setItem(\'manifest_device_state\', JSON.stringify(state); } catch(e) {});', 'try { localStorage.setItem(\'manifest_device_state\', JSON.stringify(state)); } catch(e) {}');
fs.writeFileSync('src/hooks/useDeviceState.ts', devState);
