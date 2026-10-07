import { IndustrialDocument, DiagramPage, TagItem, CableScheduleItem, FieldChecklistItem } from '../types/diagram';
import ocrIndexData from './ocrIndex.json';

// Catálogo das 337 páginas do projeto Votorantim Moagem Z3 (NB.I.Z3001.505)
// Extraído diretamente do índice oficial das folhas 06 a 16 do projeto

export interface IndexRow {
  pageNumber: number;
  sheetCode: string;
  description: string;
  rev: string;
  panel?: string;
  category: 'DOC' | 'INDEX' | 'POWER' | 'CONTROL' | 'INSTRUMENT' | 'FILTER' | 'CONVEYOR' | 'SILO';
  primaryTag?: string;
  kw?: string;
}

export const OFFICIAL_INDEX_ROWS: IndexRow[] = [
  { pageNumber: 1, sheetCode: '01', description: 'CAPA', rev: '03', category: 'DOC' },
  { pageNumber: 2, sheetCode: '02', description: 'SIMBOLOGIA', rev: '01', category: 'DOC' },
  { pageNumber: 3, sheetCode: '03', description: 'LEGENDA', rev: '01', category: 'DOC', primaryTag: 'A1A01LT', panel: 'A1RM1' },
  { pageNumber: 4, sheetCode: '04', description: 'LEGENDA', rev: '03', category: 'DOC', primaryTag: 'A1J02M1', panel: 'SU1-CCM-A1-1', kw: '55 kW' },
  { pageNumber: 5, sheetCode: '05', description: 'LEGENDA - TIPICO DE INSTRUMENTAÇÃO', rev: '03', category: 'DOC', primaryTag: 'HS1' },
  { pageNumber: 6, sheetCode: '06', description: 'ÍNDICE (PÁGINAS 01 A 37)', rev: '03', category: 'INDEX', primaryTag: 'Z3M03M1' },
  { pageNumber: 7, sheetCode: '07', description: 'ÍNDICE (PÁGINAS 38 A 64)', rev: '03', category: 'INDEX' },
  { pageNumber: 8, sheetCode: '08', description: 'ÍNDICE (PÁGINAS 65 A 91)', rev: '03', category: 'INDEX' },
  { pageNumber: 9, sheetCode: '09', description: 'ÍNDICE (PÁGINAS 92 A 118)', rev: '03', category: 'INDEX' },
  { pageNumber: 10, sheetCode: '10', description: 'ÍNDICE (PÁGINAS 119 A 145)', rev: '03', category: 'INDEX' },
  { pageNumber: 11, sheetCode: '10A', description: 'ÍNDICE (PÁGINAS 146 A 172)', rev: '03', category: 'INDEX' },
  { pageNumber: 12, sheetCode: '11', description: 'ÍNDICE (PÁGINAS 173 A 199)', rev: '03', category: 'INDEX' },
  { pageNumber: 13, sheetCode: '12', description: 'ÍNDICE (PÁGINAS 200 A 226)', rev: '03', category: 'INDEX' },
  { pageNumber: 14, sheetCode: '13', description: 'ÍNDICE (PÁGINAS 227 A 253)', rev: '03', category: 'INDEX' },
  { pageNumber: 15, sheetCode: '14', description: 'ÍNDICE (PÁGINAS 254 A 280)', rev: '03', category: 'INDEX' },
  { pageNumber: 16, sheetCode: '15', description: 'ÍNDICE (PÁGINAS 281 A 307)', rev: '03', category: 'INDEX' },
  { pageNumber: 17, sheetCode: '16', description: 'ÍNDICE (PÁGINAS 308 A 337)', rev: '03', category: 'INDEX' },
  { pageNumber: 18, sheetCode: '17', description: 'CUBÍCULO 01 DE ENTRADA - Z3-QDMT01-01', rev: '03', category: 'POWER', panel: 'Z3-QDMT01', primaryTag: 'Z3-QDMT01-01' },
  { pageNumber: 19, sheetCode: '18', description: 'CUBÍCULO 01 DE ENTRADA - Z3-QDMT01-01', rev: '03', category: 'CONTROL', panel: 'Z3-QDMT01', primaryTag: 'Z3QDMT01C1' },
  { pageNumber: 20, sheetCode: '19', description: 'CUBÍCULO 3 MOTOR DO MOINHO Z3M03M1 - Z3-QDMT01-03', rev: '03', category: 'POWER', panel: 'Z3-QDMT01', primaryTag: 'Z3M03M1', kw: '3700 CV' },
  { pageNumber: 21, sheetCode: '20', description: 'CUBÍCULO 3 MOTOR DO MOINHO Z3M03M1 - Z3-QDMT01-03', rev: '03', category: 'CONTROL', panel: 'Z3-QDMT01', primaryTag: 'Z3M03M1_BL' },
  { pageNumber: 22, sheetCode: '21', description: 'Z3M03M1 - INSTRUMENTAÇÃO DO MOTOR PRINCIPAL DO MOINHO - Z3M03M1', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM05', primaryTag: 'Z3M03M1' },
  { pageNumber: 23, sheetCode: '22', description: 'Z3M03Q2 - I/O SISTEMA ESCOVA DE ELEVAÇÃO DO MOTOR PRINCIPAL DO MOINHO', rev: '03', category: 'CONTROL', panel: 'Z3RM05', primaryTag: 'Z3M03Q2' },
  { pageNumber: 24, sheetCode: '23', description: 'CUBÍCULO 4 - TRASNFORMADOR 2000kVA - Z3-QDMT01-04', rev: '03', category: 'POWER', panel: 'Z3-QDMT01', primaryTag: 'Z3TF01' },
  { pageNumber: 25, sheetCode: '23A', description: 'CUBÍCULO 4 - TRASNFORMADOR 2000kVA - Z3-QDMT01-04', rev: '03', category: 'POWER', panel: 'Z3-QDMT01', primaryTag: 'Z3-RA-01' },
  { pageNumber: 26, sheetCode: '24', description: 'CUBÍCULO 5 - BANCO DE CAPACITOR - Z3-QDMT01-05', rev: '03', category: 'POWER', panel: 'Z3-QDMT01', primaryTag: 'Z3QDMT5C1' },
  { pageNumber: 27, sheetCode: '25', description: 'Z3-QDBT01 - ALIMENTAÇÃO DE ENTRADA', rev: '03', category: 'POWER', panel: 'Z3-QDBT01', primaryTag: 'Z3-QDBT01' },
  { pageNumber: 28, sheetCode: '26', description: 'GAVETA 2A - ALIMENTAÇÃO DO TRAFO DE ILUMINAÇÃO Z3-TL-001', rev: '03', category: 'POWER', panel: 'Z3-QDBT01', primaryTag: 'Z3-TL-001' },
  { pageNumber: 29, sheetCode: '27', description: 'Z3-QDBT01 - GAVETA 2B - ALIMENTAÇÃO DO SOFT-STARTER 416FA21EC10 - Z3P62Q1', rev: '03', category: 'POWER', panel: 'Z3-QDBT01', primaryTag: 'Z3P62Q1', kw: '90 kW' },
  { pageNumber: 30, sheetCode: '28', description: 'Z3P62Q1 - 416FA21EC10 - PAINEL DO SOFT-STARTER DO VENTILADOR', rev: '03', category: 'CONTROL', panel: '416FA21EC10', primaryTag: 'Z3P62M1', kw: '90 kW' },
  { pageNumber: 31, sheetCode: '29', description: 'Z3-QDBT01 - GAVETA 2C - RESERVA', rev: '03', category: 'POWER', panel: 'Z3-QDBT01', primaryTag: 'RESERVA 30kW' },
  { pageNumber: 32, sheetCode: '30', description: 'Z3-QDBT01 - GAVETA 2D - ALIMENTAÇÃO DO INV. SEPARADOR 416SP09EC10 - Z3S01Q1', rev: '03', category: 'POWER', panel: 'Z3-QDBT01', primaryTag: 'Z3S01Q1', kw: '135 kW' },
  { pageNumber: 33, sheetCode: '31', description: 'Z3S01Q1 - 416SP09MT10 - PAINEL DO INVERSOR DO SEPARADOR', rev: '03', category: 'CONTROL', panel: '416SP09EC10', primaryTag: 'Z3S01M1', kw: '135 kW' },
  { pageNumber: 34, sheetCode: '32', description: 'Z3S01 - INSTRUMENTAÇÃO DO SEPARADOR', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM04', primaryTag: 'Z3S01_TT1' },
  { pageNumber: 35, sheetCode: '33', description: 'Z3S01 - INSTRUMENTAÇÃO DO SEPARADOR', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM04', primaryTag: 'Z3S01_XT1' },
  { pageNumber: 36, sheetCode: '34', description: 'Z3-QDBT01 - GAVETA 2E - ALIMENTAÇÃO DO Z3-CCM02', rev: '03', category: 'POWER', panel: 'Z3-QDBT01', primaryTag: 'Z3-CCM02', kw: '323.1 kW' },
  { pageNumber: 37, sheetCode: '35', description: 'Z3-QDBT01 - GAVETA 2F - ALIMENTAÇÃO DO Z3-CCM03', rev: '03', category: 'POWER', panel: 'Z3-QDBT01', primaryTag: 'Z3-CCM03', kw: '307.5 kW' },
  { pageNumber: 38, sheetCode: '36', description: 'GAVETA 3A1 - ALIMENTAÇÃO DO TRAFO DE CONTROLE Z3-TC-001', rev: '03', category: 'POWER', panel: 'Z3-QDBT01', primaryTag: 'Z3-TC-001' },
  { pageNumber: 39, sheetCode: '37', description: 'GAVETA 3A2 - ALIMENTAÇÃO DO PAINEL Z3-QDCC-001', rev: '03', category: 'POWER', panel: 'Z3-QDBT01', primaryTag: 'Z3-QDCC-001' },
  { pageNumber: 40, sheetCode: '38', description: 'Z3-QDBT01 - GAVETA 3B- ALIMENTAÇÃO DO Z3-POWERBOX 01', rev: '03', category: 'POWER', panel: 'Z3-QDBT01', primaryTag: 'Z3-POWERBOX 01' },
  { pageNumber: 41, sheetCode: '39', description: 'Z3-QDBT01 - GAVETA 3C - ALIMENTAÇÃO PAINEL DO INV. DO VENT. Z3P72Q1', rev: '03', category: 'POWER', panel: 'Z3-QDBT01', primaryTag: 'Z3P72Q1', kw: '260 kW' },
  { pageNumber: 42, sheetCode: '40', description: 'Z3P72Q1 - 416FA16EC10 - PAINEL DO INVERSOR DO VENTILADOR', rev: '03', category: 'CONTROL', panel: '416FA16EC10', primaryTag: 'Z3P72M1', kw: '260 kW' },
  { pageNumber: 43, sheetCode: '41', description: 'Z3P72M1 - INSTRUMENTAÇÃO DO VENTILADOR DO FILTRO DE PROCESSO', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM06', primaryTag: 'Z3P72_XT1' },
  { pageNumber: 44, sheetCode: '42', description: 'Z3P72M1 - INSTRUMENTAÇÃO DO VENTILADOR DO FILTRO DE PROCESSO', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM06', primaryTag: 'Z3P72_TSH' },
  { pageNumber: 45, sheetCode: '43', description: 'Z3-QDBT01 - GAVETA 3D - RESERVA', rev: '03', category: 'POWER', panel: 'Z3-QDBT01', primaryTag: 'RESERVA 100kW' },
  { pageNumber: 46, sheetCode: '44', description: 'Z3-QDBT01 - GAVETA 3E -ALIMENTAÇÃO DO Z3-CCM01', rev: '03', category: 'POWER', panel: 'Z3-QDBT01', primaryTag: 'Z3-CCM01', kw: '263.08 kW' },
  { pageNumber: 47, sheetCode: '45', description: 'Z3-POWERBOX 01 - DISTRIBUIÇÃO DE ALIMENTAÇÃO AR-CONDICIONADO ELETROCENTROS', rev: '03', category: 'POWER', panel: 'Z3-POWERBOX 01', primaryTag: 'Z3POWERBOX01' },
  { pageNumber: 48, sheetCode: '46', description: 'PT100 E ALARME DE INCÊNDIO - Z3SE1 E Z3SE2 - SINAIS DE TEMPERATURA E ALARME', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM01', primaryTag: 'Z3SE1' },
  { pageNumber: 49, sheetCode: '47', description: 'PT100 E ALARME DE INCÊNDIO - Z3SE3 - SINAIS DE TEMPERATURA E ALARME', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM09', primaryTag: 'Z3SE3' },
  { pageNumber: 50, sheetCode: '48', description: 'ALIMENTAÇÃO - ALIMENTAÇÃO DO Z3-QDTC-01', rev: '03', category: 'POWER', panel: 'Z3-QDTC-01', primaryTag: 'Z3-QDTC-01' },
  { pageNumber: 51, sheetCode: '49', description: 'Z3-QDTC-01 - ALIMENTAÇÃO DO Z3-QDTC-02', rev: '03', category: 'POWER', panel: 'Z3-QDTC-01', primaryTag: 'Z3-QDTC-02' },
  { pageNumber: 52, sheetCode: '50', description: 'Z3-QDTC-01 - RESERVA', rev: '03', category: 'POWER', panel: 'Z3-QDTC-01', primaryTag: 'RESERVA QDTC' },
  { pageNumber: 53, sheetCode: '51', description: 'Z3P71 - 416DC15EC10 - PROGRAMADOR DO FILTRO', rev: '03', category: 'FILTER', panel: 'Z3P71Q1', primaryTag: 'Z3P71' },
  { pageNumber: 54, sheetCode: '51A', description: 'Z3P71 - 416DC15EC10 - PROGRAMADOR DO FILTRO (CONTINUAÇÃO)', rev: '03', category: 'FILTER', panel: 'Z3P71Q1', primaryTag: 'Z3P71' },
  { pageNumber: 55, sheetCode: '52', description: 'Z3P71 - INSTRUMENTAÇÃO DO FILTRO DE PROCESSO', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM06', primaryTag: 'Z3P71_PT1' },
  { pageNumber: 56, sheetCode: '53', description: 'Z3P71 - INSTRUMENTAÇÃO DO FILTRO DE PROCESSO', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM06', primaryTag: 'Z3P71_PT2' },
  { pageNumber: 57, sheetCode: '54', description: 'Z3P71 - TEMPERATURA ENTRADA DO FILTRO', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM06', primaryTag: 'Z3P71_TT1' },
  { pageNumber: 58, sheetCode: '55', description: 'Z3P71 - 416DC15EC10 - INSTRUMENTAÇÃO DO FILTRO', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM06', primaryTag: 'Z3P71_LSH1' },
  { pageNumber: 59, sheetCode: '56', description: 'Z3-QDTC-01 - PROGRAMADOR DO FILTRO - Z3P61 - 416DC20EC10', rev: '03', category: 'FILTER', panel: 'Z3-QDTC-01', primaryTag: 'Z3P61' },
  { pageNumber: 60, sheetCode: '57', description: 'Z3-QDTC-01 - INSTRUMENTAÇÃO - PROGRAMADOR DO FILTRO - Z3P61', rev: '03', category: 'FILTER', panel: 'Z3-QDTC-01', primaryTag: 'Z3P61PDT' },
  { pageNumber: 61, sheetCode: '58', description: 'Z3P61 - 416DC20EC10 - INSTRUMENTAÇÃO DO FILTRO', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM07', primaryTag: 'Z3P61_LSH1' },
  { pageNumber: 62, sheetCode: '59', description: 'Z3-QDTC-01 - PROGRAMADOR DO FILTRO - Z3P81 - 418DC12EC10', rev: '03', category: 'FILTER', panel: 'Z3-QDTC-01', primaryTag: 'Z3P81' },
  { pageNumber: 63, sheetCode: '60', description: 'Z3-QDTC-01 - INSTRUMENTAÇÃO - PROGRAMADOR DO FILTRO - Z3P81', rev: '03', category: 'FILTER', panel: 'Z3-QDTC-01', primaryTag: 'Z3P81PDT' },
  { pageNumber: 64, sheetCode: '61', description: 'Z3P81 - 418DC12EC10 - INSTRUMENTAÇÃO DO FILTRO', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM08', primaryTag: 'Z3P81_PSL' },
  { pageNumber: 65, sheetCode: '62', description: 'Z3-QDTC-01 - PROGRAMADOR DO FILTRO - Z3P91 - 418DC14EC10', rev: '03', category: 'FILTER', panel: 'Z3-QDTC-01', primaryTag: 'Z3P91' },
  { pageNumber: 66, sheetCode: '63', description: 'Z3-QDTC-01 - INSTRUMENTAÇÃO - PROGRAMADOR DO FILTRO - Z3P91', rev: '03', category: 'FILTER', panel: 'Z3-QDTC-01', primaryTag: 'Z3P91PDT' },
  { pageNumber: 67, sheetCode: '64', description: 'Z3P91 - 418DC14EC10 - INSTRUMENTAÇÃO DO FILTRO', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM08', primaryTag: 'Z3P91_PSL' },
  { pageNumber: 68, sheetCode: '65', description: 'Z3-QDTC-01 - ALIMENTAÇÃO DO RK-01/ PLC-01/Z3-RM-01', rev: '03', category: 'POWER', panel: 'Z3-QDTC-01', primaryTag: 'RK-01' },
  { pageNumber: 69, sheetCode: '66', description: 'Z3-QDTC-01 - ALIMENTAÇÃO Z3-RM-07/ Z3-RM-08/ Z3-RM-04', rev: '03', category: 'POWER', panel: 'Z3-QDTC-01', primaryTag: 'Z3-RM-07' },
  { pageNumber: 70, sheetCode: '67', description: 'Z3-QDTC-01 - ALIMENTAÇÃO Z3-RM-05/ Z3-RM-06/ RACK SWITCH', rev: '03', category: 'POWER', panel: 'Z3-QDTC-01', primaryTag: 'Z3-RM-05' },
  { pageNumber: 71, sheetCode: '68', description: 'Z3-QDTE-01 - ALIMENTAÇÃO DO Z3-TF1/ Z3-NB-01/ Z3-QDTE-01', rev: '03', category: 'POWER', panel: 'Z3-QDTE-01', primaryTag: 'Z3-TF1' },
  { pageNumber: 72, sheetCode: '69', description: 'Z3-QDTC-01 - ALIMENTAÇÃO DOS CIRCUITOS DE RESERVA', rev: '03', category: 'POWER', panel: 'Z3-QDTC-01', primaryTag: 'Z3K01Q1F1' },
  { pageNumber: 73, sheetCode: '70', description: 'Z3-QDTC-02 - INSTRUMENTAÇÃO SILO DE CLÍNQUER - G3L01 - 413H020L01', rev: '03', category: 'SILO', panel: 'Z3RM02', primaryTag: 'G3L01' },
  { pageNumber: 74, sheetCode: '71', description: 'G3L01 - 413H020L02 - INSTRUMENTAÇÃO SILO DE CLÍNQUER', rev: '03', category: 'SILO', panel: 'Z3RM02', primaryTag: 'G3L01_LT' },
  { pageNumber: 75, sheetCode: '72', description: 'Z3-QDTC-02 - INSTRUMENTAÇÃO SILO DE POZOLANA - G3L02 - 413H021L01', rev: '03', category: 'SILO', panel: 'Z3RM02', primaryTag: 'G3L02' },
  { pageNumber: 76, sheetCode: '73', description: 'G3L02 - 413H021L02 - INSTRUMENTAÇÃO SILO DE POZOLANA', rev: '03', category: 'SILO', panel: 'Z3RM02', primaryTag: 'G3L02_LT' },
  { pageNumber: 77, sheetCode: '74', description: 'Z3-QDTC-02 - INSTRUMENTAÇÃO SILO DE GESSO - G3L03 - 413H022L01', rev: '03', category: 'SILO', panel: 'Z3RM02', primaryTag: 'G3L03' },
  { pageNumber: 78, sheetCode: '75', description: 'G3L03 - 413H022L02 - INSTRUMENTAÇÃO SILO DE GESSO', rev: '03', category: 'SILO', panel: 'Z3RM02', primaryTag: 'G3L03_LT' },
  { pageNumber: 79, sheetCode: '76', description: 'Z3-QDTC-02 - INSTRUMENTAÇÃO SILO DE CALCÁRIO - G3L04 - 413H023L01', rev: '03', category: 'SILO', panel: 'Z3RM02', primaryTag: 'G3L04' },
  { pageNumber: 80, sheetCode: '77', description: 'G3L04 - 413H023L02 - INSTRUMENTAÇÃO SILO DE CALCÁRIO', rev: '03', category: 'SILO', panel: 'Z3RM02', primaryTag: 'G3L04_LT' },
  { pageNumber: 81, sheetCode: '78', description: 'Z3-QDTC-02 - PROGRAMADOR DO FILTRO - U3P01 - 413DC05EC10', rev: '03', category: 'FILTER', panel: 'Z3-QDTC-02', primaryTag: 'U3P01' },
  { pageNumber: 82, sheetCode: '79', description: 'Z3-QDTC-02 - INSTRUMENTAÇÃO - PROGRAMADOR DO FILTRO - U3P01', rev: '03', category: 'FILTER', panel: 'Z3-QDTC-02', primaryTag: 'U3P01PDT' },
  { pageNumber: 83, sheetCode: '80', description: 'Z3-QDTC-02 - INSTRUMENTAÇÃO DO FILTRO - U3P01', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM02', primaryTag: 'U3P01_PSL' },
  { pageNumber: 109, sheetCode: '106', description: 'ALIMENTAÇÃO DO RK-01 / SKF MOTOR PRINCIPAL DO MOINHO E REDUTOR (Z3M03M1 Z3M02)', rev: '03', category: 'POWER', panel: 'Z3-QDTC-01', primaryTag: 'Z3SKFQ1' },
  { pageNumber: 132, sheetCode: '132', description: 'Z3U08M1 - 416BE05MT10 - MOTOR PRINCIPAL DO ELEVADOR DE CANECAS (55kW)', rev: '03', category: 'CONVEYOR', panel: 'Z3-CCM01-01', primaryTag: 'Z3U08M1', kw: '55 kW' },
  { pageNumber: 133, sheetCode: '133', description: 'Z3U08M1 - 416BE05MT10 - INSTRUMENTAÇÃO ELEVADOR DE CANECAS', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM05', primaryTag: 'Z3U08_TSH' },
  { pageNumber: 134, sheetCode: '134', description: 'Z3U08M2 - 416BE05MT20 - MOTOR DO GIRO LENTO DO ELEVADOR DE CANECAS', rev: '03', category: 'CONVEYOR', panel: 'Z3-CCM01-01', primaryTag: 'Z3U08M2', kw: '4 kW' },
  { pageNumber: 135, sheetCode: '135', description: 'Z3U08M2 - 416BE05MT20 - INSTRUMENTAÇÃO DO GIRO LENTO DO ELEVADOR', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM05', primaryTag: 'Z3U08_SE2' },
  { pageNumber: 136, sheetCode: '136', description: 'Z3U10M1 - 416FA07MT10 - VENTILADOR DA REGUEIRA (7.5kW)', rev: '03', category: 'CONTROL', panel: 'Z3-CCM01-01', primaryTag: 'Z3U10M1', kw: '7.5 kW' },
  { pageNumber: 137, sheetCode: '137', description: 'Z3U12M1 - 416FA08MT10 - VENTILADOR DA REGUEIRA (7.5kW)', rev: '03', category: 'CONTROL', panel: 'Z3-CCM01-01', primaryTag: 'Z3U12M1', kw: '7.5 kW' },
  { pageNumber: 138, sheetCode: '138', description: 'Z3U09_LSH - CHAVE DE NÍVEL REGUEIRA DE SAÍDA DO ELEVADOR Z3U08', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM04', primaryTag: 'Z3U09_LSH' },
  { pageNumber: 139, sheetCode: '139', description: 'Z3-CCM01 - ALIMENTAÇÃO DE ENTRADA DO CCM', rev: '03', category: 'POWER', panel: 'Z3-CCM01', primaryTag: 'Z3-CCM01' },
  { pageNumber: 140, sheetCode: '140', description: 'Z3J21M1 - 416FA18MT10 - VENTILADOR DA REGUEIRA (4kW)', rev: '03', category: 'CONTROL', panel: 'Z3-CCM01-02', primaryTag: 'Z3J21M1', kw: '4 kW' },
  { pageNumber: 141, sheetCode: '141', description: 'Z3J20_LSH - CHAVE DE NÍVEL REGUEIRA DE SAÍDA DA VÁLVULA ROTATIVA Z3P75', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM06', primaryTag: 'Z3J20_LSH' },
  { pageNumber: 142, sheetCode: '142', description: 'Z3P63M1 - 416FA08MT10 - ROSCA TRANSPORTADORA (5.5kW)', rev: '03', category: 'CONVEYOR', panel: 'Z3-CCM01-02', primaryTag: 'Z3P63M1', kw: '5.5 kW' },
  { pageNumber: 143, sheetCode: '143', description: 'Z3P63M1 - 416DC20SC02 - INSTRUMENTAÇÃO DA ROSCA TRANSPORTADORA', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM07', primaryTag: 'Z3P63_SE' },
  { pageNumber: 144, sheetCode: '144', description: 'Z3P64M1 - 416DC20RA03 - VÁLVULA ROTATIVA (2.2kW)', rev: '03', category: 'CONTROL', panel: 'Z3-CCM01-02', primaryTag: 'Z3P64M1', kw: '2.2 kW' },
  { pageNumber: 145, sheetCode: '145', description: 'Z3P64M1 - 416DC20RA03 - INSTRUMENTAÇÃO DA VÁLVULA ROTATIVA', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM07', primaryTag: 'Z3P64_SE' },
  { pageNumber: 146, sheetCode: '146', description: 'Z3U05M1 - 416FA23MT10 - VENTILADOR DA REGUEIRA (4kW)', rev: '03', category: 'CONTROL', panel: 'Z3-CCM01-02', primaryTag: 'Z3U05M1', kw: '4 kW' },
  { pageNumber: 147, sheetCode: '147', description: 'Z3U04_LSH - CHAVE DE NÍVEL REGUEIRA DE SAÍDA DO FILTRO Z3P61', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM07', primaryTag: 'Z3U04_LSH' },
  { pageNumber: 148, sheetCode: '148', description: 'Z3J15M1 - 416BE14MT10 - MOTOR PRINCIPAL DO ELEVADOR DE CANECAS (30kW)', rev: '03', category: 'CONVEYOR', panel: 'Z3-CCM01-02', primaryTag: 'Z3J15M1', kw: '30 kW' },
  { pageNumber: 149, sheetCode: '149', description: 'Z3J15M1 - 416BE14MT10 - INSTRUMENTAÇÃO DO ELEVADOR DE CANECAS', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM04', primaryTag: 'Z3J15_TSH' },
  { pageNumber: 150, sheetCode: '150', description: 'Z3J14M1 - 416FA13MT10 - VENTILADOR DA REGUEIRA (4kW)', rev: '03', category: 'CONTROL', panel: 'Z3-CCM01-02', primaryTag: 'Z3J14M1', kw: '4 kW' },
  { pageNumber: 151, sheetCode: '151', description: 'Z3J13_LSH - CHAVE DE NÍVEL REGUEIRA DE SAÍDA DA UNIDADE HIDRÁULICA Z3J36', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM04', primaryTag: 'Z3J13_LSH' },
  { pageNumber: 152, sheetCode: '152', description: 'Z3M04M1 - 416BM01MT20 - MOTOR DO GIRO LENTO DO MOINHO DE BOLAS (45kW)', rev: '03', category: 'POWER', panel: 'Z3-CCM01-02', primaryTag: 'Z3M04M1', kw: '45 kW' },
  { pageNumber: 153, sheetCode: '153', description: 'Z3M04M1 - 416BM01MT20 - INSTRUMENTAÇÃO DO MOTOR GIRO LENTO DO MOINHO', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM05', primaryTag: 'Z3M04_ZSH' },
  { pageNumber: 154, sheetCode: '154', description: 'Z3J15M2 - 416BE14MT20 - MOTOR DO GIRO LENTO DO ELEVADOR DE CANECAS (4kW)', rev: '03', category: 'CONVEYOR', panel: 'Z3-CCM01-02', primaryTag: 'Z3J15M2', kw: '4 kW' },
  { pageNumber: 155, sheetCode: '155', description: 'Z3J15M2 - 416BE14MT10 - INSTRUMENTAÇÃO DO GIRO LENTO DO ELEVADOR', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM04', primaryTag: 'Z3J15_SE2' },
  { pageNumber: 156, sheetCode: '156', description: 'Z3M03Q2 - 416BM01EC10 - PAINEL DO SISTEMA DE LEVANTAMENTO DAS ESCOVAS DO MOTOR', rev: '03', category: 'CONTROL', panel: 'Z3-CCM01-03', primaryTag: 'Z3M03Q2', kw: '3 kW' },
  { pageNumber: 157, sheetCode: '157', description: 'Z3M03Q1 - 416BM01LS10 - PAINEL DO REOSTATO LÍQUIDO', rev: '03', category: 'CONTROL', panel: 'Z3-CCM01-03', primaryTag: 'Z3M03Q1', kw: '10 kW' },
  { pageNumber: 158, sheetCode: '158', description: 'Z3QDMT01- 05 - 416BM01CP10 - ALIMENTAÇÃO CUBÍCULO 5 DO BANCO CAPACITOR', rev: '03', category: 'POWER', panel: 'Z3-CCM01-03', primaryTag: 'Z3M03BC' },
  { pageNumber: 159, sheetCode: '159', description: 'Z3X02Q1 - 416HI26EC10 - PAINEL DA TALHA ELÉTRICA (14.1kW)', rev: '03', category: 'CONTROL', panel: 'Z3-CCM01-03', primaryTag: 'Z3X02Q1', kw: '14.1 kW' },
  { pageNumber: 160, sheetCode: '160', description: 'Z3M16M1 - BOMBA 1 DE LUBRIFICAÇÃO DO REDUTOR (15kW)', rev: '03', category: 'CONTROL', panel: 'Z3-CCM01-03', primaryTag: 'Z3M16M1', kw: '15 kW' },
  { pageNumber: 161, sheetCode: '161', description: 'Z3M15 - INSTRUMENTAÇÃO UNIDADE HIDRÁULICA REDUTOR MOINHO', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM05', primaryTag: 'Z3M15_LSL' },
  { pageNumber: 162, sheetCode: '162', description: 'Z3K01Q1 - ALIMENTAÇÃO PAINEL DE INVERSORES SISTEMA DE INJEÇÃO DE ÁGUA', rev: '03', category: 'POWER', panel: 'Z3-CCM01-03', primaryTag: 'Z3K01Q1' },
  { pageNumber: 163, sheetCode: '163', description: 'Z3K02M1 - BOMBA 01- KSB - UNIDADE DE INJEÇÃO ÁGUA MOINHO Z3K01 (3.0kW)', rev: '03', category: 'CONTROL', panel: 'PAINEL INVERSORES', primaryTag: 'Z3K02M1', kw: '3.0 kW' },
  { pageNumber: 164, sheetCode: '164', description: 'Z3K03M1 - BOMBA 02- KSB - UNIDADE DE INJEÇÃO ÁGUA MOINHO Z3K01 (3.0kW)', rev: '03', category: 'CONTROL', panel: 'PAINEL INVERSORES', primaryTag: 'Z3K03M1', kw: '3.0 kW' },
  { pageNumber: 165, sheetCode: '165', description: 'Z3K04M1 - BOMBA 03- KSB - UNIDADE DE INJEÇÃO ÁGUA MOINHO Z3K01 (3.0kW)', rev: '03', category: 'CONTROL', panel: 'PAINEL INVERSORES', primaryTag: 'Z3K04M1', kw: '3.0 kW' },
  { pageNumber: 166, sheetCode: '166', description: 'Z3K01 - INSTRUMENTAÇÃO SISTEMA DE INJEÇÃO DE ÁGUA NO MOINHO', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM05', primaryTag: 'Z3K03_PSL1' },
  { pageNumber: 167, sheetCode: '167', description: 'Z3K01 - INSTRUMENTAÇÃO SISTEMA DE INJEÇÃO DE ÁGUA NO MOINHO', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM05', primaryTag: 'Z3K02_ZSH' },
  { pageNumber: 168, sheetCode: '168', description: 'Z3X01Q1 - 416HI24EC10 - PAINEL DA TALHA ELÉTRICA', rev: '03', category: 'CONTROL', panel: 'Z3-CCM01-03', primaryTag: 'Z3X01Q1' },
  { pageNumber: 169, sheetCode: '169', description: 'Z3M17M1 - BOMBA 2 DE LUBRIFICAÇÃO DO REDUTOR (15kW)', rev: '03', category: 'CONTROL', panel: 'Z3-CCM01-03', primaryTag: 'Z3M17M1', kw: '15 kW' },
  { pageNumber: 170, sheetCode: '170', description: 'Z3J27 - 416SZ19MT10 - AMOSTRADOR (0.18kW)', rev: '03', category: 'CONTROL', panel: 'Z3-CCM01-03', primaryTag: 'Z3J27', kw: '0.18 kW' },
  { pageNumber: 171, sheetCode: '171', description: 'Z3J13-2 - 416SM11EC01 - PAINEL DO MEDIDOR DE FLUXO DE SÓLIDOS', rev: '03', category: 'CONTROL', panel: 'Z3-CCM01-03', primaryTag: 'Z3J13-2' },
  { pageNumber: 172, sheetCode: '172', description: 'Z3J13-2 - 416SM11EC10 - PAINEL DO MEDIDOR DE FLUXO DE SÓLIDOS', rev: '03', category: 'CONTROL', panel: 'Z3RM05', primaryTag: '416SM11EC10' },
  { pageNumber: 258, sheetCode: '258', description: 'Z3J10M1 - 413BC32MT10 - CORREIA TRANSPORTADORA', rev: '03', category: 'CONVEYOR', panel: 'Z3-CCM01-02', primaryTag: 'Z3J10M1', kw: '15 kW' },
  { pageNumber: 259, sheetCode: '259', description: 'Z3J10M1 - 413BC32MT10 - INSTRUMENTAÇÃO DA CORREIA TRANSPORTADORA', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM04', primaryTag: 'Z3J10_SE1' },
  { pageNumber: 260, sheetCode: '260', description: 'Z3J12M1 - 413BC35MT10 - CORREIA TRANSPORTADORA', rev: '03', category: 'CONVEYOR', panel: 'Z3-CCM01-02', primaryTag: 'Z3J12M1', kw: '15 kW' },
  { pageNumber: 261, sheetCode: '261', description: 'Z3J12M1 - 413BC35MT10 - INSTRUMENTAÇÃO DA CORREIA TRANSPORTADORA', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM04', primaryTag: 'Z3J12_SE1' },
  { pageNumber: 321, sheetCode: '312', description: 'Z3SKFQ1 - SISTEMA SKF MOTOR PRINCIPAL DO MOINHO E REDUTOR (Z3M03M1 Z3M02)', rev: '03', category: 'INSTRUMENT', panel: 'Z3SKFQ1', primaryTag: 'Z3SKFQ1' },
  { pageNumber: 333, sheetCode: '324', description: 'Z3M03_XT1 - VIBRAÇÃO DO MANCAL DO MOTOR - LNA (MOTOR Z3M03M1)', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM05', primaryTag: 'Z3M03_XT1' },
  { pageNumber: 334, sheetCode: '325', description: 'Z3M03_XT2 - VIBRAÇÃO DO MANCAL DO MOTOR - LA (MOTOR Z3M03M1)', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM05', primaryTag: 'Z3M03_XT2' },
  { pageNumber: 337, sheetCode: '328', description: 'Z3P34_AT1 - MEDIDOR DE PARTICULADOS (OPACÍMETRO DA CHAMINÉ)', rev: '03', category: 'INSTRUMENT', panel: 'Z3RM06', primaryTag: 'Z3P34_AT1' }
];

export const initialNobresDocument: IndustrialDocument = {
  id: 'doc-nb-z3001-505',
  documentNumber: 'NB.I.Z3001.505',
  title: 'DIAGRAMA DE INTERLIGAÇÃO',
  client: 'VOTORANTIM CIMENTOS',
  location: 'NOBRES - MT',
  project: 'MOAGEM Z3',
  activeRevision: '03',
  supplierDrawingNumber: 'AE-TA-0375-DI001',
  date: '02/10/26',
  designer: 'T.S.S.',
  approvedBy: 'G.F.R.',
  fileSize: '49.8 MB',
  uploadedAt: '2026-10-02T20:30:00Z',
  revisions: [
    {
      revision: '03',
      date: '02/10/26',
      description: 'REVISÃO GERAL DA MOAGEM Z3 - DISPOSITIVOS KKS & GIRO LENTO (ATIVO)',
      requestedBy: 'G.F.R (Votorantim)',
      revisedBy: 'T.S.S (ATMC Engenharia)',
      isActive: true,
      totalPages: 337,
      pdfUrl: '/NB.I.Z3001.505-03.pdf',
      changesSummary: [
        'Atualização dos quadros de Giro Lento KKS 416BM01MT10WHO1 e 416BM01MT10WHO2 na Folha 20',
        'Re-indexação e mapeamento dos cabos de potência 6,6kV Z3M03M1F1..F6',
        'Inclusão dos diagramas atualizados de interligação dos silos e despoeiramento'
      ]
    }
  ],
  pages: []
};

// Gera o catálogo completo de 337 páginas com todas as tags mapeadas conforme a revisão
export const generateNobresPages = (currentRev: string = '03'): DiagramPage[] => {
  const rowMap = new Map<number, IndexRow>();
  for (const row of OFFICIAL_INDEX_ROWS) {
    rowMap.set(row.pageNumber, row);
  }

  const pages: DiagramPage[] = [];

  for (let i = 1; i <= 337; i++) {
    const row = rowMap.get(i);
    const title = row ? row.description : `DIAGRAMA DE INTERLIGAÇÃO - FOLHA ${String(i).padStart(2, '0')}`;
    const panel = row?.panel;
    const rev = currentRev;
    const sheetCode = row?.sheetCode || String(i).padStart(2, '0');

    // Tags mapeadas especificamente para cada página
    const tags: TagItem[] = [];

    // Tag principal se existir
    if (row?.primaryTag) {
      const tagCode = row.primaryTag;
      const isMotor = tagCode.includes('M1') || tagCode.includes('M2');
      const isCable = tagCode.includes('C1') || tagCode.includes('F1');
      const isBorne = tagCode.includes('SL') || tagCode.includes(':');
      const isPanel = tagCode.includes('CCM') || tagCode.includes('QD') || tagCode.includes('RM') || tagCode.includes('SE');

      tags.push({
        id: `tag-${i}-primary`,
        code: tagCode,
        type: isPanel ? 'PANEL' : isCable ? 'CABLE' : isBorne ? 'TERMINAL_BORNE' : 'EQUIPMENT',
        description: row.description,
        spec: row.kw || (isMotor ? 'Motor de Indução Trifásico' : undefined),
        pageNumber: i,
        documentNumber: 'NB.I.Z3001.505',
        locationArea: panel || 'Área de Moagem Z3',
        panelId: panel,
        boundingBox: { x: 38, y: 35, width: 24, height: 12 },
        relations: []
      });
    }

    // Se a folha não tiver primaryTag manual, gerar tag técnica automática para a folha (ex: Z3P83, Z3F100, etc.)
    if (!row?.primaryTag) {
      const generatedCode = `Z3-FOLHA-${sheetCode}`;
      tags.push({
        id: `tag-${i}-sheet-auto`,
        code: generatedCode,
        type: 'EQUIPMENT',
        description: title,
        pageNumber: i,
        documentNumber: 'NB.I.Z3001.505',
        locationArea: panel || 'Área da Moagem Z3',
        panelId: panel,
        boundingBox: { x: 35, y: 25, width: 25, height: 12 },
        relations: []
      });
    }

    // Extrator inteligente e abrangente de Tags KKS, ISA e Equipamentos nas 337 folhas
    if (row && row.description) {
      // Captura formatos KKS/ISA como Z3J10M1, 413BC32MT10, Z3J10, Z3S01Q1, G3J02M1, Z3P63M1, Z3P83, etc.
      const extractedTags = row.description.match(/\b([A-Z0-9]{2,6}[A-Z]{1,4}\d{1,4}[A-Z0-9]*|[A-Z]{1,3}\d{1,4}[A-Z0-9]*)\b/gi);
      if (extractedTags) {
        for (const rawTag of extractedTags) {
          const cleanTag = rawTag.trim().toUpperCase();
          // Evitar falsos positivos como palavras puros ou de vocabulário padrão
          if (cleanTag.length >= 3 && !['ALIMENTAÇÃO', 'SISTEMA', 'PAINEL', 'MOTOR', 'FILTRO', 'GAVETA', 'ENTRADA', 'CUBÍCULO', 'RESERVA', 'LEGENDA', 'ÍNDICE', 'PÁGINAS', 'FOLHA', 'PROCESSO'].includes(cleanTag)) {
            if (!tags.some((t) => t.code.toUpperCase() === cleanTag)) {
              const isMotor = cleanTag.includes('M1') || cleanTag.includes('M2') || cleanTag.includes('MT');
              const isCable = cleanTag.includes('C1') || cleanTag.includes('F1');
              const isPanel = cleanTag.includes('CCM') || cleanTag.includes('QD') || cleanTag.includes('EC') || cleanTag.includes('CP');
              tags.push({
                id: `tag-${i}-auto-${cleanTag}`,
                code: cleanTag,
                type: isPanel ? 'PANEL' : isCable ? 'CABLE' : 'EQUIPMENT',
                tagFormat: cleanTag.match(/^\d/) ? 'KKS' : 'ISA',
                description: row.description,
                spec: row.kw || (isMotor ? 'Motor de Indução Trifásico' : 'Equipamento de Processo'),
                pageNumber: i,
                documentNumber: 'NB.I.Z3001.505',
                locationArea: panel || 'Área da Moagem Z3',
                panelId: panel,
                boundingBox: { x: 35, y: 25, width: 25, height: 12 },
                relations: []
              });
            }
          }
        }
      }
    }

    // Mapeamento dinâmico de Tags reais detectadas via OCR no diagrama
    const ocrPage = (ocrIndexData as any[])?.find((op: any) => op.p === i);
    if (ocrPage && Array.isArray(ocrPage.g)) {
      for (const [rawCode, x, y, w, h] of ocrPage.g) {
        const cleanTag = String(rawCode).trim().toUpperCase();
        if (cleanTag.length >= 3 && !['ALIMENTAÇÃO', 'SISTEMA', 'PAINEL', 'MOTOR', 'FILTRO', 'GAVETA', 'ENTRADA', 'CUBÍCULO', 'RESERVA', 'LEGENDA', 'ÍNDICE', 'PÁGINAS', 'FOLHA', 'PROCESSO', 'CONSULTORIA', 'ENGENHARIA', 'VOTORANTIM', 'CLIENTE', 'PROJETO', 'TITULO', 'MOAGEM', 'NOBRES'].includes(cleanTag)) {
          if (!tags.some((t) => t.code.toUpperCase() === cleanTag)) {
            const isMotor = cleanTag.includes('M1') || cleanTag.includes('M2') || cleanTag.includes('MT');
            const isCable = cleanTag.includes('C1') || cleanTag.includes('F1') || cleanTag.includes('#') || cleanTag.includes('MM');
            const isBorne = cleanTag.includes('SL') || cleanTag.includes(':') || cleanTag.startsWith('X');
            const isPanel = cleanTag.includes('CCM') || cleanTag.includes('QD') || cleanTag.includes('RM') || cleanTag.includes('SE');

            tags.push({
              id: `ocr-${i}-${cleanTag}-${Math.round(x)}-${Math.round(y)}`,
              code: cleanTag,
              type: isPanel ? 'PANEL' : isCable ? 'CABLE' : isBorne ? 'TERMINAL_BORNE' : 'EQUIPMENT',
              tagFormat: cleanTag.match(/^\d/) ? 'KKS' : isCable ? 'CABLE' : isBorne ? 'BORNE' : isPanel ? 'PANEL' : 'ISA',
              description: `Tag / Dispositivo mapeado na Folha ${sheetCode} (${ocrPage.t || title})`,
              spec: isMotor ? 'Motor de Indução Trifásico' : isCable ? 'Condutor / Cabo de Interligação' : undefined,
              pageNumber: i,
              documentNumber: 'NB.I.Z3001.505',
              locationArea: panel || 'Área da Moagem Z3',
              panelId: panel,
              boundingBox: {
                x: Math.max(0, Math.min(95, x)),
                y: Math.max(0, Math.min(95, y)),
                width: Math.max(8, Math.min(40, w || 10)),
                height: Math.max(4, Math.min(25, h || 5))
              },
              relations: []
            });
          }
        }
      }
    }

    // Regras de relacionamento para Z3M03M1 (Critério de Aceite RF-03 e RF-02)
    if (i === 6 || i === 20 || i === 21 || i === 22 || i === 23 || i === 109 || i === 321 || i === 333 || i === 334) {
      if (!tags.some((t) => t.code === 'Z3M03M1')) {
        tags.push({
          id: `tag-${i}-z3m03m1`,
          code: 'Z3M03M1',
          type: 'EQUIPMENT',
          description: 'MOTOR PRINCIPAL DO MOINHO DE BOLAS Z3 (3700CV / 6,6kV)',
          spec: '3700 CV / 6.600 V / Rotor Bobinado 1.900 V',
          pageNumber: i,
          documentNumber: 'NB.I.Z3001.505',
          locationArea: 'Área da Moagem Z3 - Moega do Moinho',
          panelId: 'Z3-QDMT01-03',
          boundingBox:
            i === 6 ? { x: 8, y: 39, width: 50, height: 5 } :
            i === 20 ? { x: 44, y: 22, width: 14, height: 18 } :
            i === 21 ? { x: 2, y: 3, width: 22, height: 8 } :
            i === 22 ? { x: 55, y: 92, width: 14, height: 6 } :
            { x: 40, y: 40, width: 15, height: 10 },
          relations: [
            { targetPageNumber: 6, relationType: 'INDEXED_IN', description: 'Índice Geral de Moagem Z3' },
            { targetPageNumber: 20, relationType: 'POWERS', description: 'Cubículo 3 Alimentação Média Tensão 6,6kV e Reostato Líquido' },
            { targetPageNumber: 21, relationType: 'CONTROLS', description: 'Cubículo 3 Botoeira Local e Remota Z3RM01' },
            { targetPageNumber: 22, relationType: 'MEASURES', description: 'Instrumentação de Temperatura 1R a 8R (Pt-100) Remota Z3RM05' },
            { targetPageNumber: 23, relationType: 'CONTROLS', description: 'Z3M03Q2 - Painel Sistema Escova de Elevação do Motor' },
            { targetPageNumber: 109, relationType: 'MEASURES', description: 'Sistema SKF Monitoramento Motor Principal e Redutor' },
            { targetPageNumber: 333, relationType: 'MEASURES', description: 'Z3M03_XT1 - Vibração do Mancal do Motor LNA' },
            { targetPageNumber: 334, relationType: 'MEASURES', description: 'Z3M03_XT2 - Vibração do Mancal do Motor LA' }
          ]
        });
      }
    }

    // Cabos e bornes adicionais por folha
    if (i === 3) {
      tags.push({
        id: 'tag-3-borne',
        code: 'RM1-SL8:A2',
        type: 'TERMINAL_BORNE',
        description: 'Borne de Interligação Analógica Remota 1 Slot 8 Pino A2',
        pageNumber: 3,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 23, y: 55, width: 12, height: 8 },
        relations: [{ targetPageNumber: 3, relationType: 'INTERCONNECTS', description: 'Entrada analógica de nível A1A01LT' }]
      });
      tags.push({
        id: 'tag-3-remota',
        code: 'A1RM1',
        type: 'PANEL',
        description: 'Painel de Remota de Automação SU1',
        pageNumber: 3,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 70, y: 55, width: 22, height: 14 },
        relations: [{ targetPageNumber: 68, relationType: 'POWERS', description: 'Alimentado pelo QDTC-01' }]
      });
    }

    if (i === 4) {
      tags.push({
        id: 'tag-4-cabo',
        code: 'A1J01M2C01',
        type: 'CABLE',
        description: 'Cabo de Comando Botoeira Campo 1X7C#1,0mm²',
        pageNumber: 4,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 64, y: 64, width: 14, height: 5 },
        relations: [{ targetPageNumber: 4, relationType: 'CONTROLS', description: 'Comando local do motor A1J02M1' }]
      });
    }

    if (i === 20 && rev === '03') {
      tags.push({
        id: 'tag-20-kks-who1',
        code: '416BM01MT10WHO1',
        type: 'EQUIPMENT',
        tagFormat: 'KKS',
        description: 'Tag KKS (Exclusiva Rev 03) - Dispositivo Entrada Giro Lento Motor Moinho (Z3M03M1)',
        spec: 'Entrada 6,6kV / Quadro 416BM01MT10',
        pageNumber: 20,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 26, y: 10, width: 28, height: 6 },
        relations: [{ targetPageNumber: 20, relationType: 'INTERCONNECTS', description: 'Conexão Entrada Estator U, V, W' }]
      });
      tags.push({
        id: 'tag-20-kks-who2',
        code: '416BM01MT10WHO2',
        type: 'EQUIPMENT',
        tagFormat: 'KKS',
        description: 'Tag KKS (Exclusiva Rev 03) - Dispositivo Giro Lento / Resistor do Motor Z3M03M1',
        spec: 'Quadro 416BM01MT10 / Acessório Moinho',
        pageNumber: 20,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 55, y: 10, width: 28, height: 6 },
        relations: [{ targetPageNumber: 20, relationType: 'INTERCONNECTS', description: 'Giro Lento e Chaveamento Motor Moinho' }]
      });
      tags.push({
        id: 'tag-20-kks-mt10',
        code: '416BM01MT10',
        type: 'EQUIPMENT',
        tagFormat: 'KKS',
        description: 'Tag KKS (Exclusiva Rev 03) - Motor Principal Moinho de Bolas 3700CV (Z3M03M1)',
        spec: '3700 CV / 6.6kV / 1900V Rotor',
        pageNumber: 20,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 44, y: 22, width: 20, height: 18 },
        relations: [{ targetPageNumber: 20, relationType: 'POWERS', description: 'Motor Moinho Moagem Z3' }]
      });
    }

    if (i === 20) {
      tags.push({
        id: 'tag-20-cabo-f1',
        code: 'Z3M03M1F1',
        type: 'CABLE',
        tagFormat: 'CABLE',
        description: 'Cabo Alimentação Estator U - 2x(1C#150mm²)',
        spec: '2x(1C#150mm²) 6,6kV',
        pageNumber: 20,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 30, y: 14, width: 11, height: 4 },
        relations: [{ targetPageNumber: 20, relationType: 'POWERS', description: 'Cubículo 03 -> Borne Estator U' }]
      });
      tags.push({
        id: 'tag-20-cabo-f2',
        code: 'Z3M03M1F2',
        type: 'CABLE',
        tagFormat: 'CABLE',
        description: 'Cabo Alimentação Estator V - 2x(1C#150mm²)',
        spec: '2x(1C#150mm²) 6,6kV',
        pageNumber: 20,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 30, y: 20, width: 11, height: 4 },
        relations: [{ targetPageNumber: 20, relationType: 'POWERS', description: 'Cubículo 03 -> Borne Estator V' }]
      });
      tags.push({
        id: 'tag-20-cabo-f3',
        code: 'Z3M03M1F3',
        type: 'CABLE',
        tagFormat: 'CABLE',
        description: 'Cabo Alimentação Estator W - 2x(1C#150mm²)',
        spec: '2x(1C#150mm²) 6,6kV',
        pageNumber: 20,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 30, y: 26, width: 11, height: 4 },
        relations: [{ targetPageNumber: 20, relationType: 'POWERS', description: 'Cubículo 03 -> Borne Estator W' }]
      });
      tags.push({
        id: 'tag-20-cabo-f4',
        code: 'Z3M03M1F4',
        type: 'CABLE',
        tagFormat: 'CABLE',
        description: 'Cabo Alimentação Fase R - 3x(1C#150mm²)',
        spec: '3x(1C#150mm²) 6,6kV',
        pageNumber: 20,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 56, y: 14, width: 20, height: 4 },
        relations: [{ targetPageNumber: 20, relationType: 'POWERS', description: 'Alimentação Fase R Motor Z3M03M1' }]
      });
      tags.push({
        id: 'tag-20-cabo-f5',
        code: 'Z3M03M1F5',
        type: 'CABLE',
        tagFormat: 'CABLE',
        description: 'Cabo Alimentação Fase S - 3x(1C#150mm²)',
        spec: '3x(1C#150mm²) 6,6kV',
        pageNumber: 20,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 56, y: 20, width: 20, height: 4 },
        relations: [{ targetPageNumber: 20, relationType: 'POWERS', description: 'Alimentação Fase S Motor Z3M03M1' }]
      });
      tags.push({
        id: 'tag-20-cabo-f6',
        code: 'Z3M03M1F6',
        type: 'CABLE',
        tagFormat: 'CABLE',
        description: 'Cabo Alimentação Fase T - 3x(1C#150mm²)',
        spec: '3x(1C#150mm²) 6,6kV',
        pageNumber: 20,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 56, y: 26, width: 20, height: 4 },
        relations: [{ targetPageNumber: 20, relationType: 'POWERS', description: 'Alimentação Fase T Motor Z3M03M1' }]
      });
      tags.push({
        id: 'tag-20-cabo-t1',
        code: 'Z3M03M1T1',
        type: 'CABLE',
        tagFormat: 'CABLE',
        description: 'Cabo Aterramento do Estator 1x(1C#150mm²)',
        spec: '1x(1C#150mm²)',
        pageNumber: 20,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 44, y: 35, width: 14, height: 4 },
        relations: [{ targetPageNumber: 20, relationType: 'PROTECTS', description: 'Aterramento da Carcaça do Estator' }]
      });
      tags.push({
        id: 'tag-20-cabo-c1',
        code: 'Z3M03M1C1',
        type: 'CABLE',
        tagFormat: 'CABLE',
        description: 'Cabo de Sinal e Interlock Reostato Líquido 1X7C#1,0mm²',
        spec: '1X7C#1,0mm²',
        pageNumber: 20,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 44, y: 55, width: 14, height: 4 },
        relations: [{ targetPageNumber: 20, relationType: 'CONTROLS', description: 'Sinal de Posição Reostato Líquido' }]
      });
      tags.push({
        id: 'tag-20-cabo-c2',
        code: 'Z3M03M1C2',
        type: 'CABLE',
        tagFormat: 'CABLE',
        description: 'Cabo de Parada de Emergência 1X3C#1,0mm²',
        spec: '1X3C#1,0mm²',
        pageNumber: 20,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 44, y: 88, width: 14, height: 4 },
        relations: [{ targetPageNumber: 20, relationType: 'PROTECTS', description: 'Circuito Trip de Arco / Emergência' }]
      });
      tags.push({
        id: 'tag-20-reostato',
        code: 'Z3M3Q1',
        type: 'PANEL',
        tagFormat: 'ISA',
        description: 'Painel do Reostato Líquido do Moinho',
        pageNumber: 20,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 75, y: 18, width: 20, height: 18 },
        relations: [{ targetPageNumber: 20, relationType: 'INTERCONNECTS', description: 'Ligado ao rotor 1900V' }]
      });
    }

    if (i === 22) {
      tags.push({
        id: 'tag-22-cabo-tt8c1',
        code: 'Z3M03M1T1@TT8C1',
        type: 'CABLE',
        description: 'Cabo de Instrumentação 8 Pares Trançados Blindados',
        spec: '1X8T#1,0mm² Blindado',
        pageNumber: 22,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 62, y: 52, width: 14, height: 5 },
        relations: [{ targetPageNumber: 22, relationType: 'INTERCONNECTS', description: 'Interliga régua X2 à Remota Z3RM05' }]
      });
      // Sensores Pt-100 1R a 8R mapeados individualmente para a Folha 22
      ['1R', '2R', '3R', '4R', '5R', '6R', '7R', '8R'].forEach((ptTag, idx) => {
        if (!tags.some(t => t.code === ptTag)) {
          tags.push({
            id: `tag-22-pt100-${ptTag}`,
            code: ptTag,
            type: 'TERMINAL_BORNE',
            description: `Termoresistência Pt-100 Mancal/Estator - Canal ${ptTag}`,
            pageNumber: 22,
            documentNumber: 'NB.I.Z3001.505',
            boundingBox: { x: 25 + idx * 8, y: 16, width: 6, height: 18 },
            relations: [{ targetPageNumber: 22, relationType: 'MEASURES', description: `Canal RM5-SL11:A${idx}+` }]
          });
        }
      });
      // Réguas de bornes X2-1R1 a X2-24-BR2 da Folha 22
      tags.push({
        id: 'tag-22-regua-x2',
        code: 'X2-1..24',
        type: 'TERMINAL_BORNE',
        description: 'Régua de Bornes de Campo X2-1 a X2-24 do Motor Z3M03M1',
        pageNumber: 22,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 22, y: 35, width: 68, height: 10 },
        relations: [{ targetPageNumber: 22, relationType: 'INTERCONNECTS', description: 'Bornes de Interligação dos Pt-100 com o Painel Remota 05' }]
      });
      tags.push({
        id: 'tag-22-remota05',
        code: 'Z3RM05',
        type: 'PANEL',
        description: 'Painel Remota 05 - Módulo RM5-SL11 (Entradas RTD Pt-100)',
        pageNumber: 22,
        documentNumber: 'NB.I.Z3001.505',
        boundingBox: { x: 20, y: 72, width: 72, height: 20 },
        relations: [{ targetPageNumber: 22, relationType: 'MEASURES', description: 'Módulo analógico RTD RM5-SL11: A0+ a B31' }]
      });
    }

    if (i === 29 || i === 30) {
      if (!tags.some((t) => t.code === 'Z3P62Q1')) {
        tags.push({
          id: `tag-${i}-z3p62q1`,
          code: 'Z3P62Q1',
          type: 'EQUIPMENT',
          description: 'Soft-Starter 416FA21EC10 - Ventilador do Moinho (90kW)',
          spec: '90 kW / 440Vca',
          pageNumber: i,
          documentNumber: 'NB.I.Z3001.505',
          boundingBox: { x: 7, y: 80, width: 14, height: 8 },
          relations: [{ targetPageNumber: 30, relationType: 'POWERS', description: 'Painel do Soft-Starter' }]
        });
      }
    }

    if (i === 32 || i === 33) {
      if (!tags.some((t) => t.code === 'Z3S01Q1')) {
        tags.push({
          id: `tag-${i}-z3s01q1`,
          code: 'Z3S01Q1',
          type: 'EQUIPMENT',
          description: 'Inversor de Frequência do Separador Dinâmico (135kW)',
          spec: '135 kW / 440Vca',
          pageNumber: i,
          documentNumber: 'NB.I.Z3001.505',
          boundingBox: { x: 7, y: 80, width: 14, height: 8 },
          relations: [{ targetPageNumber: 33, relationType: 'POWERS', description: 'Painel do Inversor' }]
        });
      }
    }

    if (i === 337) {
      if (!tags.some((t) => t.code === 'Z3P34_AT1')) {
        tags.push({
          id: 'tag-337-at1',
          code: 'Z3P34_AT1',
          type: 'EQUIPMENT',
          description: 'Medidor de Particulados / Opacímetro da Chaminé de Emissão',
          spec: 'Analisador Óptico Contínuo 4~20mA DC',
          pageNumber: 337,
          documentNumber: 'NB.I.Z3001.505',
          boundingBox: { x: 45, y: 26, width: 14, height: 16 },
          relations: [{ targetPageNumber: 72, relationType: 'POWERS', description: 'Alimentado pelo Z3-QDTC-01 QF22' }]
        });
      }
    }

    pages.push({
      id: `page-${String(i).padStart(2, '0')}`,
      pageNumber: i,
      sheetCode,
      title,
      subgroup: 'MOAGEM Z3',
      revision: rev,
      date: '07/04/26',
      client: 'VOTORANTIM CIMENTOS',
      location: 'NOBRES - MT',
      drawingNumber: 'NB.I.Z3001.505',
      supplierDrawing: 'AE-TA-0375-DI001',
      panel,
      cubicleGaveta: row?.kw ? `POTÊNCIA: ${row.kw}` : undefined,
      diagramType: i <= 5 ? (i === 1 ? 'COVER' : i === 2 ? 'SYMBOLS' : 'INSTRUMENTATION') :
                   i <= 17 ? 'INDEX' :
                   row?.category === 'POWER' ? 'SCHEMATIC_POWER' :
                   row?.category === 'INSTRUMENT' || row?.category === 'SILO' ? 'INSTRUMENTATION' : 'CONTROL_IO',
      svgBlueprintKey: i <= 5 ? (i === 1 ? 'cover' : i === 2 ? 'symbols' : 'legenda') :
                       i <= 17 ? 'index_table' :
                       i === 20 ? 'mill_motor_power' :
                       i === 21 ? 'mill_motor_ctrl' :
                       i === 22 ? 'mill_motor_instrumentation' :
                       i === 337 ? 'opacimeter' : 'schematic_authentic',
      notes: [
        `Projeto Moagem Z3 - Nobres MT · Desenho AE-TA-0375-DI001 Folha ${sheetCode}.`,
        'Interligação elétrica e de automação conforme especificações técnicas Votorantim Cimentos.'
      ],
      tags
    });
  }

  return pages;
};

export const initialCableSchedule: CableScheduleItem[] = [
  {
    id: 'cab-01',
    cableTag: 'Z3M03M1F1',
    cableSpec: '2x(1C#150mm²) 6,6kV',
    originTag: 'Cubículo 03 - Z3-QDMT01-03',
    originTerminal: 'Barramento U',
    destinationTag: 'Motor do Moinho Z3M03M1',
    destinationTerminal: 'Caixa de Ligações Estator - Borne U',
    functionDescription: 'Alimentação de Força Média Tensão 6,6kV (Fase U)',
    pageReference: 20,
    status: 'COMMISSIONED'
  },
  {
    id: 'cab-02',
    cableTag: 'Z3M03M1F4',
    cableSpec: '3x(1C#150mm²) 1900V',
    originTag: 'Motor do Moinho Z3M03M1',
    originTerminal: 'Caixa de Ligações Rotor - Borne K',
    destinationTag: 'Reostato Líquido Z3M3Q1',
    destinationTerminal: 'Eletrodo Móvel R1',
    functionDescription: 'Interligação Rotórica para Partida Reostática',
    pageReference: 20,
    status: 'COMMISSIONED'
  },
  {
    id: 'cab-03',
    cableTag: 'Z3M03M1C3',
    cableSpec: '1X7C#1,0mm²',
    originTag: 'Cubículo 03 - Z3-QDMT01-03',
    originTerminal: 'Régua X1: 1 a 7',
    destinationTag: 'Botoeira Local Z3M03M1_BL',
    destinationTerminal: 'Bornes BL/BE/RST',
    functionDescription: 'Comando Local Liga/Desliga/Emergência em Campo',
    pageReference: 21,
    status: 'COMMISSIONED'
  },
  {
    id: 'cab-04',
    cableTag: 'Z3M03M1C5',
    cableSpec: '1X12C#1,0mm²',
    originTag: 'Cubículo 03 - Z3-QDMT01-03',
    originTerminal: 'Régua Bornes 110..168',
    destinationTag: 'Painel Remota 01 (Z3RM01)',
    destinationTerminal: 'Módulos Slot 2 & Slot 3',
    functionDescription: 'Sinais de Falha, Trip, Status do Disjuntor 6,6kV para CLP',
    pageReference: 21,
    status: 'COMMISSIONED'
  },
  {
    id: 'cab-05',
    cableTag: 'Z3M03M1T1@TT8C1',
    cableSpec: '1X8T#1,0mm² Blindado',
    originTag: 'Motor do Moinho Z3M03M1',
    originTerminal: 'Caixa de Bornes X2: 1 a 24',
    destinationTag: 'Painel Remota 05 (Z3RM05)',
    destinationTerminal: 'Módulo RM5-SL11 (Canais A0..B31)',
    functionDescription: 'Sinal RTD Pt-100 Temperatura Estator e Mancais (1R a 8R)',
    pageReference: 22,
    status: 'COMMISSIONED'
  },
  {
    id: 'cab-06',
    cableTag: 'Z3P62Q1F1',
    cableSpec: '2x(3Cx15mm²+1x1C#70mm²)',
    originTag: 'Quadro Z3-QDBT01 (Gaveta 2B)',
    originTerminal: 'Régua X1: 1..4',
    destinationTag: 'Painel Soft-Starter 416FA21EC10',
    destinationTerminal: 'Disjuntor de Entrada Q1',
    functionDescription: 'Alimentação 440Vca Soft-Starter Ventilador (90kW)',
    pageReference: 29,
    status: 'COMMISSIONED'
  },
  {
    id: 'cab-07',
    cableTag: 'Z3S01Q1F1',
    cableSpec: '1X3C#185mm²+1Cx95mm²',
    originTag: 'Quadro Z3-QDBT01 (Gaveta 2D)',
    originTerminal: 'Contator KM1: 2,4,6',
    destinationTag: 'Inversor Separador Z3S01Q1',
    destinationTerminal: 'Terminais de Entrada L1, L2, L3',
    functionDescription: 'Alimentação 440Vca Inversor Separador Dinâmico (135kW)',
    pageReference: 32,
    status: 'COMMISSIONED'
  },
  {
    id: 'cab-08',
    cableTag: 'Z3P34AT1I1',
    cableSpec: '1x2P#1,0mm² Blindado',
    originTag: 'Opacímetro Chaminé Z3P34_AT1',
    originTerminal: 'Borne + / - (4~20mA)',
    destinationTag: 'Painel Remota 06 (Z3RM06)',
    destinationTerminal: 'Módulo RM6-SL4:05',
    functionDescription: 'Sinal Analógico Contínuo de Emissão de Particulados',
    pageReference: 337,
    status: 'INSTALLED'
  }
];

export const initialFieldChecklist: FieldChecklistItem[] = [
  {
    id: 'chk-01',
    tagCode: 'Z3M03M1',
    pageNumber: 20,
    description: 'Verificar torque e aperto das conexões dos cabos de média tensão 6,6kV (Z3M03M1F1..F3)',
    category: 'APERTO_BORNE',
    completed: true,
    technician: 'Carlos M. (Eletricista)',
    timestamp: '2026-09-28 09:30'
  },
  {
    id: 'chk-02',
    tagCode: 'Z3M03M1',
    pageNumber: 22,
    description: 'Medir resistência ôhmica dos sensores Pt-100 1R a 8R na régua X2 (esperado ~109 ohms a 25°C)',
    category: 'ISOLAMENTO',
    completed: true,
    technician: 'Carlos M. (Eletricista)',
    timestamp: '2026-09-28 11:15'
  },
  {
    id: 'chk-03',
    tagCode: 'Z3M03_XT1',
    pageNumber: 333,
    description: 'Conferir loop analógico 4~20mA do sensor de vibração mancal LNA até a Remota Z3RM05',
    category: 'CONTINUIDADE',
    completed: false,
    notes: 'Pendente liberação de acesso mecânico'
  },
  {
    id: 'chk-04',
    tagCode: 'RM1-SL8:A2',
    pageNumber: 3,
    description: 'Inspeção do fusível seccionável 0.250A da régua LT no painel de remota A1RM1',
    category: 'IDENTIFICACAO',
    completed: true,
    technician: 'Rodrigo S. (Automação)',
    timestamp: '2026-09-29 08:20'
  },
  {
    id: 'chk-05',
    tagCode: 'Z3P71',
    pageNumber: 53,
    description: 'Checagem das 52 válvulas de pulso do programador do filtro de mangas e sequenciamento',
    category: 'CONTINUIDADE',
    completed: false,
    notes: 'Programado para o turno noturno'
  }
];
