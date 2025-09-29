import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    // Check if fingerprint failed in this session
    const fingerprintFailed = sessionStorage.getItem("fingerprintFailed");
    if (fingerprintFailed) {
      setFallback(true);
      return;
    }

    const fingerprintLogin = async () => {
      if (!window.PublicKeyCredential) {
        sessionStorage.setItem("fingerprintFailed", "true");
        setFallback(true);
        return toast.warning("Fingerprint not supported. Use email/password.");
      }

      try {
        await navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array([0x8C, 0x01, 0x7F, 0xAA, 0x44]),
            allowCredentials: [],
          },
        });

        // Demo: Use stored demo email/password for fingerprint login
        const userEmail = "mscx0013@shd";
        const user = await login({ email: userEmail, password: "demo" });
        toast.success(`Logged in with fingerprint! Welcome, ${user.username || "User"}!`);
        navigate("/chat");
      } catch (err) {
        console.error("Fingerprint login failed:", err);
        toast.warning("Fingerprint failed. Please login with email/password.");
        sessionStorage.setItem("fingerprintFailed", "true");
        setFallback(true);
      }
    };

    fingerprintLogin();
  }, [login, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const user = await login(formData);
      toast.success(`Welcome back, ${user.username || "User"}!`);
      navigate("/chat");
    } catch (err) {
      console.error(err);
      setErrorMsg("Invalid email or password.");
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!fallback) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 text-white">
        <h1 className="text-3xl font-bold">Authenticate with your fingerprint</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 text-white">
      <div className="w-full max-w-md bg-black border border-white/20 rounded-2xl shadow-xl p-8">
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
          <div>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email"
              required
              className="w-full px-4 py-2 rounded-lg bg-transparent border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white transition"
            />
          </div>

          <div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Password"
                required
                className="w-full px-4 py-2 pr-10 rounded-lg bg-transparent border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 rounded-lg font-semibold transition ${
              isLoading
                ? "bg-white text-black opacity-60 cursor-not-allowed"
                : "border border-white hover:bg-white hover:text-black"
            }`}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link to="/register" className="underline underline-offset-2 hover:text-white">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
