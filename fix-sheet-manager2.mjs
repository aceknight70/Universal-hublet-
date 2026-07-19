import fs from 'fs';
let content = fs.readFileSync('src/pages/SheetManager.tsx', 'utf8');

const matchStart = '  return (\\n    <div className="p-6 max-w-6xl mx-auto">';
const matchEnd = '{parsedRows.length > 0 && (';

const re = new RegExp('  return \\(\\[\\\\s\\\\S]*?(?={parsedRows\\.length > 0 && \\()');
const match = content.match(/  return \([\s\S]*?(?=\{parsedRows\.length > 0 && \()/);

if (match) {
  content = content.replace(match[0], `  return (
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded mb-4 text-sm shrink-0">
        <strong>Sheet Manager</strong> • View your current catalog or paste a new list to bulk import/update.
      </div>
      {message && (
        <div className={\`px-4 py-3 rounded mb-4 shrink-0 \${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}\`}>
          <strong>{message.type === 'success' ? 'Success: ' : 'Error: '}</strong> {message.text}
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left Panel: Current Catalog */}
        <div className="w-full lg:w-1/3 flex flex-col bg-white rounded shadow-sm border overflow-hidden shrink-0 h-[45vh] lg:h-full min-h-[400px] lg:min-h-0">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-gray-800">Current Catalog</h3>
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-bold">
              {catalog.length} Products
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-0">
            {loadingCatalog ? (
              <div className="p-8 text-center text-gray-400">Loading catalog...</div>
            ) : catalog.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No products found. Add some!</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-white sticky top-0 border-b z-10">
                  <tr>
                    <th className="p-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Code</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-gray-500 font-semibold">Product</th>
                    <th className="p-3 text-xs uppercase tracking-wider text-gray-500 font-semibold text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {catalog.map((prod, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs text-gray-600">{prod.code}</td>
                      <td className="p-3">
                        <div className="font-medium text-gray-900 line-clamp-1">{prod.name}</div>
                      </td>
                      <td className="p-3 text-right text-gray-700">
                        ₦{prod.price?.toLocaleString() || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        {/* Right Panel: Add New Rows */}
        <div className="w-full lg:w-2/3 flex flex-col h-[60vh] lg:h-full min-h-[500px] lg:min-h-0">
          <div className="bg-white rounded shadow-sm border overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-800">Add New Rows</h3>
              <p className="text-xs text-gray-500 mt-1">Paste from Excel/Sheets. Existing codes will UPDATE, new codes will INSERT.</p>
            </div>
            <div className="p-4 flex flex-col flex-1 min-h-0">
              <textarea
                className="w-full flex-1 border rounded-lg p-4 text-sm font-mono focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent outline-none resize-none mb-4"
                placeholder="Paste your product list here (CSV/TSV format from Excel/Sheets)..."
                value={pasteData}
                onChange={e => setPasteData(e.target.value)}
              />
              <button
                onClick={handleParse}
                disabled={!pasteData.trim()}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-bold shadow hover:bg-gray-700 disabled:opacity-50 shrink-0"
              >
                Preview Import
              </button>
            </div>
          </div>
        </div>
      </div>
      
      `);
}

// Fix the syntax error from earlier
content = content.replace(
  '{parsedRows.length > 0 && (\n        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/60 backdrop-blur-sm">\n          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative">',
  '{parsedRows.length > 0 && (\n        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/60 backdrop-blur-sm">\n          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative">'
);

// We need an extra </div> to close the fixed inset div
content = content.replace(
  '            <div className="p-4 bg-gray-50 border-t flex justify-end">\n              <button onClick={() => setParsedRows([])} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">Cancel</button>\n            </div>\n          </div>\n        </div>\n      )}\n    </div>\n  );\n}',
  '            <div className="p-4 bg-gray-50 border-t flex justify-end">\n              <button onClick={() => setParsedRows([])} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">Cancel</button>\n            </div>\n          </div>\n          </div>\n        </div>\n      )}\n    </div>\n  );\n}'
);

fs.writeFileSync('src/pages/SheetManager.tsx', content);
console.log("Sheet Manager UI updated and syntax fixed!");
