import fs from 'fs';

let masterRoom = fs.readFileSync('src/pages/MasterRoom.tsx', 'utf8');
masterRoom = masterRoom.replace(/\/\/ For fallbacks, save to localStorage so it persists visually[\s\S]*?localStorage\.setItem\('manifest_theme_overrides', JSON\.stringify\(existing\)\);/g, '');
masterRoom = masterRoom.replace(/const overridesStr = localStorage\.getItem\('manifest_theme_overrides'\);[\s\S]*?\} catch\(e\) \{\}/g, '');
fs.writeFileSync('src/pages/MasterRoom.tsx', masterRoom);

let spotlight = fs.readFileSync('src/pages/SpotlightManager.tsx', 'utf8');
spotlight = spotlight.replace(/\/\/ Fallback to localStorage[\s\S]*?setAds\(JSON\.parse\(local\)\);[\s\S]*?\} catch \(e\) \{\}/g, '');
spotlight = spotlight.replace(/console\.warn\("DB save failed, using local fallback", error\);[\s\S]*?localStorage\.setItem\('mock_ads_' \+ client\.id, JSON\.stringify\(\[newAd\]\)\);/g, 'console.error("DB save failed", error);');
spotlight = spotlight.replace(/localStorage\.removeItem\('mock_ads_' \+ client\?\.id\);/g, '');
fs.writeFileSync('src/pages/SpotlightManager.tsx', spotlight);

let storeRouter = fs.readFileSync('src/pages/StoreRouter.tsx', 'utf8');
storeRouter = storeRouter.replace(/try \{[\s\S]*?const local = localStorage\.getItem\('mock_ads_' \+ client\.id\);[\s\S]*?setAdBanner\(JSON\.parse\(local\)\[0\]\.banner_url\);[\s\S]*?\}[\s\S]*?\} catch \(e\) \{\}/g, '');
fs.writeFileSync('src/pages/StoreRouter.tsx', storeRouter);
