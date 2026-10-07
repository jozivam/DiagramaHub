import { TagType, TagItem, DiagramPage } from '../types/diagram';
import { foldTagForSearch } from './tagFold';

export type TagFormatFilter = 'ALL' | 'ISA' | 'KKS' | 'CABLE' | 'BORNE' | 'PANEL' | 'SIGNAL';

export interface SearchResultItem {
  tag: TagItem;
  page: DiagramPage;
  documentNumber: string;
  revision: string;
  isExactMatch: boolean;
  score: number;
  formatLabel: string; // 'ISA-5.1', 'KKS / FABRIL', 'CABO', 'BORNE / RÉGUA', 'PAINEL / CUBÍCULO'
  highlightIndices?: [number, number];
}

interface KKSMapping {
  pattern: RegExp;
  pageNumber: number;
  code: string;
  description: string;
  isaEquivalent: string;
}

// Matriz Oficial de Equivalência de Tags KKS <-> ISA <-> Páginas do Projeto Nobres Z3
const KKS_CROSS_REFERENCE: KKSMapping[] = [
  {
    pattern: /416BM01MT10WHO[12]|416BM01MT10|416BM01/i,
    pageNumber: 20,
    code: '416BM01MT10WHO2',
    description: 'Tag KKS - Dispositivo Giro Lento / Resistor do Motor Z3M03M1 (Folha 20)',
    isaEquivalent: 'Z3M03M1'
  },
  {
    pattern: /416BM01MT20/i,
    pageNumber: 152,
    code: '416BM01MT20',
    description: 'Tag KKS - Motor Giro Lento do Moinho Z3M04M1 (45kW) (Folha 152)',
    isaEquivalent: 'Z3M04M1'
  },
  {
    pattern: /416BM01EC10/i,
    pageNumber: 156,
    code: '416BM01EC10',
    description: 'Tag KKS - Elevação das Escovas do Motor Z3M03Q2 (Folha 156)',
    isaEquivalent: 'Z3M03Q2'
  },
  {
    pattern: /416BM01LS10/i,
    pageNumber: 157,
    code: '416BM01LS10',
    description: 'Tag KKS - Painel Reostato Líquido Z3M03Q1 (Folha 157)',
    isaEquivalent: 'Z3M03Q1'
  },
  {
    pattern: /416BM01CP10/i,
    pageNumber: 158,
    code: '416BM01CP10',
    description: 'Tag KKS - Cubículo Banco Capacitor Z3QDMT01-05 (Folha 158)',
    isaEquivalent: 'Z3M03BC'
  },
  {
    pattern: /416FA21EC10/i,
    pageNumber: 29,
    code: '416FA21EC10',
    description: 'Tag KKS - Soft-Starter Ventilador Moinho Z3P62Q1 (Folhas 29, 30)',
    isaEquivalent: 'Z3P62Q1'
  },
  {
    pattern: /416SP09EC10|416SP09MT10/i,
    pageNumber: 32,
    code: '416SP09EC10',
    description: 'Tag KKS - Inversor Separador Dinâmico Z3S01Q1 (Folhas 32, 33)',
    isaEquivalent: 'Z3S01Q1'
  },
  {
    pattern: /416FA16EC10/i,
    pageNumber: 42,
    code: '416FA16EC10',
    description: 'Tag KKS - Inversor Ventilador Filtro Z3P72Q1 (Folhas 41, 42)',
    isaEquivalent: 'Z3P72Q1'
  },
  {
    pattern: /416DC15EC10/i,
    pageNumber: 53,
    code: '416DC15EC10',
    description: 'Tag KKS - Programador Filtro de Processo Z3P71 (Folha 53)',
    isaEquivalent: 'Z3P71'
  },
  {
    pattern: /416DC20EC10/i,
    pageNumber: 59,
    code: '416DC20EC10',
    description: 'Tag KKS - Programador Filtro Z3P61 (Folha 59)',
    isaEquivalent: 'Z3P61'
  },
  {
    pattern: /418DC12EC10|Z3P81/i,
    pageNumber: 62,
    code: '418DC12EC10',
    description: 'Tag KKS - Programador Filtro Z3P81 (Folha 59)',
    isaEquivalent: 'Z3P81'
  },
  {
    pattern: /418DC14EC10|Z3P91/i,
    pageNumber: 65,
    code: '418DC14EC10',
    description: 'Tag KKS - Programador Filtro Z3P91 (Folha 62)',
    isaEquivalent: 'Z3P91'
  },
  {
    pattern: /413H020L0[12]/i,
    pageNumber: 73,
    code: '413H020L01',
    description: 'Tag KKS - Silo de Clínquer G3L01 (Folhas 73, 74)',
    isaEquivalent: 'G3L01'
  },
  {
    pattern: /413H021L0[12]/i,
    pageNumber: 75,
    code: '413H021L01',
    description: 'Tag KKS - Silo de Pozolana G3L02 (Folhas 75, 76)',
    isaEquivalent: 'G3L02'
  },
  {
    pattern: /413H022L0[12]/i,
    pageNumber: 77,
    code: '413H022L01',
    description: 'Tag KKS - Silo de Gesso G3L03 (Folhas 77, 78)',
    isaEquivalent: 'G3L03'
  },
  {
    pattern: /413H023L0[12]/i,
    pageNumber: 79,
    code: '413H023L01',
    description: 'Tag KKS - Silo de Calcário G3L04 (Folhas 79, 80)',
    isaEquivalent: 'G3L04'
  },
  {
    pattern: /413DC05EC10/i,
    pageNumber: 81,
    code: '413DC05EC10',
    description: 'Tag KKS - Programador Filtro dos Silos U3P01 (Folha 81)',
    isaEquivalent: 'U3P01'
  },
  {
    pattern: /416BE05MT10/i,
    pageNumber: 132,
    code: '416BE05MT10',
    description: 'Tag KKS - Elevador Canecas Z3U08M1 (Folha 132)',
    isaEquivalent: 'Z3U08M1'
  },
  {
    pattern: /416BE05MT20/i,
    pageNumber: 134,
    code: '416BE05MT20',
    description: 'Tag KKS - Giro Lento Elevador Z3U08M2 (Folha 134)',
    isaEquivalent: 'Z3U08M2'
  },
  {
    pattern: /416BE14MT10/i,
    pageNumber: 148,
    code: '416BE14MT10',
    description: 'Tag KKS - Elevador Canecas Z3J15M1 (Folha 148)',
    isaEquivalent: 'Z3J15M1'
  },
  {
    pattern: /416BE14MT20/i,
    pageNumber: 154,
    code: '416BE14MT20',
    description: 'Tag KKS - Giro Lento Elevador Z3J15M2 (Folha 154)',
    isaEquivalent: 'Z3J15M2'
  }
];

