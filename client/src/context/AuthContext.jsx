import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (response.ok) {
        setUser(data);
        if (['/', '/login', '/register'].includes(location.pathname)) {
          navigate('/dashboard');
        }
      } else {
        setUser(null);
        if (location.pathname === '/dashboard') {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error("Auth verification failed", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);