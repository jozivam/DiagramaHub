// Função de normalização com tolerância a substituições comuns de OCR em fontes CAD técnicas.
// Converte:
// O, Q -> 0
// I, L, |, ! -> 1
// S -> 5
// Z -> 2
// B -> 8
export function foldTagForSearch(str: string): string {
  if (!str) return '';
  return str
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '')
    .replace(/[OQ]/g, '0')
    .replace(/[IL|!]/g, '1')
    .replace(/S/g, '5')
    .replace(/Z/g, '2')
    .replace(/B/g, '8');
}

export function cleanTagCode(str: string): string {
  if (!str) return '';
  return str
    .toUpperCase()
    .replace(/[—–]/g, '-')
    .replace(/^[^A-Z0-9]+|[^A-Z0-9]+$/g, '')
    .trim();
}
