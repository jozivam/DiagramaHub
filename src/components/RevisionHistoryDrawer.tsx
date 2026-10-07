import React, { useState } from 'react';
import { 
  History, Check, ArrowRight, ShieldAlert, FileText, Calendar, 
  UserCheck, Trash2, GitCompare, Layers, Tag, Cable, AlertTriangle, RefreshCw
} from 'lucide-react';
import { DocumentRevision } from '../types/diagram';

interface RevisionHistoryDrawerProps {
  revisions: DocumentRevision[];
  activeRevision: string;
  onSelectActiveRevision: (rev: string) => void;
  onDeleteRevision: (rev: string) => void;
  onOpenUpload: () => void;
}

export const RevisionHistoryDrawer: React.FC<RevisionHistoryDrawerProps> = ({
  revisions,
  activeRevision,
  onSelectActiveRevision,
  onDeleteRevision,
  onOpenUpload
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'compare'>('timeline');
  const [baseRev, setBaseRev] = useState<string>('02');
  const [targetRev, setTargetRev] = useState<string>('03');
  const [revToDelete, setRevToDelete] = useState<string | null>(null);

  const activeRevObj = revisions.find((r) => r.revision === activeRevision) || revisions[0];

  const handleConfirmDelete = (rev: string) => {
    onDeleteRevision(rev);
    setRevToDelete(null);
  };

  return (
    <div className="flex-1 bg-slate-950 p-4 sm:p-6 overflow-y-auto text-slate-200">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <History className="w-4 h-4" />
              <span>Controle de Engenharia & Cruzamento de Revisões</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 flex items-center gap-3">
              <span>Histórico de Emissões (NB.I.Z3001.505)</span>
              <span className="text-xs font-mono px-2.5 py-1 bg-cyan-950 border border-cyan-700/80 text-cyan-300 rounded-lg">
                Rev Ativa: {activeRevision}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Gerencie emissões, faça cruzamento comparativo de dados entre revisões e exclua versões quando necessário.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'bg-cyan-900/80 text-cyan-200 border border-cyan-500/50'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Linha do Tempo</span>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'compare'
                  ? 'bg-cyan-900/80 text-cyan-200 border border-cyan-500/50'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Cruzar Dados das Revisões</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm shadow-cyan-900/40"
            >
              + Nova Revisão
            </button>
          </div>
        </div>

        {/* Modal / Alert de Confirmação de Exclusão */}
        {revToDelete && (
          <div className="p-4 bg-rose-950/40 border border-rose-600/60 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold text-rose-200">Excluir Revisão {revToDelete}?</span>
                <p className="text-rose-300/80 text-[11px] mt-0.5">
                  Esta ação irá remover o registro da Revisão {revToDelete} do histórico e recalcular os índices de busca.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setRevToDelete(null)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleConfirmDelete(revToDelete)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded shadow-sm"
              >
                Sim, Excluir Revisão
              </button>
            </div>
          </div>
        )}

        {/* MODO 1: LINHA DO TEMPO DE REVISÕES */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {revisions.map((rev) => {
              const isCurrent = rev.revision === activeRevision;

              return (
                <div
                  key={rev.revision}
                  className={`p-5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-black ${
                          isCurrent
                            ? 'bg-cyan-600 text-white shadow'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="text-[10px] leading-none uppercase font-normal">Rev</span>
                        <span className="text-lg leading-tight">{rev.revision}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-white">
                            Revisão {rev.revision}
                          </h3>
                          {isCurrent ? (
                            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-600/50 px-2 py-0.5 rounded-full">
                              REVISÃO ATIVA NO SISTEMA
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-mono">Histórico</span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {rev.date}
                          </span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                            Aprovador: {rev.requestedBy}
                          </span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span>Projetista: {rev.revisedBy}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {!isCurrent && (
                        <button
                          onClick={() => onSelectActiveRevision(rev.revision)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 border border-slate-700 rounded-lg transition-colors"
                        >
                          Tornar Ativa
                        </button>
                      )}

                      {revisions.length > 1 && (
                        <button
                          onClick={() => setRevToDelete(rev.revision)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/60 rounded-lg transition-colors"
                          title={`Excluir Revisão ${rev.revision}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 space-y-2 text-xs">
                    <div className="font-semibold text-slate-300">
                      Descrição do Escopo / Emissão:
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      {rev.description}
                    </p>

                    {rev.changesSummary && rev.changesSummary.length > 0 && (
                      <div className="mt-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                        <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                          <span>Modificações Realizadas nesta Revisão:</span>
                          <span className="text-[10px] text-slate-500 font-mono">{rev.totalPages} Folhas Indexadas</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                          {rev.changesSummary.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODO 2: CRUZAMENTO E COMPARAÇÃO ENTRE REVISÕES (DIFF) */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            {/* Controladores da Comparação */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <GitCompare className="w-4 h-4" />
                <span>Selecione as Revisões para Cruzamento de Dados:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Revisão Anterior (Base):</label>
                  <select
                    value={baseRev}
                    onChange={(e) => setBaseRev(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-cyan-400 focus:outline-none"
                  >
                    {revisions.map((r) => (
                      <option key={r.revision} value={r.revision}>
                        Rev {r.revision} ({r.date}) - {r.description.slice(0, 40)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Revisão Recente (Comparada):</label>
                  <select
                    value={targetRev}
                    onChange={(e) => setTargetRev(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:border-cyan-400 focus:outline-none"
                  >
                    {revisions.map((r) => (
                      <option key={r.revision} value={r.revision}>
                        Rev {r.revision} ({r.date}) - {r.description.slice(0, 40)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Painel Comparativo Resumido */}
            <div className="p-5 bg-slate-900/80 border border-cyan-800/60 rounded-xl space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <span>Relatório de Cruzamento: Rev {baseRev} ➔ Rev {targetRev}</span>
                </h3>
                <span className="text-xs text-cyan-300 font-mono bg-cyan-950 border border-cyan-800 px-2.5 py-1 rounded">
                  Status: Revisão Comparada com Sucesso
                </span>
              </div>

              {/* Grid de Estatísticas do Cruzamento */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[11px]">Tags Novas / KKS</div>
                  <div className="text-lg font-mono font-bold text-emerald-400 mt-1">+12 Tags</div>
                  <div className="text-[10px] text-slate-400">Giro Lento & WHO2</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[11px]">Cabos Reindexados</div>
                  <div className="text-lg font-mono font-bold text-cyan-400 mt-1">6 Circuitos</div>
                  <div className="text-[10px] text-slate-400">Fases F1..F6 6,6kV</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[11px]">Folhas Alteradas</div>
                  <div className="text-lg font-mono font-bold text-amber-400 mt-1">8 Folhas</div>
                  <div className="text-[10px] text-slate-400">Págs 19, 20, 21, 29, 32...</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[11px]">Total de Folhas</div>
                  <div className="text-lg font-mono font-bold text-purple-400 mt-1">337 Folhas</div>
                  <div className="text-[10px] text-slate-400">Índice Mantido</div>
                </div>
              </div>

              {/* Tabela Detalhada do Cruzamento */}
              <div className="space-y-3 pt-2">
                <div className="font-semibold text-slate-300">
                  Detalhamento de Alterações Encontradas entre Rev {baseRev} e Rev {targetRev}:
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-950">
                  <table className="w-full text-left divide-y divide-slate-800 font-mono text-[11px]">
                    <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-3 py-2">Folha</th>
                        <th className="px-3 py-2">Elemento / Tag</th>
                        <th className="px-3 py-2">Estado na Rev {baseRev}</th>
                        <th className="px-3 py-2">Estado na Rev {targetRev}</th>
                        <th className="px-3 py-2">Impacto / Categoria</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      <tr>
                        <td className="px-3 py-2 text-cyan-400 font-bold">Pág 20 (Folha 19)</td>
                        <td className="px-3 py-2 text-white font-bold">416BM01MT10WHO2</td>
                        <td className="px-3 py-2 text-slate-500">Não Mapeado</td>
                        <td className="px-3 py-2 text-emerald-400 font-bold">Cadastrado / KKS</td>
                        <td className="px-3 py-2 text-slate-400">Dispositivo Giro Lento Motor</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-cyan-400 font-bold">Pág 20 (Folha 19)</td>
                        <td className="px-3 py-2 text-white font-bold">416BM01MT10WHO1</td>
                        <td className="px-3 py-2 text-slate-500">Não Mapeado</td>
                        <td className="px-3 py-2 text-emerald-400 font-bold">Cadastrado / KKS</td>
                        <td className="px-3 py-2 text-slate-400">Entrada Quadro Giro Lento</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-cyan-400 font-bold">Pág 20 (Folha 19)</td>
                        <td className="px-3 py-2 text-white font-bold">Z3M03M1F1..F6</td>
                        <td className="px-3 py-2 text-amber-300">Generico</td>
                        <td className="px-3 py-2 text-cyan-300 font-bold">3x(1C#150mm²) 6.6kV</td>
                        <td className="px-3 py-2 text-slate-400">Cabos de Alimentação Estator</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-cyan-400 font-bold">Pág 29 (Folha 27)</td>
                        <td className="px-3 py-2 text-white font-bold">416FA21EC10</td>
                        <td className="px-3 py-2 text-slate-500">Apenas ISA Z3P62Q1</td>
                        <td className="px-3 py-2 text-emerald-400 font-bold">Mapeado KKS ↔ ISA</td>
                        <td className="px-3 py-2 text-slate-400">Soft-Starter Ventilador 90kW</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-cyan-400 font-bold">Pág 32 (Folha 30)</td>
                        <td className="px-3 py-2 text-white font-bold">416SP09EC10</td>
                        <td className="px-3 py-2 text-slate-500">Apenas ISA Z3S01Q1</td>
                        <td className="px-3 py-2 text-emerald-400 font-bold">Mapeado KKS ↔ ISA</td>
                        <td className="px-3 py-2 text-slate-400">Inversor Separador 135kW</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
