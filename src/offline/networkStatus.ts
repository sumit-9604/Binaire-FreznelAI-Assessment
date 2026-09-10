type NetworkListener = (isOnline: boolean) => void;

/**
 * NetworkStatusManager (Observer Pattern)
 * Monitors browser online/offline events and provides a manual simulation switch
 * for testing the app when internet is switched randomly.
 */
export class NetworkStatusManager {
  private static instance: NetworkStatusManager;
  private isOnlineState: boolean =
    typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true;
  private isSimulatedOffline: boolean = false;
  private listeners: Set<NetworkListener> = new Set();

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  public static getInstance(): NetworkStatusManager {
    if (!NetworkStatusManager.instance) {
      NetworkStatusManager.instance = new NetworkStatusManager();
    }
    return NetworkStatusManager.instance;
  }

  private handleOnline = () => {
    this.isOnlineState = true;
    this.notify();
  };

  private handleOffline = () => {
    this.isOnlineState = false;
    this.notify();
  };

  /**
   * Returns true if system is online AND simulated offline is NOT active.
   */
  public isOnline(): boolean {
    if (this.isSimulatedOffline) {
      return false;
    }
    return this.isOnlineState;
  }

  /**
   * Allows manual toggling of simulated offline mode (per assessment requirements).
   */
  public toggleSimulatedOffline(forceOffline?: boolean): boolean {
    this.isSimulatedOffline =
      forceOffline !== undefined ? forceOffline : !this.isSimulatedOffline;
    this.notify();
    return this.isSimulatedOffline;
  }

  public isSimulationActive(): boolean {
    return this.isSimulatedOffline;
  }

  public subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    listener(this.isOnline());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const status = this.isOnline();
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (err) {
        console.error('Error notifying network listener:', err);
      }
    });
  }
}
