import { openDB, IDBPDatabase } from 'idb';
import { RawModelData, UserSavedSelection } from '../types/model';

const DB_NAME = 'binaire_freznel_db';
const DB_VERSION = 1;
const STORE_MODELS = 'models_cache';
const STORE_STAGING = 'models_staging';
const STORE_SELECTIONS = 'user_selections';

/**
 * OfflineStorageManager Class
 * Manages client-side IndexedDB persistence, atomic transactions,
 * and user selection CRUD operations.
 */
export class OfflineStorageManager {
  private static instance: OfflineStorageManager;
  private dbPromise: Promise<IDBPDatabase> | null = null;

  private constructor() {
    this.initDb();
  }

  public static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager();
    }
    return OfflineStorageManager.instance;
  }

  private initDb(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_MODELS)) {
            db.createObjectStore(STORE_MODELS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_STAGING)) {
            db.createObjectStore(STORE_STAGING, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_SELECTIONS)) {
            db.createObjectStore(STORE_SELECTIONS, { keyPath: 'id' });
          }
        },
      });
    }
    return this.dbPromise;
  }

  /**
   * Reads cached models from IndexedDB.
   */
  public async getCachedModels(): Promise<RawModelData[]> {
    const db = await this.initDb();
    return (await db.getAll(STORE_MODELS)) as RawModelData[];
  }

  /**
   * Saves models list to IndexedDB live cache.
   */
  public async cacheModels(models: RawModelData[]): Promise<void> {
    const db = await this.initDb();
    const tx = db.transaction(STORE_MODELS, 'readwrite');
    await tx.objectStore(STORE_MODELS).clear();
    for (const model of models) {
      await tx.objectStore(STORE_MODELS).put(model);
    }
    await tx.done;
  }

  /**
   * Requirement 9.2: Atomic Commit to Prevent Data Corruption.
   * Stages data into STORE_STAGING first, verifies integrity,
   * then atomically promotes to STORE_MODELS.
   */
  public async stageAndCommitModels(models: RawModelData[]): Promise<void> {
    const db = await this.initDb();

    // 1. Write to staging store
    const stageTx = db.transaction(STORE_STAGING, 'readwrite');
    await stageTx.objectStore(STORE_STAGING).clear();
    for (const model of models) {
      await stageTx.objectStore(STORE_STAGING).put(model);
    }
    await stageTx.done;

    // 2. Validate staging store contents
    const stagedItems = await db.getAll(STORE_STAGING);
    if (!stagedItems || stagedItems.length !== models.length) {
      throw new Error('Integrity validation failed: staged models count mismatch.');
    }

    // 3. Atomically overwrite live cache
    const liveTx = db.transaction(STORE_MODELS, 'readwrite');
    await liveTx.objectStore(STORE_MODELS).clear();
    for (const item of stagedItems) {
      await liveTx.objectStore(STORE_MODELS).put(item);
    }
    await liveTx.done;
  }

  // ==========================================
  // USER SELECTIONS / BOOKMARKS CRUD OPERATIONS
  // ==========================================

  /**
   * CREATE: Saves a user selection / bookmark.
   */
  public async createSelection(selection: UserSavedSelection): Promise<void> {
    const db = await this.initDb();
    await db.put(STORE_SELECTIONS, selection);
  }

  /**
   * READ: Returns all saved user selections.
   */
  public async getSelections(): Promise<UserSavedSelection[]> {
    const db = await this.initDb();
    return (await db.getAll(STORE_SELECTIONS)) as UserSavedSelection[];
  }

  /**
   * UPDATE: Updates notes or priority for an existing selection.
   */
  public async updateSelection(selection: UserSavedSelection): Promise<void> {
    const db = await this.initDb();
    await db.put(STORE_SELECTIONS, selection);
  }

  /**
   * DELETE: Removes a user selection by id.
   */
  public async deleteSelection(id: string): Promise<void> {
    const db = await this.initDb();
    await db.delete(STORE_SELECTIONS, id);
  }
}
