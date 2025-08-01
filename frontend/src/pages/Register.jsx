import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon } from "lucide-react";

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
      const user = await register(userData);
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
        <h1 className="text-4xl font-bold text-center text-white mb-1">Connect</h1>
        <p className="text-center text-gray-400 mb-6 text-sm">
          Create an account and start meaningful conversations.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 border border-red-500 bg-red-500/10 text-sm text-red-300 rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="username"
              className="w-full px-4 py-2 bg-transparent border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {/* Email */}
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

          {/* Password */}
          <div>
            
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="password"
                className="w-full px-4 py-2 pr-10 bg-transparent border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="confirm password"
                className="w-full px-4 py-2 pr-10 bg-transparent border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                aria-label="Toggle confirm password"
              >
                {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
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

        {/* Footer */}
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
