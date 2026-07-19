import fs from 'fs';
let content = fs.readFileSync('src/pages/StoreRouter.tsx', 'utf8');

const wrongCode = `              )}
            </div>
          </div>
          
          <div className="flex-1 flex justify-end items-start gap-2 overflow-x-auto">`;

const rightCode = `              )}
            </div>
          </div>
          </div>
          
          <div className="flex-1 flex justify-end items-start gap-2 overflow-x-auto">`;

content = content.replace(wrongCode, rightCode);

fs.writeFileSync('src/pages/StoreRouter.tsx', content);
console.log("StoreRouter fixed missing div close!");
