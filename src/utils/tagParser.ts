import { TagType, TagItem, DiagramPage } from '../types/diagram';

export interface SearchResultItem {
  tag: TagItem;
  page: DiagramPage;
  documentNumber: string;
  revision: string;
  isExactMatch: boolean;
  score: number;
  highlightIndices?: [number, number];
}

export function classifyTagCode(code: string): TagType {
  const clean = code.trim().toUpperCase();

  // Bornes e Réguas
  if (
    clean.includes('-SL') ||
    clean.includes(':') ||
    /^X\d+[-:]\d+/.test(clean) ||
    /^LT:\d+/.test(clean) ||
    /^[1-8]R$/.test(clean)
  ) {
    return 'TERMINAL_BORNE';
  }

  // Cabos
  if (
    clean.includes('#') ||
    clean.includes('MM²') ||
    /F\d+$/.test(clean) ||
    /C\d+$/.test(clean) ||
    clean.includes('WL') ||
    clean.includes('BLC') ||
    clean.includes('XWC')
  ) {
    return 'CABLE';
  }

  // Painéis / CLPs / Quadros
  if (
    clean.includes('CCM') ||
    clean.includes('QDMT') ||
    clean.includes('QDBT') ||
    clean.includes('QDTC') ||
    clean.includes('QDTE') ||
    clean.includes('QDL') ||
    clean.includes('POWERBOX') ||
    clean.includes('REMOTA') ||
    /^Z3RM\d+/.test(clean) ||
    /^A1RM\d+/.test(clean) ||
    /^Z3SE\d+/.test(clean)
  ) {
    return 'PANEL';
  }

  // Sinais
  if (
    clean.includes('FEEDBACK') ||
    clean.includes('TRIP') ||
    clean.includes('ALARM') ||
    clean.includes('EMERG') ||
    clean.includes('4~20MA')
  ) {
    return 'SIGNAL';
  }

  // Equipamentos (Motores, Válvulas, Transmissores, Soft-starters, etc.)
  if (
    /M\d+/.test(clean) ||
    clean.endsWith('LT') ||
    clean.endsWith('PT') ||
    clean.endsWith('TT') ||
    clean.endsWith('XT') ||
    clean.endsWith('XV') ||
    clean.endsWith('LSH') ||
    clean.endsWith('PSL') ||
    clean.endsWith('Q1') ||
    clean.endsWith('Q2') ||
    clean.includes('SKF')
  ) {
    return 'EQUIPMENT';
  }

  return 'UNKNOWN';
}

export function searchTagsInPages(
  query: string,
  pages: DiagramPage[],
  filterType: TagType | 'ALL' = 'ALL'
): SearchResultItem[] {
  if (!query || !query.trim()) return [];

  const rawQuery = query.trim().toUpperCase();
  const queryTokens = rawQuery.split(/[\s-_:]+/).filter(Boolean);

  const results: SearchResultItem[] = [];

  for (const page of pages) {
    for (const tag of page.tags) {
      if (filterType !== 'ALL' && tag.type !== filterType) {
        continue;
      }

      const tagUpper = tag.code.toUpperCase();
      const descUpper = tag.description.toUpperCase();
      const pageTitleUpper = page.title.toUpperCase();

      let isExact = tagUpper === rawQuery;
      let score = 0;

      if (isExact) {
        score = 1000;
      } else if (tagUpper.startsWith(rawQuery)) {
        score = 500 + (100 - (tagUpper.length - rawQuery.length));
      } else if (tagUpper.includes(rawQuery)) {
        score = 300;
      } else {
        // Verifica tokens
        const matchedTokens = queryTokens.filter(
          tok => tagUpper.includes(tok) || descUpper.includes(tok) || pageTitleUpper.includes(tok)
        );
        if (matchedTokens.length > 0) {
          score = matchedTokens.length * 50;
        }
      }

      // Bônus se a tag for exatamente no título da página
      if (pageTitleUpper.includes(rawQuery)) {
        score += 80;
      }

      if (score > 0) {
        results.push({
          tag,
          page,
          documentNumber: page.drawingNumber,
          revision: page.revision,
          isExactMatch: isExact,
          score
        });
      }
    }
  }

  // Ordena por pontuação decrescente, exatos primeiro, depois número de página
  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.page.pageNumber - b.page.pageNumber;
  });
}

// Coleta todas as páginas onde uma tag específica aparece
export function findTagOccurrencesAcrossDocument(tagCode: string, pages: DiagramPage[]): {
  page: DiagramPage;
  tag: TagItem;
}[] {
  const cleanTarget = tagCode.trim().toUpperCase();
  const occurrences: { page: DiagramPage; tag: TagItem }[] = [];

  for (const page of pages) {
    // Procura por tag exata ou página cujo título ou descrição cite o equipamento
    const matchingTag = page.tags.find(
      t => t.code.toUpperCase() === cleanTarget || cleanTarget.includes(t.code.toUpperCase())
    );

    if (matchingTag) {
      occurrences.push({ page, tag: matchingTag });
    } else if (page.title.toUpperCase().includes(cleanTarget)) {
      // Se a página tem o código no título mas não tag explícita, associa a ocorrência com a primeira tag ou tag virtual
      const dummyTag: TagItem = {
        id: `virtual-${page.pageNumber}-${cleanTarget}`,
        code: cleanTarget,
        type: classifyTagCode(cleanTarget),
        description: page.title,
        pageNumber: page.pageNumber,
        documentNumber: page.drawingNumber,
        boundingBox: { x: 40, y: 40, width: 20, height: 10 },
        relations: []
      };
      occurrences.push({ page, tag: dummyTag });
    }
  }

  return occurrences.sort((a, b) => a.page.pageNumber - b.page.pageNumber);
}
