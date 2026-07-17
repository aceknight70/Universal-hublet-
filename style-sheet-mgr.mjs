import fs from 'fs';
let content = fs.readFileSync('src/components/Navigation.tsx', 'utf8');

const oldLink = `{isManager && (
        <Link 
          to={\`/\${clientSlug}/sheet-manager\`}
          className={\`text-sm font-medium whitespace-nowrap \${isSheetManagerActive ? 'font-bold' : ''}\`}
          style={{ color: headerTextColor, opacity: isSheetManagerActive ? 1 : 0.85 }}
        >
          Sheet Manager
        </Link>
      )}`;

const newLink = `{isManager && (
        <Link 
          to={\`/\${clientSlug}/sheet-manager\`}
          className={\`text-sm font-bold whitespace-nowrap px-3 py-1.5 rounded-md border-2 transition-all \${isSheetManagerActive ? 'bg-black/10' : 'hover:bg-black/5'}\`}
          style={{ color: headerTextColor, borderColor: headerTextColor }}
        >
          Sheet Manager
        </Link>
      )}`;

content = content.replace(oldLink, newLink);

fs.writeFileSync('src/components/Navigation.tsx', content);
