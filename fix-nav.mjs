import fs from 'fs';
let content = fs.readFileSync('src/components/Navigation.tsx', 'utf8');

const oldNavGroup = `  const NavGroup = ({ title, links, isHighlighted = false }: { title: string, links: any[], isHighlighted?: boolean }) => {
    return (
      <div className="relative group inline-block">
        <button 
          className={\`text-sm font-medium flex items-center space-x-1 whitespace-nowrap \${isHighlighted ? 'font-bold' : ''}\`}
          style={{ color: headerTextColor, opacity: isHighlighted ? 1 : 0.85 }}
        >
          <span>{title}</span>
          <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
          {links.map(link => {
            const isActive = currentPath === link.path || (currentPath === clientSlug && link.path === '');
            return (
              <Link 
                key={link.path}
                to={\`/\${clientSlug}/\${link.path}\`}
                className={\`block px-4 py-2 text-sm \${isActive ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}\`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    );
  };`;

const newNavGroup = `  const NavGroup = ({ title, links, isHighlighted = false }: { title: string, links: any[], isHighlighted?: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="relative inline-block" onMouseLeave={() => setIsOpen(false)}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={\`text-sm font-medium flex items-center space-x-1 whitespace-nowrap \${isHighlighted ? 'font-bold' : ''}\`}
          style={{ color: headerTextColor, opacity: isHighlighted ? 1 : 0.85 }}
        >
          <span>{title}</span>
          <svg className={\`w-4 h-4 opacity-70 transition-transform \${isOpen ? 'rotate-180' : ''}\`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {isOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg transition-all z-50 overflow-hidden">
            {links.map(link => {
              const isActive = currentPath === link.path || (currentPath === clientSlug && link.path === '');
              return (
                <Link 
                  key={link.path}
                  onClick={() => setIsOpen(false)}
                  to={\`/\${clientSlug}/\${link.path}\`}
                  className={\`block px-4 py-2 text-sm \${isActive ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}\`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };`;

content = content.replace(oldNavGroup, newNavGroup);
fs.writeFileSync('src/components/Navigation.tsx', content);
