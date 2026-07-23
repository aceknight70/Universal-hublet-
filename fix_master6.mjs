import fs from 'fs';
let content = fs.readFileSync('src/pages/MasterRoom.tsx', 'utf8');

// The `loadStore` or `load` function doesn't have a closing brace for the function itself.
// Let's just fix it automatically.
const fixStr = "      setClients(loadedClients);\\n      load();\\n    }, []);";
content = content.replace("      setClients(loadedClients);\\n      load();\\n    }, []);", "      setClients(loadedClients);\\n    }\\n    load();\\n  }, []);");

// Wait, let's just do a regex replace or nano.
fs.writeFileSync('src/pages/MasterRoom.tsx', content);
