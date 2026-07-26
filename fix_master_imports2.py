with open('src/pages/MasterRoom.tsx', 'r') as f:
    code = f.read()

old_import = "import { Settings, Upload, Loader2, Image as ImageIcon } from 'lucide-react';"
new_import = "import { Settings, Upload, Loader2, Image as ImageIcon, Copy, Check } from 'lucide-react';"

code = code.replace(old_import, new_import)

with open('src/pages/MasterRoom.tsx', 'w') as f:
    f.write(code)
