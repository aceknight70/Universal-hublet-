const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

// replace "Update: any;" with "Update: Partial<Row>;"
content = content.replace(/Update: any;/g, 'Update: Partial<Row>;');
content = content.replace(/Insert: any;/g, 'Insert: Partial<Row>;');

fs.writeFileSync('src/types.ts', content);
