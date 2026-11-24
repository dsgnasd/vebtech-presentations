// Фактуры для сот: фото Unsplash → квадрат, дуотон в фирменной гамме → data URI в бандле.
// Исходники: assets-src/textures/orig/*.jpg (Unsplash License), результат: assets-src/textures/*.webp
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
export const TEXTURES = [
  { id: 'facade', title: 'Стеклянный фасад', author: 'Héctor J. Rivas', url: 'https://unsplash.com/photos/1FxMET2U5dU' },
  { id: 'circuit', title: 'Печатная плата', author: 'Vishnu Mohanan', url: 'https://unsplash.com/photos/pfR18JNEMv8' },
  { id: 'server', title: 'Серверная стойка', author: 'Tyler (@tylergm)', url: 'https://unsplash.com/photos/eqd0f78u9nI' },
  { id: 'fiber', title: 'Оптоволоконный кросс', author: 'Albert Stoynov', url: 'https://unsplash.com/photos/yhJVLxcquEY' },
  { id: 'ceiling', title: 'Потолок терминала', author: 'Claudio Mezzasalma', url: 'https://unsplash.com/photos/1qZ94JesPi4' },
  { id: 'code', title: 'Код на экране', author: 'Chris Ried', url: 'https://unsplash.com/photos/ieic5Tq8YMk' },
  { id: 'lights', title: 'Световые линии', author: 'Mark Denton', url: 'https://unsplash.com/photos/hBOYcQqGvUw' },
  { id: 'cables', title: 'Сетевые кабели', author: 'Scott Rodgerson', url: 'https://unsplash.com/photos/PSpf_XgOM5w' },
  { id: 'glass', title: 'Стеклянная стена', author: 'Christian Ladewig', url: 'https://unsplash.com/photos/T0iFfJw-rB0' },
  { id: 'grid', title: 'Сетчатый свод', author: 'R M', url: 'https://unsplash.com/photos/hPPfYLRuBvU' },
  { id: 'tunnel', title: 'Шестиугольный тоннель', author: 'drmakete lab', url: 'https://unsplash.com/photos/hsg538WrP0Y' },
];
// Дуотон: тени → brand-900 #142C66, света → brand-100 #E6EEFF (через brand #3B79FF в середине)
const py = `
import sys, io, base64
from PIL import Image, ImageOps
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('L')
s = min(im.size); im = im.crop(((im.width - s)//2, (im.height - s)//2, (im.width + s)//2, (im.height + s)//2)).resize((320, 320), Image.LANCZOS)
im = ImageOps.autocontrast(im, cutoff=1)
im = ImageOps.colorize(im, black='#142C66', mid='#3B79FF', white='#E6EEFF', blackpoint=0, midpoint=140, whitepoint=255)
im.save(dst, 'WEBP', quality=80)
print(base64.b64encode(open(dst, 'rb').read()).decode())`;
fs.mkdirSync('assets-src/textures', { recursive: true });
const out = {};
for (const t of TEXTURES) {
  const b64 = execFileSync('python3', ['-c', py, `assets-src/textures/orig/${t.id}.jpg`, `assets-src/textures/${t.id}.webp`]).toString().trim();
  out[t.id] = 'data:image/webp;base64,' + b64;
}
fs.writeFileSync('src/textures.generated.js', `// СГЕНЕРИРОВАНО src/gen-textures.mjs — не править руками.\nexport const TEXTURES = ${JSON.stringify(out)};\nexport const TEXTURE_CREDITS = ${JSON.stringify(TEXTURES)};\n`);
console.log('textures', TEXTURES.length, Math.round(fs.statSync('src/textures.generated.js').size / 1024) + ' KB');
