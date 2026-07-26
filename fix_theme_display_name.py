import re

with open('src/pages/MasterRoom.tsx', 'r') as f:
    code = f.read()

display_name_html = """                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Business Display Name</label>
                   <input
                     type="text"
                     className="mt-1 block w-full pl-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md border"
                     placeholder="E.g., Adane House Electronics"
                     value={themeDraft.display_name || ''}
                     onChange={e => setThemeDraft({...themeDraft, display_name: e.target.value})}
                   />
                 </div>
"""

# We'll insert it right before the "Accent Color" div
code = code.replace("""                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>""", display_name_html + """                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>""")

with open('src/pages/MasterRoom.tsx', 'w') as f:
    f.write(code)
print("Added display_name to ThemeEditor")
