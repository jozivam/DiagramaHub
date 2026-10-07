// Mapeamento por OCR (Windows.Media.Ocr) de todas as páginas do PDF CAD.
// Cada página é renderizada em alta resolução, dividida em blocos com sobreposição,
// e cada bloco é lido na horizontal e girado 90° (texto vertical).
// Uso: node scripts/ocr_win.mjs <pdf> [de] [ate]
// Saída retomável: scripts/ocr/page-XXX.json  { page, lines:[{t,x,y,w,h,v}] }  (coords em % da página)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createCanvas } from '@napi-rs/canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const pdfPath = process.argv[2] || 'public/NB.I.Z3001.505-03.pdf';
const OUT = process.env.OCR_OUT || 'scripts/ocr';
const TMP = path.resolve('scripts/ocr_tmp');
const SCALE = parseFloat(process.env.OCR_SCALE || '6');
const GRID_X = parseInt(process.env.OCR_GX || '4', 10), GRID_Y = parseInt(process.env.OCR_GY || '3', 10), OVERLAP = 0.05;
fs.mkdirSync(OUT, { recursive: true });

const doc = await getDocument({ data: new Uint8Array(fs.readFileSync(pdfPath)), disableFontFace: true, verbosity: 0 }).promise;
const from = parseInt(process.argv[3] || '1', 10);
const to = Math.min(parseInt(process.argv[4] || String(doc.numPages), 10), doc.numPages);

for (let p = from; p <= to; p++) {
  const outFile = `${OUT}/page-${String(p).padStart(3, '0')}.json`;
  if (fs.existsSync(outFile)) continue;

  let success = false;
  for (let attempt = 1; attempt <= 3 && !success; attempt++) {
    const t0 = Date.now();
    const pageTmp = path.resolve(`scripts/ocr_tmp_p${p}_a${attempt}`);
    try {
      fs.rmSync(pageTmp, { recursive: true, force: true });
      fs.mkdirSync(pageTmp, { recursive: true });

      const page = await doc.getPage(p);
      const vp = page.getViewport({ scale: SCALE });
      const W = Math.ceil(vp.width), H = Math.ceil(vp.height);
      const full = createCanvas(W, H);
      const fctx = full.getContext('2d');
      fctx.fillStyle = '#fff'; fctx.fillRect(0, 0, W, H);
      await page.render({ canvasContext: fctx, viewport: vp }).promise;

      const tiles = [];
      const tw = W / GRID_X, th = H / GRID_Y, ox = W * OVERLAP, oy = H * OVERLAP;
      for (let gy = 0; gy < GRID_Y; gy++) for (let gx = 0; gx < GRID_X; gx++) {
        const sx = Math.max(0, Math.floor(gx * tw - ox)), sy = Math.max(0, Math.floor(gy * th - oy));
        const ex = Math.min(W, Math.ceil((gx + 1) * tw + ox)), ey = Math.min(H, Math.ceil((gy + 1) * th + oy));
        const cw = ex - sx, ch = ey - sy;
        const id = `t${gy}${gx}`;
        const c = createCanvas(cw, ch);
        c.getContext('2d').drawImage(full, sx, sy, cw, ch, 0, 0, cw, ch);
        fs.writeFileSync(path.join(pageTmp, `${id}h.png`), c.toBuffer('image/png'));
        const r = createCanvas(ch, cw);
        const rc = r.getContext('2d');
        rc.translate(ch, 0); rc.rotate(Math.PI / 2); rc.drawImage(c, 0, 0);
        fs.writeFileSync(path.join(pageTmp, `${id}v.png`), r.toBuffer('image/png'));
        tiles.push({ id, sx, sy, cw, ch });
      }

      execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'scripts/winocr_batch.ps1', pageTmp], { stdio: 'inherit' });

      const lines = [];
      for (const tl of tiles) for (const vert of [false, true]) {
        const jf = path.join(pageTmp, `${tl.id}${vert ? 'v' : 'h'}.json`);
        if (!fs.existsSync(jf)) continue;
        const raw = fs.readFileSync(jf, 'utf8').replace(/^\uFEFF/, '').replace(/[\u0000-\u001f]/g, ' ');
        let arr = JSON.parse(raw || '[]');
        if (!Array.isArray(arr)) arr = [arr];
        for (const ln of arr) {
          const ws = Array.isArray(ln.words) ? ln.words : [ln.words].filter(Boolean);
          if (!ws.length) continue;
          let x0 = Math.min(...ws.map((w) => w.x)), y0 = Math.min(...ws.map((w) => w.y));
          let x1 = Math.max(...ws.map((w) => w.x + w.w)), y1 = Math.max(...ws.map((w) => w.y + w.h));
          // bloco girado 90° horário: (x',y') -> (y', ch - x')
          if (vert) [x0, y0, x1, y1] = [y0, tl.ch - x1, y1, tl.ch - x0];
          x0 += tl.sx; x1 += tl.sx; y0 += tl.sy; y1 += tl.sy;
          lines.push({
            t: String(ln.l).replace(/\s+/g, ' ').trim(),
            x: +(x0 / W * 100).toFixed(2), y: +(y0 / H * 100).toFixed(2),
            w: +((x1 - x0) / W * 100).toFixed(2), h: +((y1 - y0) / H * 100).toFixed(2),
            ...(vert ? { v: 1 } : {})
          });
        }
      }
      fs.writeFileSync(outFile, JSON.stringify({ page: p, lines }));
      console.log(`p${p}: ${lines.length} linhas em ${((Date.now() - t0) / 1000).toFixed(1)}s`);
      page.cleanup();
      success = true;
    } catch (err) {
      console.error(`Erro na página ${p} (tentativa ${attempt}):`, err.message || err);
      await new Promise((r) => setTimeout(r, 500));
    } finally {
      try { fs.rmSync(pageTmp, { recursive: true, force: true }); } catch (_) {}
    }
  }
}
console.log('OCR concluído.');
