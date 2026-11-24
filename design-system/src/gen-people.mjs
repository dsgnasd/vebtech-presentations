// Фото-примеры сотрудников → data URI в бандле (работают в превью, шаблонах и презентациях без сети).
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const PEOPLE = [
  { id: 'aleksey-orlov', name: 'Алексей Орлов', role: 'Генеральный директор' },
  { id: 'maria-kozlova', name: 'Мария Козлова', role: 'Технический директор' },
  { id: 'ilya-petrov', name: 'Илья Петров', role: 'Коммерческий директор' },
  { id: 'anna-smirnova', name: 'Анна Смирнова', role: 'Директор по продукту' },
];
const py = `
import sys, io, base64
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGB').resize((320, 320), Image.LANCZOS)
b = io.BytesIO(); im.save(b, 'WEBP', quality=78); print(base64.b64encode(b.getvalue()).decode())`;
const out = PEOPLE.map((p) => ({ ...p, photo: 'data:image/webp;base64,' + execFileSync('python3', ['-c', py, `assets-src/people/${p.id}.jpg`]).toString().trim() }));
fs.writeFileSync('src/people.generated.js', `// СГЕНЕРИРОВАНО src/gen-people.mjs из assets-src/people — не править руками.\nexport const SAMPLE_PEOPLE = ${JSON.stringify(out)};\n`);
console.log('people', out.length, Math.round(fs.statSync('src/people.generated.js').size / 1024) + ' KB');
