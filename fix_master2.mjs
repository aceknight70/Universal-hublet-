import fs from 'fs';
let content = fs.readFileSync('src/pages/MasterRoom.tsx', 'utf8');

// replace:
//   parsed = typeof client.theme === 'string' ? JSON.parse(client.theme) : (client.theme || {});
// } catch(e) {}
// with:
//   try { parsed = typeof client.theme === 'string' ? JSON.parse(client.theme) : (client.theme || {}); } catch(e) {}

content = content.replace(
  /parsed = typeof client\.theme === 'string' \? JSON\.parse\(client\.theme\) : \(client\.theme \|\| \{\}\);\s*\} catch\(e\) \{\}/g,
  "try { parsed = typeof client.theme === 'string' ? JSON.parse(client.theme) : (client.theme || {}); } catch(e) {}"
);

// also remove any stray catch
// Wait, the stray catch was around line 184. Let's find it.
//        setClients(loadedClients);
//      }
//      load();

content = content.replace(/ \/\/ Apply overrides\s*setClients\(loadedClients\);\s*\}/g, "// Apply overrides\n      setClients(loadedClients);");

fs.writeFileSync('src/pages/MasterRoom.tsx', content);
