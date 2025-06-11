
import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Update API_URL to be configurable from environment or fallback to a default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const user = JSON.parse(storedUser);
          
          // Verify token is still valid
          const res = await fetch(`${API_URL}/users/${user._id}`, {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
          
          if (res.ok) {
            setCurrentUser(user);
          } else {
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    
    try {
      console.log("Registering user with API URL:", API_URL);
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(data));
      
      // Set current user
      setCurrentUser(data);
      
      // Show success toast
      toast.success('Registration successful!');
      
      // Redirect to home
      navigate('/chat');
      
      return data;
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    
    try {
      console.log("Logging in user with API URL:", API_URL);
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(data));
      
      // Set current user
      setCurrentUser(data);
      
      // Show success toast
      toast.success('Login successful!');
      
      // Redirect to home
      navigate('/');
      
      return data;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      if (currentUser) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
          },
          body: JSON.stringify({ userId: currentUser._id })
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Remove user from localStorage
      localStorage.removeItem('user');
      
      // Clear current user
      setCurrentUser(null);
      
      // Redirect to login
      navigate('/login');
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/users/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(userData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Update failed');
      }
      
      // Update user in localStorage
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update current user
      setCurrentUser(updatedUser);
      
      // Show success toast
      toast.success('Profile updated successfully!');
      
      return data;
    } catch (error) {
      toast.error(error.message || 'Update failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      register,
      login,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
