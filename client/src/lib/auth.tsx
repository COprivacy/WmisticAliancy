import { createContext, useContext, useState, ReactNode, useEffect } from "react";

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

// Admin validation moved to a more "abstracted" way to avoid hardcoding in UI
// In a real app, this would be a server-side check
const ADMIN_ID = "1792001576";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wmythic_auth");
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const login = async (username: string, id: string, zoneId: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const isAdmin = id === ADMIN_ID;

    const newUser = {
      username: isAdmin ? "sempaiadm" : username,
      id,
      zoneId: zoneId || "0000",
      isAdmin,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${isAdmin ? "sempaiadm" : username}&backgroundColor=b6e3f4`,
      rank: isAdmin ? "Mythical Glory" : "Legend",
    };

    setUser(newUser);
    localStorage.setItem("wmythic_auth", JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("wmythic_auth");
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
