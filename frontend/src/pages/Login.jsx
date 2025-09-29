import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { openDB } from "idb";

const Login = () => {
  const { login, getFingerprintUser } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fallback, setFallback] = useState(false);
  const [checkingFingerprint, setCheckingFingerprint] = useState(true);

  // 🔹 Check IndexedDB for auto-login
  useEffect(() => {
    const tryFingerprintLogin = async () => {
      const userId = await getFingerprintUser();
      if (userId) {
        try {
          // check IndexedDB
          const db = await openDB("AuthDB", 1);
          const cred = await db.get("credentials", "user");
          if (cred && cred._id === userId) {
            toast.success(`Welcome back, ${cred.username || "User"}!`);
            navigate("/chat");
            return;
          }

          // fallback localStorage
          const storedUser = JSON.parse(localStorage.getItem("user"));
          if (storedUser && storedUser._id === userId) {
            toast.success(`Welcome back, ${storedUser.username || "User"}!`);
            navigate("/chat");
            return;
          }
        } catch (err) {
          console.error("Error in fingerprint login:", err);
        }
      }
      setFallback(true);
      setCheckingFingerprint(false);
    };
    tryFingerprintLogin();
  }, [getFingerprintUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const user = await login(formData);
      toast.success(`Welcome back, ${user.username || "User"}!`);
      navigate("/chat");
    } catch (err) {
      setErrorMsg("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingFingerprint && !fallback) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <h1 className="text-2xl">Authenticating with fingerprint...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 text-white">
      <div className="w-full max-w-md bg-black border border-white/20 rounded-2xl p-8">
        <h1 className="text-4xl font-bold text-center mb-1">Connect</h1>
        <p className="text-center text-sm text-gray-400 mb-6">
          Welcome back. Please login.
        </p>

        {errorMsg && (
          <div className="mb-4 px-4 py-2 rounded border border-red-500 bg-red-500/10 text-red-300 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-white/30 rounded bg-transparent text-white"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 pr-10 border border-white/30 rounded bg-transparent text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 border rounded hover:bg-white hover:text-black"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link to="/register" className="underline hover:text-white">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
