import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { authApi } from "../services/api";

interface User {
  email: string;
  name: string;
  avatar: string;
  plan: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
  updateName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function defaultNameFromEmail(email: string): string {
  const namePart = email.split("@")[0].replace(/[._]/g, " ");
  return namePart.replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildUser(email: string): User {
  const savedName = localStorage.getItem("userDisplayName");
  const name = savedName && savedName.trim() ? savedName : defaultNameFromEmail(email);
  const avatar = name.charAt(0).toUpperCase();
  return { email, name, avatar, plan: "Free" };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (savedEmail && localStorage.getItem("token")) setUser(buildUser(savedEmail));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    if (!data.token) throw new Error(data.message || "Login failed");
    localStorage.setItem("token", data.token);
    localStorage.setItem("userEmail", email);
    setUser(buildUser(email));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUser(null);
  };

  const register = async (email: string, password: string) => {
    const data = await authApi.register(email, password);
    if (data.message !== "Registered successfully") throw new Error(data.message);
  };

  const updateName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || !user) return;
    localStorage.setItem("userDisplayName", trimmed);
    setUser({ ...user, name: trimmed, avatar: trimmed.charAt(0).toUpperCase() });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, register, updateName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}