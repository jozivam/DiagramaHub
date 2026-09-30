import React, { useState, useMemo } from 'react';
import { 
  Search, Cpu, ExternalLink, Filter, Radio, Layers, Zap, 
  Thermometer, Gauge, Signal, AlertTriangle, ChevronDown
} from 'lucide-react';
import { OFFICIAL_INDEX_ROWS, IndexRow } from '../data/nobresProjectData';

// ──────────────────────────────────────────────────────────────
//  Metadados de cada Remota (nome descritivo + área)
// ──────────────────────────────────────────────────────────────
const REMOTA_METADATA: Record<string, { name: string; area: string }> = {
  Z3RM01: { name: 'Remota 01 – Eletrocentro SE1', area: 'Eletrocentro Z3SE1 / Cubículo de Entrada' },
  Z3RM02: { name: 'Remota 02 – Silos de Clínquer, Pozolana, Gesso e Calcário', area: 'Silos G3L01~G3L04 / Filtro U3P01' },
  Z3RM04: { name: 'Remota 04 – Separador Dinâmico & Elevadores', area: 'Separador Z3S01 / Elevadores Z3J15, Z3U08' },
  Z3RM05: { name: 'Remota 05 – Motor do Moinho & Instrumentação', area: 'Motor Z3M03M1, Redutor, Injeção de Água' },
  Z3RM06: { name: 'Remota 06 – Filtros de Processo Z3P71/Z3P72', area: 'Ventilador Z3P72M1, Filtro Z3P71, Chaminé' },
  Z3RM07: { name: 'Remota 07 – Filtro Z3P61 & Transporte', area: 'Filtro Z3P61, Rosca Z3P63, Válvula Z3P64' },
  Z3RM08: { name: 'Remota 08 – Filtros Z3P81 & Z3P91', area: 'Filtros de Despoeiramento Z3P81 / Z3P91' },
  Z3RM09: { name: 'Remota 09 – Eletrocentro SE3', area: 'Eletrocentro Z3SE3 / Incêndio e Temperatura' },
};

// ──────────────────────────────────────────────────────────────
//  Interface para cada tag mapeada a uma Remota
// ──────────────────────────────────────────────────────────────
interface RemotaTagEntry {
  remotaId: string;
  remotaName: string;
  tagCode: string;
  description: string;
  category: string;
  pageNumber: number;
  sheetCode: string;
  area: string;
  /** Texto concatenado para busca — inclui aliases como RM6, RM06, REMOTA 6 etc. */
  searchText: string;
}

// ──────────────────────────────────────────────────────────────
//  Gera aliases de pesquisa para cada Remota (RM6 → Z3RM06)
// ──────────────────────────────────────────────────────────────
function buildRemotaSearchAliases(remotaId: string): string {
  // De "Z3RM06" extrai número 06 → gera "RM06", "RM6", "REMOTA 06", "REMOTA 6"
  const match = remotaId.match(/Z3RM(\d+)/);
  if (!match) return remotaId;
  const num = match[1];                         // "06"
  const numShort = String(parseInt(num, 10));    // "6"
  return [
    remotaId,               // Z3RM06
    `RM${num}`,             // RM06
    `RM${numShort}`,        // RM6
    `RM-${num}`,            // RM-06
    `RM-${numShort}`,       // RM-6
    `REMOTA ${num}`,        // REMOTA 06
    `REMOTA ${numShort}`,   // REMOTA 6
    `REMOTA${numShort}`,    // REMOTA6
  ].join(' ');
}

// ──────────────────────────────────────────────────────────────
//  Gera a lista completa de tags por Remota a partir do
//  OFFICIAL_INDEX_ROWS (fonte de dados real do projeto)
// ──────────────────────────────────────────────────────────────
function buildRemotaTagList(): RemotaTagEntry[] {
  const entries: RemotaTagEntry[] = [];

  for (const row of OFFICIAL_INDEX_ROWS) {
    // Só nos interessa linhas vinculadas a uma Remota
    if (!row.panel || !row.panel.startsWith('Z3RM')) continue;
    if (!row.primaryTag) continue;

    const remotaId = row.panel;
    const meta = REMOTA_METADATA[remotaId];
    const remotaName = meta ? meta.name : remotaId;
    const area = meta ? meta.area : row.description;

    // Texto concatenado para busca — inclui aliases
    const searchText = [
      row.primaryTag,
      row.description,
      remotaId,
      remotaName,
      row.sheetCode,
      area,
      buildRemotaSearchAliases(remotaId),
      `FL ${row.pageNumber}`,
      `FOLHA ${row.pageNumber}`,
      `PG ${row.pageNumber}`,
    ].join(' ').toLowerCase();

    entries.push({
      remotaId,
      remotaName,
      tagCode: row.primaryTag,
      description: row.description,
      category: row.category,
      pageNumber: row.pageNumber,
      sheetCode: row.sheetCode,
      area,
      searchText,
    });
  }

  // Ordenar por Remota e depois por página
  entries.sort((a, b) => {
    if (a.remotaId !== b.remotaId) return a.remotaId.localeCompare(b.remotaId);
    return a.pageNumber - b.pageNumber;
  });

  return entries;
}

