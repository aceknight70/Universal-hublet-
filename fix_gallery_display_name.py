import re

with open('src/pages/Gallery.tsx', 'r') as f:
    code = f.read()

# I will replace `${client?.name || 'Store'}` with `${getDisplayName() || 'Store'}`

code = code.replace("const isStaff = profile?.role === 'staff' || profile?.role === 'manager' || profile?.role === 'master';",
"""const isStaff = profile?.role === 'staff' || profile?.role === 'manager' || profile?.role === 'master';
  
  const getDisplayName = () => {
    if (!client) return 'Store';
    let themeObj = client.theme as any;
    if (typeof themeObj === 'string') {
      try { themeObj = JSON.parse(themeObj); } catch(e) { themeObj = {}; }
    }
    return themeObj?.display_name || client.name;
  };""")

code = code.replace("${client?.name || 'Store'}", "${getDisplayName()}")
code = code.replace("{client?.name || 'Store'}", "{getDisplayName()}")

with open('src/pages/Gallery.tsx', 'w') as f:
    f.write(code)
print("Updated Gallery display_name")
