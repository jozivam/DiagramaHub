// Gera src/data/ocrIndex.json a partir do OCR (scripts/ocr/page-XXX.json).
// Para cada página do PDF: número da folha (carimbo "PÁG."), título (carimbo) e todas as
// tags lidas no desenho com a posição real (em % da página).
// Uso: node scripts/build_ocr_index.mjs
import fs from 'node:fs';

const SRC = process.env.OCR_OUT || 'scripts/ocr';
const OUT = 'src/data/ocrIndex.json';

// Mesma normalização usada na busca (src/utils/tagFold.ts): tolera confusões típicas do OCR.
const fold = (s) => s.toUpperCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^A-Z0-9|!]/g, '')
  .replace(/[OQ]/g, '0').replace(/[IL|!]/g, '1').replace(/S/g, '5').replace(/Z/g, '2').replace(/B/g, '8');

const clean = (s) => s.toUpperCase()
  .replace(/[—–]/g, '-')
  .replace(/^[^A-Z0-9]+|[^A-Z0-9]+$/g, '');

const isTagLike = (c) => {
  if (c.length < 4 || c.length > 32) return false;
  const alnum = c.replace(/[^A-Z0-9]/g, '');
  if (alnum.length < 4) return false;
  if (!/[A-Z]/.test(alnum) || !/\d/.test(alnum)) return false;
  if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(c)) return false;            // datas
  if (/^(FORMATO|A3|297X420)/.test(c)) return false;
  if (/^NB\.?\/?\.?Z3001/.test(c) || /^AE-?TA/.test(c)) return false; // nº do desenho (todas as páginas)
  return true;
};

const files = fs.readdirSync(SRC).filter((f) => /^page-\d{3}\.json$/.test(f)).sort();
const out = [];
let totalTags = 0;

for (const f of files) {
  const { page, lines } = JSON.parse(fs.readFileSync(`${SRC}/${f}`, 'utf8'));

  // --- Carimbo: folha e título
  let sheet = null;
  const sheetCands = lines.filter((l) => !l.v && l.x >= 83 && l.x <= 91 && l.y >= 90 && l.y <= 94 && /^\d{1,3}[A-Z]?$/.test(l.t.trim()));
  if (sheetCands.length) sheet = sheetCands[0].t.trim();

  const titleParts = [];
  for (const l of lines.filter((l) => !l.v && l.x >= 47 && l.x <= 68 && l.y >= 88.6 && l.y <= 93.8).sort((a, b) => a.y - b.y || a.x - b.x)) {
    const t = l.t.replace(/\s+/g, ' ').trim();
    if (!t || /^DIAGRAMA DE INTERLIGA/i.test(t) || /^T[IÍ]TULO/i.test(t)) continue;
    if (!titleParts.some((p) => p === t || p.includes(t))) titleParts.push(t);
  }

  // --- Tags no desenho
  const seen = new Map();
  const tags = [];
  for (const l of lines) {
    const raw = l.t.toUpperCase().replace(/[—–]/g, '-');
    const toks = raw.split(/\s+/).filter(Boolean);
    const cands = new Set();
    for (let i = 0; i < toks.length; i++) {
      for (let n = 1; n <= 3 && i + n <= toks.length; n++) {
        const joined = clean(toks.slice(i, i + n).join(''));
        if (isTagLike(joined)) cands.add(joined);
      }
    }
    for (const c of cands) {
      const key = fold(c) + '@' + Math.round(l.x / 2) + ',' + Math.round(l.y / 2);
      if (seen.has(key)) continue;
      seen.set(key, true);
      tags.push([c, l.x, l.y, l.w, l.h, l.v ? 1 : 0]);
    }
  }
  totalTags += tags.length;
  out.push({ p: page, s: sheet, t: titleParts.join(' - '), g: tags });
}

fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`Páginas indexadas: ${out.length} | tags lidas: ${totalTags} | arquivo: ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
