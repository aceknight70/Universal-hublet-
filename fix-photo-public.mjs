import fs from 'fs';
let content = fs.readFileSync('src/pages/PhotoMatchingBay.tsx', 'utf8');

content = content.replace(
    /const folder = client\?\.id\?\.includes\('fallback'\) \? '00000000-0000-0000-0000-000000000000' : \(client\?\.id \|\| 'public'\);/g,
    "const folder = client?.id?.includes('fallback') ? '00000000-0000-0000-0000-000000000000' : (client?.id || '00000000-0000-0000-0000-000000000000');"
);

// Also fix the public URL fetch if it's relying on client.id being present
content = content.replace(
    /getPublicUrl\(\`\$\{client\?\.id\}\/\$\{photo\.name\}\`\)/g,
    "getPublicUrl(`${client?.id || '00000000-0000-0000-0000-000000000000'}/${photo.name}`)"
);

fs.writeFileSync('src/pages/PhotoMatchingBay.tsx', content);
