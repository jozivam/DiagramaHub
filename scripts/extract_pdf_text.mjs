// Extrai o texto real de todas as páginas do PDF para scripts/pdf_text.json
import fs from 'node:fs';
import path from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const pdfPath = process.argv[2] || 'public/NB.I.Z3001.505-03.pdf';
const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await getDocument({ data, disableFontFace: true, verbosity: 0 }).promise;

const out = [];
let pagesWithText = 0;
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const vp = page.getViewport({ scale: 1 });
  const tc = await page.getTextContent();
  const items = tc.items
    .filter((it) => it.str && it.str.trim())
    .map((it) => ({
      s: it.str.trim(),
      x: +(it.transform[4] / vp.width * 100).toFixed(2),
      y: +((1 - it.transform[5] / vp.height) * 100).toFixed(2)
    }));
  if (items.length) pagesWithText++;
  out.push({ page: p, count: items.length, items });
  page.cleanup();
}
fs.writeFileSync('scripts/pdf_text.json', JSON.stringify(out));
console.log(`Páginas: ${doc.numPages} | com texto: ${pagesWithText}`);
console.log('Amostra p1-3, 20, 64:');
for (const p of [1, 2, 3, 20, 64]) {
  const pg = out[p - 1];
  if (pg) console.log(p, pg.count, pg.items.slice(0, 25).map((i) => i.s).join(' | '));
}
