// frontend/src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('healsync_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('healsync_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData, token) => {
    // userData should have: role, email, name, id
    // Store both user data and token
    const userWithMeta = {
      ...userData,
      loginTime: new Date().toISOString()
    };
    setUser(userWithMeta);
    localStorage.setItem('healsync_user', JSON.stringify(userWithMeta));
    if (token) {
      localStorage.setItem('healsync_token', token);
    }
  };
  
  // Legacy login for backward compatibility with demo login
  const loginLegacy = (role, entityId, entityName) => {
    const userData = {
      role,
      entityId,
      entityName,
      loginTime: new Date().toISOString()
    };
    setUser(userData);
    localStorage.setItem('healsync_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('healsync_user');
  };

  const value = {
    user,
    isLoading,
    login,
    loginLegacy,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

