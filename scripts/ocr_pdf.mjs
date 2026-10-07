// OCR de todas as páginas do PDF (desenho CAD sem camada de texto).
// Lê texto HORIZONTAL e VERTICAL (rotacionado 90°), comum nos diagramas de interligação.
// Uso: node scripts/ocr_pdf.mjs <pdf> [paginaInicial] [paginaFinal]
// Saída incremental (retomável): scripts/ocr/page-XXX.json  { page, words:[{t,conf,x,y,w,h,v}] }
// Coordenadas x,y,w,h em % da página (0-100). v=1 indica texto vertical.
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createWorker, PSM } from 'tesseract.js';

const pdfPath = process.argv[2] || 'public/NB.I.Z3001.505-03.pdf';
const OUT = process.env.OCR_OUT || 'scripts/ocr';
const SCALE = parseFloat(process.env.OCR_SCALE || '5');
fs.mkdirSync(OUT, { recursive: true });

const doc = await getDocument({ data: new Uint8Array(fs.readFileSync(pdfPath)), disableFontFace: true, verbosity: 0 }).promise;
const from = parseInt(process.argv[3] || '1', 10);
const to = Math.min(parseInt(process.argv[4] || String(doc.numPages), 10), doc.numPages);

const worker = await createWorker('eng');
await worker.setParameters({
  tessedit_pageseg_mode: PSM.SPARSE_TEXT,
  tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_:/.,#()@+',
  preserve_interword_spaces: '1'
});

function collect(data, W, H, vertical) {
  const res = [];
  for (const b of data.blocks || []) for (const para of b.paragraphs) for (const line of para.lines) for (const w of line.words) {
    const t = w.text.trim();
    if (!t) continue;
    let { x0, y0, x1, y1 } = w.bbox;
    // Imagem girada 90° horário: (x',y') -> original (y', H - x')
    if (vertical) [x0, y0, x1, y1] = [y0, H - x1, y1, H - x0];
    res.push({
      t, conf: Math.round(w.confidence),
      x: +(x0 / W * 100).toFixed(2), y: +(y0 / H * 100).toFixed(2),
      w: +((x1 - x0) / W * 100).toFixed(2), h: +((y1 - y0) / H * 100).toFixed(2),
      ...(vertical ? { v: 1 } : {})
    });
  }
  return res;
}

for (let p = from; p <= to; p++) {
  const file = `${OUT}/page-${String(p).padStart(3, '0')}.json`;
  if (fs.existsSync(file)) continue; // retomável
  const t0 = Date.now();
  const page = await doc.getPage(p);
  const vp = page.getViewport({ scale: SCALE });
  const W = Math.ceil(vp.width), H = Math.ceil(vp.height);
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  await page.render({ canvasContext: ctx, viewport: vp }).promise;

  const horiz = await worker.recognize(canvas.toBuffer('image/png'), {}, { blocks: true });

  const rot = createCanvas(H, W);
  const rctx = rot.getContext('2d');
  rctx.translate(H, 0); rctx.rotate(Math.PI / 2); rctx.drawImage(canvas, 0, 0);
  const vert = await worker.recognize(rot.toBuffer('image/png'), {}, { blocks: true });

  const words = [...collect(horiz.data, W, H, false), ...collect(vert.data, W, H, true)];
  fs.writeFileSync(file, JSON.stringify({ page: p, words }));
  console.log(`p${p}: ${words.length} palavras em ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  page.cleanup();
}
await worker.terminate();
console.log('OCR concluído.');
