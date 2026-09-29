import React, { useState } from 'react';
import { 
  Search, ArrowRight, CornerDownLeft, Network, Tag, ChevronRight, 
  ChevronLeft, Layers, Wrench, X, RefreshCw, ZoomIn, ZoomOut, Check, SlidersHorizontal
} from 'lucide-react';
import { DiagramPage, TagItem } from '../types/diagram';
import { searchTagsInPages, findTagOccurrencesAcrossDocument } from '../utils/tagParser';

interface MobileFieldViewProps {
  currentPage: DiagramPage;
  allPages: DiagramPage[];
  onSelectPage: (pageNumber: number) => void;
  onSelectTag: (tag: TagItem) => void;
  selectedTag: TagItem | null;
  onOpenUpload: () => void;
  recentSearches: string[];
  onAddRecentSearch: (query: string) => void;
}

export const MobileFieldView: React.FC<MobileFieldViewProps> = ({
  currentPage,
  allPages,
  onSelectPage,
  onSelectTag,
  selectedTag,
  onOpenUpload,
  recentSearches,
  onAddRecentSearch
}) => {
  const [mobileQuery, setMobileQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [mobileZoom, setMobileZoom] = useState(100);
  const [showTagDrawer, setShowTagDrawer] = useState(false);

  const searchResults = searchTagsInPages(mobileQuery, allPages);

  // Active tag or primary page tag
  const currentTag = selectedTag || currentPage.tags[0] || null;
  const tagOccurrences = currentTag
    ? findTagOccurrencesAcrossDocument(currentTag.code, allPages)
    : [];

  // Next occurrence logic for floating button
  const currentOccurrenceIndex = tagOccurrences.findIndex(
    (occ) => occ.page.pageNumber === currentPage.pageNumber
  );

  const handleNextOccurrence = () => {
    if (tagOccurrences.length <= 1) return;
    const nextIndex = (currentOccurrenceIndex + 1) % tagOccurrences.length;
    const nextOcc = tagOccurrences[nextIndex];
    onSelectPage(nextOcc.page.pageNumber);
    if (nextOcc.tag) onSelectTag(nextOcc.tag);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 relative overflow-hidden select-none">
      {/* Mobile Top Header - Ergonomic 1-handed field maintenance */}
      <div className="px-3 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-600 flex items-center justify-center font-bold text-xs">
            DH
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-mono">
              {currentPage.drawingNumber} · Rev {currentPage.revision}
            </div>
            <div className="text-xs font-bold text-white truncate max-w-[140px]">
              Pág {currentPage.pageNumber}: {currentPage.title}
            </div>
          </div>
        </div>

        {/* Quick Search Trigger */}
        <button
          onClick={() => setShowSearchModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-cyan-300 font-medium"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Buscar Tag</span>
        </button>
      </div>

      {/* Quick Tag Pills on this sheet */}
      <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar shrink-0">
        <span className="text-[11px] text-slate-500 font-semibold shrink-0">Nesta Folha:</span>
        {currentPage.tags.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              onSelectTag(t);
              setShowTagDrawer(true);
            }}
            className={`px-2 py-0.5 rounded font-mono text-xs whitespace-nowrap transition-colors border ${
              currentTag?.code === t.code
                ? 'bg-cyan-900 text-cyan-200 border-cyan-500'
                : 'bg-slate-800/80 text-slate-300 border-slate-700'
            }`}
          >
            {t.code}
          </button>
        ))}
      </div>

      {/* Main Diagram Area with Touch Pinch/Drag Simulation */}
      <div className="flex-1 relative overflow-auto p-2 flex items-center justify-center bg-slate-950">
        <div
          className="transition-transform duration-100 origin-center bg-white shadow-xl rounded relative overflow-hidden"
          style={{
            transform: `scale(${mobileZoom / 100})`,
            width: '100%',
            maxWidth: '460px',
            height: '320px'
          }}
        >
          {/* Simple Vector View for Mobile */}
          <svg viewBox="0 0 460 320" className="w-full h-full select-none">
            {/* Border and grid */}
            <rect x="5" y="5" width="450" height="310" fill="none" stroke="#334155" strokeWidth="1.5" />

            {/* Title header */}
            <rect x="10" y="10" width="440" height="24" fill="#f1f5f9" stroke="#cbd5e1" />
            <text x="20" y="26" fill="#0f172a" fontSize="10" fontWeight="bold" fontFamily="monospace">
              PÁG {currentPage.pageNumber}: {currentPage.title.slice(0, 32)}
            </text>

            {/* Schematic elements representation */}
            <line x1="20" y1="70" x2="440" y2="70" stroke="#0284c7" strokeWidth="2.5" />
            <text x="30" y="62" fill="#0f172a" fontSize="9" fontWeight="bold" fontFamily="monospace">
              ALIMENTAÇÃO & INTERLIGAÇÃO
            </text>

            {/* Component boxes */}
            <rect x="30" y="95" width="110" height="120" fill="#f8fafc" stroke="#334155" strokeWidth="1" />
            <text x="40" y="115" fill="#0f172a" fontSize="9" fontWeight="bold">COMANDO</text>
            <circle cx="85" cy="165" r="24" fill="none" stroke="#0284c7" strokeWidth="1.5" />
            <text x="85" y="169" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">M</text>

            {/* Wire to terminal */}
            <path d="M 140 155 L 230 155" stroke="#f59e0b" strokeWidth="2" />
            <rect x="155" y="145" width="60" height="14" fill="#ffffff" stroke="#f59e0b" />
            <text x="185" y="155" fill="#b45309" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              1X7C#1.0mm²
            </text>

            {/* Terminal Block */}
            <rect x="230" y="95" width="200" height="120" fill="#f8fafc" stroke="#334155" strokeWidth="1" />
            <text x="240" y="115" fill="#0f172a" fontSize="9" fontWeight="bold">RÉGUA DE BORNES</text>
            {[1, 2, 3, 4].map((b) => (
              <g key={b} transform={`translate(${235 + b * 36}, 160)`}>
                <circle cx="0" cy="0" r="8" fill="#e2e8f0" stroke="#334155" />
                <text x="0" y="3" fill="#0f172a" fontSize="8" textAnchor="middle" fontFamily="monospace">{b}</text>
              </g>
            ))}

            {/* Tag pins overlay on mobile */}
            {currentPage.tags.map((tag) => (
              <g
                key={tag.id}
                onClick={() => {
                  onSelectTag(tag);
                  setShowTagDrawer(true);
                }}
                className="cursor-pointer"
              >
                <circle cx="85" cy="205" r="6" fill="#06b6d4" className="animate-pulse" />
                <rect x="40" y="215" width="90" height="18" rx="3" fill="#0f172a" stroke="#06b6d4" />
                <text x="85" y="227" fill="#fff" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  {tag.code}
                </text>
              </g>
            ))}

            {/* Mini carimbo */}
            <rect x="260" y="255" width="190" height="55" fill="#ffffff" stroke="#cbd5e1" />
            <text x="270" y="272" fill="#0284c7" fontSize="10" fontWeight="bold" fontFamily="monospace">
              NB.I.Z3001.505
            </text>
            <text x="270" y="286" fill="#64748b" fontSize="8">
              VOTORANTIM CIMENTOS
            </text>
            <text x="270" y="300" fill="#e11d48" fontSize="10" fontWeight="bold">
              REV. {currentPage.revision} · PÁG {currentPage.sheetCode}
            </text>
          </svg>
        </div>

        {/* Floating Zoom Controls for Field */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setMobileZoom((z) => Math.min(z + 20, 240))}
            className="p-1.5 text-slate-300 hover:text-white"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileZoom((z) => Math.max(z - 20, 70))}
            className="p-1.5 text-slate-300 hover:text-white"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Action: "Próxima Ocorrência da Tag" (Requirement RF-04.1 / UX Mobile) */}
      {currentTag && tagOccurrences.length > 1 && (
        <div className="absolute bottom-16 right-4 z-20">
          <button
            onClick={handleNextOccurrence}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-lg shadow-cyan-900/50 text-xs font-semibold animate-bounce transition-transform"
          >
            <Network className="w-4 h-4" />
            <span>
              Próxima Folha da Tag ({currentOccurrenceIndex + 1}/{tagOccurrences.length})
            </span>
          </button>
        </div>
      )}

      {/* Bottom Control Bar */}
      <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <button
          onClick={() => onSelectPage(Math.max(currentPage.pageNumber - 1, 1))}
          disabled={currentPage.pageNumber <= 1}
          className="flex items-center gap-1 text-slate-300 disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        <button
          onClick={() => setShowTagDrawer(true)}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-lg text-cyan-300 font-semibold border border-slate-700"
        >
          <Network className="w-3.5 h-3.5" />
          <span>Ver Relacional ({currentTag?.code || 'Tag'})</span>
        </button>

        <button
          onClick={() => onSelectPage(Math.min(currentPage.pageNumber + 1, allPages.length))}
          disabled={currentPage.pageNumber >= allPages.length}
          className="flex items-center gap-1 text-slate-300 disabled:opacity-30"
        >
          <span>Próxima</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Sheet Drawer for Tag Details */}
      {showTagDrawer && currentTag && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-slate-900 border-t border-slate-700 rounded-t-2xl p-4 max-h-[75vh] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-base font-bold text-white">{currentTag.code}</span>
              </div>
              <button
                onClick={() => setShowTagDrawer(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">{currentTag.description}</p>
            {currentTag.spec && (
              <div className="text-xs font-mono text-amber-300 bg-slate-950 p-2 rounded border border-slate-800">
                Spec: {currentTag.spec}
              </div>
            )}

            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-400 mb-1.5">
                Ocorrências em outras páginas ({tagOccurrences.length}):
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {tagOccurrences.map((occ) => (
                  <button
                    key={`${occ.page.pageNumber}-${occ.tag.id}`}
                    onClick={() => {
                      onSelectPage(occ.page.pageNumber);
                      onSelectTag(occ.tag);
                      setShowTagDrawer(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between border ${
                      occ.page.pageNumber === currentPage.pageNumber
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-bold">Pág {occ.page.pageNumber}</span>: {occ.page.title}
                    </div>
                    <CornerDownLeft className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Search Modal for Mobile */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col p-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Search className="w-4 h-4 text-cyan-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={mobileQuery}
              onChange={(e) => setMobileQuery(e.target.value)}
              placeholder="Digite a tag (ex: Z3M03M1, A1J02M1)..."
              className="flex-1 bg-transparent text-sm text-white focus:outline-none font-mono"
            />
            <button
              onClick={() => setShowSearchModal(false)}
              className="px-2 py-1 text-xs bg-slate-800 rounded text-slate-300"
            >
              Fechar
            </button>
          </div>

          {/* Quick chips */}
          {!mobileQuery && (
            <div className="py-3 space-y-2">
              <div className="text-[11px] text-slate-500 font-semibold">Tags mais frequentes:</div>
              <div className="flex flex-wrap gap-1.5">
                {['Z3M03M1', 'A1J02M1', 'RM1-SL8:A2', 'Z3P62Q1', 'Z3S01Q1', 'Z3P71'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setMobileQuery(t)}
                    className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300 font-mono text-xs border border-slate-700"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search results */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 py-2">
            {searchResults.map((item) => (
              <div
                key={`${item.page.pageNumber}-${item.tag.id}`}
                onClick={() => {
                  onAddRecentSearch(item.tag.code);
                  onSelectPage(item.page.pageNumber);
                  onSelectTag(item.tag);
                  setShowSearchModal(false);
                }}
                className="py-2.5 px-2 hover:bg-slate-900 rounded cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-300 text-sm">{item.tag.code}</span>
                  <span className="text-[11px] text-slate-400 font-mono">Pág {item.page.pageNumber}</span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">{item.tag.description}</div>
                <div className="text-[11px] text-slate-500 truncate">{item.page.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
