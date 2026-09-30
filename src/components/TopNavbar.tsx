import React from 'react';
import { Search, UploadCloud, Smartphone, Monitor, Shield, FileText } from 'lucide-react';

interface TopNavbarProps {
  currentTab: 'viewer' | 'cables' | 'remotas' | 'revisions' | 'checklist';
  onSelectTab: (tab: 'viewer' | 'cables' | 'remotas' | 'revisions' | 'checklist') => void;
  onOpenSearch: () => void;
  onOpenUpload: () => void;
  isMobileMode: boolean;
  onToggleMobileMode: () => void;
  activeRevision: string;
  documentNumber: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
  onOpenUpload,
  isMobileMode,
  onToggleMobileMode,
  activeRevision,
  documentNumber
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 px-4 lg:px-6 py-2.5 flex items-center justify-between transition-colors">
      {/* Zone 1: Brand title, single line */}
      <div className="flex items-center gap-3">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); onSelectTab('viewer'); }}
          className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-white hover:text-cyan-400 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-inner shadow-cyan-400/20 text-white font-bold text-sm tracking-wider">
            DH
          </div>
          <span className="font-semibold text-lg tracking-tight">DiagramHub</span>
        </a>

        {/* Quiet document context (single-line unboxed text) */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-700/60 pl-3">
          <span className="font-mono text-cyan-300 font-medium">{documentNumber}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Rev {activeRevision}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-400">Votorantim Nobres MT</span>
        </div>
      </div>

      {/* Zone 2: Clean text navigation links */}
      <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
        <button
          onClick={() => onSelectTab('viewer')}
          className={`px-3 py-1.5 rounded-md text-xs lg:text-sm transition-colors whitespace-nowrap ${
            currentTab === 'viewer'
              ? 'bg-slate-800 text-cyan-400 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Visualizador & Tags
        </button>

        <button
          onClick={() => onSelectTab('cables')}
          className={`px-3 py-1.5 rounded-md text-xs lg:text-sm transition-colors whitespace-nowrap ${
            currentTab === 'cables'
              ? 'bg-slate-800 text-cyan-400 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          De-Para de Bornes & Cabos
        </button>

        <button
          onClick={() => onSelectTab('remotas')}
          className={`px-3 py-1.5 rounded-md text-xs lg:text-sm transition-colors whitespace-nowrap ${
            currentTab === 'remotas'
              ? 'bg-slate-800 text-cyan-400 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Pesquisa de Remotas
        </button>

        <button
          onClick={() => onSelectTab('revisions')}
          className={`px-3 py-1.5 rounded-md text-xs lg:text-sm transition-colors whitespace-nowrap ${
            currentTab === 'revisions'
              ? 'bg-slate-800 text-cyan-400 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Histórico de Revisões
        </button>

        <button
          onClick={() => onSelectTab('checklist')}
          className={`px-3 py-1.5 rounded-md text-xs lg:text-sm transition-colors whitespace-nowrap ${
            currentTab === 'checklist'
              ? 'bg-slate-800 text-cyan-400 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Check-list de Campo
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2">
        {/* Spotlight Quick Search button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-all hover:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          title="Buscar Tag (Ctrl + K)"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Buscar Tag...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-700 rounded">
            Ctrl K
          </kbd>
        </button>

        {/* Upload Revision Action */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors shadow-sm shadow-cyan-900/40 whitespace-nowrap"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nova Revisão</span>
        </button>

        {/* Toggle Mobile/Desktop View Simulator */}
        <button
          onClick={onToggleMobileMode}
          className={`p-2 rounded-lg text-xs transition-colors border ${
            isMobileMode
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60'
              : 'text-slate-400 hover:text-white bg-slate-800/60 border-slate-700 hover:bg-slate-700'
          }`}
          title={isMobileMode ? 'Alternar para visão Desktop' : 'Alternar para visão Mobile (Técnico de Campo)'}
          aria-label="Alternar modo de dispositivo"
        >
          {isMobileMode ? <Smartphone className="w-4 h-4 text-cyan-400" /> : <Monitor className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
