// Converte todas as imagens PNG/JPG do projeto para WebP usando sharp
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIRS = ['Realme', 'Honor', 'Motorola', 'Redmi', 'Poco', 'Iphone', 'logo'];
const EXTS = ['.jpg', '.jpeg', '.png'];

let total = 0, converted = 0, skipped = 0;

async function convertDir(dir) {
    const fullDir = path.join(ROOT, dir);
    if (!fs.existsSync(fullDir)) return;
    const files = fs.readdirSync(fullDir);
    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (!EXTS.includes(ext)) continue;
        total++;
        const src = path.join(fullDir, file);
        const dest = path.join(fullDir, path.basename(file, ext) + '.webp');
        if (fs.existsSync(dest)) { skipped++; continue; }
        try {
            await sharp(src).webp({ quality: 82 }).toFile(dest);
            converted++;
            console.log('  ✓', path.join(dir, path.basename(file, ext) + '.webp'));
        } catch (e) {
            console.warn('  ✗', file, ':', e.message);
        }
    }
}

(async () => {
    for (const dir of DIRS) await convertDir(dir);
    console.log(`\nTotal: ${total} | Convertidas: ${converted} | Já existiam: ${skipped}`);
})();
