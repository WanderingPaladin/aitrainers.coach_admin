const STORAGE_KEY = 'aitrainers.admin.apiKey';

export function getStoredApiKey(): string {
  return sessionStorage.getItem(STORAGE_KEY) ?? '';
}

export function getDefaultApiKey(): string {
  return import.meta.env.VITE_ADMIN_API_KEY ?? '';
}

export function setStoredApiKey(key: string) {
  sessionStorage.setItem(STORAGE_KEY, key.trim());
}

export function clearStoredApiKey() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function isSignedIn(): boolean {
  return getStoredApiKey().length > 0;
}