export function classifyTagFormat(code: string, description: string = '', spec: string = ''): TagFormatFilter {
  const clean = code.trim().toUpperCase();
  const cleanDesc = description.trim().toUpperCase();
  const cleanSpec = spec.trim().toUpperCase();

  // 1. Padrão KKS / Código Fabril de Processo
  if (
    /^\d{3}[A-Z]{2,4}\d{2,4}/.test(clean) ||
    /41[368][A-Z]{2}\d{2}/.test(clean) ||
    cleanDesc.includes('KKS') ||
    cleanSpec.includes('KKS') ||
    clean.includes('WHO') ||
    clean.includes('EC10') ||
    clean.includes('LS10') ||
    clean.includes('CP10')
  ) {
    return 'KKS';
  }

  // 2. Bornes, Réguas e Terminais
  if (
    clean.includes('-SL') ||
    clean.includes(':') ||
    /^X\d+[-:]\d+/.test(clean) ||
    /^LT:\d+/.test(clean) ||
    /^[1-8]R$/.test(clean) ||
    /^1-[RST]$/.test(clean) ||
    clean.startsWith('X2:')
  ) {
    return 'BORNE';
  }

  // 3. Cabos e Condutores
  if (
    clean.includes('#') ||
    clean.includes('MM²') ||
    /F\d+$/.test(clean) ||
    /C\d+$/.test(clean) ||
    clean.includes('WL') ||
    clean.includes('BLC') ||
    clean.includes('XWC') ||
    clean.includes('@')
  ) {
    return 'CABLE';
  }

  // 4. Painéis, Cubículos e Gavetas
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

  // 5. Sinais de I/O
  if (
    clean.includes('FEEDBACK') ||
    clean.includes('TRIP') ||
    clean.includes('ALARM') ||
    clean.includes('EMERG') ||
    clean.includes('4~20MA')
  ) {
    return 'SIGNAL';
  }

  return 'ISA';
}

export function classifyTagCode(code: string): TagType {
  const format = classifyTagFormat(code);
  switch (format) {
    case 'KKS':
    case 'ISA':
      return 'EQUIPMENT';
    case 'BORNE':
      return 'TERMINAL_BORNE';
    case 'CABLE':
      return 'CABLE';
    case 'PANEL':
      return 'PANEL';
    case 'SIGNAL':
      return 'SIGNAL';
    default:
      return 'UNKNOWN';
  }
}

