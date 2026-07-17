import fs from 'fs';
let content = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');

// Ensure video_url is also deleted
if (!content.includes('delete (finalProduct as any).video_url')) {
    content = content.replace(
        "delete (finalProduct as any).back_image;",
        "delete (finalProduct as any).back_image;\n    delete (finalProduct as any).video_url;"
    );
    fs.writeFileSync('src/components/ProductDetail.tsx', content);
}
