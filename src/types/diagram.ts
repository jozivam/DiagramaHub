export type TagType = 
  | 'EQUIPMENT'        // Motores, Moinhos, Válvulas, Transmissores (ex: Z3M03M1, 416BM01MT10)
  | 'PANEL'            // CCM, Cubículo, Remota, Switch, QDL, QDTC (ex: Z3SE1, Z3RM01, Z3-CCM02)
  | 'CABLE'            // Cabos de comando, força, sinal (ex: Z3M03M1C1, 1X7C#1,0mm², 1x4C#150mm²)
  | 'TERMINAL_BORNE'   // Bornes, Réguas, Conectores (ex: RM1-SL8:A2, X2-1, LT:04)
  | 'SIGNAL'           // I/O CLP, feedbacks, paradas de emergência (ex: RUNNING_FEEDBACK, 4~20mA)
  | 'UNKNOWN';

export interface BoundingBox {
  x: number;      // percentual 0..100
  y: number;      // percentual 0..100
  width: number;  // percentual
  height: number; // percentual
}

export interface TagRelation {
  fromTag?: string;
  toTag?: string;
  targetPageNumber: number;
  relationType: 'POWERS' | 'CONTROLS' | 'MEASURES' | 'INTERCONNECTS' | 'PROTECTS' | 'INDEXED_IN';
  description: string;
  cableCode?: string;
  terminalBlock?: string;
}

export interface TagItem {
  id: string;
  code: string;
  type: TagType;
  tagFormat?: 'ISA' | 'KKS' | 'CABLE' | 'BORNE' | 'PANEL' | 'OTHER';
  description: string;
  spec?: string;       // ex: "3700CV / 6.6kV", "1x4C#150mm²", "Pt-100 3 fios"
  pageNumber: number;
  documentNumber: string;
  locationArea?: string; // ex: "Eletrocentro Z3SE1", "Saída do Moinho - Topo"
  panelId?: string;      // ex: "Z3-QDMT01-03", "Z3RM05"
  boundingBox: BoundingBox;
  relations: TagRelation[];
  metadata?: Record<string, string | number | boolean>;
}

export interface DiagramPage {
  id: string;
  pageNumber: number;         // ex: 19
  sheetCode: string;          // ex: "19", "23A", "10A"
  title: string;              // ex: "CUBÍCULO 3 MOTOR DO MOINHO Z3M03M1 - Z3-QDMT01-03"
  subgroup: string;           // ex: "MOAGEM Z3"
  revision: string;           // ex: "02"
  date: string;               // ex: "07/04/26"
  client: string;             // ex: "VOTORANTIM CIMENTOS"
  location: string;           // ex: "NOBRES - MT"
  drawingNumber: string;      // ex: "NB.I.Z3001.505"
  supplierDrawing: string;    // ex: "AE-TA-0375-DI001"
  localArea?: string;         // ex: "ELETROCENTRO Z3SE1"
  panel?: string;             // ex: "Z3-QDMT01"
  cubicleGaveta?: string;     // ex: "CUBICULO 03"
  notes?: string[];
  tags: TagItem[];
  diagramType: 'SCHEMATIC_POWER' | 'CONTROL_IO' | 'INSTRUMENTATION' | 'INDEX' | 'COVER' | 'SYMBOLS';
  svgBlueprintKey: string;    // chave para template visual vetorial
}

export interface DocumentRevision {
  revision: string;           // "00", "01", "02", "03"
  date: string;               // "07/04/26"
  description: string;        // "REVISÃO GERAL"
  requestedBy: string;        // "G.F.R"
  revisedBy: string;          // "T.S.S"
  isActive: boolean;
  totalPages: number;
  changesSummary: string[];
  pdfUrl?: string;
}

export interface IndustrialDocument {
  id: string;
  documentNumber: string;     // "NB.I.Z3001.505"
  title: string;              // "DIAGRAMA DE INTERLIGAÇÃO"
  client: string;             // "VOTORANTIM CIMENTOS"
  location: string;           // "NOBRES - MT"
  project: string;            // "MOAGEM Z3"
  activeRevision: string;     // "02"
  supplierDrawingNumber: string; // "AE-TA-0375-DI001"
  date: string;
  designer: string;           // "T.S.S."
  approvedBy: string;         // "G.F.R."
  revisions: DocumentRevision[];
  pages: DiagramPage[];
  fileSize?: string;
  uploadedAt: string;
}

export interface CableScheduleItem {
  id: string;
  cableTag: string;
  cableSpec: string;          // ex: "1x7C#1,0mm²"
  originTag: string;          // ex: "Painel Z3-QDMT01-03"
  originTerminal: string;     // ex: "X1: 1..7"
  destinationTag: string;     // ex: "Botoeira Local Z3M03M1_BL"
  destinationTerminal: string;// ex: "BE: 1..7"
  functionDescription: string;// ex: "Comando e Intertravamento Botoeira Campo"
  pageReference: number;      // 20
  status: 'INSTALLED' | 'PENDING_FIELD' | 'COMMISSIONED';
}

export interface FieldChecklistItem {
  id: string;
  tagCode: string;
  pageNumber: number;
  description: string;
  category: 'CONTINUIDADE' | 'APERTO_BORNE' | 'ISOLAMENTO' | 'IDENTIFICACAO';
  completed: boolean;
  technician?: string;
  notes?: string;
  timestamp?: string;
}