export function getFormatBadgeLabel(format?: TagFormatFilter | TagType | 'ISA' | 'KKS' | 'CABLE' | 'BORNE' | 'PANEL' | 'OTHER'): string {
  switch (format) {
    case 'KKS':
      return 'KKS / FABRIL';
    case 'ISA':
      return 'ISA 5.1';
    case 'CABLE':
      return 'CABO';
    case 'BORNE':
    case 'TERMINAL_BORNE':
      return 'BORNE';
    case 'PANEL':
      return 'PAINEL';
    case 'SIGNAL':
      return 'SINAL I/O';
    default:
      return 'ISA';
  }
}

interface IndexedTag {
  tag: TagItem;
  page: DiagramPage;
  tagUpper: string;
  normTag: string;
  foldTag: string;
  descUpper: string;
  specUpper: string;
  pageTitleUpper: string;
  sheetUpper: string;
  format: TagFormatFilter;
  uniqueKey: string;
}

let cachedPagesRef: DiagramPage[] | null = null;
let cachedIndexedTags: IndexedTag[] = [];

function getOrBuildIndexedTags(pages: DiagramPage[]): IndexedTag[] {
  if (cachedPagesRef === pages && cachedIndexedTags.length > 0) {
    return cachedIndexedTags;
  }
  cachedPagesRef = pages;
  const list: IndexedTag[] = [];
  const seen = new Set<string>();

  for (const page of pages) {
    const pageTitleUpper = page.title.toUpperCase();
    const sheetUpper = page.sheetCode.toUpperCase();

    for (const tag of page.tags) {
      const tagUpper = tag.code.toUpperCase();
      const uniqueKey = `${page.pageNumber}-${tag.code}`;
      if (seen.has(uniqueKey)) continue;
      seen.add(uniqueKey);

      const format = tag.tagFormat || classifyTagFormat(tag.code, tag.description, tag.spec || '');
      list.push({
        tag,
        page,
        tagUpper,
        normTag: tagUpper.replace(/[^A-Z0-9]/g, ''),
        foldTag: foldTagForSearch(tagUpper),
        descUpper: (tag.description || '').toUpperCase(),
        specUpper: (tag.spec || '').toUpperCase(),
        pageTitleUpper,
        sheetUpper,
        format,
        uniqueKey
      });
    }
  }
  cachedIndexedTags = list;
  return list;
}

