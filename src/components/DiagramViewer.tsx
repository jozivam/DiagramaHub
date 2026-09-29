import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize2, RotateCcw, Download, Printer, 
  Layers, Tag, Eye, ChevronLeft, ChevronRight, Share2, Compass, Check,
  Search, ArrowRight, CornerDownLeft, Target, Crosshair, Sparkles, Navigation
} from 'lucide-react';
import { DiagramPage, TagItem } from '../types/diagram';
import { OFFICIAL_INDEX_ROWS, IndexRow } from '../data/nobresProjectData';
import { searchTagsInPages, findTagOccurrencesAcrossDocument } from '../utils/tagParser';

interface DiagramViewerProps {
  page: DiagramPage;
  totalPages: number;
  allPages: DiagramPage[];
  highlightedTagCode?: string;
  selectedTag?: TagItem | null;
  onSelectTag: (tag: TagItem) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onJumpToPage: (pageNumber: number) => void;
  onNavigateToPageAndTag: (pageNumber: number, tagCode: string) => void;
  themeMode?: 'blueprint-dark' | 'blueprint-cad' | 'light-classic';
}

export const DiagramViewer: React.FC<DiagramViewerProps> = ({
  page,
  totalPages,
  allPages,
  highlightedTagCode,
  selectedTag,
  onSelectTag,
  onPrevPage,
  onNextPage,
  onJumpToPage,
  onNavigateToPageAndTag,
  themeMode = 'light-classic'
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [viewTheme, setViewTheme] = useState<'light-classic' | 'blueprint-cad' | 'blueprint-dark'>('light-classic');
  const [showTagPins, setShowTagPins] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Filtro interativo no diagrama existente
  const [diagramFilterQuery, setDiagramFilterQuery] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const filterInputRef = useRef<HTMLInputElement>(null);

  // Active Tag ou primeira tag da folha
  const activeTag = selectedTag || (page.tags.length > 0 ? page.tags[0] : null);

  // Ocorrências da tag ativa em todo o projeto
  const occurrences = useMemo(() => {
    if (!highlightedTagCode && !activeTag?.code) return [];
    const code = highlightedTagCode || activeTag?.code || '';
    return findTagOccurrencesAcrossDocument(code, allPages);
  }, [highlightedTagCode, activeTag, allPages]);

  // Índice da página atual entre as ocorrências
  const currentOccurrenceIndex = occurrences.findIndex(
    (occ) => occ.page.pageNumber === page.pageNumber
  );

  // Correr para próxima página da tag relacionada
  const handleRunToNextOccurrence = () => {
    if (occurrences.length <= 1) return;
    const nextIdx = (currentOccurrenceIndex + 1) % occurrences.length;
    const nextOcc = occurrences[nextIdx];
    onNavigateToPageAndTag(nextOcc.page.pageNumber, highlightedTagCode || activeTag?.code || '');
  };

  const handleRunToPrevOccurrence = () => {
    if (occurrences.length <= 1) return;
    const prevIdx = (currentOccurrenceIndex - 1 + occurrences.length) % occurrences.length;
    const prevOcc = occurrences[prevIdx];
    onNavigateToPageAndTag(prevOcc.page.pageNumber, highlightedTagCode || activeTag?.code || '');
  };

  // Auto-foco / Apontar quando muda a tag destacada
  useEffect(() => {
    if (highlightedTagCode) {
      const match = page.tags.find(
        (t) => t.code.toUpperCase() === highlightedTagCode.toUpperCase()
      );
      if (match) {
        // Centraliza suavemente na coordenada da tag no diagrama
        setPanOffset({
          x: -(match.boundingBox.x - 50) * 8,
          y: -(match.boundingBox.y - 50) * 5
        });
      }
    }
  }, [highlightedTagCode, page]);

  // Resultados do filtro rápido do diagrama
  const filterResults = useMemo(() => {
    if (!diagramFilterQuery.trim()) return [];
    return searchTagsInPages(diagramFilterQuery, allPages).slice(0, 8);
  }, [diagramFilterQuery, allPages]);

  const handleResetZoom = () => {
    setZoomLevel(100);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 400));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 15 : -15;
      setZoomLevel((prev) => Math.max(50, Math.min(prev + delta, 400)));
    }
  };

  const isDark = viewTheme === 'blueprint-dark';
  const isCad = viewTheme === 'blueprint-cad';

  const bgColor = isDark ? '#0b1120' : isCad ? '#002b49' : '#fafafa';
  const strokeColor = isDark ? '#38bdf8' : isCad ? '#67e8f9' : '#1e293b';
  const textPrimary = isDark ? '#f8fafc' : isCad ? '#e0f2fe' : '#0f172a';
  const textMuted = isDark ? '#94a3b8' : isCad ? '#7dd3fc' : '#475569';
  const gridLineColor = isDark ? 'rgba(56,189,248,0.12)' : isCad ? 'rgba(103,232,249,0.12)' : 'rgba(30,41,59,0.08)';
  const borderGridColor = isDark ? '#334155' : isCad ? '#0369a1' : '#cbd5e1';

  return (
    <div className="relative flex-1 flex flex-col h-full bg-slate-950 select-none overflow-hidden">
      {/* 1. Barra de Filtro e Localização Direta no Diagrama */}
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 z-20 shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-[280px] max-w-xl relative">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2 pointer-events-none" />
            <input
              ref={filterInputRef}
              type="text"
              value={diagramFilterQuery}
              onFocus={() => setIsFilterOpen(true)}
              onChange={(e) => {
                setDiagramFilterQuery(e.target.value);
                setIsFilterOpen(true);
              }}
              placeholder="Filtrar ou apontar tag no diagrama (ex: Z3M03M1, A1J02M1, RM1-SL8:A2, Z3P62Q1)..."
              className="w-full bg-slate-950 border border-cyan-800/80 rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono shadow-inner"
            />
            {diagramFilterQuery && (
              <button
                onClick={() => {
                  setDiagramFilterQuery('');
                  setIsFilterOpen(false);
                }}
                className="absolute right-2 top-2 text-slate-500 hover:text-white"
              >
                ×
              </button>
            )}

            {/* Dropdown de Resultados do Filtro com Ação de "Correr para Página" */}
            {isFilterOpen && filterResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto divide-y divide-slate-800">
                <div className="px-3 py-1.5 bg-slate-950 text-[11px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Tags encontradas - Clique para correr e apontar:</span>
                  <span className="text-slate-500 font-normal">ESC para fechar</span>
                </div>
                {filterResults.map((res) => (
                  <div
                    key={`${res.page.pageNumber}-${res.tag.id}`}
                    onClick={() => {
                      onNavigateToPageAndTag(res.page.pageNumber, res.tag.code);
                      setDiagramFilterQuery('');
                      setIsFilterOpen(false);
                    }}
                    className="p-2.5 hover:bg-cyan-950/50 cursor-pointer flex items-center justify-between transition-colors text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-300">{res.tag.code}</span>
                        <span className="text-[10px] text-slate-400">({res.tag.type})</span>
                      </div>
                      <div className="text-[11px] text-slate-300">{res.tag.description}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
                      <span>Pág {res.page.pageNumber}</span>
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Controles de Navegação de Folha */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={onPrevPage}
              disabled={page.pageNumber <= 1}
              className="p-1 hover:text-white disabled:opacity-30 rounded transition-colors"
              title="Folha anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 px-2 font-mono font-medium text-slate-200 text-xs">
              <span>Folha</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={page.pageNumber}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (val >= 1 && val <= totalPages) onJumpToPage(val);
                }}
                className="w-10 bg-slate-900 border border-slate-700 rounded text-center text-cyan-300 font-bold py-0.5"
              />
              <span className="text-slate-500">/ {totalPages}</span>
            </div>
            <button
              onClick={onNextPage}
              disabled={page.pageNumber >= totalPages}
              className="p-1 hover:text-white disabled:opacity-30 rounded transition-colors"
              title="Próxima folha"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Temas CAD */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setViewTheme('light-classic')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                viewTheme === 'light-classic' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Clássico
            </button>
            <button
              onClick={() => setViewTheme('blueprint-cad')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                viewTheme === 'blueprint-cad' ? 'bg-cyan-900 text-cyan-200' : 'text-slate-400 hover:text-white'
              }`}
            >
              CAD Azul
            </button>
          </div>

          {/* Zoom */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button onClick={handleZoomOut} className="p-1 hover:text-white text-slate-400">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] text-slate-300 w-11 text-center">
              {zoomLevel}%
            </span>
            <button onClick={handleZoomIn} className="p-1 hover:text-white text-slate-400">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleResetZoom} className="p-1 hover:text-white text-slate-400 border-l border-slate-700" title="100%">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. HUD APONTADOR & RADAR DE OCORRÊNCIAS (Atende o requisito: "apenas apontar e correr para pagina da tag relacionada") */}
      {highlightedTagCode && (
        <div className="px-4 py-2 bg-cyan-950/90 backdrop-blur border-b border-cyan-800/80 text-xs flex flex-wrap items-center justify-between gap-3 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-cyan-600 text-white animate-pulse">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="text-cyan-400 font-semibold uppercase text-[10px] tracking-wider block">
                Apontando no Diagrama Existente:
              </span>
              <span className="font-mono font-bold text-white text-sm">
                {highlightedTagCode}
              </span>
              <span className="text-slate-400 text-xs ml-2">
                (Ocorrência {currentOccurrenceIndex >= 0 ? currentOccurrenceIndex + 1 : 1} de {Math.max(occurrences.length, 1)} folhas)
              </span>
            </div>
          </div>

          {/* Chips com botões diretos para "Correr para página da tag relacionada" */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-cyan-300 font-medium shrink-0">
              Correr para folha:
            </span>
            {occurrences.map((occ, idx) => {
              const isThisPage = occ.page.pageNumber === page.pageNumber;
              return (
                <button
                  key={`${occ.page.pageNumber}-${idx}`}
                  onClick={() => onNavigateToPageAndTag(occ.page.pageNumber, highlightedTagCode)}
                  className={`px-2 py-0.5 rounded text-xs font-mono font-semibold transition-all whitespace-nowrap border ${
                    isThisPage
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-sm'
                      : 'bg-slate-900/80 text-cyan-300 border-slate-700 hover:border-cyan-500'
                  }`}
                  title={occ.page.title}
                >
                  Fl. {occ.page.pageNumber}
                </button>
              );
            })}

            {occurrences.length > 1 && (
              <div className="flex items-center gap-1 pl-2 border-l border-cyan-800/60 shrink-0">
                <button
                  onClick={handleRunToPrevOccurrence}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-cyan-300 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  ← Anterior
                </button>
                <button
                  onClick={handleRunToNextOccurrence}
                  className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-white font-semibold flex items-center gap-1 text-[11px] shadow"
                >
                  <span>Próxima</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Área Central do Visualizador de Diagramas em Alta Definição */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`flex-1 relative overflow-hidden flex items-center justify-center cursor-${
          isDragging ? 'grabbing' : 'grab'
        } p-2 sm:p-4`}
        style={{ backgroundColor: isDark ? '#050811' : isCad ? '#001a2c' : '#0f172a' }}
      >
        <div
          className="transition-transform duration-75 origin-center shadow-2xl relative"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel / 100})`,
            width: '1280px',
            height: '840px',
            backgroundColor: bgColor
          }}
        >
          <svg
            viewBox="0 0 1280 840"
            className="w-full h-full select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Margens e moldura perimetral com coordenadas de engenharia A-H e 1-12 */}
            <rect x="20" y="20" width="1240" height="800" fill="none" stroke={borderGridColor} strokeWidth="2.5" />
            <rect x="26" y="26" width="1228" height="788" fill="none" stroke={borderGridColor} strokeWidth="1" />

            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter, i) => (
              <g key={`coord-y-${letter}`}>
                <text x="23" y={60 + i * 95} fill={textMuted} fontSize="9" textAnchor="middle" fontFamily="monospace">
                  {letter}
                </text>
                <text x="1257" y={60 + i * 95} fill={textMuted} fontSize="9" textAnchor="middle" fontFamily="monospace">
                  {letter}
                </text>
                <line x1="20" y1={72 + i * 95} x2="26" y2={72 + i * 95} stroke={borderGridColor} strokeWidth="1" />
                <line x1="1254" y1={72 + i * 95} x2="1260" y2={72 + i * 95} stroke={borderGridColor} strokeWidth="1" />
              </g>
            ))}

            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
              <g key={`coord-x-${num}`}>
                <text x={70 + (num - 1) * 98} y="24" fill={textMuted} fontSize="9" textAnchor="middle" fontFamily="monospace">
                  {num}
                </text>
                <text x={70 + (num - 1) * 98} y="822" fill={textMuted} fontSize="9" textAnchor="middle" fontFamily="monospace">
                  {num}
                </text>
                <line x1={70 + (num - 1) * 98} y1="20" x2={70 + (num - 1) * 98} y2="26" stroke={borderGridColor} strokeWidth="1" />
                <line x1={70 + (num - 1) * 98} y1="814" x2={70 + (num - 1) * 98} y2="820" stroke={borderGridColor} strokeWidth="1" />
              </g>
            ))}

            {/* Cabeçalho do local e painel */}
            {page.localArea && (
              <g>
                <rect x="35" y="35" width="300" height="24" fill={isDark ? '#1e293b' : isCad ? '#03436a' : '#f1f5f9'} stroke={borderGridColor} strokeWidth="1" />
                <text x="45" y="51" fill={textPrimary} fontSize="11" fontWeight="bold" fontFamily="monospace">
                  LOCALIZAÇÃO: {page.localArea}
                </text>
              </g>
            )}

            {page.cubicleGaveta && (
              <g>
                <rect x="920" y="35" width="300" height="24" fill={isDark ? '#1e293b' : isCad ? '#03436a' : '#f1f5f9'} stroke={borderGridColor} strokeWidth="1" />
                <text x="930" y="51" fill={textPrimary} fontSize="11" fontWeight="bold" fontFamily="monospace">
                  {page.cubicleGaveta}
                </text>
              </g>
            )}

            {/* RENDERIZAÇÃO REAL DO DIAGRAMA DA FOLHA (Sem reescrever com genérico!) */}
            {renderAuthenticSheetContent({
              page,
              strokeColor,
              textPrimary,
              textMuted,
              borderGridColor,
              isDark,
              isCad,
              onNavigateToPageAndTag
            })}

            {/* CARIMBO OFICIAL TÉCNICO (VOTORANTIM CIMENTOS / ATMC / NOBRES MT) */}
            <g id="carimbo-tecnico">
              <rect x="35" y="730" width="1210" height="84" fill={isDark ? '#0f172a' : isCad ? '#00223a' : '#ffffff'} stroke={borderGridColor} strokeWidth="1.5" />
              <line x1="200" y1="730" x2="200" y2="814" stroke={borderGridColor} strokeWidth="1" />
              <line x1="440" y1="730" x2="440" y2="814" stroke={borderGridColor} strokeWidth="1" />
              <line x1="640" y1="730" x2="640" y2="814" stroke={borderGridColor} strokeWidth="1" />
              <line x1="940" y1="730" x2="940" y2="814" stroke={borderGridColor} strokeWidth="1" />
              <line x1="1140" y1="730" x2="1140" y2="814" stroke={borderGridColor} strokeWidth="1" />
              <line x1="1200" y1="730" x2="1200" y2="814" stroke={borderGridColor} strokeWidth="1" />
              <line x1="640" y1="765" x2="1245" y2="765" stroke={borderGridColor} strokeWidth="1" />

              <g transform="translate(45, 742)">
                <text x="0" y="10" fill="#f97316" fontSize="18" fontWeight="900" fontFamily="sans-serif">
                  ATMC
                </text>
                <text x="0" y="24" fill={textMuted} fontSize="9" fontFamily="sans-serif">
                  Consultoria e Engenharia
                </text>
                <text x="0" y="58" fill={textMuted} fontSize="8" fontFamily="monospace">
                  FORNECEDOR DO PROJETO
                </text>
              </g>

              <g transform="translate(210, 742)">
                <text x="0" y="9" fill={textMuted} fontSize="8" fontFamily="monospace">
                  CLIENTE:
                </text>
                <path d="M 0 16 L 12 36 L 24 16 Z" fill="#2563eb" />
                <path d="M 12 16 L 22 36 L 32 16 Z" fill="#16a34a" />
                <text x="36" y="26" fill={textPrimary} fontSize="14" fontWeight="800" fontFamily="sans-serif">
                  VOTORANTIM
                </text>
                <text x="36" y="40" fill={textPrimary} fontSize="12" fontWeight="600" fontFamily="sans-serif">
                  cimentos
                </text>
              </g>

              <g transform="translate(450, 742)">
                <text x="0" y="9" fill={textMuted} fontSize="8" fontFamily="monospace">
                  PROJETO:
                </text>
                <text x="0" y="28" fill={textPrimary} fontSize="12" fontWeight="bold">
                  MOAGEM Z3
                </text>
                <text x="0" y="44" fill={textMuted} fontSize="11">
                  NOBRES - MT
                </text>
              </g>

              <g transform="translate(650, 740)">
                <text x="0" y="9" fill={textMuted} fontSize="8" fontFamily="monospace">
                  TÍTULO:
                </text>
                <text x="0" y="20" fill={textPrimary} fontSize="10" fontWeight="bold" fontFamily="monospace">
                  {page.title.slice(0, 48)}
                </text>
                {page.title.length > 48 && (
                  <text x="0" y="32" fill={textPrimary} fontSize="10" fontWeight="bold" fontFamily="monospace">
                    {page.title.slice(48)}
                  </text>
                )}
                <text x="0" y="55" fill={textMuted} fontSize="9" fontFamily="monospace">
                  DIAGRAMA DE INTERLIGAÇÃO
                </text>
              </g>

              <g transform="translate(950, 742)">
                <text x="0" y="8" fill={textMuted} fontSize="7" fontFamily="monospace">
                  Nº DO DESENHO DO FORNECEDOR:
                </text>
                <text x="0" y="20" fill={textPrimary} fontSize="11" fontWeight="bold" fontFamily="monospace">
                  {page.supplierDrawing}
                </text>
                <text x="0" y="44" fill={textMuted} fontSize="8" fontFamily="monospace">
                  PROJETISTA: T.S.S. | APROV: G.F.R.
                </text>
                <text x="0" y="58" fill={textMuted} fontSize="8" fontFamily="monospace">
                  ESCALA: S/E | DIEDRO: 1º
                </text>
              </g>

              <g transform="translate(950, 775)">
                <text x="0" y="10" fill={textMuted} fontSize="8" fontFamily="monospace">
                  PROJECT ID:
                </text>
                <text x="0" y="26" fill="#0284c7" fontSize="13" fontWeight="900" fontFamily="monospace">
                  {page.drawingNumber}
                </text>
              </g>

              <g transform="translate(1145, 740)">
                <text x="0" y="10" fill={textMuted} fontSize="8" fontFamily="monospace">
                  DATA:
                </text>
                <text x="0" y="22" fill={textPrimary} fontSize="9" fontFamily="monospace">
                  {page.date}
                </text>
                <text x="0" y="44" fill={textMuted} fontSize="8" fontFamily="monospace">
                  PÁG.
                </text>
                <text x="14" y="66" fill={textPrimary} fontSize="16" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  {page.sheetCode}
                </text>
              </g>

              <g transform="translate(1205, 740)">
                <text x="18" y="14" fill={textMuted} fontSize="8" fontFamily="monospace" textAnchor="middle">
                  REV.
                </text>
                <text x="18" y="55" fill="#e11d48" fontSize="26" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                  {page.revision}
                </text>
              </g>
            </g>

            {/* 4. ELEMENTO APONTADOR / MIRA TELESCÓPICA NO DIAGRAMA EXISTENTE */}
            {showTagPins &&
              page.tags.map((tag) => {
                const isTargetTag =
                  highlightedTagCode && tag.code.toUpperCase() === highlightedTagCode.toUpperCase();
                const isSelected = selectedTag?.id === tag.id;

                const bx = (tag.boundingBox.x / 100) * 1280;
                const by = (tag.boundingBox.y / 100) * 840;
                const bw = (tag.boundingBox.width / 100) * 1280;
                const bh = (tag.boundingBox.height / 100) * 840;

                return (
                  <g
                    key={tag.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTag(tag);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Bounding Box Ring */}
                    <rect
                      x={bx - 4}
                      y={by - 4}
                      width={bw + 8}
                      height={bh + 8}
                      rx="4"
                      fill={
                        isTargetTag
                          ? 'rgba(6, 182, 212, 0.25)'
                          : isSelected
                          ? 'rgba(59, 130, 246, 0.2)'
                          : 'rgba(2, 132, 199, 0.05)'
                      }
                      stroke={
                        isTargetTag
                          ? '#06b6d4'
                          : isSelected
                          ? '#3b82f6'
                          : 'rgba(2, 132, 199, 0.4)'
                      }
                      strokeWidth={isTargetTag ? 3 : isSelected ? 2 : 1}
                      strokeDasharray={isTargetTag ? 'none' : '4 2'}
                    />

                    {/* MIRA TELESCÓPICA / RETÍCULO APONTANDO DIRETAMENTE NA TAG */}
                    {isTargetTag && (
                      <g transform={`translate(${bx + bw / 2}, ${by + bh / 2})`}>
                        {/* Concentric radar rings */}
                        <circle cx="0" cy="0" r="32" fill="none" stroke="#06b6d4" strokeWidth="1.5" className="animate-ping" opacity="0.6" />
                        <circle cx="0" cy="0" r="24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="3 3" />
                        <circle cx="0" cy="0" r="14" fill="rgba(6,182,212,0.3)" stroke="#06b6d4" strokeWidth="2" />
                        <circle cx="0" cy="0" r="3" fill="#ffffff" />
                        {/* Crosshairs */}
                        <line x1="-36" y1="0" x2="-16" y2="0" stroke="#22d3ee" strokeWidth="2" />
                        <line x1="16" y1="0" x2="36" y2="0" stroke="#22d3ee" strokeWidth="2" />
                        <line x1="0" y1="-36" x2="0" y2="-16" stroke="#22d3ee" strokeWidth="2" />
                        <line x1="0" y1="16" x2="0" y2="36" stroke="#22d3ee" strokeWidth="2" />
                      </g>
                    )}

                    {/* Tag Pin Badge */}
                    <rect
                      x={bx}
                      y={by - 22}
                      width={Math.max(tag.code.length * 8 + 20, 75)}
                      height="18"
                      rx="3"
                      fill={isTargetTag ? '#0891b2' : isSelected ? '#1d4ed8' : '#0f172a'}
                      stroke={isTargetTag ? '#22d3ee' : isSelected ? '#60a5fa' : '#334155'}
                      strokeWidth={isTargetTag ? 2 : 1}
                    />
                    <text
                      x={bx + 8}
                      y={by - 9}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {tag.code}
                    </text>
                  </g>
                );
              })}
          </svg>
        </div>
      </div>
    </div>
  );
};