const ALL_REMOTA_TAGS = buildRemotaTagList();

// ──────────────────────────────────────────────────────────────
//  Helper: ícone de categoria
// ──────────────────────────────────────────────────────────────
function CategoryIcon({ category }: { category: string }) {
  switch (category) {
    case 'INSTRUMENT': return <Gauge className="w-3.5 h-3.5 text-cyan-400" />;
    case 'CONTROL':    return <Zap className="w-3.5 h-3.5 text-amber-400" />;
    case 'SILO':       return <Layers className="w-3.5 h-3.5 text-emerald-400" />;
    case 'FILTER':     return <Signal className="w-3.5 h-3.5 text-violet-400" />;
    default:           return <Cpu className="w-3.5 h-3.5 text-slate-400" />;
  }
}

function categoryLabel(cat: string): string {
  switch (cat) {
    case 'INSTRUMENT': return 'Instrumentação';
    case 'CONTROL':    return 'Controle';
    case 'SILO':       return 'Silo / Nível';
    case 'FILTER':     return 'Filtro';
    case 'CONVEYOR':   return 'Transporte';
    case 'POWER':      return 'Potência';
    default:           return cat;
  }
}

// ──────────────────────────────────────────────────────────────
//  Componente Principal
// ──────────────────────────────────────────────────────────────
interface RemotaSearchTabProps {
  onNavigateToPage: (pageNumber: number, tagCode: string) => void;
}

