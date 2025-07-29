import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  user: any;
  token: string | null;
  login: (userData: any, jwt: string) => void;
  logout: () => void;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  const login = (userData: any, jwt: string) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem("token", jwt);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  const updateUser = (userData: any) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 