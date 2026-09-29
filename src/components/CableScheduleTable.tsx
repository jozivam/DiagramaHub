import React, { useState } from 'react';
import { Cable, Search, Download, Filter, ExternalLink, CheckCircle2, Clock } from 'lucide-react';
import { CableScheduleItem } from '../types/diagram';

interface CableScheduleTableProps {
  cables: CableScheduleItem[];
  onNavigateToPage: (pageNumber: number, cableTag: string) => void;
}

export const CableScheduleTable: React.FC<CableScheduleTableProps> = ({
  cables,
  onNavigateToPage
}) => {
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredCables = cables.filter((c) => {
    const matchesSearch =
      c.cableTag.toLowerCase().includes(query.toLowerCase()) ||
      c.cableSpec.toLowerCase().includes(query.toLowerCase()) ||
      c.originTag.toLowerCase().includes(query.toLowerCase()) ||
      c.destinationTag.toLowerCase().includes(query.toLowerCase()) ||
      c.functionDescription.toLowerCase().includes(query.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = [
      'Tag do Cabo',
      'Especificacao',
      'Origem',
      'Terminais Origem',
      'Destino',
      'Terminais Destino',
      'Funcao',
      'Pagina Ref',
      'Status'
    ];

    const rows = filteredCables.map((c) => [
      `"${c.cableTag}"`,
      `"${c.cableSpec}"`,
      `"${c.originTag}"`,
      `"${c.originTerminal}"`,
      `"${c.destinationTag}"`,
      `"${c.destinationTerminal}"`,
      `"${c.functionDescription}"`,
      c.pageReference,
      c.status
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `diagramhub_de_para_cabos_Z3.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 bg-slate-950 p-4 sm:p-6 overflow-y-auto text-slate-200">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header & Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Cable className="w-4 h-4" />
              <span>Mapeamento Automatizado de Interligação</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Lista de Cabos & De-Para de Bornes (Cable Schedule)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Relação completa de condutores de força, comando, instrumentação e bornes de campo indexados do projeto NB.I.Z3001.505.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV / Relatório</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por tag do cabo, bitola, régua ou equipamento..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Status:</span>
            {(['ALL', 'COMMISSIONED', 'INSTALLED', 'PENDING_FIELD'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  filterStatus === st
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-800'
                }`}
              >
                {st === 'ALL' && 'Todos'}
                {st === 'COMMISSIONED' && 'Comissionados'}
                {st === 'INSTALLED' && 'Instalados'}
                {st === 'PENDING_FIELD' && 'Pendentes'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-mono text-[11px]">
                  <th className="py-3 px-4 font-semibold">TAG DO CABO</th>
                  <th className="py-3 px-4 font-semibold">ESPECIFICAÇÃO</th>
                  <th className="py-3 px-4 font-semibold">ORIGEM & BORNES</th>
                  <th className="py-3 px-4 font-semibold">DESTINO & BORNES</th>
                  <th className="py-3 px-4 font-semibold">FUNÇÃO DO CIRCUITO</th>
                  <th className="py-3 px-4 font-semibold text-center">PÁG REF</th>
                  <th className="py-3 px-4 font-semibold text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredCables.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Nenhum cabo encontrado para o filtro aplicado.
                    </td>
                  </tr>
                ) : (
                  filteredCables.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onNavigateToPage(c.pageReference, c.cableTag)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-cyan-300 text-xs">
                        {c.cableTag}
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-300 text-[11px]">
                        {c.cableSpec}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div className="font-medium text-xs">{c.originTag}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{c.originTerminal}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div className="font-medium text-xs">{c.destinationTag}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{c.destinationTerminal}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs max-w-xs truncate">
                        {c.functionDescription}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          Pág {c.pageReference}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToPage(c.pageReference, c.cableTag);
                          }}
                          className="px-2.5 py-1 text-xs text-cyan-300 hover:text-white bg-slate-800 hover:bg-cyan-900/50 border border-slate-700 hover:border-cyan-500 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <span>Abrir Diagrama</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-between">
          <span>Total catalogado: {filteredCables.length} cabos</span>
          <span>Projeto: Moagem Z3 Nobres MT · Desenho AE-TA-0375-DI001</span>
        </div>
      </div>
    </div>
  );
};
