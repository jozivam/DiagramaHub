import React, { useState, useEffect, useRef } from 'react';
import { Search, X, CornerDownLeft, ArrowRight, Layers, Tag, Cable, Cpu, Hash, ExternalLink, Bookmark } from 'lucide-react';
import { DiagramPage, TagItem, TagType } from '../types/diagram';
import { searchTagsInPages, SearchResultItem } from '../utils/tagParser';

interface SearchSpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: DiagramPage[];
  onSelectTagResult: (pageNumber: number, tagCode: string) => void;
  recentSearches: string[];
  onAddRecentSearch: (query: string) => void;
}

export const SearchSpotlightModal: React.FC<SearchSpotlightModalProps> = ({
  isOpen,
  onClose,
  pages,
  onSelectTagResult,
  recentSearches,
  onAddRecentSearch
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<TagType | 'ALL'>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  // Global shortcut Ctrl+K / Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = searchTagsInPages(query, pages, filterType);

  // Keyboard navigation up / down / enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelect(searchResults[selectedIndex]);
      } else if (query.trim()) {
        onAddRecentSearch(query.trim());
      }
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    onAddRecentSearch(item.tag.code);
    onSelectTagResult(item.page.pageNumber, item.tag.code);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/90 gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Digite a tag (ex: Z3M03M1, A1J02M1, RM1-SL8:A2, Z3P62Q1, Z3-CCM02)..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none font-mono"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 rounded border border-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Filter Bar (Zero-pill discipline: segmented interactive buttons) */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50 text-xs text-slate-400 overflow-x-auto">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-slate-500 mr-1.5 hidden sm:inline">Filtrar por:</span>
            {(['ALL', 'EQUIPMENT', 'CABLE', 'PANEL', 'TERMINAL_BORNE'] as const).map((type) => (
              <button
                key={type}
                onClick={() => { setFilterType(type); setSelectedIndex(0); }}
                className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors whitespace-nowrap ${
                  filterType === type
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {type === 'ALL' && 'Todos'}
                {type === 'EQUIPMENT' && 'Equipamentos'}
                {type === 'CABLE' && 'Cabos'}
                {type === 'PANEL' && 'Painéis / CCM'}
                {type === 'TERMINAL_BORNE' && 'Bornes / Réguas'}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-500 font-mono hidden md:inline shrink-0">
            {searchResults.length} {searchResults.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>

        {/* Quick Suggestions & Recent Searches */}
        {!query && (
          <div className="p-4 border-b border-slate-800 bg-slate-900/30">
            <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
              <span>Tags em Destaque da Moagem Z3 (Clique para buscar rápido):</span>
              <span className="text-[11px] text-slate-500">Revisão Ativa: Rev 02</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { tag: 'Z3M03M1', desc: 'Motor Principal Moinho 3700CV (Págs 6, 19, 20, 21)' },
                { tag: 'A1J02M1', desc: 'Motor 55kW SU1 (Pág 4)' },
                { tag: 'RM1-SL8:A2', desc: 'Borne Analógico Remota 01 (Pág 3)' },
                { tag: 'Z3P62Q1', desc: 'Soft-Starter Ventilador 90kW (Págs 27, 28)' },
                { tag: 'Z3S01Q1', desc: 'Inversor Separador Dinâmico 135kW (Pág 30, 31)' },
                { tag: 'Z3P71', desc: 'Programador Filtro 52 Válvulas (Pág 51)' },
                { tag: 'Z3P34_AT1', desc: 'Opacímetro Chaminé (Pág 337)' },
                { tag: 'Z3-CCM02', desc: 'Alimentação CCM 02 (Pág 34, 192)' }
              ].map((item) => (
                <button
                  key={item.tag}
                  onClick={() => setQuery(item.tag)}
                  className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-cyan-950/40 border border-slate-700/80 hover:border-cyan-500/50 rounded-lg text-slate-300 hover:text-cyan-200 transition-all font-mono text-xs"
                >
                  <Tag className="w-3 h-3 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">{item.tag}</span>
                  <span className="text-[10px] text-slate-500 font-sans group-hover:text-slate-400 hidden sm:inline">
                    · {item.desc}
                  </span>
                </button>
              ))}
            </div>

            {recentSearches.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-800/60">
                <div className="text-[11px] text-slate-500 mb-1.5">Buscas Recentes:</div>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((rec, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(rec)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
                    >
                      {rec}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results List */}
        <div className="overflow-y-auto divide-y divide-slate-800/60 p-2 max-h-[55vh]">
          {searchResults.length === 0 && query ? (
            <div className="p-8 text-center text-slate-400">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <div className="font-medium text-slate-300">Nenhuma tag ou circuito encontrado para "{query}"</div>
              <p className="text-xs text-slate-500 mt-1">
                Tente buscar por código ISA de equipamento (ex: Z3M03M1), cabo (ex: Z3M03M1C3), painel (ex: Z3RM01) ou número de página (ex: 21).
              </p>
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.page.pageNumber}-${item.tag.id}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-lg cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-cyan-950/40 border border-cyan-500/40 text-white'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-2 rounded-lg bg-slate-800 border border-slate-700/60 shrink-0">
                      {item.tag.type === 'EQUIPMENT' && <Cpu className="w-4 h-4 text-cyan-400" />}
                      {item.tag.type === 'CABLE' && <Cable className="w-4 h-4 text-amber-400" />}
                      {item.tag.type === 'PANEL' && <Layers className="w-4 h-4 text-emerald-400" />}
                      {item.tag.type === 'TERMINAL_BORNE' && <Hash className="w-4 h-4 text-purple-400" />}
                      {item.tag.type !== 'EQUIPMENT' &&
                        item.tag.type !== 'CABLE' &&
                        item.tag.type !== 'PANEL' &&
                        item.tag.type !== 'TERMINAL_BORNE' && (
                          <Tag className="w-4 h-4 text-blue-400" />
                        )}
                    </div>

                    <div>
                      {/* Tag Code + Exact Match Badge */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-white tracking-wide">
                          {item.tag.code}
                        </span>
                        {item.isExactMatch && (
                          <span className="text-[10px] font-semibold tracking-wider text-cyan-300 bg-cyan-950/80 border border-cyan-700/60 px-1.5 py-0.2 rounded uppercase">
                            Correspondência Exata
                          </span>
                        )}
                        <span className="text-xs text-slate-400 hidden sm:inline">
                          ({item.tag.type})
                        </span>
                      </div>

                      {/* Tag Description & Spec */}
                      <div className="text-xs text-slate-300 font-medium mt-0.5">
                        {item.tag.description}
                        {item.tag.spec && (
                          <span className="text-slate-400 font-mono ml-2">· {item.tag.spec}</span>
                        )}
                      </div>

                      {/* Page Info & Location (Zero-pill text separators) */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <span className="text-cyan-400 font-semibold font-mono">
                          Página {String(item.page.pageNumber).padStart(2, '0')}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-slate-300 truncate max-w-md">{item.page.title}</span>
                        {item.page.panel && (
                          <>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className="text-slate-400 font-mono">{item.page.panel}</span>
                          </>
                        )}
                      </div>

                      {/* Relational connections preview */}
                      {item.tag.relations && item.tag.relations.length > 0 && (
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <span className="text-slate-500">Interligações Relacionais:</span>
                          <span className="text-slate-300 truncate max-w-sm">
                            {item.tag.relations[0].description} (Pág. {item.tag.relations[0].targetPageNumber})
                            {item.tag.relations.length > 1 && ` +${item.tag.relations.length - 1} páginas`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation Callout */}
                  <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-center gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400">
                      Doc {item.documentNumber}
                    </span>
                    <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-cyan-300 bg-cyan-900/30 hover:bg-cyan-800/50 border border-cyan-600/40 rounded transition-colors">
                      <span>Abrir Pág {item.page.pageNumber}</span>
                      <CornerDownLeft className="w-3 h-3 text-cyan-400" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-slate-400">↑↓</kbd> Navegar</span>
            <span><kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-slate-400">Enter</kbd> Selecionar</span>
            <span><kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-slate-400">Esc</kbd> Fechar</span>
          </div>
          <div className="font-mono text-slate-400 hidden sm:inline">
            DiagramHub Indexer Engine v1.0
          </div>
        </div>
      </div>
    </div>
  );
};
