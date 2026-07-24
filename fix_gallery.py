import re

with open('src/pages/Gallery.tsx', 'r') as f:
    code = f.read()

code = code.replace("'Adane House Featured Item'", "`${client?.name || 'Store'} Featured Item`")
code = code.replace("Adane House Gallery", "{client?.name || 'Store'} Gallery")
code = code.replace("Adane House Official Gallery", "{client?.name || 'Store'} Official Gallery")
code = code.replace("Adane House Store", "{client?.name || 'Store'} Store")
code = code.replace("Adane House Product Showcase", "{client?.name || 'Store'} Product Showcase")
code = code.replace("Adane House QLED 4K TV 65\"", "Premium QLED 4K TV 65\\\"")
code = code.replace("Adane House Premium Soundbar 5.1", "Premium Soundbar 5.1")

with open('src/pages/Gallery.tsx', 'w') as f:
    f.write(code)
print("Updated Gallery")
