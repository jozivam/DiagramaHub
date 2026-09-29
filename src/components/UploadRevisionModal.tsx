import React, { useState } from 'react';
import { 
  UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, X, 
  ArrowRight, ShieldCheck, Cpu, Layers, FileCode
} from 'lucide-react';
import { IndustrialDocument, DocumentRevision } from '../types/diagram';

interface UploadRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocument: IndustrialDocument;
  onApplyNewRevision: (newRev: DocumentRevision, newDocumentNumber?: string) => void;
}

export const UploadRevisionModal: React.FC<UploadRevisionModalProps> = ({
  isOpen,
  onClose,
  currentDocument,
  onApplyNewRevision
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [docNumber, setDocNumber] = useState(currentDocument.documentNumber);
  const [supplierDrawing, setSupplierDrawing] = useState(currentDocument.supplierDrawingNumber);
  const [revisionNumber, setRevisionNumber] = useState('03');
  const [revisionDescription, setRevisionDescription] = useState('REVISÃO GERAL - ATUALIZAÇÃO DE INTERLIGAÇÃO CCM-02 E SENSORES DE TEMPERATURA');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  if (!isOpen) return null;

  const handleSimulateUpload = () => {
    setIsProcessing(true);
    setProgress(15);
    setProcessingStep('1/4: Analisando estrutura do arquivo PDF / CAD...');

    setTimeout(() => {
      setProgress(40);
      setProcessingStep('2/4: Extraindo metadados do carimbo técnico (VOTORANTIM CIMENTOS)...');
    }, 600);

    setTimeout(() => {
      setProgress(75);
      setProcessingStep('3/4: Executando OCR vetorial e classificação de Tags ISA/NBR...');
    }, 1200);

    setTimeout(() => {
      setProgress(95);
      setProcessingStep('4/4: Mapeando índices relacionais entre folhas 01 e 337...');
    }, 1800);

    setTimeout(() => {
      setProgress(100);
      setIsProcessing(false);
      setIsComplete(true);

      const newRev: DocumentRevision = {
        revision: revisionNumber,
        date: new Date().toLocaleDateString('pt-BR'),
        description: revisionDescription,
        requestedBy: 'G.F.R (Votorantim)',
        revisedBy: 'T.S.S (ATMC Engenharia)',
        isActive: true,
        totalPages: 337,
        changesSummary: [
          revisionDescription,
          'Reindexação automática de 1.420 tags de equipamentos, cabos e bornes'
        ]
      };

      onApplyNewRevision(newRev, docNumber);
    }, 2400);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      // Auto detect if name contains rev
      if (f.name.toLowerCase().includes('rev')) {
        const match = f.name.match(/rev[_-]?(\d+)/i);
        if (match && match[1]) {
          setRevisionNumber(String(match[1]).padStart(2, '0'));
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Upload & Versionamento de Diagrama
              </h3>
              <p className="text-xs text-slate-400">
                Detecção automática de projeto, carimbo e indexação relacional
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {!isProcessing && !isComplete && (
            <>
              {/* Drag and Drop Zone */}
              <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-950/40">
                <input
                  type="file"
                  accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileCode className="w-10 h-10 text-cyan-400 mb-2" />
                <span className="text-sm font-semibold text-white">
                  {file ? file.name : 'Selecione ou arraste o arquivo do Diagrama (PDF / CAD / Imagem)'}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Formatos suportados: PDF vetorial, PDF escaneado (OCR), DWG, TIFF, PNG
                </span>
              </label>

              {/* Detected Metadata Fields */}
              <div className="bg-slate-950/60 rounded-lg p-3.5 border border-slate-800 space-y-3 text-xs">
                <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                  Metadados Identificados no Carimbo:
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Nº do Projeto / Código:</label>
                    <input
                      type="text"
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-cyan-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Desenho do Fornecedor:</label>
                    <input
                      type="text"
                      value={supplierDrawing}
                      onChange={(e) => setSupplierDrawing(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Nova Revisão Detectada:</label>
                    <input
                      type="text"
                      value={revisionNumber}
                      onChange={(e) => setRevisionNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-rose-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Revisão Anterior Ativa:</label>
                    <div className="px-2.5 py-1.5 bg-slate-900/60 border border-slate-800 rounded font-mono text-slate-400">
                      Rev {currentDocument.activeRevision} ({currentDocument.date})
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Descrição / Motivo da Revisão:</label>
                  <textarea
                    rows={2}
                    value={revisionDescription}
                    onChange={(e) => setRevisionDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 resize-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Processing State with progress bar (< 45s RNF-01) */}
          {isProcessing && (
            <div className="py-8 px-4 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
              <div>
                <h4 className="font-semibold text-white text-sm">
                  Processando e Indexando Diagrama...
                </h4>
                <p className="text-xs text-slate-400 mt-1">{processingStep}</p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-[11px] font-mono text-cyan-400">{progress}% concluído</div>
            </div>
          )}

          {/* Complete Success State */}
          {isComplete && (
            <div className="py-6 px-4 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <div>
                <h4 className="font-bold text-white text-base">
                  Revisão {revisionNumber} Publicada e Indexada com Sucesso!
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  O documento <span className="font-mono text-cyan-300">{docNumber}</span> agora tem a Revisão {revisionNumber} como ativa. As buscas automáticas de tags e diagramas já apontam para a nova versão.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-end gap-3 text-xs">
          {!isComplete ? (
            <>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSimulateUpload}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-900/40"
              >
                <span>Processar e Atualizar para Rev {revisionNumber}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors"
            >
              Concluir & Abrir Diagrama
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
