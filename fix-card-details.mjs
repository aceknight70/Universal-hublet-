import fs from 'fs';
let card = fs.readFileSync('src/components/ProductCard.tsx', 'utf8');

card = card.replace(/product\.main_image/g, "(product as any).main_image");

fs.writeFileSync('src/components/ProductCard.tsx', card);

let detail = fs.readFileSync('src/components/ProductDetail.tsx', 'utf8');
detail = detail.replace(/product\.main_image/g, "(product as any).main_image");
detail = detail.replace(/product\.front_image/g, "(product as any).front_image");
detail = detail.replace(/product\.left_image/g, "(product as any).left_image");
detail = detail.replace(/product\.right_image/g, "(product as any).right_image");
detail = detail.replace(/product\.back_image/g, "(product as any).back_image");
detail = detail.replace(/product\.video_url/g, "(product as any).video_url");
detail = detail.replace(/product\.extra_details/g, "(product as any).extra_details");
fs.writeFileSync('src/components/ProductDetail.tsx', detail);

