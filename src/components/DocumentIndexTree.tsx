import React, { useState } from 'react';
import { 
  Folder, FolderOpen, FileText, Search, Bookmark, BookmarkCheck,
  ChevronDown, ChevronRight, Hash, Layers, Cpu, Zap, Star
} from 'lucide-react';
import { DiagramPage } from '../types/diagram';

interface DocumentIndexTreeProps {
  pages: DiagramPage[];
  currentPageNumber: number;
  onSelectPage: (pageNumber: number) => void;
  bookmarkedPages: number[];
  onToggleBookmark: (pageNumber: number) => void;
}

interface SectionCategory {
  id: string;
  name: string;
  icon: 'doc' | 'zap' | 'cpu' | 'layers' | 'star';
  range: [number, number];
  featuredPages?: number[];
}

export const DocumentIndexTree: React.FC<DocumentIndexTreeProps> = ({
  pages,
  currentPageNumber,
  onSelectPage,
  bookmarkedPages,
  onToggleBookmark
}) => {
  const [filterText, setFilterText] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'doc-intro': true,
    'moagem-motor': true,
    'media-tensao': true,
    'baixa-tensao': false,
    'silos-aditivos': false,
    'transporte-canecas': false,
    'filtro-emissoes': false
  });

  const categories: SectionCategory[] = [
    {
      id: 'doc-intro',
      name: '01. Documentação & Simbologia',
      icon: 'doc',
      range: [1, 5]
    },
    {
      id: 'doc-index',
      name: '02. Índice Mestre do Projeto',
      icon: 'layers',
      range: [6, 16]
    },
    {
      id: 'moagem-motor',
      name: '03. Motor do Moinho Z3M03M1 (6,6kV)',
      icon: 'zap',
      range: [19, 22],
      featuredPages: [19, 20, 21, 22, 109, 321, 333, 334]
    },
    {
      id: 'media-tensao',
      name: '04. Cubículos Média Tensão 6,6kV',
      icon: 'zap',
      range: [17, 24]
    },
    {
      id: 'baixa-tensao',
      name: '05. Distribuição 440V (Z3-QDBT01)',
      icon: 'layers',
      range: [25, 45]
    },
    {
      id: 'silos-aditivos',
      name: '06. Silos de Clínquer & Pozolana',
      icon: 'cpu',
      range: [70, 90]
    },
    {
      id: 'transporte-canecas',
      name: '07. Elevadores e Correias (Z3U08, Z3J22)',
      icon: 'cpu',
      range: [132, 145]
    },
    {
      id: 'filtro-emissoes',
      name: '08. Filtro de Mangas & Chaminé',
      icon: 'zap',
      range: [51, 64],
      featuredPages: [51, 52, 53, 54, 337]
    }
  ];

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered pages
  const filteredPages = filterText
    ? pages.filter(
        (p) =>
          p.title.toLowerCase().includes(filterText.toLowerCase()) ||
          p.sheetCode.includes(filterText) ||
          p.tags.some((t) => t.code.toLowerCase().includes(filterText.toLowerCase()))
      )
    : null;

  return (
    <aside className="w-80 h-full bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 text-slate-300">
      {/* Search Filter Header */}
      <div className="p-3 border-b border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filtrar páginas ou tags no índice..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Bookmarked quick filter if any */}
        {bookmarkedPages.length > 0 && (
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              {bookmarkedPages.length} páginas favoritadas
            </span>
            <button
              onClick={() => onSelectPage(bookmarkedPages[0])}
              className="hover:text-white transition-colors"
            >
              Ir para primeira
            </button>
          </div>
        )}
      </div>

      {/* Pages List View */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
        {filteredPages ? (
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {filteredPages.length} páginas encontradas
            </div>
            {filteredPages.map((p) => {
              const isSelected = p.pageNumber === currentPageNumber;
              const isBookmarked = bookmarkedPages.includes(p.pageNumber);

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPage(p.pageNumber)}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/80'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-slate-500 text-[11px] w-6 shrink-0 text-right">
                      {p.pageNumber}
                    </span>
                    <span className="truncate">{p.title}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleBookmark(p.pageNumber);
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-amber-400 transition-opacity"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          categories.map((cat) => {
            const isOpen = !!openSections[cat.id];
            const sectionPages = cat.featuredPages
              ? pages.filter((p) => cat.featuredPages?.includes(p.pageNumber))
              : pages.filter((p) => p.pageNumber >= cat.range[0] && p.pageNumber <= cat.range[1]);

            return (
              <div key={cat.id} className="rounded-lg overflow-hidden border border-slate-800/40">
                <button
                  onClick={() => toggleSection(cat.id)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/40 hover:bg-slate-800 text-slate-200 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 truncate">
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="font-semibold text-xs truncate">{cat.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {sectionPages.length} fls
                  </span>
                </button>

                {isOpen && (
                  <div className="bg-slate-950/40 py-1 divide-y divide-slate-800/30">
                    {sectionPages.map((p) => {
                      const isSelected = p.pageNumber === currentPageNumber;
                      const isBookmarked = bookmarkedPages.includes(p.pageNumber);

                      return (
                        <div
                          key={p.id}
                          onClick={() => onSelectPage(p.pageNumber)}
                          className={`group flex items-center justify-between px-3 py-1.5 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-cyan-950/80 text-cyan-300 font-medium'
                              : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-mono text-[10px] text-slate-500 w-5 shrink-0 text-right">
                              {p.pageNumber}
                            </span>
                            <span className="truncate text-xs">{p.title}</span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleBookmark(p.pageNumber);
                            }}
                            className="p-1 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-amber-400 transition-opacity"
                          >
                            {isBookmarked ? (
                              <BookmarkCheck className="w-3 h-3 text-amber-400 fill-amber-400" />
                            ) : (
                              <Bookmark className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 bg-slate-900/60 flex items-center justify-between">
        <span className="font-mono">Págs: 01 a 337</span>
        <span className="text-cyan-400">Total: {pages.length} folhas</span>
      </div>
    </aside>
  );
};
