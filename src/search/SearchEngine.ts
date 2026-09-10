import { Model } from '../models/Model';

/**
 * SearchEngine Class
 * Handles substring search matching (from start or middle),
 * with custom implementation of throttling and debouncing.
 */
export class SearchEngine {
  /**
   * Debouncing wrapper: delays invocation until after waitMs have elapsed
   * since the last time the debounced function was invoked.
   */
  public static debounce<T extends (...args: any[]) => void>(
    func: T,
    waitMs: number = 300
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
        timeoutId = null;
      }, waitMs);
    };
  }

  /**
   * Throttling wrapper: ensures the function is invoked at most once per limitMs.
   */
  public static throttle<T extends (...args: any[]) => void>(
    func: T,
    limitMs: number = 200
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;
    let lastArgs: Parameters<T> | null = null;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
          if (lastArgs) {
            func(...lastArgs);
            lastArgs = null;
          }
        }, limitMs);
      } else {
        lastArgs = args;
      }
    };
  }

  /**
   * Core search method: evaluates substring match (start or middle).
   */
  public executeSearch(
    models: Model[],
    query: string,
    field: 'all' | 'name' | 'family' = 'all'
  ): Model[] {
    if (!query || query.trim() === '') {
      return models;
    }

    return models.filter((model) => model.matchesSearch(query, field));
  }

  /**
   * Inspects where the query matched within a text ('start' | 'middle' | 'none')
   */
  public getMatchPosition(text: string, query: string): 'start' | 'middle' | 'none' {
    if (!query) return 'start';
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === 0) return 'start';
    if (index > 0) return 'middle';
    return 'none';
  }
}
