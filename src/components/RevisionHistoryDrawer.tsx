import React from 'react';
import { History, Check, ArrowRight, ShieldAlert, FileText, Calendar, UserCheck } from 'lucide-react';
import { DocumentRevision } from '../types/diagram';

interface RevisionHistoryDrawerProps {
  revisions: DocumentRevision[];
  activeRevision: string;
  onSelectActiveRevision: (rev: string) => void;
  onOpenUpload: () => void;
}

export const RevisionHistoryDrawer: React.FC<RevisionHistoryDrawerProps> = ({
  revisions,
  activeRevision,
  onSelectActiveRevision,
  onOpenUpload
}) => {
  return (
    <div className="flex-1 bg-slate-950 p-6 overflow-y-auto text-slate-200">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <History className="w-4 h-4" />
              <span>Controle de Engenharia e Rastreabilidade</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Histórico de Revisões do Diagrama (NB.I.Z3001.505)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Todas as emissões registradas para o projeto Moagem Z3 - Votorantim Nobres MT.
            </p>
          </div>

          <button
            onClick={onOpenUpload}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm self-start sm:self-auto"
          >
            Subir Nova Revisão
          </button>
        </div>

        {/* Timeline of Revisions */}
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
                          <span className="text-[11px] text-slate-500">Histórico</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
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

                  {!isCurrent && (
                    <button
                      onClick={() => onSelectActiveRevision(rev.revision)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 border border-slate-700 rounded-lg transition-colors self-start sm:self-auto"
                    >
                      Ativar esta Revisão
                    </button>
                  )}
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
                      <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                        Modificações Realizadas nesta Revisão:
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
      </div>
    </div>
  );
};
