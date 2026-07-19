import fs from 'fs';
let content = fs.readFileSync('src/pages/Showroom.tsx', 'utf8');

content = content.replace(
  "import { useDeviceState } from '../hooks/useDeviceState';",
  "import { useAuth } from '../hooks/useAuth';"
);

content = content.replace(
  "const { viewMode } = useDeviceState();",
  "const { profile } = useAuth();\n  const viewMode = profile?.role || 'customer';"
);

fs.writeFileSync('src/pages/Showroom.tsx', content);
