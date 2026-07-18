import fs from 'fs';
let content = fs.readFileSync('src/pages/SheetManager.tsx', 'utf8');

// 1. Add state for message
if (!content.includes('const [message, setMessage]')) {
  content = content.replace(
    "const [progress, setProgress] = useState(0);",
    "const [progress, setProgress] = useState(0);\n  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);"
  );
}

// 2. Replace alert with setMessage
content = content.replace(
  "      alert('Import successful!');",
  "      setMessage({ type: 'success', text: `Successfully imported ${validRows.length} products.` });"
);

content = content.replace(
  "      alert(`Error during import: ${err.message}`);",
  "      setMessage({ type: 'error', text: `Error during import: ${err.message}` });"
);

// 3. Clear message on new paste
content = content.replace(
  "  const handleParse = () => {",
  "  const handleParse = () => {\n    setMessage(null);"
);

// 4. Render the message
const renderMessage = `
      {message && (
        <div className={\`px-4 py-3 rounded mb-6 \${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}\`}>
          <strong>{message.type === 'success' ? 'Success: ' : 'Error: '}</strong> {message.text}
        </div>
      )}
      <div className="mb-6">
`;

content = content.replace(
  '      <div className="mb-6">',
  renderMessage
);

fs.writeFileSync('src/pages/SheetManager.tsx', content);
