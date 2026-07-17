import fs from 'fs';
let content = fs.readFileSync('src/pages/StoreRouter.tsx', 'utf8');

const startIdx = content.indexOf('<header');
const endIdx = content.indexOf('</header>') + 9;

const newHeader = `<header 
        className="shadow-sm flex flex-col"
        style={{ backgroundColor: headerBackgroundColor }}
      >
        <div className="px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <Link to={\`/\${client.slug}\`} className="text-xl font-bold shrink-0" style={{ color: headerTextColor }}>{client.name}</Link>
          <div className="flex items-center space-x-2 md:space-x-4 shrink-0" style={{ borderColor: headerTextColor }}>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider hidden md:inline-block" style={{ color: headerTextColor, opacity: 0.6 }}>Store:</span>
              <select 
                value={client.slug}
                onChange={e => {
                  window.location.href = \`/\${e.target.value}\`;
                }}
                className="text-xs border border-white border-opacity-20 rounded p-1 bg-transparent max-w-[100px] md:max-w-none"
                style={{ color: headerTextColor }}
              >
                <option value="ugomenz" className="text-black">Ugomenz</option>
                <option value="o-frank" className="text-black">O Frank</option>
                <option value="allsufficiency" className="text-black">AllSufficiency</option>
                <option value="linz" className="text-black">Linz</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 md:border-l md:pl-4 border-opacity-20" style={{ borderColor: headerTextColor }}>
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold uppercase px-2 py-1 bg-black bg-opacity-10 rounded" style={{ color: headerTextColor }}>
                    {profile?.role || 'No Role'}
                  </span>
                  <button 
                    onClick={() => logout().then(() => navigate(\`/\${client.slug}\`))}
                    className="text-xs border border-white border-opacity-20 rounded px-2 py-1 hover:bg-black hover:bg-opacity-5"
                    style={{ color: headerTextColor }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  to={\`/\${client.slug}/login\`}
                  className="text-xs border border-white border-opacity-20 rounded px-3 py-1 hover:bg-black hover:bg-opacity-5"
                  style={{ color: headerTextColor }}
                >
                  Staff Login
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Navigation Row */}
        <div className="px-4 md:px-6 pb-3 pt-1 overflow-x-auto scrollbar-hide border-t border-black/5 w-full">
          <StoreNavigation clientSlug={client.slug} viewMode={viewMode} headerTextColor={headerTextColor} />
        </div>
      </header>`;

content = content.substring(0, startIdx) + newHeader + content.substring(endIdx);

fs.writeFileSync('src/pages/StoreRouter.tsx', content);
