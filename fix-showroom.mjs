import fs from 'fs';
let content = fs.readFileSync('src/pages/Showroom.tsx', 'utf8');

// Remove spotlight state
content = content.replace(
  '  const [categories, setCategories] = useState<string[]>([]);\n  const [spotlightAd, setSpotlightAd] = useState<any>(null);',
  '  const [categories, setCategories] = useState<string[]>([]);'
);

// Remove fetch from loadData
const loadDataOld = `      // Load spotlight ad
      const { data: adData } = await supabase.from('manifest_brand_ads').select('*').eq('client_id', client.id).limit(1);
      if (adData && adData.length > 0) {
        setSpotlightAd(adData[0]);
      } else {
        setSpotlightAd(null);
      }
      
      if (brandLinks && brandLinks.length > 0) {`;
const loadDataNew = `      if (brandLinks && brandLinks.length > 0) {`;
content = content.replace(loadDataOld, loadDataNew);

// Remove UI from header
const oldUI = `    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-blue-50 text-blue-800 px-4 py-2 text-sm font-medium flex justify-between items-center relative min-h-[48px]">
        <span className="flex-1">Showroom • Browse brands and categories.</span>
        
        <div className="flex items-center space-x-4">
          {spotlightAd && (
            <a 
              href={spotlightAd.cta_link}
              className="flex items-center space-x-2 bg-white px-3 py-1 rounded shadow-sm hover:shadow hover:-translate-y-0.5 transition-all"
            >
              {spotlightAd.banner_image_url && (
                <img src={spotlightAd.banner_image_url} alt={spotlightAd.brand_name} className="w-6 h-6 rounded object-cover" />
              )}
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight text-gray-900">{spotlightAd.brand_name}</span>
                {spotlightAd.tagline && <span className="text-[10px] text-gray-500 leading-tight">{spotlightAd.tagline}</span>}
              </div>
            </a>
          )}

          {['staff', 'manager', 'master'].includes(viewMode) && (
            <button 
              onClick={() => setIsCreating(true)}
              className="flex items-center text-xs bg-white text-blue-800 px-2 py-1.5 rounded shadow-sm hover:bg-blue-100 flex-shrink-0"
            >
              <Plus className="w-3 h-3 mr-1" /> New Product
            </button>
          )}
        </div>
      </div>`;

const newUI = `    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-blue-50 text-blue-800 px-4 py-2 text-sm text-center font-medium flex justify-between items-center">
        <span>Showroom • Browse brands and categories.</span>
        {['staff', 'manager', 'master'].includes(viewMode) && (
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center text-xs bg-white text-blue-800 px-2 py-1 rounded shadow-sm hover:bg-blue-100"
          >
            <Plus className="w-3 h-3 mr-1" /> New Product
          </button>
        )}
      </div>`;

content = content.replace(oldUI, newUI);

fs.writeFileSync('src/pages/Showroom.tsx', content);
console.log("Showroom cleaned!");
