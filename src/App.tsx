/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  initialNobresDocument, 
  generateNobresPages, 
  initialCableSchedule, 
  initialFieldChecklist 
} from './data/nobresProjectData';
import { 
  IndustrialDocument, 
  DiagramPage, 
  TagItem, 
  DocumentRevision, 
  CableScheduleItem, 
  FieldChecklistItem 
} from './types/diagram';
import { TopNavbar } from './components/TopNavbar';
import { DiagramViewer } from './components/DiagramViewer';
import { DocumentIndexTree } from './components/DocumentIndexTree';
import { RelationalPanel } from './components/RelationalPanel';
import { SearchSpotlightModal } from './components/SearchSpotlightModal';
import { UploadRevisionModal } from './components/UploadRevisionModal';
import { RevisionHistoryDrawer } from './components/RevisionHistoryDrawer';
import { CableScheduleTable } from './components/CableScheduleTable';
import { RemotaSearchTab } from './components/RemotaSearchTab';
import { FieldChecklistModal } from './components/FieldChecklistModal';
import { MobileFieldView } from './components/MobileFieldView';

export default function App() {
  // Inicialização do documento com todas as páginas geradas
  const [document, setDocument] = useState<IndustrialDocument>(() => {
    const pages = generateNobresPages();
    return {
      ...initialNobresDocument,
      pages
    };
  });

  // Estado de navegação e visualização
  const [currentPageNumber, setCurrentPageNumber] = useState<number>(19); // Começa na folha chave do motor Z3M03M1
  const [selectedTag, setSelectedTag] = useState<TagItem | null>(null);
  const [highlightedTagCode, setHighlightedTagCode] = useState<string>('Z3M03M1');
  const [currentTab, setCurrentTab] = useState<'viewer' | 'cables' | 'remotas' | 'revisions' | 'checklist'>('viewer');
  const [isMobileMode, setIsMobileMode] = useState<boolean>(false);

  // Modais e painéis
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  // Favoritos, Histórico de buscas, Cabos e Checklist
  const [bookmarkedPages, setBookmarkedPages] = useState<number[]>([6, 19, 21, 337]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Z3M03M1',
    'RM1-SL8:A2',
    'A1J02M1',
    'Z3P62Q1'
  ]);
  const [cables, setCables] = useState<CableScheduleItem[]>(initialCableSchedule);
  const [checklistItems, setChecklistItems] = useState<FieldChecklistItem[]>(initialFieldChecklist);

  // Auto-detecção e escuta em tempo real da largura de tela para Mobile
  useEffect(() => {
    const checkWidth = () => {
      setIsMobileMode(window.innerWidth < 768);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Atalhos de teclado globais
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Página atual do diagrama
  const currentPage = useMemo(() => {
    return (
      document.pages.find((p) => p.pageNumber === currentPageNumber) ||
      document.pages[0]
    );
  }, [document.pages, currentPageNumber]);

  // Navegação para página e tag
  const handleNavigateToPageAndTag = (pageNumber: number, tagCode: string) => {
    setCurrentPageNumber(pageNumber);
    setHighlightedTagCode(tagCode);
    setCurrentTab('viewer');

    const targetPage = document.pages.find((p) => p.pageNumber === pageNumber);
    if (targetPage) {
      const tagMatch = targetPage.tags.find(
        (t) => t.code.toUpperCase() === tagCode.toUpperCase()
      );
      if (tagMatch) {
        setSelectedTag(tagMatch);
      } else if (targetPage.tags.length > 0) {
        setSelectedTag(targetPage.tags[0]);
      }
    }
  };

  const handleSelectPage = (pageNumber: number) => {
    setCurrentPageNumber(pageNumber);
    const targetPage = document.pages.find((p) => p.pageNumber === pageNumber);
    if (targetPage && targetPage.tags.length > 0) {
      setSelectedTag(targetPage.tags[0]);
    } else {
      setSelectedTag(null);
    }
    // Remove highlight ao mudar de página manualmente a menos que a tag exista nela
    if (targetPage) {
      const hasCurrentHighlight = targetPage.tags.some(
        (t) => t.code.toUpperCase() === highlightedTagCode?.toUpperCase()
      );
      if (!hasCurrentHighlight) {
        setHighlightedTagCode('');
      }
    }
  };

  const handleSelectTag = (tag: TagItem) => {
    setSelectedTag(tag);
    setHighlightedTagCode(tag.code);
  };

  const handleToggleBookmark = (pageNumber: number) => {
    setBookmarkedPages((prev) =>
      prev.includes(pageNumber)
        ? prev.filter((p) => p !== pageNumber)
        : [...prev, pageNumber]
    );
  };

  const handleAddRecentSearch = (query: string) => {
    const clean = query.trim().toUpperCase();
    if (!clean) return;
    setRecentSearches((prev) => [clean, ...prev.filter((q) => q !== clean)].slice(0, 10));
  };

  // Aplicação de nova revisão (RF-01)
  const handleApplyNewRevision = (newRev: DocumentRevision, newDocumentNumber?: string) => {
    setDocument((prev) => {
      const updatedRevisions = prev.revisions.map((r) => ({
        ...r,
        isActive: false
      }));
      updatedRevisions.unshift(newRev);

      const updatedPages = prev.pages.map((p) => ({
        ...p,
        revision: newRev.revision,
        drawingNumber: newDocumentNumber || p.drawingNumber
      }));

      return {
        ...prev,
        documentNumber: newDocumentNumber || prev.documentNumber,
        activeRevision: newRev.revision,
        revisions: updatedRevisions,
        pages: updatedPages
      };
    });
  };

  const handleSelectActiveRevision = (revNumber: string) => {
    setDocument((prev) => {
      const updatedRevisions = prev.revisions.map((r) => ({
        ...r,
        isActive: r.revision === revNumber
      }));
      const updatedPages = prev.pages.map((p) => ({
        ...p,
        revision: revNumber
      }));

      return {
        ...prev,
        activeRevision: revNumber,
        revisions: updatedRevisions,
        pages: updatedPages
      };
    });
  };

  // Gerenciamento do checklist de campo
  const handleToggleChecklist = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleAddChecklistItem = (item: Omit<FieldChecklistItem, 'id' | 'completed'>) => {
    const newItem: FieldChecklistItem = {
      ...item,
      id: `chk-${Date.now()}`,
      completed: false
    };
    setChecklistItems((prev) => [newItem, ...prev]);
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklistItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddToChecklistFromPanel = (tagCode: string, pageNumber: number, description: string) => {
    handleAddChecklistItem({
      tagCode,
      pageNumber,
      description: `Inspeção de campo e teste do equipamento/circuito: ${description}`,
      category: 'CONTINUIDADE',
      technician: 'Técnico de Manutenção'
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Universal Top Bar */}
      <TopNavbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        isMobileMode={isMobileMode}
        onToggleMobileMode={() => setIsMobileMode(!isMobileMode)}
        activeRevision={document.activeRevision}
        documentNumber={document.documentNumber}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Mobile View Mode */}
        {isMobileMode ? (
          <MobileFieldView
            currentPage={currentPage}
            allPages={document.pages}
            onSelectPage={handleSelectPage}
            onSelectTag={handleSelectTag}
            selectedTag={selectedTag}
            onOpenUpload={() => setIsUploadOpen(true)}
            recentSearches={recentSearches}
            onAddRecentSearch={handleAddRecentSearch}
          />
        ) : (
          /* Desktop Split View Mode */
          <>
            {currentTab === 'viewer' && (
              <div className="flex-1 flex w-full h-full overflow-hidden">
                {/* Left Panel: Document Index Tree */}
                <DocumentIndexTree
                  pages={document.pages}
                  currentPageNumber={currentPageNumber}
                  onSelectPage={handleSelectPage}
                  bookmarkedPages={bookmarkedPages}
                  onToggleBookmark={handleToggleBookmark}
                />

                {/* Center Panel: High-Definition Vector CAD Diagram Viewer */}
                <DiagramViewer
                  page={currentPage}
                  totalPages={document.pages.length}
                  allPages={document.pages}
                  highlightedTagCode={highlightedTagCode}
                  selectedTag={selectedTag}
                  onSelectTag={handleSelectTag}
                  onPrevPage={() => handleSelectPage(Math.max(currentPageNumber - 1, 1))}
                  onNextPage={() => handleSelectPage(Math.min(currentPageNumber + 1, document.pages.length))}
                  onJumpToPage={handleSelectPage}
                  onNavigateToPageAndTag={handleNavigateToPageAndTag}
                />

                {/* Right Panel: Relational Inspector Panel */}
                <RelationalPanel
                  selectedTag={selectedTag}
                  currentPage={currentPage}
                  allPages={document.pages}
                  onNavigateToPageAndTag={handleNavigateToPageAndTag}
                  onAddToChecklist={handleAddToChecklistFromPanel}
                />
              </div>
            )}

            {currentTab === 'cables' && (
              <CableScheduleTable
                cables={cables}
                onNavigateToPage={handleNavigateToPageAndTag}
              />
            )}

            {currentTab === 'remotas' && (
              <RemotaSearchTab
                onNavigateToPage={handleNavigateToPageAndTag}
              />
            )}

            {currentTab === 'revisions' && (
              <RevisionHistoryDrawer
                revisions={document.revisions}
                activeRevision={document.activeRevision}
                onSelectActiveRevision={handleSelectActiveRevision}
                onOpenUpload={() => setIsUploadOpen(true)}
              />
            )}

            {currentTab === 'checklist' && (
              <FieldChecklistModal
                items={checklistItems}
                onToggleComplete={handleToggleChecklist}
                onAddItem={handleAddChecklistItem}
                onNavigateToPage={handleNavigateToPageAndTag}
                onDeleteItem={handleDeleteChecklistItem}
              />
            )}
          </>
        )}
      </main>

      {/* Spotlight Universal Search Modal (Ctrl + K) */}
      <SearchSpotlightModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        pages={document.pages}
        onSelectTagResult={handleNavigateToPageAndTag}
        recentSearches={recentSearches}
        onAddRecentSearch={handleAddRecentSearch}
      />

      {/* Upload and Revision Modal (RF-01) */}
      <UploadRevisionModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        currentDocument={document}
        onApplyNewRevision={handleApplyNewRevision}
      />
    </div>
  );
}
