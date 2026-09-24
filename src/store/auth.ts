import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  discordUsername?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string) => void;
  register: (user: AuthUser, token: string) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) =>
        set({ user, token, isAuthenticated: true }),

      register: (user, token) =>
        set({ user, token, isAuthenticated: true }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),

      setUser: (user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : user,
        })),

      setToken: (token) => set({ token }),
    }),
    {
      name: "flux-auth",
    }
  )
);

export function getAuthHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
}
