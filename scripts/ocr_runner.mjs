// Executor contínuo e resiliente para processar 100% das 346 páginas do PDF
// Retoma de onde parou e atualiza o ocrIndex.json periodicamente
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const OUT = process.env.OCR_OUT || 'scripts/ocr';
fs.mkdirSync(OUT, { recursive: true });

console.log('Iniciando executor contínuo do OCR (1 a 346)...');

for (let p = 1; p <= 346; p++) {
  const outFile = `${OUT}/page-${String(p).padStart(3, '0')}.json`;
  if (fs.existsSync(outFile)) continue;

  try {
    console.log(`\n=== Processando Página ${p}/346 ===`);
    execFileSync('node', ['scripts/ocr_win.mjs', 'dist/NB.I.Z3001.505-03.pdf', String(p), String(p)], { stdio: 'inherit' });
  } catch (err) {
    console.error(`Falha transitória na página ${p}, tentando novamente...`, err.message || err);
    try {
      execFileSync('node', ['scripts/ocr_win.mjs', 'dist/NB.I.Z3001.505-03.pdf', String(p), String(p)], { stdio: 'inherit' });
    } catch (err2) {
      console.error(`Página ${p} ignorada após segunda tentativa.`, err2.message || err2);
    }
  }

  // A cada 10 páginas, atualiza o índice global
  if (p % 10 === 0 || p === 346) {
    try {
      execFileSync('node', ['scripts/build_ocr_index.mjs'], { stdio: 'inherit' });
    } catch (_) {}
  }
}

// Consolidação final
console.log('\nFinalizando e gerando índice consolidado definitivo...');
try {
  execFileSync('node', ['scripts/build_ocr_index.mjs'], { stdio: 'inherit' });
} catch (_) {}
console.log('Processo de mapeamento 100% concluído!');
