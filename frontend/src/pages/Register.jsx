import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { openDB } from "idb";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // IndexedDB init
  const initDB = async () => {
    return await openDB("AuthDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("credentials")) {
          db.createObjectStore("credentials", { keyPath: "id" });
        }
      },
    });
  };

  // Save credentials to IndexedDB + localStorage
  const saveCredentials = async (user) => {
    const db = await initDB();
    await db.put("credentials", { id: "user", ...user });
    localStorage.setItem("user", JSON.stringify(user));
  };

  // Check auto-login on mount
  useEffect(() => {
    const autoLogin = async () => {
      const db = await initDB();
      const cred = await db.get("credentials", "user");
      if (cred) {
        console.log("Auto-login with:", cred);
        navigate("/chat");
      }
    };
    autoLogin();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;

      // Register via AuthContext
      const user = await register(userData);

      // Save credentials locally
      await saveCredentials({
        _id: user._id,
        email: user.email,
        username: user.username,
        token: user.token, // assuming backend returns token
      });

      toast.success(`Welcome to Connect, ${user.username || "User"}!`);
      navigate("/chat");
    } catch (error) {
      console.error("Registration failed:", error);
      setErrorMsg(error.message || "Registration failed. Try again.");
      toast.error("Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md border border-white/20 rounded-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-1">Connect</h1>
        <p className="text-center text-gray-400 mb-6 text-sm">
          Create an account and start meaningful conversations.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 border border-red-500 bg-red-500/10 text-sm text-red-300 rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Username"
              className="w-full px-4 py-2 bg-transparent border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <div>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email ID"
              className="w-full px-4 py-2 bg-transparent border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Password"
                className="w-full px-4 py-2 pr-10 bg-transparent border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          <div>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm Password"
                className="w-full px-4 py-2 pr-10 bg-transparent border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 border rounded text-white font-semibold transition ${
              isLoading
                ? "border-white opacity-60 cursor-not-allowed"
                : "border-white hover:bg-white hover:text-black"
            }`}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="underline hover:text-white">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