export const RemotaSearchTab: React.FC<RemotaSearchTabProps> = ({ onNavigateToPage }) => {
  const [selectedRemotaId, setSelectedRemotaId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Lista única de Remotas presentes nos dados
  const remotaIds = useMemo(() => {
    const ids = new Set<string>();
    ALL_REMOTA_TAGS.forEach((e) => ids.add(e.remotaId));
    return Array.from(ids).sort();
  }, []);

  // Categorias únicas disponíveis no filtro ativo
  const categoryOptions = useMemo(() => {
    const cats = new Set<string>();
    ALL_REMOTA_TAGS.forEach((e) => {
      if (selectedRemotaId === 'ALL' || e.remotaId === selectedRemotaId) {
        cats.add(e.category);
      }
    });
    return Array.from(cats).sort();
  }, [selectedRemotaId]);

  // Filtragem precisa
  const filteredTags = useMemo(() => {
    return ALL_REMOTA_TAGS.filter((entry) => {
      // Filtro por Remota
      if (selectedRemotaId !== 'ALL' && entry.remotaId !== selectedRemotaId) return false;
      // Filtro por categoria
      if (selectedCategory !== 'ALL' && entry.category !== selectedCategory) return false;
      // Busca textual
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          entry.tagCode.toLowerCase().includes(q) ||
          entry.description.toLowerCase().includes(q) ||
          entry.remotaId.toLowerCase().includes(q) ||
          entry.remotaName.toLowerCase().includes(q) ||
          entry.sheetCode.toLowerCase().includes(q) ||
          entry.area.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedRemotaId, selectedCategory, searchQuery]);

  // Estatísticas da seleção ativa
  const stats = useMemo(() => {
    const byRemota = new Map<string, number>();
    filteredTags.forEach((e) => {
      byRemota.set(e.remotaId, (byRemota.get(e.remotaId) || 0) + 1);
    });
    return {
      totalTags: filteredTags.length,
      totalRemotas: byRemota.size,
      byRemota,
    };
  }, [filteredTags]);

  const activeRemotaLabel = useMemo(() => {
    if (selectedRemotaId === 'ALL') return 'Todas as Remotas do Projeto';
    const meta = REMOTA_METADATA[selectedRemotaId];
    return meta ? meta.name : selectedRemotaId;
  }, [selectedRemotaId]);

  const activeRemotaArea = useMemo(() => {
    if (selectedRemotaId === 'ALL') return 'Projeto Votorantim Moagem Z3 – Nobres MT';
    const meta = REMOTA_METADATA[selectedRemotaId];
    return meta ? meta.area : '';
  }, [selectedRemotaId]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">

      {/* ─── CABEÇALHO & FILTROS ─────────────────────────── */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 lg:p-6 shrink-0 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Mapeamento Preciso de I/O por Remota</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">
              Pesquisa de Remotas — Tags Conectadas
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Filtro extraído do índice oficial do diagrama. Cada linha corresponde a uma folha do PDF vinculada a uma Remota.
            </p>
          </div>

          {/* Barra de Busca */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar tag, descrição, remota..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-500 hover:text-white text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Filtro de Categoria */}
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-cyan-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-slate-200">Todas as Categorias</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-slate-200">
                    {categoryLabel(c)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chips de seleção de Remotas */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => { setSelectedRemotaId('ALL'); setSelectedCategory('ALL'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
              selectedRemotaId === 'ALL'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md font-semibold'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            Todas ({ALL_REMOTA_TAGS.length})
          </button>

          {remotaIds.map((rId) => {
            const count = ALL_REMOTA_TAGS.filter((e) => e.remotaId === rId).length;
            const isSelected = selectedRemotaId === rId;
            return (
              <button
                key={rId}
                onClick={() => { setSelectedRemotaId(rId); setSelectedCategory('ALL'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-600 text-white border-cyan-300 shadow-md font-bold'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-500 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-300" />
                <span>{rId}</span>
                <span className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── CONTEÚDO PRINCIPAL ───────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-4">

          {/* Card resumo */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white font-mono">{activeRemotaLabel}</h2>
                <span className="text-xs text-slate-400">{activeRemotaArea}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
              <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
                <span className="text-slate-500 mr-1">Tags:</span>
                <span className="text-cyan-400 font-bold">{stats.totalTags}</span>
              </div>
              <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
                <span className="text-slate-500 mr-1">Remotas:</span>
                <span className="text-emerald-400 font-bold">{stats.totalRemotas}</span>
              </div>
              <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
                <span className="text-slate-500 mr-1">Fonte:</span>
                <span className="text-amber-400 font-bold">Índice Oficial NB.I.Z3001.505</span>
              </div>
            </div>
          </div>

          {/* Tabela de tags por Remota */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    <th className="py-3 px-4">Remota</th>
                    <th className="py-3 px-4">Tag Conectada</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Descrição da Folha</th>
                    <th className="py-3 px-4">Folha PDF</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredTags.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                        Nenhuma tag encontrada com os filtros atuais.
                      </td>
                    </tr>
                  ) : (
                    filteredTags.map((entry, idx) => (
                      <tr
                        key={`${entry.remotaId}-${entry.tagCode}-${idx}`}
                        className="hover:bg-cyan-950/30 transition-colors group"
                      >
                        {/* Remota ID */}
                        <td className="py-3 px-4 font-mono whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold text-[11px]">
                            {entry.remotaId}
                          </span>
                        </td>

                        {/* Tag Conectada */}
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                          {entry.tagCode}
                        </td>

                        {/* Categoria */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <CategoryIcon category={entry.category} />
                            <span className="text-slate-300">{categoryLabel(entry.category)}</span>
                          </div>
                        </td>

                        {/* Descrição */}
                        <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={entry.description}>
                          {entry.description}
                        </td>

                        {/* Folha PDF */}
                        <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-bold">
                            Fl. {entry.pageNumber} ({entry.sheetCode})
                          </span>
                        </td>

                        {/* Ver no Diagrama */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => onNavigateToPage(entry.pageNumber, entry.tagCode)}
                            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold font-mono inline-flex items-center gap-1.5 shadow transition-all hover:scale-105"
                            title={`Abrir folha ${entry.pageNumber} e destacar ${entry.tagCode}`}
                          >
                            <span>Ver no Diagrama</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumo por Remota (visível quando "Todas" está selecionada) */}
          {selectedRemotaId === 'ALL' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {remotaIds.map((rId) => {
                const meta = REMOTA_METADATA[rId];
                const count = ALL_REMOTA_TAGS.filter((e) => e.remotaId === rId).length;
                const tags = ALL_REMOTA_TAGS.filter((e) => e.remotaId === rId);
                const categories = new Set(tags.map((t) => t.category));
                return (
                  <button
                    key={rId}
                    onClick={() => { setSelectedRemotaId(rId); setSelectedCategory('ALL'); }}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left hover:border-cyan-600 transition-all group hover:shadow-lg hover:shadow-cyan-900/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
                      <span className="font-mono font-bold text-cyan-300 text-sm">{rId}</span>
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                        {count} tags
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium truncate">
                      {meta ? meta.name.replace(/^Remota \d+ – /, '') : rId}
                    </p>
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {Array.from(categories).map((cat) => (
                        <span key={cat} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                          {categoryLabel(cat)}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
