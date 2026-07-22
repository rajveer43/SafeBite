import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User } from "@/types";
import { getProfile } from "@/services/auth_service";
import { getRoleFromToken } from "@/utils/role";

interface AuthCtx {
  token: string | null;
  user: User | null;
  role: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx>({ token: null, user: null, role: null, login: () => {}, logout: () => {}, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const data = await getProfile();
      setUser(data);
      setRole(data.role || getRoleFromToken());
    } catch {
      setRole(getRoleFromToken());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (token) { setRole(getRoleFromToken()); fetchUser(); }
    else setLoading(false);
  }, [token, fetchUser]);

  const login = (t: string) => { localStorage.setItem("token", t); setToken(t); };
  const logout = () => { localStorage.removeItem("token"); setToken(null); setUser(null); setRole(null); };

  return <AuthContext.Provider value={{ token, user, role, login, logout, loading }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react/only-export-components
export const useAuth = () => useContext(AuthContext);
