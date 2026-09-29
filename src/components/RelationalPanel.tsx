import React, { useState } from 'react';
import { 
  Network, ArrowRight, CornerDownLeft, ExternalLink, Copy, Check, 
  Layers, Cpu, Cable, Hash, Zap, Shield, PlusCircle, Wrench, ChevronRight
} from 'lucide-react';
import { TagItem, DiagramPage } from '../types/diagram';
import { findTagOccurrencesAcrossDocument } from '../utils/tagParser';

interface RelationalPanelProps {
  selectedTag: TagItem | null;
  currentPage: DiagramPage;
  allPages: DiagramPage[];
  onNavigateToPageAndTag: (pageNumber: number, tagCode: string) => void;
  onAddToChecklist: (tagCode: string, pageNumber: number, description: string) => void;
}

export const RelationalPanel: React.FC<RelationalPanelProps> = ({
  selectedTag,
  currentPage,
  allPages,
  onNavigateToPageAndTag,
  onAddToChecklist
}) => {
  const [copied, setCopied] = useState(false);
  const [addedToChecklist, setAddedToChecklist] = useState(false);

  // If no tag is selected, let's take the first primary tag on current page as default preview
  const activeTag = selectedTag || currentPage.tags[0] || null;

  const occurrences = activeTag
    ? findTagOccurrencesAcrossDocument(activeTag.code, allPages)
    : [];

  const handleCopyTag = () => {
    if (!activeTag) return;
    navigator.clipboard?.writeText(activeTag.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddChecklist = () => {
    if (!activeTag) return;
    onAddToChecklist(activeTag.code, activeTag.pageNumber, activeTag.description);
    setAddedToChecklist(true);
    setTimeout(() => setAddedToChecklist(false), 2500);
  };

  if (!activeTag) {
    return (
      <aside className="w-80 h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center text-slate-400">
        <Network className="w-10 h-10 text-slate-600 mb-3 opacity-60" />
        <h4 className="font-semibold text-slate-200 text-sm">Nenhuma Tag Selecionada</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Clique em qualquer tag ou componente no diagrama vetorial ou use a barra de busca (Ctrl+K) para inspecionar as conexões relacionais.
        </p>
      </aside>
    );
  }

  return (
    <aside className="w-84 xl:w-96 h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 text-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-cyan-950 border border-cyan-800/80 text-cyan-400">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                Contexto Relacional
              </div>
              <h3 className="font-mono text-base font-bold text-white tracking-tight">
                {activeTag.code}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyTag}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
              title="Copiar código da tag"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tag Meta Details */}
        <div className="mt-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>Classificação ISA:</span>
            <span className="font-medium text-cyan-300 font-mono">{activeTag.type}</span>
          </div>
          <div className="text-slate-300 leading-snug">
            {activeTag.description}
          </div>
          {activeTag.spec && (
            <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-slate-400 font-mono text-[11px]">
              <span>Especificação:</span>
              <span className="text-amber-300">{activeTag.spec}</span>
            </div>
          )}
          {activeTag.locationArea && (
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Área / Local:</span>
              <span className="text-slate-200">{activeTag.locationArea}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Relational Occurrences Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Onde mais aparece neste projeto */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Onde mais aparece neste projeto ({occurrences.length}):</span>
            <span className="text-[10px] text-slate-500 font-mono">Doc: {currentPage.drawingNumber}</span>
          </div>

          <div className="space-y-2">
            {occurrences.map((occ) => {
              const isCurrent = occ.page.pageNumber === currentPage.pageNumber;

              return (
                <div
                  key={`${occ.page.pageNumber}-${occ.tag.id}`}
                  onClick={() => onNavigateToPageAndTag(occ.page.pageNumber, activeTag.code)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-white shadow-sm'
                      : 'bg-slate-950/40 hover:bg-slate-800/70 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-cyan-400 font-bold text-xs">
                        Pág {String(occ.page.pageNumber).padStart(2, '0')}
                      </span>
                      <span className="font-semibold text-xs text-white truncate max-w-[170px]">
                        {occ.page.title}
                      </span>
                    </div>

                    <div className="flex items-center text-xs text-slate-400 group-hover:text-cyan-300">
                      {isCurrent ? (
                        <span className="text-[10px] text-cyan-400 font-medium">Página Atual</span>
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>

                  {occ.page.panel && (
                    <div className="mt-1 text-[11px] text-slate-400 font-mono">
                      Painel: <span className="text-slate-300">{occ.page.panel}</span>
                    </div>
                  )}

                  {/* Associated relations on this page */}
                  {occ.tag.relations && occ.tag.relations.length > 0 && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 text-[11px] text-slate-400">
                      <span className="text-slate-500">Vínculo:</span> {occ.tag.relations[0].description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rotas de Interligação De-Para */}
        {activeTag.relations && activeTag.relations.length > 0 && (
          <div className="pt-2 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-400 mb-2">
              Rotas Relacionais Mapeadas:
            </div>
            <div className="space-y-2">
              {activeTag.relations.map((rel, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigateToPageAndTag(rel.targetPageNumber, activeTag.code)}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>{rel.relationType}</span>
                    <span className="text-slate-500 font-mono text-[11px]">→ Pág {rel.targetPageNumber}</span>
                  </div>
                  <div className="text-slate-300 text-[11px] leading-snug">
                    {rel.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ações Técnicas de Campo */}
        <div className="pt-2 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-2">
            Ações de Campo:
          </div>
          <button
            onClick={handleAddChecklist}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors"
          >
            {addedToChecklist ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Adicionado ao Check-list!</span>
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span>Adicionar ao Check-list de Campo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
