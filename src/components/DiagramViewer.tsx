import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize2, RotateCcw, Download, Printer, 
  Layers, Tag, Eye, ChevronLeft, ChevronRight, Share2, Compass, Check,
  Search, ArrowRight, CornerDownLeft, Target, Crosshair, Sparkles, Navigation, FileText
} from 'lucide-react';
import { DiagramPage, TagItem } from '../types/diagram';
import { OFFICIAL_INDEX_ROWS, IndexRow } from '../data/nobresProjectData';
import { searchTagsInPages, findTagOccurrencesAcrossDocument } from '../utils/tagParser';
import { RealPdfViewer } from './RealPdfViewer';

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
  const [viewerMode, setViewerMode] = useState<'pdf-canvas' | 'pdf-native'>('pdf-canvas');
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

  // Ao navegar para uma nova folha (ex: clicando na barra lateral), navega diretamente mantendo a folha visivel sem auto-zoom forçado
  useEffect(() => {
    setPanOffset({ x: 0, y: 0 });
  }, [page.pageNumber]);

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
    // Zoom responsivo direto pelo scroll do mouse sem precisar de Ctrl
    e.preventDefault();
    const delta = e.deltaY < 0 ? 10 : -10;
    setZoomLevel((prev) => Math.max(40, Math.min(prev + delta, 400)));
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

          {/* Alternância Modo de Visualização do PDF Real */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setViewerMode('pdf-canvas')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                viewerMode === 'pdf-canvas' ? 'bg-cyan-900 text-cyan-200 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="PDF Real renderizado em alta definição com apontador de tags"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>PDF Interativo</span>
            </button>
            <button
              onClick={() => setViewerMode('pdf-native')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                viewerMode === 'pdf-native' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Visualizador de PDF nativo do navegador"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Nativo</span>
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
      {viewerMode === 'pdf-native' ? (
        <div className="flex-1 relative w-full h-full bg-slate-950">
          <iframe
            src={`/NB.I.Z3001.505-02.pdf#page=${page.pageNumber}`}
            className="w-full h-full border-0"
            title={`Diagrama Real NB.I.Z3001.505-02 - Folha ${page.pageNumber}`}
          />
        </div>
      ) : (
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
            className="transition-transform duration-75 origin-center shadow-2xl relative flex items-center justify-center rounded border border-slate-700/50 w-full h-full max-w-full max-h-full"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel / 100})`,
              backgroundColor: bgColor
            }}
          >
            {/* RENDERIZADOR DO PDF REAL FORNECIDO NO PROJETO (NB.I.Z3001.505-02.pdf) */}
            <div className="w-full h-full flex items-center justify-center pointer-events-none p-1">
              <RealPdfViewer
                pdfUrl="/NB.I.Z3001.505-02.pdf"
                pageNumber={page.pageNumber}
                viewTheme={viewTheme}
                scale={2.0}
              />
            </div>

            {/* OVERLAY SVG COM TAGS, APONTADOR E MIRA SOBRE O PDF REAL */}
            <svg
              viewBox="0 0 1280 840"
              className="w-full h-full select-none absolute inset-0 z-10 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Margens e moldura perimetral com coordenadas de engenharia A-H e 1-12 */}
              <rect x="20" y="20" width="1240" height="800" fill="none" stroke={borderGridColor} strokeWidth="2" opacity="0.4" />

              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter, i) => (
                <g key={`coord-y-${letter}`}>
                  <text x="23" y={60 + i * 95} fill={textMuted} fontSize="9" textAnchor="middle" fontFamily="monospace" opacity="0.6">
                    {letter}
                  </text>
                  <text x="1257" y={60 + i * 95} fill={textMuted} fontSize="9" textAnchor="middle" fontFamily="monospace" opacity="0.6">
                    {letter}
                  </text>
                </g>
              ))}

              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                <g key={`coord-x-${num}`}>
                  <text x={70 + (num - 1) * 98} y="24" fill={textMuted} fontSize="9" textAnchor="middle" fontFamily="monospace" opacity="0.6">
                    {num}
                  </text>
                  <text x={70 + (num - 1) * 98} y="822" fill={textMuted} fontSize="9" textAnchor="middle" fontFamily="monospace" opacity="0.6">
                    {num}
                  </text>
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

            {/* 4. ELEMENTO APONTADOR DISCRETO QUANDO UMA TAG FOR BUSCADA (Sem quadrado pontilhado nem badge) */}
            {showTagPins &&
              page.tags.map((tag) => {
                const isTargetTag =
                  highlightedTagCode && tag.code.toUpperCase() === highlightedTagCode.toUpperCase();

                if (!isTargetTag) return null;

                const bx = (tag.boundingBox.x / 100) * 1280;
                const by = (tag.boundingBox.y / 100) * 840;
                const bw = (tag.boundingBox.width / 100) * 1280;
                const bh = (tag.boundingBox.height / 100) * 840;

                return (
                  <g key={tag.id} className="pointer-events-auto cursor-pointer">
                    {/* RETÍCULO DE MIRA TELESCÓPICA APONTANDO NA TAG */}
                    <g transform={`translate(${bx + bw / 2}, ${by + bh / 2})`}>
                      <circle cx="0" cy="0" r="32" fill="none" stroke="#06b6d4" strokeWidth="1.5" className="animate-ping" opacity="0.6" />
                      <circle cx="0" cy="0" r="24" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="3 3" />
                      <circle cx="0" cy="0" r="14" fill="rgba(6,182,212,0.3)" stroke="#06b6d4" strokeWidth="2" />
                      <circle cx="0" cy="0" r="3" fill="#ffffff" />
                      <line x1="-36" y1="0" x2="-16" y2="0" stroke="#22d3ee" strokeWidth="2" />
                      <line x1="16" y1="0" x2="36" y2="0" stroke="#22d3ee" strokeWidth="2" />
                      <line x1="0" y1="-36" x2="0" y2="-16" stroke="#22d3ee" strokeWidth="2" />
                      <line x1="0" y1="16" x2="0" y2="36" stroke="#22d3ee" strokeWidth="2" />
                    </g>
                  </g>
                );
              })}
          </svg>
        </div>
      </div>
    )}
  </div>
);
};

