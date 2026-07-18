import fs from 'fs';
let types = fs.readFileSync('src/types.ts', 'utf8');

const imageCols = ['main_image', 'front_image', 'left_image', 'right_image', 'back_image', 'video_url'];
for (const col of imageCols) {
    types = types.replace(new RegExp(`\\s*${col}:\\s*string\\s*\\|\\s*null;\\n`, 'g'), '\n');
}

fs.writeFileSync('src/types.ts', types);