export function searchTagsInPages(
  query: string,
  pages: DiagramPage[],
  filterType: TagFormatFilter | TagType | 'ALL' = 'ALL'
): SearchResultItem[] {
  if (!query || !query.trim()) return [];

  const rawQuery = query.trim().toUpperCase();
  const normQuery = rawQuery.replace(/[^A-Z0-9]/g, '');
  const foldQuery = foldTagForSearch(rawQuery);
  const queryTokens = rawQuery.split(/[\s-_:@#.]+/).filter(Boolean);

  const results: SearchResultItem[] = [];
  const seenKeys = new Set<string>();
  const indexedTags = getOrBuildIndexedTags(pages);

  // 1. Pesquisa instantânea no índice pré-computado
  for (let idx = 0; idx < indexedTags.length; idx++) {
    const item = indexedTags[idx];
    const { tag, page, tagUpper, normTag, foldTag, descUpper, specUpper, pageTitleUpper, sheetUpper, format, uniqueKey } = item;
    
    if (filterType !== 'ALL') {
      if (filterType === 'KKS' && format !== 'KKS') continue;
      if (filterType === 'ISA' && format !== 'ISA') continue;
      if (filterType === 'CABLE' && format !== 'CABLE' && tag.type !== 'CABLE') continue;
      if ((filterType === 'BORNE' || filterType === 'TERMINAL_BORNE') && format !== 'BORNE' && tag.type !== 'TERMINAL_BORNE') continue;
      if (filterType === 'PANEL' && format !== 'PANEL' && tag.type !== 'PANEL') continue;
      if (filterType === 'EQUIPMENT' && tag.type !== 'EQUIPMENT' && format !== 'ISA' && format !== 'KKS') continue;
    }

    let isExact = tagUpper === rawQuery || (normQuery.length >= 3 && normTag === normQuery) || (foldQuery.length >= 3 && foldTag === foldQuery);
    let score = 0;

    if (isExact) {
      score = 1000;
    } else if (normTag.length >= 3 && normQuery.length >= 3 && (normTag.includes(normQuery) || normQuery.includes(normTag))) {
      score = 850;
    } else if (foldQuery.length >= 3 && foldTag.length >= 3 && (foldTag.includes(foldQuery) || foldQuery.includes(foldTag))) {
      score = 800;
    } else if (tagUpper.startsWith(rawQuery) || rawQuery.startsWith(tagUpper.substring(0, Math.min(5, tagUpper.length)))) {
      score = 700;
    } else if (tagUpper.includes(rawQuery)) {
      score = 600;
    } else if (descUpper.includes(rawQuery) || specUpper.includes(rawQuery)) {
      score = 450;
    } else {
      let matchedCount = 0;
      for (let t = 0; t < queryTokens.length; t++) {
        const tok = queryTokens[t];
        if (tagUpper.includes(tok) || descUpper.includes(tok) || specUpper.includes(tok) || pageTitleUpper.includes(tok)) {
          matchedCount++;
        }
      }
      if (matchedCount === queryTokens.length) {
        score = 350 + matchedCount * 20;
      } else if (matchedCount > 0) {
        score = matchedCount * 50;
      }
    }

    if (pageTitleUpper.includes(rawQuery) || sheetUpper === rawQuery) {
      score += 80;
    }

    if (score > 0) {
      if (!seenKeys.has(uniqueKey)) {
        seenKeys.add(uniqueKey);
        results.push({
          tag,
          page,
          documentNumber: page.drawingNumber,
          revision: page.revision,
          isExactMatch: isExact,
          score,
          formatLabel: getFormatBadgeLabel(format)
        });
      }
    }
  }

  // Busca secundária se a descrição da folha contém a tag ou palavra buscada
  for (const page of pages) {
    if (page.title.toUpperCase().includes(rawQuery) || (normQuery.length >= 3 && page.title.toUpperCase().replace(/[^A-Z0-9]/g, '').includes(normQuery))) {
      const tagCodeFromPage = page.tags[0]?.code || `FOLHA-${page.sheetCode}`;
      const uniqueKey = `${page.pageNumber}-${tagCodeFromPage}`;
      if (!seenKeys.has(uniqueKey)) {
        seenKeys.add(uniqueKey);
        results.push({
          tag: page.tags[0] || {
            id: `tag-${page.pageNumber}-page-match`,
            code: page.sheetCode,
            type: 'EQUIPMENT',
            description: page.title,
            pageNumber: page.pageNumber,
            documentNumber: page.drawingNumber,
            boundingBox: { x: 30, y: 30, width: 30, height: 10 },
            relations: []
          },
          page,
          documentNumber: page.drawingNumber,
          revision: page.revision,
          isExactMatch: false,
          score: 500,
          formatLabel: 'FOLHA'
        });
      }
    }
  }

  // 2. Consulta à Matriz de Cruzamento KKS <-> ISA <-> Folhas do Projeto
  for (const kksItem of KKS_CROSS_REFERENCE) {
    if (kksItem.pattern.test(rawQuery) || kksItem.pattern.test(normQuery)) {
      const targetPage = pages.find((p) => p.pageNumber === kksItem.pageNumber);
      if (targetPage) {
        const uniqueKey = `${targetPage.pageNumber}-${kksItem.code}`;
        if (!seenKeys.has(uniqueKey)) {
          seenKeys.add(uniqueKey);

          // Tenta pegar a tag exata se já existir na página, ou cria a tag KKS de alta precisão
          const existingTag = targetPage.tags.find((t) => t.code.toUpperCase() === kksItem.code.toUpperCase());
          const tagToReturn: TagItem = existingTag || {
            id: `kks-matrix-${targetPage.pageNumber}-${kksItem.code}`,
            code: kksItem.code,
            type: 'EQUIPMENT',
            tagFormat: 'KKS',
            description: kksItem.description,
            spec: `Equivalente ISA: ${kksItem.isaEquivalent}`,
            pageNumber: targetPage.pageNumber,
            documentNumber: targetPage.drawingNumber,
            boundingBox: { x: 42, y: 12, width: 28, height: 8 },
            relations: []
          };

          results.push({
            tag: tagToReturn,
            page: targetPage,
            documentNumber: targetPage.drawingNumber,
            revision: targetPage.revision,
            isExactMatch: true,
            score: 1200, // Pontuação máxima para equivalência KKS direta
            formatLabel: 'KKS / FABRIL'
          });
        }
      }
    }
  }

  // 3. Fallback adicional para títulos de folha e padrões de Tag (ex: Z3P83, Z3J10, etc.)
  if (results.length === 0) {
    for (const page of pages) {
      const pageTitleUpper = page.title.toUpperCase();
      const sheetUpper = page.sheetCode.toUpperCase();
      const pagePanelUpper = (page.panel || '').toUpperCase();
      
      if (pageTitleUpper.includes(rawQuery) || sheetUpper === rawQuery || pageTitleUpper.includes(normQuery) || pagePanelUpper.includes(rawQuery)) {
        const fmt = classifyTagFormat(rawQuery);
        const dummyTagFormat: 'ISA' | 'KKS' | 'CABLE' | 'BORNE' | 'PANEL' | 'OTHER' = 
          fmt === 'KKS' ? 'KKS' : fmt === 'CABLE' ? 'CABLE' : fmt === 'BORNE' ? 'BORNE' : fmt === 'PANEL' ? 'PANEL' : 'ISA';
        
        const dummyTag: TagItem = {
          id: `virtual-search-${page.pageNumber}-${rawQuery}`,
          code: rawQuery,
          type: classifyTagCode(rawQuery),
          tagFormat: dummyTagFormat,
          description: `Tag / Dispositivo de processo mapeado na Folha ${page.sheetCode} (${page.title})`,
          pageNumber: page.pageNumber,
          documentNumber: page.drawingNumber,
          boundingBox: { x: 40, y: 35, width: 20, height: 15 },
          relations: []
        };

        results.push({
          tag: dummyTag,
          page,
          documentNumber: page.drawingNumber,
          revision: page.revision,
          isExactMatch: true,
          score: pageTitleUpper.includes(rawQuery) ? 900 : 600,
          formatLabel: getFormatBadgeLabel(fmt)
        });
      }
    }
  }

  // 4. Se a busca com filtro restrito (ex: PANEL) não encontrou nada, faz fallback automático para 'ALL'
  if (results.length === 0 && filterType !== 'ALL') {
    return searchTagsInPages(query, pages, 'ALL');
  }

  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.page.pageNumber - b.page.pageNumber;
  });
}

