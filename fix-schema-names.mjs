import fs from 'fs';

// 1. Update SheetManager.tsx
let sheet = fs.readFileSync('src/pages/SheetManager.tsx', 'utf8');

sheet = sheet.replace(
  "assurance_layer: assuranceYesNo === 'yes',",
  "assurance_yn: assuranceYesNo === 'yes',"
);

sheet = sheet.replace(
  "laggard_layer: laggardYesNo === 'yes',",
  "laggard_yn: laggardYesNo === 'yes',"
);

sheet = sheet.replace(
  "specs: row['Technical Specs (Full)'] || null,",
  "technical_specs: row['Technical Specs (Full)'] || null,"
);

fs.writeFileSync('src/pages/SheetManager.tsx', sheet);

// 2. Update types.ts
let types = fs.readFileSync('src/types.ts', 'utf8');

types = types.replace("specs: any | null;", "technical_specs: any | null;");
types = types.replace("assurance_layer: boolean;", "assurance_yn: boolean;");
types = types.replace("laggard_layer: boolean;", "laggard_yn: boolean;");

fs.writeFileSync('src/types.ts', types);

// 3. Update ProductDetail.tsx ?
// Let's check ProductDetail.tsx too, maybe it uses the old names.
let detail = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');
detail = detail.replace(/assurance_layer/g, 'assurance_yn');
detail = detail.replace(/laggard_layer/g, 'laggard_yn');
detail = detail.replace(/specs/g, 'technical_specs');

fs.writeFileSync('src/components/ProductDetail.tsx', detail);

