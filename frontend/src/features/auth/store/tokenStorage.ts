const ACCESS_TOKEN_STORAGE_KEY = "auth.accessToken";
const REFRESH_TOKEN_STORAGE_KEY = "auth.refreshToken";

export interface StoredTokens {
  access: string;
  refresh: string;
}

export function getStoredTokens(): StoredTokens | null {
  if (typeof window === "undefined") return null;
  const access = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  const refresh = window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  if (!access || !refresh) return null;
  return { access, refresh };
}

export function setStoredTokens(tokens: StoredTokens): void {
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokens.access);
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refresh);
}

export function clearStoredTokens(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}
