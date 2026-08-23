import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import api, { API_BASE_URL } from "../api/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));

  const login = useCallback(async (email, password) => {
    // Backend uses OAuth2PasswordRequestForm -> must be form-urlencoded,
    // with fields named "username" and "password".
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);

    const { data } = await axios.post(`${API_BASE_URL}/login`, form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    localStorage.setItem("access_token", data.access_token);
    setToken(data.access_token);
    return data;
  }, []);

  const register = useCallback(async (email, password) => {
    // Optional convenience — hits POST /users/
    await api.post("/users/", { email, password });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}