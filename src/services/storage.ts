/**
 * Storage Service
 * Provides unified, asynchronous storage abstraction with fallback between
 * chrome.storage.local (Extension) and localStorage (Dev/Browser).
 */

class StorageService {
  private isChromeStorage(): boolean {
    return (
      typeof chrome !== 'undefined' &&
      !!chrome.storage &&
      !!chrome.storage.local
    );
  }

  async get<T>(key: string, defaultValue: T): Promise<T> {
    if (this.isChromeStorage()) {
      return new Promise((resolve) => {
        try {
          chrome.storage.local.get([key], (result) => {
            if (chrome.runtime.lastError) {
              console.warn('Chrome storage get error:', chrome.runtime.lastError);
              resolve(this.getFromLocalStorage(key, defaultValue));
            } else {
              resolve(result[key] !== undefined ? (result[key] as T) : this.getFromLocalStorage(key, defaultValue));
            }
          });
        } catch {
          resolve(this.getFromLocalStorage(key, defaultValue));
        }
      });
    }

    return this.getFromLocalStorage(key, defaultValue);
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (this.isChromeStorage()) {
      return new Promise((resolve) => {
        try {
          chrome.storage.local.set({ [key]: value }, () => {
            if (chrome.runtime.lastError) {
              console.warn('Chrome storage set error:', chrome.runtime.lastError);
              this.setInLocalStorage(key, value);
            }
            resolve();
          });
        } catch {
          this.setInLocalStorage(key, value);
          resolve();
        }
      });
    }

    this.setInLocalStorage(key, value);
  }

  async remove(key: string): Promise<void> {
    if (this.isChromeStorage()) {
      return new Promise((resolve) => {
        try {
          chrome.storage.local.remove([key], () => {
            localStorage.removeItem(`pimxdash_${key}`);
            localStorage.removeItem(`lumina_${key}`);
            resolve();
          });
        } catch {
          localStorage.removeItem(`pimxdash_${key}`);
          localStorage.removeItem(`lumina_${key}`);
          resolve();
        }
      });
    }

    localStorage.removeItem(`pimxdash_${key}`);
    localStorage.removeItem(`lumina_${key}`);
  }

  private getFromLocalStorage<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(`pimxdash_${key}`) ?? localStorage.getItem(`lumina_${key}`);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage:`, e);
      return defaultValue;
    }
  }

  private setInLocalStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`pimxdash_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to localStorage:`, e);
    }
  }
}

export const storage = new StorageService();
