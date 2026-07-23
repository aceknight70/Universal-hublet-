import fs from 'fs';
let content = fs.readFileSync('src/pages/MasterRoom.tsx', 'utf8');

// The one I broke was:
//          try {
//            parsed = typeof client.theme === 'string' ? JSON.parse(client.theme) : (client.theme || {});
//          } catch(e) {}

content = content.replace(
  "           parsed = typeof client.theme === 'string' ? JSON.parse(client.theme) : (client.theme || {});\\n            } catch(e) {}",
  "          try {\\n            parsed = typeof client.theme === 'string' ? JSON.parse(client.theme) : (client.theme || {});\\n          } catch(e) {}"
);

// The empty one to remove:
//      // Apply overrides
//      try {
//        
//      setClients(loadedClients);

content = content.replace(
  "// Apply overrides\\n      try {\\n        \\n      setClients(loadedClients);",
  "// Apply overrides\\n      setClients(loadedClients);"
);

// Let's just fix it by script or nano...
