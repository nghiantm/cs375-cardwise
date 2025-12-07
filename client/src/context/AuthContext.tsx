import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  ownedCards?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // Verify token is still valid by fetching current user
      fetch(`${API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Token invalid');
          return res.json();
        })
        .then(data => {
          if (data.success && data.data) {
            // Update user info from server
            const updatedUser = {
              id: data.data.id,
              email: data.data.email,
              firstName: data.data.firstName,
              lastName: data.data.lastName,
              ownedCards: data.data.ownedCards,
            };
            setUser(updatedUser);
            localStorage.setItem('authUser', JSON.stringify(updatedUser));
          }
        })
        .catch(() => {
          // Token is invalid, clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Listen for storage changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        if (e.newValue) {
          setToken(e.newValue);
        } else {
          setToken(null);
          setUser(null);
        }
      } else if (e.key === 'authUser') {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue));
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('Login response:', data); // DEBUG

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.success && data.token && data.data) {
      const userInfo = {
        id: data.data.id,
        email: data.data.email,
        firstName: data.data.firstName,
        lastName: data.data.lastName,
        ownedCards: data.data.ownedCards,
      };

      // Save to state
      setToken(data.token);
      setUser(userInfo);

      // Persist to localStorage (will sync across tabs)
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(userInfo));
      
      console.log('Token saved:', data.token.substring(0, 20) + '...'); // DEBUG
      console.log('User saved:', userInfo); // DEBUG
    } else {
      console.error('Login response missing token or data:', data); // DEBUG
    }
  };

  const logout = () => {
    // Clear state
    setToken(null);
    setUser(null);

    // Clear localStorage (will sync across tabs via storage event)
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hook to get authenticated fetch function
export function useAuthFetch() {
  const { token } = useAuth();

  return async (url: string, options: RequestInit = {}) => {
    console.log('useAuthFetch - token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN'); // DEBUG
    
    const headers = {
      ...options.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    console.log('useAuthFetch - headers:', headers); // DEBUG

    return fetch(url, {
      ...options,
      headers,
    });
  };
}
