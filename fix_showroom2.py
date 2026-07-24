import re

with open('src/pages/Showroom.tsx', 'r') as f:
    code = f.read()

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
      setLoading(true);
      // Load assigned brands
      const { data: brandLinks } = await supabase
""", replacement.strip())

with open('src/pages/Showroom.tsx', 'w') as f:
    f.write(code)
print("Updated Showroom loadData")
