import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const user = await login(formData);
      toast.success(`Welcome back to Connect, ${user.username || "User"}!`);
      navigate("/chat");
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Invalid email or password.");
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 text-white">
      <div className="w-full max-w-md bg-black border border-white/20 rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-1">Connect</h1>
        <p className="text-center text-sm text-gray-400 mb-6">
          Welcome back. Let’s get you connected.
        </p>

        {errorMsg && (
          <div className="mb-4 px-4 py-2 rounded border border-red-500 bg-red-500/10 text-red-300 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email ID"
              required
              className="w-full px-4 py-2 rounded-lg bg-transparent border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white transition"
            />
          </div>

          {/* Password */}
          <div>
            
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="password"
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
            <div className="text-right mt-1">
              <Link
                to="/forgot-password"
                className="text-sm underline underline-offset-2 hover:text-gray-300"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
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

        {/* Footer */}
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
