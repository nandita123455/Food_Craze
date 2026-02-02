import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const riderStr = localStorage.getItem('rider');
    const userStr = localStorage.getItem('user');
    
    if (token) {
      if (riderStr) {
        // Rider login
        try {
          const rider = JSON.parse(riderStr);
          setUser({ ...rider, type: 'rider' });
          console.log('✅ Auto-login from localStorage (Rider)');
        } catch (e) {
          console.error('Invalid rider data');
          localStorage.removeItem('rider');
          localStorage.removeItem('token');
        }
      } else if (userStr) {
        // Customer/Admin login
        try {
          const userData = JSON.parse(userStr);
          setUser({ ...userData, type: userData.isAdmin ? 'admin' : 'customer' });
          console.log('✅ Auto-login from localStorage (Customer)');
        } catch (e) {
          console.error('Invalid user data');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    }
    
    setLoading(false);
  }, []); // ✅ Only run once

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser({ ...userData, type: userData.isAdmin ? 'admin' : 'customer' });
  };

  const loginAsRider = (riderData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('rider', JSON.stringify(riderData));
    setUser({ ...riderData, type: 'rider' });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rider');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    loginAsRider,
    logout,
    isRider: user?.type === 'rider',
    isAdmin: user?.type === 'admin',
    isCustomer: user?.type === 'customer'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
