import fs from 'fs';
let content = fs.readFileSync('src/pages/StoreRouter.tsx', 'utf8');

const oldHeader = `        <div className="px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
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

const newHeader = `        <div className="px-4 md:px-6 py-3 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2 shrink-0">
            <Link to={\`/\${client.slug}\`} className="text-xl md:text-2xl font-bold" style={{ color: headerTextColor }}>{client.name}</Link>
            
            <div className="flex items-center space-x-2 md:space-x-4" style={{ borderColor: headerTextColor }}>`;

const oldHeaderEnd = `              )}
            </div>
          </div>
        </div>`;

const newHeaderEnd = `              )}
            </div>
          </div>
          
          <div className="flex-1 flex justify-end items-start gap-2 overflow-x-auto">
            {ads.map(ad => (
              <a 
                key={ad.id}
                href={ad.cta_link}
                className="flex items-center space-x-2 px-3 py-2 rounded bg-black/5 hover:bg-black/10 transition-colors flex-shrink-0"
                style={{ color: headerTextColor }}
                title={ad.description}
              >
                {ad.banner_image_url && (
                  <img src={ad.banner_image_url} alt={ad.brand_name} className="w-10 h-10 rounded object-cover shadow-sm bg-white" />
                )}
                <div className="flex flex-col text-left justify-center hidden sm:flex">
                  <span className="text-sm font-bold leading-none">{ad.brand_name}</span>
                  {ad.tagline && <span className="text-[10px] opacity-80 leading-tight mt-0.5">{ad.tagline}</span>}
                </div>
              </a>
            ))}
          </div>
        </div>`;

content = content.replace(oldHeader, newHeader).replace(oldHeaderEnd, newHeaderEnd);

fs.writeFileSync('src/pages/StoreRouter.tsx', content);
console.log("StoreRouter layout updated!");
