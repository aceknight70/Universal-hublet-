import fs from 'fs';
let content = fs.readFileSync('src/pages/StoreRouter.tsx', 'utf8');

// Add supabase import if not there
if (!content.includes("import { supabase }")) {
  content = content.replace("import { Link,", "import { supabase } from '../lib/supabase';\nimport { Link,");
}
if (!content.includes("import React, { useState, useEffect }")) {
  content = content.replace("import React from", "import React, { useState, useEffect } from");
}

// Add state for ads inside StoreContent
const storeContentStart = `function StoreContent() {
  const { client, loading, error } = useStore();
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();`;

const storeContentNew = `function StoreContent() {
  const { client, loading, error } = useStore();
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    if (client?.id) {
      supabase.from('manifest_brand_ads').select('*').eq('client_id', client.id)
        .then(({data}) => {
          if (data) setAds(data);
        });
    }
  }, [client]);`;

content = content.replace(storeContentStart, storeContentNew);


const headerOld = `        <div className="px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <Link to={\`/\${client.slug}\`} className="text-xl font-bold shrink-0" style={{ color: headerTextColor }}>{client.name}</Link>
          <div className="flex items-center space-x-2 md:space-x-4 shrink-0" style={{ borderColor: headerTextColor }}>`;

const headerNew = `        <div className="px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <Link to={\`/\${client.slug}\`} className="text-xl font-bold shrink-0" style={{ color: headerTextColor }}>{client.name}</Link>
          
          <div className="flex-1 flex justify-end items-center gap-2 overflow-x-auto mx-4">
            {ads.map(ad => (
              <a 
                key={ad.id}
                href={ad.cta_link}
                className="flex items-center space-x-2 px-2 py-1.5 rounded bg-black/5 hover:bg-black/10 transition-colors flex-shrink-0"
                style={{ color: headerTextColor }}
                title={ad.description}
              >
                {ad.banner_image_url && (
                  <img src={ad.banner_image_url} alt={ad.brand_name} className="w-8 h-8 rounded object-cover shadow-sm bg-white" />
                )}
                <div className="flex flex-col text-left justify-center">
                  <span className="text-sm font-bold leading-none">{ad.brand_name}</span>
                  {ad.tagline && <span className="text-[10px] opacity-80 leading-tight mt-0.5">{ad.tagline}</span>}
                </div>
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-2 md:space-x-4 shrink-0" style={{ borderColor: headerTextColor }}>`;

content = content.replace(headerOld, headerNew);

fs.writeFileSync('src/pages/StoreRouter.tsx', content);
console.log("StoreRouter updated!");
