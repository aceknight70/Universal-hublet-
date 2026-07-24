const fs = require('fs');
let code = fs.readFileSync('src/pages/MasterRoom.tsx', 'utf8');

// Find the nested DomainSkinControl and extract it
const domainStart = code.indexOf('function DomainSkinControl');
const firstPart = code.substring(0, domainStart);
let rest = code.substring(domainStart);

// We know DomainSkinControl ends at `  );\n}\n`
const domainEndMatch = rest.match(/  \);\n\}\n/);
const domainEndIndex = domainEndMatch.index + domainEndMatch[0].length;

const domainSkinControlCode = rest.substring(0, domainEndIndex);
const remainingCode = rest.substring(domainEndIndex);

// Reassemble
const newCode = firstPart.replace('function WatermarkEditor', domainSkinControlCode + '\n\nfunction WatermarkEditor') + remainingCode;

fs.writeFileSync('src/pages/MasterRoom.tsx', newCode);
