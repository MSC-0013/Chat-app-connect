import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { openDB } from "idb";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // IndexedDB init
  const initDB = async () =>
    openDB("AuthDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("credentials")) {
          db.createObjectStore("credentials", { keyPath: "id" });
        }
      },
    });

  // Save user to localStorage + IndexedDB
  const saveUser = async (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    const db = await initDB();
    await db.put("credentials", { id: "user", ...user });
  };

  // Load user from IndexedDB / localStorage
  const loadUser = async () => {
    const db = await initDB();
    const cred = await db.get("credentials", "user");
    if (cred) return cred;
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  };

  // On mount, load user for auto-login
  useEffect(() => {
    (async () => {
      const user = await loadUser();
      if (user) setCurrentUser(user);
      setLoading(false);
    })();
  }, []);

  // REGISTER
  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      await saveUser(data);
      setCurrentUser(data);
      toast.success("Registration successful!");
      navigate("/chat");
      return data;
    } catch (error) {
      toast.error(error.message || "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // LOGIN
  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      await saveUser(data);
      setCurrentUser(data);
      toast.success("Login successful!");
      return data;
    } catch (error) {
      toast.error(error.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = async () => {
    localStorage.removeItem("user");
    const db = await initDB();
    await db.clear("credentials");
    setCurrentUser(null);
    navigate("/login");
  };

  // UPDATE PROFILE (supports FormData for file upload)
  const updateProfile = async (formData) => {
    try {
      const res = await fetch(`${API_URL}/users/${currentUser._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${currentUser.token}` },
        body: formData, // FormData allows file upload
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setCurrentUser(data);
      await saveUser(data);
      return data;
    } catch (err) {
      toast.error(err.message || "Profile update failed");
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loading,
        register,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
