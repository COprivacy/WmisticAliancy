import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { apiRequest, queryClient } from "./queryClient";

type User = {
  id: string;
  zoneId: string;
  username: string;
  isAdmin: boolean;
  avatar?: string;
  rank?: string;
};

type AuthContextType = {
  user: User | null;
  login: (username: string, id: string, zoneId: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check session on mount
    fetch("/api/user")
      .then(res => res.json())
      .then(data => {
        if (data) setUser(data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, id: string, zoneId: string, pin?: string) => {
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/login", { username, id, zoneId, pin });
      const data = await res.json();

      // If it's a regular user object (id exists), set it
      if (data && data.id) {
        setUser(data);
      }
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await apiRequest("POST", "/api/logout");
    setUser(null);
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
