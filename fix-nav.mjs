import fs from 'fs';
let content = fs.readFileSync('src/components/Navigation.tsx', 'utf8');

// remove sheet manager from managerLinks
content = content.replace(
  "{ name: 'Sheet Manager', path: 'sheet-manager' },",
  ""
);

const isSheetManagerActive = "const isSheetManagerActive = currentPath === 'sheet-manager';\n";
content = content.replace(
  "const NavGroup =",
  isSheetManagerActive + "  const NavGroup ="
);

const sheetManagerLink = `
      {isManager && (
        <Link 
          to={\`/\${clientSlug}/sheet-manager\`}
          className={\`text-sm font-medium whitespace-nowrap \${isSheetManagerActive ? 'font-bold' : ''}\`}
          style={{ color: headerTextColor, opacity: isSheetManagerActive ? 1 : 0.85 }}
        >
          Sheet Manager
        </Link>
      )}
`;

content = content.replace(
  "{isManager && <NavGroup title=\"Manager Modules\" links={managerLinks} isHighlighted={viewMode === 'manager'} />}",
  "{isManager && <NavGroup title=\"Manager Modules\" links={managerLinks} isHighlighted={viewMode === 'manager' && !isSheetManagerActive} />}" + sheetManagerLink
);

fs.writeFileSync('src/components/Navigation.tsx', content);
