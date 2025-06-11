import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Loader2, Check, Users, Search, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CreateGroupModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    picture: ''
  });
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) fetchContacts();
  }, [isOpen]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/contacts/all`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch contacts');
      const data = await res.json();
      setContacts(data);
    } catch (error) {
      toast.error('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSelectContact = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Group name is required');
    if (selectedContacts.length === 0) return toast.error('Select at least one contact');

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ ...formData, members: selectedContacts })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create group');
      }

      toast.success('Group created successfully!');
      setFormData({ name: '', description: '', picture: '' });
      setSelectedContacts([]);
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = contacts.filter((c) =>
    c.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-5xl w-full flex flex-col sm:flex-row">
        {/* Left side - Form */}
        <div className="p-6 sm:w-1/2 w-full">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Create New Group
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Create a group to chat with multiple contacts
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Group Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="picture" className="block text-sm font-medium mb-1">Group Picture URL (Optional)</label>
              <input
                id="picture"
                name="picture"
                type="text"
                value={formData.picture}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">Description (Optional)</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.name.trim() || selectedContacts.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Create Group
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right side - Contact List */}
        <div className="p-6 border-t sm:border-t-0 sm:border-l border-gray-300 sm:w-1/2 w-full overflow-y-auto max-h-[75vh]">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Select Members
          </h3>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-8 py-2 border rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {selectedContacts.length > 0 && (
            <p className="text-xs text-gray-600 mb-2">
              Selected: {selectedContacts.length} member{selectedContacts.length > 1 ? 's' : ''}
            </p>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <p className="text-sm text-gray-500">No contacts found.</p>
          ) : (
            <ul className="space-y-2">
              {filteredContacts.map((contact) => (
                <li
                  key={contact._id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded"
                  onClick={() => toggleSelectContact(contact._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact._id)}
                    onChange={() => toggleSelectContact(contact._id)}
                    className="accent-blue-600"
                  />
                  <img
                    src={contact.picture}
                    alt={contact.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">{contact.username}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
