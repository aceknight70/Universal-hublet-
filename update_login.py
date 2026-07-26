import re

with open('src/components/Login.tsx', 'r') as f:
    code = f.read()

new_code = code.replace("await login(email, password);", 
"""await login(email, password);
      // DEBUG: Verify auth.uid() is real
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Master Login Success. auth.uid() =", session?.user?.id);""")

# Need to import supabase if not there
if "import { supabase }" not in new_code:
    new_code = new_code.replace("import { useAuth }", "import { supabase } from '../lib/supabase';\nimport { useAuth }")

with open('src/components/Login.tsx', 'w') as f:
    f.write(new_code)
print("Updated Login.tsx")
