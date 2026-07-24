import re

with open('src/pages/InventoryManager.tsx', 'r') as f:
    code = f.read()

replacement = """
    async function loadData() {
      if (!client?.id) return;
      setLoading(true);

      const { data: exclusions } = await supabase.from('manifest_brand_exclusions').select('brand_name').eq('client_id', client.id);
      const excludedBrandNames = new Set((exclusions || []).map((e: any) => e.brand_name));

      const [catRes, invRes] = await Promise.all([
        supabase.from('manifest_catalog').select('*').or(`exclusive_to_client_id.is.null,exclusive_to_client_id.eq.${client?.id}`).order('name'),
        supabase.from('manifest_inventory').select('*').eq('client_id', client?.id)
      ]);
"""

code = code.replace("""
    async function loadData() {
      setLoading(true);
      const [catRes, invRes] = await Promise.all([
        supabase.from('manifest_catalog').select('*').or(`exclusive_to_client_id.is.null,exclusive_to_client_id.eq.${client?.id}`).order('name'),
        supabase.from('manifest_inventory').select('*').eq('client_id', client?.id)
      ]);
""", replacement)

# Filter catalog
filter_cat_old = "if (!catRes.error && catRes.data) setCatalog(catRes.data);"
filter_cat_new = "if (!catRes.error && catRes.data) setCatalog(catRes.data.filter((item: any) => !excludedBrandNames.has(item.brand)));"
code = code.replace(filter_cat_old, filter_cat_new)

with open('src/pages/InventoryManager.tsx', 'w') as f:
    f.write(code)
print("Updated InventoryManager")
