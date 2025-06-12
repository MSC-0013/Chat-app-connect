import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Loader2, Camera, Check } from 'lucide-react';
import ProfilePicture from '../assets/ProfileConnect.jpg';

const ProfileEditor = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    profilePicture: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        bio: currentUser.bio || '',
        profilePicture: currentUser.profilePicture || ''
      });
      setPreviewImage(currentUser.profilePicture || '');
    }
  }, [currentUser, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'profilePicture' && value) {
      setPreviewImage(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-center text-blue-600 dark:text-white mb-6">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload Section */}
          <div className="flex justify-center">
            <div className="relative group">
              <img
                src={previewImage || ProfilePicture}
                alt="avatar"
                className="w-28 h-28 rounded-full object-cover border-4 border-blue-500 dark:border-blue-300 shadow-md transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-md cursor-pointer">
                <Camera size={18} className="text-gray-700 dark:text-white" />
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              maxLength={160}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white h-28 resize-none"
            />
            <p className="text-right text-xs text-gray-500 mt-1">{formData.bio.length}/160 characters</p>
          </div>

          {/* Action Buttons */}
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