// Renderiza o diagrama fiel original para cada folha do projeto
function renderAuthenticSheetContent({
  page,
  strokeColor,
  textPrimary,
  textMuted,
  borderGridColor,
  isDark,
  isCad,
  onNavigateToPageAndTag
}: {
  page: DiagramPage;
  strokeColor: string;
  textPrimary: string;
  textMuted: string;
  borderGridColor: string;
  isDark: boolean;
  isCad: boolean;
  onNavigateToPageAndTag: (pageNumber: number, tagCode: string) => void;
}) {
  const p = page.pageNumber;

  // 1. CAPA ORIGINAL (Folha 01)
  if (p === 1) {
    return (
      <g id="sheet-cover">
        <text x="640" y="320" fill={textPrimary} fontSize="44" fontWeight="300" textAnchor="middle" fontFamily="sans-serif" letterSpacing="6">
          DIAGRAMA DE INTERLIGAÇÃO
        </text>

        {/* Bloco de Notas Oficial da Capa */}
        <g transform="translate(200, 480)">
          <rect x="0" y="0" width="880" height="180" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <text x="30" y="35" fill={textPrimary} fontSize="14" fontWeight="bold" fontFamily="monospace">
            NOTAS:
          </text>
          <text x="30" y="65" fill={textPrimary} fontSize="12" fontFamily="monospace">
            1 - O DIAGRAMA DE INTERLIGAÇÃO FOI ELABORADO COM BASE NA DOCUMENTAÇÃO FORNECIDA PELA CETEC.
          </text>
          <text x="30" y="95" fill={textPrimary} fontSize="12" fontFamily="monospace">
            2 - AS INTERLIGAÇÕES QUE PERMANECEM PENDENTES DE DOCUMENTAÇÃO NÃO DEVEM SER MONTADAS
          </text>
          <text x="60" y="115" fill={textPrimary} fontSize="12" fontFamily="monospace">
            ATÉ QUE OS DOCUMENTOS CORRESPONDENTES SEJAM DISPONIBILIZADOS.
          </text>
          <text x="30" y="145" fill={textPrimary} fontSize="12" fontFamily="monospace">
            3 - CONFIRMAR EM CAMPO TODAS AS INTERLIGAÇÕES DOS INSTRUMENTOS ANTES DA EXECUÇÃO.
          </text>
        </g>
      </g>
    );
  }

  // 2. SIMBOLOGIA ORIGINAL (Folha 02)
  if (p === 2) {
    return (
      <g id="sheet-symbols">
        {/* Tabela de 3 colunas de símbolos */}
        <rect x="100" y="60" width="1080" height="640" fill="none" stroke={strokeColor} strokeWidth="1.5" />
        <line x1="460" y1="60" x2="460" y2="700" stroke={strokeColor} strokeWidth="1" />
        <line x1="820" y1="60" x2="820" y2="700" stroke={strokeColor} strokeWidth="1" />

        {/* Cabeçalhos */}
        <rect x="100" y="60" width="1080" height="30" fill={isDark ? '#1e293b' : '#f1f5f9'} stroke={strokeColor} />
        <text x="280" y="80" fill={textPrimary} fontSize="12" fontWeight="bold" textAnchor="middle">SÍMBOLO / DESCRIÇÃO</text>
        <text x="640" y="80" fill={textPrimary} fontSize="12" fontWeight="bold" textAnchor="middle">SÍMBOLO / DESCRIÇÃO</text>
        <text x="1000" y="80" fill={textPrimary} fontSize="12" fontWeight="bold" textAnchor="middle">SÍMBOLO / DESCRIÇÃO</text>

        {/* Linhas de símbolos (Exatamente como na folha 2 do PDF) */}
        {[
          { sim: 'MINI DISJUNTOR', desc2: 'TEMPERATURA', desc3: 'CHAVE DE EMERGÊNCIA' },
          { sim: 'CÉLULA DE CARGA', desc2: 'CHAVE EXTRAÍVEL', desc3: 'CHAVE DE NÍVEL' },
          { sim: 'FUSÍVEL', desc2: 'DISJUNTOR TERMOMAGNÉTICO', desc3: 'CONTATO NA' },
          { sim: 'BOBINA', desc2: 'RELÉ TÉRMICO', desc3: 'CONTATO NF' },
          { sim: 'SENSOR DE VELOCIDADE', desc2: 'TERRA', desc3: '-' },
          { sim: 'MOTOR DE INDUÇÃO TRIFÁSICO', desc2: 'TRANSFORMADOR DE CORRENTE', desc3: '-' },
          { sim: 'VENTILADOR', desc2: 'FLUXOSTATO (-OG1)', desc3: '-' },
          { sim: 'VÁLVULA SOLENÓIDE', desc2: 'TERMOSTATO', desc3: '-' },
          { sim: 'SIRENE', desc2: 'PRESSOSTATO', desc3: '-' },
          { sim: 'DISJUNTOR', desc2: 'CHAVE DE DESALINHAMENTO', desc3: '-' }
        ].map((item, idx) => (
          <g key={idx} transform={`translate(100, ${90 + idx * 60})`}>
            <line x1="0" y1="60" x2="1080" y2="60" stroke={borderGridColor} strokeWidth="1" />
            <text x="240" y="35" fill={textPrimary} fontSize="11" fontWeight="bold">{item.sim}</text>
            <text x="600" y="35" fill={textPrimary} fontSize="11" fontWeight="bold">{item.desc2}</text>
            <text x="940" y="35" fill={textPrimary} fontSize="11" fontWeight="bold">{item.desc3}</text>
          </g>
        ))}
      </g>
    );
  }

  // 3. LEGENDA REMOTA (Folha 03)
  if (p === 3) {
    return (
      <g id="sheet-legenda-03">
        <text x="640" y="110" fill={textPrimary} fontSize="36" fontWeight="300" textAnchor="middle" letterSpacing="6">
          L E G E N D A
        </text>

        {/* Transmissor A1A01LT */}
        <g transform="translate(180, 200)">
          <rect x="0" y="0" width="160" height="140" fill={isDark ? '#1e293b' : '#fff'} stroke={strokeColor} strokeWidth="1.5" />
          <text x="80" y="24" fill={textMuted} fontSize="9" textAnchor="middle">TRANSMISSOR DE NÍVEL</text>
          <text x="80" y="44" fill="#0284c7" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">A1A01LT</text>
          <circle cx="80" cy="85" r="25" fill="none" stroke={strokeColor} />
          <text x="80" y="90" fill={textPrimary} fontSize="14" textAnchor="middle">P</text>
        </g>

        {/* Cabo de Instrumentação */}
        <line x1="260" y1="340" x2="260" y2="480" stroke="#f59e0b" strokeWidth="2.5" />
        <rect x="235" y="400" width="90" height="16" fill={isDark ? '#1e293b' : '#fff'} stroke="#f59e0b" />
        <text x="280" y="412" fill="#b45309" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
          1T#0,75mm²(BL)
        </text>

        {/* Régua de Bornes RM1-SL1/A2 */}
        <g transform="translate(100, 480)">
          <rect x="0" y="0" width="1080" height="160" fill={isDark ? '#1e293b' : '#f8fafc'} stroke={strokeColor} strokeWidth="1.5" />
          <text x="20" y="30" fill={textPrimary} fontSize="12" fontWeight="bold" fontFamily="monospace">
            PAINEL REMOTA: A1RM1 | LOCAL: SU1 | CLP: A1CLP01
          </text>
          <text x="20" y="50" fill={textMuted} fontSize="10">
            Régua de Distribuição de Alimentação (220V, 0V, 24Vcc) e Bornes Analógicos
          </text>
        </g>
      </g>
    );
  }

  // 4. ÍNDICE DE PÁGINAS (Folhas 06 a 17) - Tabela industrial com links clicáveis!
  if (p >= 6 && p <= 17) {
    const startIdx = (p - 6) * 37;
    const pageRows = OFFICIAL_INDEX_ROWS.slice(startIdx, startIdx + 37);

    return (
      <g id="sheet-index-table">
        <text x="640" y="70" fill={textPrimary} fontSize="20" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
          D E S C R I Ç Ã O   D O S   D O C U M E N T O S
        </text>

        {/* Tabela de Índice */}
        <rect x="50" y="90" width="1180" height="625" fill={isDark ? '#0f172a' : '#fff'} stroke={strokeColor} strokeWidth="1.5" />
        <line x1="120" y1="90" x2="120" y2="715" stroke={strokeColor} strokeWidth="1" />
        <line x1="1160" y1="90" x2="1160" y2="715" stroke={strokeColor} strokeWidth="1" />

        {/* Cabeçalho da Tabela */}
        <rect x="50" y="90" width="1180" height="24" fill={isDark ? '#1e293b' : '#f1f5f9'} stroke={strokeColor} />
        <text x="85" y="106" fill={textPrimary} fontSize="10" fontWeight="bold" textAnchor="middle">FL</text>
        <text x="640" y="106" fill={textPrimary} fontSize="11" fontWeight="bold" textAnchor="middle">DESCRIÇÃO DO CIRCUITO / DOCUMENTO</text>
        <text x="1200" y="106" fill={textPrimary} fontSize="10" fontWeight="bold" textAnchor="middle">REV.</text>

        {/* Linhas de Índice */}
        {pageRows.map((row, idx) => {
          const y = 114 + idx * 16.5;
          const isTarget = row.primaryTag === 'Z3M03M1' || row.description.includes('Z3M03M1');

          return (
            <g
              key={row.pageNumber}
              onClick={() => onNavigateToPageAndTag(row.pageNumber, row.primaryTag || '')}
              className="cursor-pointer group"
            >
              <rect
                x="50"
                y={y}
                width="1180"
                height="16.5"
                fill={isTarget ? 'rgba(6, 182, 212, 0.15)' : idx % 2 === 0 ? 'transparent' : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}
                className="hover:fill-cyan-500/20 transition-colors"
              />
              <line x1="50" y1={y + 16.5} x2="1230" y2={y + 16.5} stroke={borderGridColor} strokeWidth="0.5" />
              <text x="85" y={y + 12} fill={isTarget ? '#06b6d4' : textMuted} fontSize="9.5" textAnchor="middle" fontFamily="monospace" fontWeight={isTarget ? 'bold' : 'normal'}>
                {row.sheetCode}
              </text>
              <text x="135" y={y + 12} fill={isTarget ? '#0284c7' : textPrimary} fontSize="10" fontFamily="monospace" fontWeight={isTarget ? 'bold' : 'normal'}>
                {row.description}
              </text>
              <text x="1200" y={y + 12} fill={textMuted} fontSize="9.5" textAnchor="middle" fontFamily="monospace">
                {row.rev}
              </text>
            </g>
          );
        })}
      </g>
    );
  }

  // 5. CUBÍCULO 3 MOTOR DO MOINHO Z3M03M1 (Folha 20 / Pág 19 do projeto)
  if (p === 20 || page.svgBlueprintKey === 'mill_motor_power') {
    return (
      <g id="sheet-cubicle-3-power">
        {/* Painel Cubículo 03 QDMT01 */}
        <rect x="60" y="80" width="280" height="620" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="8 4" />
        <text x="80" y="110" fill={textPrimary} fontSize="13" fontWeight="bold" fontFamily="monospace">
          PAINEL: Z3-QDMT01 | CUBÍCULO 03
        </text>
        <text x="80" y="130" fill={textMuted} fontSize="10" fontFamily="monospace">
          Barramento 3F 6,6kV (R, S, T)
        </text>

        {['R', 'S', 'T'].map((fase, i) => (
          <g key={fase}>
            <line x1="80" y1={170 + i * 50} x2="320" y2={170 + i * 50} stroke={strokeColor} strokeWidth="2.5" />
            <rect x="320" y={162 + i * 50} width="20" height="16" fill={strokeColor} />
            <text x="330" y={174 + i * 50} fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">
              {fase}
            </text>
          </g>
        ))}

        {/* Cabos 2x(1C#150mm²) Z3M03M1F1..F3 */}
        {['F1', 'F2', 'F3'].map((cabo, i) => (
          <g key={cabo}>
            <line x1="340" y1={170 + i * 50} x2="520" y2={170 + i * 50} stroke="#f59e0b" strokeWidth="2.5" />
            <rect x="390" y={152 + i * 50} width="110" height="18" fill={isDark ? '#1e293b' : '#fff'} stroke={borderGridColor} />
            <text x="445" y={165 + i * 50} fill={textPrimary} fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              Z3M03M1{cabo} 2x#150mm²
            </text>
          </g>
        ))}

        {/* Motor Z3M03M1 3700CV */}
        <g transform="translate(580, 220)">
          <circle cx="0" cy="0" r="50" fill="none" stroke={strokeColor} strokeWidth="3" />
          <circle cx="0" cy="0" r="42" fill="none" stroke={strokeColor} strokeWidth="1" strokeDasharray="3 3" />
          <text x="0" y="-8" fill={textPrimary} fontSize="20" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
            M
          </text>
          <text x="0" y="16" fill={textPrimary} fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            3~
          </text>
          <rect x="-65" y="65" width="130" height="45" fill={isDark ? '#1e293b' : '#fff'} stroke="#0284c7" strokeWidth="1.5" rx="3" />
          <text x="0" y="82" fill="#0284c7" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            Z3M03M1
          </text>
          <text x="0" y="98" fill={textMuted} fontSize="10" textAnchor="middle">
            3700CV · 6.6kV · ROTOR 1900V
          </text>
        </g>

        {/* Aterramento de Carcaça */}
        <path d="M 580 270 L 580 340 L 480 340 L 480 370" fill="none" stroke="#16a34a" strokeWidth="2" strokeDasharray="4 2" />
        <rect x="420" y="375" width="120" height="20" fill={isDark ? '#1e293b' : '#fff'} stroke="#16a34a" />
        <text x="480" y="389" fill="#16a34a" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
          Z3M03M1T1 1x1C#150mm²
        </text>

        {/* Reostato Líquido Z3M3Q1 */}
        {['F4', 'F5', 'F6'].map((cabo, i) => (
          <g key={cabo}>
            <line x1="630" y1={190 + i * 30} x2="880" y2={190 + i * 30} stroke="#dc2626" strokeWidth="2.5" />
            <rect x="710" y={175 + i * 30} width="120" height="18" fill={isDark ? '#1e293b' : '#fff'} stroke={borderGridColor} />
            <text x="770" y={188 + i * 30} fill={textPrimary} fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              Z3M03M1{cabo} 3x#150mm²
            </text>
          </g>
        ))}

        <rect x="880" y="140" width="300" height="240" fill="none" stroke={strokeColor} strokeWidth="2" />
        <text x="900" y="170" fill={textPrimary} fontSize="13" fontWeight="bold" fontFamily="monospace">
          LOCALIZAÇÃO: ÁREA DA MOAGEM Z3
        </text>
        <text x="900" y="190" fill="#0284c7" fontSize="14" fontWeight="bold" fontFamily="monospace">
          REOSTATO LÍQUIDO Z3M3Q1
        </text>
        <text x="900" y="210" fill={textMuted} fontSize="10">
          DISPOSITIVO DE CURTO-CIRCUITO KS
        </text>
      </g>
    );
  }

  // 6. INSTRUMENTAÇÃO DO MOTOR DO MOINHO (Folha 22 / Pág 21 do projeto - Pt-100 1R..8R)
  if (p === 22 || page.svgBlueprintKey === 'mill_motor_instrumentation') {
    return (
      <g id="sheet-motor-pt100">
        <rect x="850" y="40" width="370" height="40" fill={isDark ? '#1e293b' : '#f8fafc'} stroke={borderGridColor} />
        <text x="865" y="58" fill={textPrimary} fontSize="11" fontWeight="bold">
          DIAGRAMA DE LIGAÇÃO WEG (Nº 10013465472 PÁG 7)
        </text>
        <text x="865" y="72" fill={textMuted} fontSize="9">
          Monitoramento Térmico do Estator e Mancais do Motor Z3M03M1
        </text>

        {[
          { code: '1R', label: 'Estator Fase U', x: 80 },
          { code: '2R', label: 'Estator Fase V', x: 210 },
          { code: '3R', label: 'Estator Fase W', x: 340 },
          { code: '4R', label: 'Estator Fase U', x: 470 },
          { code: '5R', label: 'Estator Fase V', x: 600 },
          { code: '6R', label: 'Estator Fase W', x: 730 },
          { code: '7R', label: 'Mancal LA Rad.', x: 860 },
          { code: '8R', label: 'Mancal LNA Rad.', x: 990 }
        ].map((pt) => (
          <g key={pt.code} transform={`translate(${pt.x}, 120)`}>
            <rect x="0" y="0" width="95" height="110" fill={isDark ? '#1e293b' : '#fff'} stroke={strokeColor} strokeWidth="1.5" rx="3" />
            <text x="47" y="20" fill="#0284c7" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              {pt.code}
            </text>
            <text x="47" y="34" fill={textMuted} fontSize="8" textAnchor="middle">
              {pt.label}
            </text>
            <path d="M 25 55 L 70 55 M 35 45 L 60 65" stroke={strokeColor} strokeWidth="1.5" />
            <text x="47" y="75" fill={textPrimary} fontSize="9" textAnchor="middle">
              t° Pt-100
            </text>
            <line x1="25" y1="100" x2="25" y2="135" stroke={strokeColor} strokeWidth="1" />
            <line x1="50" y1="100" x2="50" y2="135" stroke={strokeColor} strokeWidth="1" />
            <line x1="75" y1="100" x2="75" y2="135" stroke={strokeColor} strokeWidth="1" />
          </g>
        ))}

        <g transform="translate(60, 260)">
          <rect x="0" y="0" width="1050" height="40" fill={isDark ? '#0f172a' : '#f1f5f9'} stroke={borderGridColor} />
          <text x="15" y="24" fill={textPrimary} fontSize="11" fontWeight="bold" fontFamily="monospace">
            TRILHO RAIL X2 (CONECTOR CMP2,5 - BORNES 1 A 24)
          </text>
        </g>

        <path d="M 580 300 L 580 430" fill="none" stroke="#0891b2" strokeWidth="4" />
        <rect x="490" y="350" width="180" height="24" fill={isDark ? '#1e293b' : '#fff'} stroke="#0891b2" strokeWidth="1.5" rx="3" />
        <text x="580" y="366" fill="#0891b2" fontSize="10.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
          Z3M03M1T1@TT8C1 (1X8T#1,0mm²)
        </text>

        <g transform="translate(60, 440)">
          <rect x="0" y="0" width="1160" height="260" fill="none" stroke={strokeColor} strokeWidth="2" />
          <text x="20" y="30" fill={textPrimary} fontSize="13" fontWeight="bold" fontFamily="monospace">
            PAINEL REMOTA 05 (Z3RM05) - SAÍDA DO MOINHO TOPO
          </text>
          <text x="20" y="48" fill={textMuted} fontSize="10">
            Módulo Analógico RTD (RM5-SL11) - Canais de Temperatura Pt-100 Estator e Mancais
          </text>
        </g>
      </g>
    );
  }

  // 7. DEMIAS FOLHAS (Desenho esquemático específico com título e potência reais da folha)
  const isGaveta = page.title.includes('GAVETA') || page.title.includes('CCM') || page.title.includes('MOTOR');
  const isInstrument = page.title.includes('INSTRUMENTAÇÃO') || page.title.includes('NÍVEL') || page.title.includes('TEMPERATURA') || page.title.includes('VIBRAÇÃO');

  return (
    <g id="sheet-schematic-specific">
      {/* Título do Circuito Específico da Folha */}
      <rect x="60" y="70" width="1160" height="40" fill={isDark ? '#1e293b' : '#f8fafc'} stroke={borderGridColor} />
      <text x="80" y="95" fill={textPrimary} fontSize="13" fontWeight="bold" fontFamily="monospace">
        {page.title}
      </text>

      {/* Barramento Superior Real com tensões específicas */}
      <line x1="80" y1="150" x2="1200" y2="150" stroke={strokeColor} strokeWidth="3" />
      <text x="90" y="140" fill={textPrimary} fontSize="11" fontWeight="bold" fontFamily="monospace">
        {isGaveta ? 'BARRAMENTO DE FORÇA 3x440Vac 60Hz (L1, L2, L3, PE)' : 'CIRCUITO DE ALIMENTAÇÃO E COMANDO 110Vca / 24Vcc'}
      </text>

      {/* Esquema Específico para Gavetas / Motores */}
      {isGaveta && (
        <g transform="translate(140, 200)">
          {/* Gaveta do CCM com Disjuntor Q1 e Contator KM1 */}
          <rect x="0" y="0" width="460" height="480" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="6 3" />
          <text x="20" y="30" fill={textPrimary} fontSize="12" fontWeight="bold">
            GAVETA / BUCKET {page.panel || 'CCM'}
          </text>
          <text x="20" y="50" fill={textMuted} fontSize="10">
            Relé Eletrônico E300 · Contator KM1 · Disjuntor Motor Q1
          </text>

          {/* Motor com Tag e Potência reais */}
          <g transform="translate(230, 360)">
            <circle cx="0" cy="0" r="42" fill="none" stroke={strokeColor} strokeWidth="2" />
            <text x="0" y="-4" fill={textPrimary} fontSize="18" fontWeight="bold" textAnchor="middle">M</text>
            <text x="0" y="14" fill={textPrimary} fontSize="11" textAnchor="middle">3~</text>
            <text x="0" y="65" fill="#0284c7" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              {page.tags[0]?.code || 'MOTOR'}
            </text>
            {page.cubicleGaveta && (
              <text x="0" y="80" fill={textMuted} fontSize="10" textAnchor="middle">
                {page.cubicleGaveta}
              </text>
            )}
          </g>
        </g>
      )}

      {/* Esquema Específico para Instrumentação */}
      {isInstrument && (
        <g transform="translate(200, 220)">
          <rect x="0" y="0" width="380" height="240" fill={isDark ? '#1e293b' : '#fff'} stroke={strokeColor} strokeWidth="2" rx="4" />
          <text x="190" y="40" fill={textMuted} fontSize="11" textAnchor="middle" fontFamily="monospace">
            INSTRUMENTO DE PROCESSO (CAMPO)
          </text>
          <text x="190" y="70" fill="#0284c7" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            {page.tags[0]?.code || 'SENSOR'}
          </text>
          <circle cx="190" cy="140" r="35" fill="none" stroke="#0284c7" strokeWidth="2" strokeDasharray="3 3" />
          <text x="190" y="145" fill={textPrimary} fontSize="12" fontWeight="bold" textAnchor="middle">
            4~20mA
          </text>
          <text x="190" y="210" fill={textPrimary} fontSize="11" textAnchor="middle">
            Conexão com Painel Remota {page.panel || 'Z3RM01'}
          </text>
        </g>
      )}

      {/* Conexão com Painel de Remota / CLP */}
      <g transform="translate(760, 200)">
        <rect x="0" y="0" width="460" height="480" fill="none" stroke={strokeColor} strokeWidth="2" />
        <text x="20" y="30" fill={textPrimary} fontSize="13" fontWeight="bold" fontFamily="monospace">
          PAINEL DE REMOTA: {page.panel || 'Z3RM01'}
        </text>
        <text x="20" y="50" fill={textMuted} fontSize="10">
          Entradas/Saídas de Automação e Barramento de Bornes
        </text>

        {/* Régua de Bornes */}
        <g transform="translate(20, 100)">
          <rect x="0" y="0" width="420" height="80" fill={isDark ? '#1e293b' : '#f8fafc'} stroke={borderGridColor} />
          <text x="15" y="25" fill={textPrimary} fontSize="11" fontWeight="bold">
            Régua de Interligação de Campo:
          </text>
          {[1, 2, 3, 4, 5, 6].map((b) => (
            <g key={b} transform={`translate(${15 + b * 55}, 55)`}>
              <circle cx="0" cy="0" r="10" fill={isDark ? '#334155' : '#e2e8f0'} stroke={strokeColor} />
              <text x="0" y="4" fill={textPrimary} fontSize="9" textAnchor="middle" fontFamily="monospace">
                {b}
              </text>
            </g>
          ))}
        </g>
      </g>
    </g>
  );
}
