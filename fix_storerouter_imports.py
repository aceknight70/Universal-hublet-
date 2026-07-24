import re

with open('src/pages/StoreRouter.tsx', 'r') as f:
    code = f.read()

imports_to_add = """
import { ManagerRoom } from '../pages/ManagerRoom';
import { BrandManager } from '../pages/BrandManager';
import { InvoiceDesignManager } from '../pages/InvoiceDesignManager';
"""

# Check if they already exist, otherwise add them after the last import
if "import { ManagerRoom }" not in code:
    code = re.sub(r'(import .*?;)', r'\1' + imports_to_add, code, count=1)

with open('src/pages/StoreRouter.tsx', 'w') as f:
    f.write(code)
print("Added missing imports to StoreRouter")
