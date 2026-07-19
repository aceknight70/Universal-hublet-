import fs from 'fs';
let content = fs.readFileSync('src/pages/SpotlightManager.tsx', 'utf8');

const oldSave = `  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!client) return;
    setSaving(true);
    
    // In a real app we might allow multiple, but the prompt says "which business appears in which store's spotlight slot", implies 1 per store.
    // Let's just create or update the first one.
    const existing = ads.length > 0 ? ads[0] : null;
    
    const { data, error } = await supabase.from('manifest_brand_ads').upsert({
      id: existing ? existing.id : undefined,
      client_id: client.id,
      brand_name: form.brand_name,
      tagline: form.tagline,
      description: form.description,
      cta_link: form.cta_link,
      banner_image_url: form.banner_image_url
    }).select();`;

const newSave = `  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!client) return;
    setSaving(true);
    
    const { data, error } = await supabase.from('manifest_brand_ads').insert({
      client_id: client.id,
      brand_name: form.brand_name,
      tagline: form.tagline,
      description: form.description,
      cta_link: form.cta_link,
      banner_image_url: form.banner_image_url
    }).select();`;

content = content.replace(oldSave, newSave);

fs.writeFileSync('src/pages/SpotlightManager.tsx', content);
console.log("SpotlightManager updated");
