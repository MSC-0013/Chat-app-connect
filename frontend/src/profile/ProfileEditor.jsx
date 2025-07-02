import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import ProfilePicture from "../assets/ProfileConnect.jpg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ProfileEditor = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser } = useAuth();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || "");
      setBio(currentUser.bio || "");
    }
  }, [currentUser, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/users/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, bio }),
      });

      if (!res.ok) throw new Error("Update failed");

      const data = await res.json();

      const updatedUser = {
        ...currentUser,
        username: data.user.username,
        bio: data.user.bio,
      };

      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile updated");
      onClose();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const finalImageSrc =
    currentUser?.profilePicture
      ? `${API_URL.replace("/api", "")}/${currentUser.profilePicture}?t=${Date.now()}`
      : ProfilePicture;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-center text-blue-600 dark:text-white mb-6">
          Edit Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Avatar (Read-only) */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={finalImageSrc}
                alt="avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = ProfilePicture;
                }}
                className="w-28 h-28 rounded-full object-cover border-4 border-blue-500 dark:border-blue-300 shadow-md"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
            />
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white h-28 resize-none"
            />
            <p className="text-right text-xs text-gray-500 mt-1">
              {bio.length}/160 characters
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600 transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditor;
