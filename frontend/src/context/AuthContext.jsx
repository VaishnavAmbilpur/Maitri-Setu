import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('maitri_token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('maitri_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading] = useState(false);

  const login = (tokenData, userData) => {
    localStorage.setItem('maitri_token', tokenData);
    localStorage.setItem('maitri_user', JSON.stringify(userData));
    setToken(tokenData);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('maitri_token');
    localStorage.removeItem('maitri_user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;
  const isOfficer = user?.role === 'officer';
  const isApplicant = user?.role === 'applicant';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated, isOfficer, isApplicant }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
