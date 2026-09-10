import { Model } from '../models/Model';
import { SortOption } from '../types/model';

/**
 * SortManager Class
 * Implements sorting algorithms using Strategy Pattern for:
 * 1. Safetensor file count (Ascending / Descending)
 * 2. Model name alphabetical (A to Z / Z to A)
 */
export class SortManager {
  public sort(models: Model[], option: SortOption): Model[] {
    const list = [...models];

    switch (option) {
      case 'safetensor_desc':
        return list.sort((a, b) => b.safetensorFileCount - a.safetensorFileCount);

      case 'safetensor_asc':
        return list.sort((a, b) => a.safetensorFileCount - b.safetensorFileCount);

      case 'name_asc':
        return list.sort((a, b) =>
          a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' })
        );

      case 'name_desc':
        return list.sort((a, b) =>
          b.displayName.localeCompare(a.displayName, undefined, { sensitivity: 'base' })
        );

      default:
        return list;
    }
  }
}
