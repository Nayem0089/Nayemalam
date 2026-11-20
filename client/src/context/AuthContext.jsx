/**
 * AUTHENTICATION CONTEXT (Admin Session Management)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Check existing session on load
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await apiRequest('/auth/me');
        if (res && res.success && res.admin) {
          setIsAdmin(true);
          setAdminUser(res.admin);
        }
      } catch (err) {
        setIsAdmin(false);
        setAdminUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (password, username = 'admin') => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    if (res && res.success) {
      setIsAdmin(true);
      setAdminUser(res.admin);
      setIsLoginModalOpen(false);
      return res;
    }
    throw new Error((res && res.error) || 'Login failed');
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    } finally {
      setIsAdmin(false);
      setAdminUser(null);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  };

  return (
    <AuthContext.Provider value={{
      isAdmin,
      adminUser,
      loading,
      isLoginModalOpen,
      setIsLoginModalOpen,
      login,
      logout,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
