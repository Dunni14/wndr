import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Load token from AsyncStorage on mount
    AsyncStorage.getItem("token").then(storedToken => {
      if (storedToken) setToken(storedToken);
    });
  }, []);

  const login = async (userData: any, jwt: string) => {
    setUser(userData);
    setToken(jwt);
    await AsyncStorage.setItem("token", jwt);
  };

  return (
    <AuthContext.Provider value={{ user, token, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 