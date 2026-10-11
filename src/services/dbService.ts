/**
 * @license
 * Apache-2.0
 * DiagramaHub IndexedDB Manager
 * Serviço de banco de dados no cliente utilizando IndexedDB para alta performance de busca e armazenamento persistente.
 */

import { DiagramPage, TagItem, CableScheduleItem, FieldChecklistItem } from '../types/diagram';
import { generateNobresPages, initialCableSchedule, initialFieldChecklist } from '../data/nobresProjectData';

const DB_NAME = 'DiagramaHubDB';
const DB_VERSION = 1;

export const STORES = {
  PAGES: 'pages',
  TAGS: 'tags',
  CABLES: 'cables',
  CHECKLIST: 'checklist',
  REMOTAS: 'remotas',
} as const;

export class IndexedDBService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  /**
   * Inicializa e abre a conexão com o banco IndexedDB
   */
  public async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store 1: Páginas do PDF
        if (!db.objectStoreNames.contains(STORES.PAGES)) {
          const pageStore = db.createObjectStore(STORES.PAGES, { keyPath: 'pageNumber' });
          pageStore.createIndex('panel', 'panel', { unique: false });
          pageStore.createIndex('sheetCode', 'sheetCode', { unique: false });
        }

        // Store 2: Tags e Dispositivos de Campo
        if (!db.objectStoreNames.contains(STORES.TAGS)) {
          const tagStore = db.createObjectStore(STORES.TAGS, { keyPath: 'id' });
          tagStore.createIndex('code', 'code', { unique: false });
          tagStore.createIndex('pageNumber', 'pageNumber', { unique: false });
          tagStore.createIndex('panelId', 'panelId', { unique: false });
          tagStore.createIndex('type', 'type', { unique: false });
        }

        // Store 3: Tabela De-Para de Cabos (Cable Schedule)
        if (!db.objectStoreNames.contains(STORES.CABLES)) {
          const cableStore = db.createObjectStore(STORES.CABLES, { keyPath: 'id' });
          cableStore.createIndex('cableTag', 'cableTag', { unique: false });
          cableStore.createIndex('originTag', 'originTag', { unique: false });
          cableStore.createIndex('destinationTag', 'destinationTag', { unique: false });
          cableStore.createIndex('pageReference', 'pageReference', { unique: false });
        }

        // Store 4: Check-list de Campo
        if (!db.objectStoreNames.contains(STORES.CHECKLIST)) {
          const chkStore = db.createObjectStore(STORES.CHECKLIST, { keyPath: 'id' });
          chkStore.createIndex('tagCode', 'tagCode', { unique: false });
          chkStore.createIndex('completed', 'completed', { unique: false });
        }
      };

      request.onsuccess = async (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        // Povoamento inicial automático se o banco estiver vazio
        await this.seedInitialDataIfEmpty();
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('Erro ao abrir IndexedDB DiagramaHubDB:', request.error);
        reject(request.error);
      };
    });

    return this.initPromise;
  }

  /**
   * Povoa o banco IndexedDB na primeira execução com dados do projeto Nobres Z3
   */
  private async seedInitialDataIfEmpty(): Promise<void> {
    if (!this.db) return;

    const pageCount = await this.countItems(STORES.PAGES);
    if (pageCount > 0) return; // Já povoado

    console.log('⚡ Populando IndexedDB DiagramaHubDB com os dados completos do Projeto Nobres Z3...');

    const pages = generateNobresPages();
    const allTags: TagItem[] = [];

    pages.forEach((p) => {
      p.tags.forEach((t) => allTags.push(t));
    });

    // Inserção em lote (Transaction)
    const tx = this.db.transaction([STORES.PAGES, STORES.TAGS, STORES.CABLES, STORES.CHECKLIST], 'readwrite');

    const pageStore = tx.objectStore(STORES.PAGES);
    pages.forEach((page) => pageStore.put(page));

    const tagStore = tx.objectStore(STORES.TAGS);
    allTags.forEach((tag) => tagStore.put(tag));

    const cableStore = tx.objectStore(STORES.CABLES);
    initialCableSchedule.forEach((cab) => cableStore.put(cab));

    const chkStore = tx.objectStore(STORES.CHECKLIST);
    initialFieldChecklist.forEach((chk) => chkStore.put(chk));

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        console.log(`✅ IndexedDB populado com sucesso: ${pages.length} páginas, ${allTags.length} tags, ${initialCableSchedule.length} cabos.`);
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Conta a quantidade de itens em uma Store
   */
  private countItems(storeName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve(0);
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Busca todas as páginas do projeto
   */
  public async getAllPages(): Promise<DiagramPage[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PAGES, 'readonly');
      const store = tx.objectStore(STORES.PAGES);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Busca todas as tags vinculadas a um painel/remota (ex: Z3RM05)
   */
  public async getTagsByPanel(panelId: string): Promise<TagItem[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.TAGS, 'readonly');
      const store = tx.objectStore(STORES.TAGS);
      const index = store.index('panelId');
      const req = index.getAll(panelId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Busca dinâmica de tags por texto (código, descrição ou painel)
   */
  public async searchTags(query: string): Promise<TagItem[]> {
    const db = await this.initDB();
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.TAGS, 'readonly');
      const store = tx.objectStore(STORES.TAGS);
      const req = store.openCursor();
      const results: TagItem[] = [];

      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const tag = cursor.value as TagItem;
          if (
            tag.code.toLowerCase().includes(q) ||
            tag.description.toLowerCase().includes(q) ||
            (tag.panelId && tag.panelId.toLowerCase().includes(q))
          ) {
            results.push(tag);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Retorna os dados da Tabela De-Para de Cabos
   */
  public async getAllCables(): Promise<CableScheduleItem[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CABLES, 'readonly');
      const store = tx.objectStore(STORES.CABLES);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Atualiza ou adiciona um item no Check-list de Campo
   */
  public async saveChecklistItem(item: FieldChecklistItem): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CHECKLIST, 'readwrite');
      const store = tx.objectStore(STORES.CHECKLIST);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

export const dbService = new IndexedDBService();
