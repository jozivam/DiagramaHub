import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Define o worker para pdfjs-dist via CDN unpkg
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface RealPdfViewerProps {
  pdfUrl: string;
  pageNumber: number;
  scale?: number;
  viewTheme?: 'light-classic' | 'blueprint-cad' | 'blueprint-dark';
  onLoadSuccess?: (numPages: number) => void;
  onTextExtracted?: (textItems: { text: string; x: number; y: number; width: number; height: number }[]) => void;
}

export const RealPdfViewer: React.FC<RealPdfViewerProps> = ({
  pdfUrl,
  pageNumber,
  scale = 2.0,
  viewTheme = 'light-classic',
  onLoadSuccess,
  onTextExtracted,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);

  // Carrega o documento PDF
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    loadingTask.promise
      .then((doc) => {
        if (!isMounted) return;
        setPdfDoc(doc);
        if (onLoadSuccess) onLoadSuccess(doc.numPages);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Erro ao carregar o PDF real:', err);
        setError('Não foi possível carregar o arquivo PDF do projeto.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);

  // Renderiza a página específica do PDF no Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isCancelled = false;
    setLoading(true);

    const targetPage = Math.max(1, Math.min(pageNumber, pdfDoc.numPages));

    pdfDoc.getPage(targetPage).then((page) => {
      if (isCancelled) return;

      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      page.render(renderContext).promise.then(() => {
        if (isCancelled) return;
        setLoading(false);

        // Extrai texto da página se callback fornecido
        if (onTextExtracted) {
          page.getTextContent().then((textContent) => {
            const items = textContent.items.map((item: any) => {
              const tx = item.transform;
              return {
                text: item.str,
                x: tx[4],
                y: viewport.height - tx[5], // Inverte Y do PDF para canvas
                width: item.width,
                height: item.height,
              };
            });
            onTextExtracted(items);
          });
        }
      });
    }).catch((err) => {
      if (isCancelled) return;
      console.error('Erro ao renderizar folha do PDF:', err);
      setLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, pageNumber, scale]);

  // Estilo de tema para o PDF (Clássico, CAD Azul, Dark)
  const getFilterStyle = () => {
    if (viewTheme === 'blueprint-cad') {
      return 'invert(0.92) hue-rotate(185deg) contrast(1.15) brightness(0.95)';
    }
    if (viewTheme === 'blueprint-dark') {
      return 'invert(0.95) hue-rotate(200deg) contrast(1.2) brightness(0.85)';
    }
    return 'none';
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 bg-slate-950/80 z-20 flex flex-col items-center justify-center text-cyan-400 gap-2 font-mono text-xs">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Carregando Folha {pageNumber} do Diagrama Real...</span>
        </div>
      )}

      {error ? (
        <div className="p-6 text-center text-rose-400 font-mono text-sm bg-rose-950/50 rounded-lg border border-rose-800">
          ⚠️ {error}
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain shadow-2xl transition-all duration-300 block"
          style={{ filter: getFilterStyle() }}
        />
      )}
    </div>
  );
};
