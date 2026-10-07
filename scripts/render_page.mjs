// Renderiza uma página para PNG (inspeção visual). Uso: node scripts/render_page.mjs <pdf> <pagina> <escala> <saida.png>
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const [pdfPath, pg, sc, out] = process.argv.slice(2);
const doc = await getDocument({ data: new Uint8Array(fs.readFileSync(pdfPath)), disableFontFace: true, verbosity: 0 }).promise;
const page = await doc.getPage(parseInt(pg, 10));
const vp = page.getViewport({ scale: parseFloat(sc || '2') });
const canvas = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
await page.render({ canvasContext: ctx, viewport: vp }).promise;
fs.writeFileSync(out, canvas.toBuffer('image/png'));
console.log('ok', canvas.width, canvas.height);
