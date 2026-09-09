import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roleData, setRoleData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smartcare_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('smartcare_token');
      const storedUser = localStorage.getItem('smartcare_user');
      const storedRoleData = localStorage.getItem('smartcare_role_data');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          if (storedRoleData) setRoleData(JSON.parse(storedRoleData));
          
          // Verify with server
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setRoleData(res.data.roleData);
            localStorage.setItem('smartcare_user', JSON.stringify(res.data.user));
            if (res.data.roleData) {
              localStorage.setItem('smartcare_role_data', JSON.stringify(res.data.roleData));
            }
          }
        } catch (err) {
          console.warn('Session expired or invalid, clearing stored credentials');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      setRoleData(res.data.roleData);

      localStorage.setItem('smartcare_token', res.data.token);
      localStorage.setItem('smartcare_user', JSON.stringify(res.data.user));
      if (res.data.roleData) {
        localStorage.setItem('smartcare_role_data', JSON.stringify(res.data.roleData));
      }
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      setRoleData(res.data.roleData);

      localStorage.setItem('smartcare_token', res.data.token);
      localStorage.setItem('smartcare_user', JSON.stringify(res.data.user));
      if (res.data.roleData) {
        localStorage.setItem('smartcare_role_data', JSON.stringify(res.data.roleData));
      }
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRoleData(null);
    localStorage.removeItem('smartcare_token');
    localStorage.removeItem('smartcare_user');
    localStorage.removeItem('smartcare_role_data');
  };

  // Quick one-click login helper for all 4 roles
  const quickDemoLogin = async (roleType) => {
    const credentials = {
      admin: { email: 'admin@smartcare.org', password: 'admin123' },
      patient: { email: 'vivek.kokambe@example.com', password: 'patient123' },
      doctor: { email: 'dr.ananya.sen@smartcare.org', password: 'doctor123' },
      hospital: { email: 'apollo@smartcare.org', password: 'hospital123' },
    };

    const target = credentials[roleType];
    if (target) {
      return await login(target.email, target.password);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setRoleData(res.data.roleData);
        localStorage.setItem('smartcare_user', JSON.stringify(res.data.user));
        if (res.data.roleData) {
          localStorage.setItem('smartcare_role_data', JSON.stringify(res.data.roleData));
        }
      }
    } catch (e) {
      console.error('Failed to refresh user data', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roleData,
        token,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
        refreshUser,
        isAuthenticated: !!token && !!user,
        isPatient: user?.role === 'patient',
        isDoctor: user?.role === 'doctor',
        isHospital: user?.role === 'hospital',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
