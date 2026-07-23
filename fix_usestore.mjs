import fs from 'fs';
let content = fs.readFileSync('src/hooks/useStore.tsx', 'utf8');

const oldStr = `        // Apply local overrides (used when saving fallback store themes in MasterRoom)
        try {
          const overridesStr = localStorage.getItem('manifest_theme_overrides');
          if (overridesStr) {
            const overrides = JSON.parse(overridesStr);
            if (overrides[slug]) {
              (data as any).theme = { ...((data as any).theme || {}), ...overrides[slug] };
            }
          }
        } catch(e) {}`;

content = content.replace(oldStr, '');

fs.writeFileSync('src/hooks/useStore.tsx', content);
