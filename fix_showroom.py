import re

with open('src/pages/Showroom.tsx', 'r') as f:
    code = f.read()

# I need to fetch exclusions.
replacement = """
    async function loadData() {
      if (!client?.id) return;
      setLoading(true);

      const { data: exclusions } = await supabase.from('manifest_brand_exclusions').select('brand_name').eq('client_id', client.id);
      const excludedBrandNames = new Set((exclusions || []).map((e: any) => e.brand_name));

      const { data: brandLinks } = await supabase
"""

code = code.replace("""
    async function loadData() {
      if (!client?.id) return;
      setLoading(true);

      const { data: brandLinks } = await supabase
""", replacement)

# Now filter the parsed brands
filter_old = "const parsedBrands = brandLinks.filter((bl: any) => !bl.manifest_brands.exclusive_to_client_id || bl.manifest_brands.exclusive_to_client_id === client.id).map((bl: any) => ({"
filter_new = "const parsedBrands = brandLinks.filter((bl: any) => (!bl.manifest_brands.exclusive_to_client_id || bl.manifest_brands.exclusive_to_client_id === client.id) && !excludedBrandNames.has(bl.manifest_brands.name)).map((bl: any) => ({"

code = code.replace(filter_old, filter_new)

with open('src/pages/Showroom.tsx', 'w') as f:
    f.write(code)
print("Updated Showroom")
