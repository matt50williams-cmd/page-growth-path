import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!auth.isLoggedIn()) { setIsLoadingAuth(false); return; }
      try {
        const userData = await auth.me();
        setUser(userData);
      } catch (err) {
        auth.logout(null);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    loadUser();
  }, []);

  const signup = async (email, password, fullName) => {
    const data = await auth.signup(email, password, fullName);
    setUser(data.user);
    return data;
  };

  const login = async (email, password) => {
    const data = await auth.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = (redirectTo = '/') => {
    setUser(null);
    auth.logout(redirectTo);
  };

  return (
    <AuthContext.Provider value={{ user, isLoadingAuth, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;