// Coleta todas as páginas onde uma tag específica aparece (suportando ISA, KKS e Cabos)
export function findTagOccurrencesAcrossDocument(tagCode: string, pages: DiagramPage[]): {
  page: DiagramPage;
  tag: TagItem;
}[] {
  const cleanTarget = tagCode.trim().toUpperCase();
  if (!cleanTarget) return [];

  const occurrences: { page: DiagramPage; tag: TagItem }[] = [];
  const seenPages = new Set<number>();

  // Primeiro verifica cruzamento KKS
  const kksMatch = KKS_CROSS_REFERENCE.find((k) => k.pattern.test(cleanTarget));
  if (kksMatch) {
    const targetPage = pages.find((p) => p.pageNumber === kksMatch.pageNumber);
    if (targetPage) {
      seenPages.add(targetPage.pageNumber);
      const tagItem = targetPage.tags.find((t) => t.code.toUpperCase() === kksMatch.code.toUpperCase()) || {
        id: `kks-occ-${targetPage.pageNumber}-${kksMatch.code}`,
        code: kksMatch.code,
        type: 'EQUIPMENT' as TagType,
        tagFormat: 'KKS' as const,
        description: kksMatch.description,
        pageNumber: targetPage.pageNumber,
        documentNumber: targetPage.drawingNumber,
        boundingBox: { x: 42, y: 12, width: 28, height: 8 },
        relations: []
      };
      occurrences.push({ page: targetPage, tag: tagItem });
    }
  }

  for (const page of pages) {
    if (seenPages.has(page.pageNumber)) continue;

    const matchingTag = page.tags.find(t => {
      const codeUpper = t.code.toUpperCase();
      const descUpper = t.description.toUpperCase();
      const specUpper = (t.spec || '').toUpperCase();

      return (
        codeUpper === cleanTarget ||
        cleanTarget.includes(codeUpper) ||
        codeUpper.includes(cleanTarget) ||
        descUpper.includes(cleanTarget) ||
        specUpper.includes(cleanTarget)
      );
    });

    if (matchingTag) {
      seenPages.add(page.pageNumber);
      occurrences.push({ page, tag: matchingTag });
    } else if (page.title.toUpperCase().includes(cleanTarget)) {
      seenPages.add(page.pageNumber);
      const fmt = classifyTagFormat(cleanTarget);
      const dummyTagFormat: 'ISA' | 'KKS' | 'CABLE' | 'BORNE' | 'PANEL' | 'OTHER' = 
        fmt === 'KKS' ? 'KKS' : fmt === 'CABLE' ? 'CABLE' : fmt === 'BORNE' ? 'BORNE' : fmt === 'PANEL' ? 'PANEL' : 'ISA';
      const dummyTag: TagItem = {
        id: `virtual-${page.pageNumber}-${cleanTarget}`,
        code: cleanTarget,
        type: classifyTagCode(cleanTarget),
        tagFormat: dummyTagFormat,
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
