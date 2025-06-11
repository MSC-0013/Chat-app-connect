import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Menu, Search, X, UserCircle, Users, Settings, Bell, Edit, LogOut } from 'lucide-react';
import ProfileEditor from '../profile/ProfileEditor';
import CreateGroupModal from '../groups/CreateGroupModal';
import UserProfile from '../profile/UserProfile';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Sidebar = ({ selectedChat, setSelectedChat, closeMobileSidebar }) => {
  const [activeTab, setActiveTab] = useState('chats');
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();
    fetchGroups();
  }, [currentUser]);

  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_URL}/users/contacts/all`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch contacts');
      const data = await res.json();
      setContacts(data);
    } catch (error) {
      toast.error('Failed to load contacts');
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/groups`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch groups');
      const data = await res.json();
      setGroups(data);
    } catch (error) {
      toast.error('Failed to load groups');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`${API_URL}/users/search/${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setSearchResults(data);
      setActiveTab('search');
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const addContact = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/users/contacts/add/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });
      if (!res.ok) throw new Error('Failed to add contact');
      toast.success('Contact added');
      fetchContacts();
      setActiveTab('chats');
    } catch (error) {
      toast.error('Failed to add contact');
    }
  };

  const selectChat = (chat, isGroup = false) => {
    setSelectedChat({ ...chat, isGroup });
    closeMobileSidebar();
  };

  const openUserProfile = (user) => {
    setSelectedUser(user);
    setIsUserProfileOpen(true);
  };

  const handleGroupCreated = () => {
    fetchGroups();
    setActiveTab('groups');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <div style={{ backgroundColor: '#000', color: '#fff', height: '100%', borderRight: '1px solid #333' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #333' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div onClick={() => setIsProfileOpen(true)} style={{ cursor: 'pointer' }}>
              <img
                src={currentUser.profilePicture || ''}
                alt="Avatar"
                style={{ borderRadius: '50%', width: 40, height: 40, border: '2px solid blue' }}
              />
              <div>{currentUser.username}</div>
            </div>
            <div>
              <button onClick={handleLogout} title="Logout"><LogOut size={20} color="white" /></button>
            </div>
          </div>
          <form onSubmit={handleSearch} style={{ marginTop: '1rem', display: 'flex' }}>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, padding: '0.5rem', borderRadius: 4 }}
            />
            <button type="submit" disabled={isSearching} style={{ marginLeft: '0.5rem' }}>
              {isSearching ? 'Searching...' : <Search size={16} />}
            </button>
          </form>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-around', backgroundColor: '#111' }}>
          <button onClick={() => setActiveTab('chats')} style={{ flex: 1, padding: '0.5rem' }}>Chats</button>
          <button onClick={() => setActiveTab('groups')} style={{ flex: 1, padding: '0.5rem' }}>Groups</button>
          <button onClick={() => setActiveTab('search')} style={{ flex: 1, padding: '0.5rem' }}>Search</button>
        </div>

        {/* Tab Content */}
        <div style={{ overflowY: 'auto', height: 'calc(100% - 200px)', padding: '0.5rem' }}>
          {activeTab === 'chats' && contacts.map(contact => (
            <div
              key={contact._id}
              onClick={() => selectChat(contact)}
              style={{
                display: 'flex', alignItems: 'center', padding: '0.5rem',
                backgroundColor: selectedChat?._id === contact._id ? '#1d4ed8' : 'transparent',
                cursor: 'pointer'
              }}
            >
              <img src={contact.profilePicture || ''} alt="Avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} />
              <div style={{ marginLeft: '1rem' }}>
                <div>{contact.username}</div>
                <small>{contact.bio || 'No bio available'}</small>
              </div>
            </div>
          ))}
          {activeTab === 'groups' && groups.map(group => (
            <div
              key={group._id}
              onClick={() => selectChat(group, true)}
              style={{
                display: 'flex', alignItems: 'center', padding: '0.5rem',
                backgroundColor: selectedChat?._id === group._id ? '#1d4ed8' : 'transparent',
                cursor: 'pointer'
              }}
            >
              <img src={group.picture || ''} alt="Group" style={{ width: 32, height: 32, borderRadius: '50%' }} />
              <div style={{ marginLeft: '1rem' }}>
                <div>{group.name}</div>
                <small>{group.description || 'No description'}</small>
              </div>
            </div>
          ))}
          {activeTab === 'search' && searchResults.map(user => {
            const isContact = contacts.some(contact => contact._id === user._id);
            return (
              <div key={user._id} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
                <img src={user.profilePicture || ''} alt="User" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                <div style={{ marginLeft: '1rem', flex: 1 }}>
                  <div>{user.username}</div>
                  <small>{user.bio || 'No bio available'}</small>
                </div>
                <button onClick={() => isContact ? selectChat(user) : addContact(user._id)}>
                  {isContact ? 'Chat' : 'Add'}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '1rem', borderTop: '1px solid #333' }}>
          <button
            onClick={() => setIsCreateGroupOpen(true)}
            style={{ width: '100%', padding: '0.5rem', backgroundColor: '#3b82f6', color: 'white' }}
          >
            <Users size={16} /> Create Group
          </button>
        </div>
      </div>

      <ProfileEditor isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <CreateGroupModal isOpen={isCreateGroupOpen} onClose={() => setIsCreateGroupOpen(false)} onGroupCreated={handleGroupCreated} />
      <UserProfile
        user={selectedUser}
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
        onStartChat={(user) => {
          selectChat(user);
          setIsUserProfileOpen(false);
        }}
      />
    </>
  );
};

export default Sidebar;
