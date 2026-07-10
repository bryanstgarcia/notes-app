"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { User } from "@/lib/api/models/User";
import { OpenAPI } from "@/lib/api/core/OpenAPI";
import { AuthService } from "@/lib/api/services/AuthService";
import { getStoredTokens, setStoredTokens, clearStoredTokens } from "./tokenStorage";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: { access: string; refresh: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Always start with isLoading = true to avoid hydration mismatch between server
  // (which has no localStorage) and client (which might have stored tokens).
  // The effect below will determine the true value and update it accordingly.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On mount, check if there are stored tokens and hydrate the user.
    const storedTokens = getStoredTokens();

    // No stored tokens; clear loading state and continue.
    if (!storedTokens) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    // Set the token in the OpenAPI config so subsequent requests include it
    OpenAPI.TOKEN = storedTokens.access;

    // Fetch the current user
    AuthService.authMeRetrieve()
      .then((me) => {
        setUser(me);
        setIsLoading(false);
      })
      .catch(() => {
        // Token is invalid or expired; clear and start fresh
        clearStoredTokens();
        OpenAPI.TOKEN = undefined;
        setUser(null);
        setIsLoading(false);
      });
  }, []);

  const login = async (tokens: { access: string; refresh: string }) => {
    // Store tokens in localStorage
    setStoredTokens(tokens);

    // Set the token in the OpenAPI config
    OpenAPI.TOKEN = tokens.access;

    // Fetch the current user
    const me = await AuthService.authMeRetrieve();
    setUser(me);
  };

  const logout = () => {
    clearStoredTokens();
    OpenAPI.TOKEN = undefined;
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
