import re

with open('src/pages/MasterRoom.tsx', 'r') as f:
    code = f.read()

# the preview says {clients.find(c => c.id === selectedClientId)?.name || 'Store Name'}
code = code.replace("""{clients.find(c => c.id === selectedClientId)?.name || 'Store Name'}""", """{themeDraft.display_name || clients.find(c => c.id === selectedClientId)?.name || 'Store Name'}""")

with open('src/pages/MasterRoom.tsx', 'w') as f:
    f.write(code)
print("Updated ThemeEditor preview")
