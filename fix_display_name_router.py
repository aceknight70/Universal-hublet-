import re

with open('src/pages/StoreRouter.tsx', 'r') as f:
    code = f.read()

# Replace client.name with (themeObj.display_name || client.name) inside the header
old_link = """            <Link to={`/`} className="text-xl md:text-2xl font-bold flex items-center gap-3" style={{ color: headerTextColor }}>
              {themeObj.logo_url ? (
                <img src={themeObj.logo_url} alt={client.name} className="h-10 object-contain" />
              ) : null}
              {(!themeObj.logo_url || themeObj.show_name_with_logo !== false) ? client.name : ''}
            </Link>"""

new_link = """            <Link to={`/`} className="text-xl md:text-2xl font-bold flex items-center gap-3" style={{ color: headerTextColor }}>
              {themeObj.logo_url ? (
                <img src={themeObj.logo_url} alt={themeObj.display_name || client.name} className="h-10 object-contain" />
              ) : null}
              {(!themeObj.logo_url || themeObj.show_name_with_logo !== false) ? (themeObj.display_name || client.name) : ''}
            </Link>"""

code = code.replace(old_link, new_link)

# Replace "Official {client.name} Hublet"
old_badge = """<span className="text-xs uppercase tracking-wider font-semibold opacity-90 px-2 py-0.5 rounded border border-white/20" style={{ color: headerTextColor }}>
                Official {client.name} Hublet
              </span>"""

new_badge = """<span className="text-xs uppercase tracking-wider font-semibold opacity-90 px-2 py-0.5 rounded border border-white/20" style={{ color: headerTextColor }}>
                Official {themeObj.display_name || client.name} Hublet
              </span>"""

code = code.replace(old_badge, new_badge)

with open('src/pages/StoreRouter.tsx', 'w') as f:
    f.write(code)
print("Updated StoreRouter display_name")
