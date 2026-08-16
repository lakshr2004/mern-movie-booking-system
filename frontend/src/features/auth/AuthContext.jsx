import { createContext, useState, useCallback } from "react";

export const AuthContext = createContext();

function AuthProvider({ children }) {
  // Initialize state directly from localStorage to prevent flash on page reload
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const getUserId = useCallback(() => {
    return user?.user?.id || user?.user?._id || user?.id || user?._id || null;
  }, [user]);

  const getUserRole = useCallback(() => {
    return user?.user?.role || user?.role || "user";
  }, [user]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getUserId, getUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
