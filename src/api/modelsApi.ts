import { Model } from '../models/Model';
import { FilterCriteria, RawModelData, SortOption, UserSavedSelection } from '../types/model';
import { SearchEngine } from '../search/SearchEngine';
import { FilterManager, AvailableFilterOptions } from '../filters/FilterManager';
import { SortManager } from '../sorting/SortManager';
import { OfflineStorageManager } from '../offline/offlineStorage';
import { NetworkStatusManager } from '../offline/networkStatus';
import { BackgroundDataFetcher, DownloadProgress } from './streamIntegrity';

/**
 * ModelService Class (Facade Pattern & Service Layer)
 * Coordinates remote API fetching, offline caching, search, filter, and sort.
 */
export class ModelService {
  private static instance: ModelService;
  private searchEngine: SearchEngine;
  private filterManager: FilterManager;
  private sortManager: SortManager;
  private storageManager: OfflineStorageManager;
  private networkManager: NetworkStatusManager;

  private inMemoryModels: Model[] = [];
  private isLoaded: boolean = false;

  private constructor() {
    this.searchEngine = new SearchEngine();
    this.filterManager = new FilterManager();
    this.sortManager = new SortManager();
    this.storageManager = OfflineStorageManager.getInstance();
    this.networkManager = NetworkStatusManager.getInstance();
  }

  public static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  /**
   * Initializes and loads model data.
   * If online: fetches from /models.json, saves to cache, and stages.
   * If offline: retrieves from IndexedDB cache.
   */
  public async loadModels(
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<Model[]> {
    const isOnline = this.networkManager.isOnline();

    if (isOnline) {
      try {
        const rawData = await this.fetchWithIntegrity('/models.json', onProgress);
        const modelsList = rawData.models || [];
        // Atomic cache to IndexedDB
        await this.storageManager.stageAndCommitModels(modelsList);
        this.inMemoryModels = modelsList.map((item) => new Model(item));
        this.isLoaded = true;
        return this.inMemoryModels;
      } catch (networkErr) {
        console.warn('Network request failed, falling back to local IndexedDB cache:', networkErr);
      }
    }

    // Offline fallback path
    const cached = await this.storageManager.getCachedModels();
    if (cached && cached.length > 0) {
      this.inMemoryModels = cached.map((item) => new Model(item));
      this.isLoaded = true;
      return this.inMemoryModels;
    }

    // Fallback: if IndexedDB is empty (first load offline), fetch local bundle
    try {
      const resp = await fetch('/models.json');
      const data = await resp.json();
      const list = data.models || [];
      await this.storageManager.cacheModels(list);
      this.inMemoryModels = list.map((item: RawModelData) => new Model(item));
      this.isLoaded = true;
      return this.inMemoryModels;
    } catch {
      return [];
    }
  }

  /**
   * Fetches models using streaming integrity and SHA-256 verification (Section 9.2).
   */
  private fetchWithIntegrity(
    url: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<{ models: RawModelData[] }> {
    return new Promise((resolve, reject) => {
      BackgroundDataFetcher.fetchWithIntegrityVerification<{ models: RawModelData[] }>(
        url,
        (progress) => {
          if (onProgress) onProgress(progress);
        },
        (data) => {
          resolve(data);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  /**
   * Pipeline query execution: Search -> Filter -> Sort
   */
  public queryModels(criteria: FilterCriteria, sortOption: SortOption): Model[] {
    // 1. Search (Substring from start or middle)
    const searched = this.searchEngine.executeSearch(
      this.inMemoryModels,
      criteria.searchQuery,
      criteria.searchField
    );

    // 2. Filter (Pipeline tags, Family tags, Architecture tags, Weight tags, Safetensor min-max)
    const filtered = this.filterManager.applyFilters(searched, criteria);

    // 3. Sort (Safetensor file count, Alphabetical A-Z / Z-A)
    return this.sortManager.sort(filtered, sortOption);
  }

  /**
   * Extracts available filter tags and range limits from the active dataset.
   */
  public getAvailableFilterOptions(): AvailableFilterOptions {
    return this.filterManager.extractAvailableOptions(this.inMemoryModels);
  }

  /**
   * Returns a single model by its ID.
   */
  public getModelById(id: string): Model | undefined {
    return this.inMemoryModels.find((m) => m.id === id);
  }

  // ==========================================
  // CRUD OPERATIONS FOR USER SELECTIONS / BOOKMARKS
  // ==========================================

  public async saveSelection(model: Model, notes: string = '', priority: 'High' | 'Medium' | 'Low' = 'Medium'): Promise<UserSavedSelection> {
    const selection: UserSavedSelection = {
      id: `${model.id}_${Date.now()}`,
      modelId: model.id,
      modelName: model.displayName,
      savedAt: new Date().toISOString(),
      notes,
      priority,
    };
    await this.storageManager.createSelection(selection);
    return selection;
  }

  public async getSavedSelections(): Promise<UserSavedSelection[]> {
    return await this.storageManager.getSelections();
  }

  public async updateSelection(selection: UserSavedSelection): Promise<void> {
    await this.storageManager.updateSelection(selection);
  }

  public async removeSelection(id: string): Promise<void> {
    await this.storageManager.deleteSelection(id);
  }
}
