import re

with open('src/pages/StoreRouter.tsx', 'r') as f:
    code = f.read()

# Replace header text with logo if available
old_link = "<Link to={`/`} className=\"text-xl md:text-2xl font-bold\" style={{ color: headerTextColor }}>{client.name}</Link>"
new_link = """<Link to={`/`} className="text-xl md:text-2xl font-bold flex items-center gap-3" style={{ color: headerTextColor }}>
              {themeObj.logo_url ? (
                <img src={themeObj.logo_url} alt={client.name} className="h-10 object-contain" />
              ) : null}
              {(!themeObj.logo_url || themeObj.show_name_with_logo !== false) ? client.name : ''}
            </Link>"""

code = code.replace(old_link, new_link)

# Replace "Official Adane House Hublet" with generic
old_badge = "Official Adane House Hublet"
new_badge = "Official {client.name} Hublet"
code = code.replace(old_badge, new_badge)

with open('src/pages/StoreRouter.tsx', 'w') as f:
    f.write(code)
print("Updated StoreRouter")
