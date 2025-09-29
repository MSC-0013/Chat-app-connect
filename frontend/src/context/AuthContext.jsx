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

  // 🔹 IndexedDB init
  const initDB = async () =>
    openDB("AuthDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("credentials")) {
          db.createObjectStore("credentials", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("fingerprints")) {
          db.createObjectStore("fingerprints", { keyPath: "userId" });
        }
      },
    });

  // 🔹 Save user
  const saveUser = async (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    const db = await initDB();
    await db.put("credentials", { id: "user", ...user });
  };

  // 🔹 Load user
  const loadUser = async () => {
    const db = await initDB();
    const cred = await db.get("credentials", "user");
    if (cred) return cred;
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  };

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

  // 🔹 Save fingerprint locally
  const saveFingerprint = async (user) => {
    if (!window.PublicKeyCredential) return;
    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: "Connect App" },
          user: {
            id: new TextEncoder().encode(user._id),
            name: user.email,
            displayName: user.username,
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      });

      const rawId = Array.from(new Uint8Array(credential.rawId));

      // Save in both
      localStorage.setItem("fingerprintUser", JSON.stringify({ userId: user._id, rawId }));
      const db = await initDB();
      await db.put("fingerprints", { userId: user._id, rawId });

      toast.success("Fingerprint stored locally!");
    } catch (err) {
      console.error("Fingerprint save failed:", err);
    }
  };

  // 🔹 Get fingerprint user
  const getFingerprintUser = async () => {
    const db = await initDB();
    let saved = await db.get("fingerprints", currentUser?._id);
    if (!saved) {
      const local = localStorage.getItem("fingerprintUser");
      saved = local ? JSON.parse(local) : null;
    }
    if (!saved) return null;

    try {
      await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [{ id: new Uint8Array(saved.rawId).buffer, type: "public-key" }],
          userVerification: "required",
        },
      });
      return saved.userId;
    } catch (err) {
      console.error("Fingerprint login failed:", err);
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
        saveFingerprint,
        getFingerprintUser,
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
