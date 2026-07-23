import fs from 'fs';

let invManager = fs.readFileSync('src/pages/InventoryManager.tsx', 'utf8');
invManager = invManager.replace('console.error("Inventory Load Error", catErr, invErr);', 'console.warn("Inventory Load Error (Expected if tables not set up)", catErr?.message, invErr?.message);');
fs.writeFileSync('src/pages/InventoryManager.tsx', invManager);

let catManager = fs.readFileSync('src/pages/CatalogManager.tsx', 'utf8');
catManager = catManager.replace('console.error("Catalog Load Error", error);', 'console.warn("Catalog Load Error (Expected if table not set up)", error?.message);');
fs.writeFileSync('src/pages/CatalogManager.tsx', catManager);

let invDesign = fs.readFileSync('src/pages/InvoiceDesignManager.tsx', 'utf8');
invDesign = invDesign.replace('console.error("Invoice Design Load Error", error);', 'console.warn("Invoice Design Load Error (Expected if table not set up)", error?.message);');
fs.writeFileSync('src/pages/InvoiceDesignManager.tsx', invDesign);
