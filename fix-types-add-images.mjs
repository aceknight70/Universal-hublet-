import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf8');

const imageType = `      manifest_product_images: {
        Row: {
          id: string;
          product_id: string;
          slot: string;
          image_url: string;
          created_at: string;
        };
        Insert: any;
        Update: any;
      };
      manifest_photo_inbox: {`;

content = content.replace(/      manifest_photo_inbox: \{/g, imageType);
fs.writeFileSync('src/types.ts', content);
