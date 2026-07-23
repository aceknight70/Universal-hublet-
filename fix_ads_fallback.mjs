import fs from 'fs';

let spotlight = fs.readFileSync('src/pages/SpotlightManager.tsx', 'utf8');
spotlight = spotlight.replace(/\/\/ Fallback to localStorage[\s\S]*?if \(local\) loadedAds = JSON\.parse\(local\);\n\s*\} catch\(e\) \{\}\n\s*\}/, '');
fs.writeFileSync('src/pages/SpotlightManager.tsx', spotlight);

let storeRouter = fs.readFileSync('src/pages/StoreRouter.tsx', 'utf8');
// We need to carefully replace the ELSE block of ads fetching
const toReplace = `          } else {
            const local = (function(){ try { return localStorage.getItem('mock_ads_' + client.id); } catch(e) { return null; } })();
            if (local) {
              try { setAds(JSON.parse(local)); } catch(e) {}
            } else {
              setAds([]);
            }
          }`;

storeRouter = storeRouter.replace(toReplace, `          } else {
            setAds([]);
          }`);
fs.writeFileSync('src/pages/StoreRouter.tsx', storeRouter);
