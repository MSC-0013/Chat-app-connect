import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    bio: currentUser?.bio || '',
    profilePicture: currentUser?.profilePicture || ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile(formData);
      onClose();
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Profile</h2>
        <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">Update your profile information</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex gap-6">
            {/* Avatar + Image input */}
            <div className="w-1/3 flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden mb-3">
                {formData.profilePicture ? (
                  <img
                    src={formData.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white bg-blue-500 text-2xl">
                    {formData.username.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <label htmlFor="profilePicture" className="text-sm text-center mb-1 font-medium text-gray-700 dark:text-gray-300">
                Profile Picture URL
              </label>
              <input
                type="text"
                id="profilePicture"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Username and Bio */}
            <div className="w-2/3 flex flex-col gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col flex-grow">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Write something about yourself..."
                  className="w-full flex-grow min-h-[100px] border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded disabled:opacity-50 transition"
            >
              {isLoading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-lg"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
