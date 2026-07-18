import fs from 'fs';
let content = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');

const oldActions = `              ) : (
                <>
                  <button className="flex-1 bg-[var(--theme-accent)] text-white py-3 rounded-xl font-bold shadow hover:opacity-90 transition-opacity">
                    Add to Invoice
                  </button>
                  {canEdit && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="px-6 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                    >
                      Edit Product
                    </button>
                  )}
                </>
              )}
            </div>`;

const newActions = `              ) : (
                <>
                  <button className="flex-1 bg-[var(--theme-accent)] text-white py-3 rounded-xl font-bold shadow hover:opacity-90 transition-opacity">
                    Add to Invoice
                  </button>
                  {canEdit && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="px-4 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  <button 
                    onClick={onClose}
                    className="px-4 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                </>
              )}
            </div>`;

content = content.replace(oldActions, newActions);
fs.writeFileSync('src/components/ProductDetail.tsx', content);
