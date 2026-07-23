import fs from 'fs';
let content = fs.readFileSync('src/pages/MasterRoom.tsx', 'utf8');

content = content.replace("     // Apply overrides\\n      setClients(loadedClients);\\n    load();\\n  }, []);", "     // Apply overrides\\n      setClients(loadedClients);\\n    }\\n    load();\\n  }, []);");

fs.writeFileSync('src/pages/MasterRoom.tsx', content);
