import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
    setLoading(false);
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

      localStorage.setItem("user", JSON.stringify(data));
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

      localStorage.setItem("user", JSON.stringify(data));
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
    try {
      if (currentUser) {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify({ userId: currentUser._id }),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      setCurrentUser(null);
      navigate("/login");
    }
  };

  // UPDATE PROFILE
  const updateProfile = async (userData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      const updatedUser = {
        ...currentUser,
        username: data.user?.username ?? currentUser.username,
        bio: data.user?.bio ?? currentUser.bio,
        email: data.user?.email ?? currentUser.email,
        token: currentUser.token,
        _id: currentUser._id,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      toast.success("Profile updated successfully!");
      return data;
    } catch (error) {
      toast.error(error.message || "Update failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // GET FINGERPRINT USER
  const getFingerprintUser = async (credential) => {
    try {
      const res = await fetch(`${API_URL}/auth/get-fingerprint-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentialId: Array.from(new Uint8Array(credential.rawId)),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.email) return null;
      return data.email;
    } catch (err) {
      console.error("Error fetching fingerprint user:", err);
      return null;
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
        getFingerprintUser, // ✅ fingerprint support
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// CUSTOM HOOK
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
