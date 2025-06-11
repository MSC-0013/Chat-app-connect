import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Bell, Shield, Menu, X } from 'lucide-react';

const Landing = () => {
  const { currentUser } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <img src="/Connect New.png" alt="Connect Logo" className="h-8 w-8" />,
      title: "Real-Time Messaging",
      description: "Enjoy seamless and instant messaging with friends and colleagues in real-time."
    },
    {
      icon: <Users className="h-8 w-8 text-chat-primary" />,
      title: "Group Chats",
      description: "Create groups for team discussions, family chats, or planning events with multiple people."
    },
    {
      icon: <Bell className="h-8 w-8 text-chat-primary" />,
      title: "Instant Notifications",
      description: "Never miss a message with real-time notifications for all your conversations."
    },
    {
      icon: <Shield className="h-8 w-8 text-chat-primary" />,
      title: "Secure & Private",
      description: "Your conversations are secured with end-to-end encryption for maximum privacy."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src="/Connect New.png" alt="Connect Logo" className="h-9 w-9 rounded-full shadow-md" />
              <span className="font-extrabold text-2xl tracking-tight text-chat-primary drop-shadow-lg">CONNECT</span>
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              <a href="#features" className="px-3 py-2 hover:text-chat-primary transition-colors">Features</a>
              <a href="#about" className="px-3 py-2 hover:text-chat-primary transition-colors">About</a>
              {currentUser ? (
                <Link to="/login">
                  <button className="chat-gradient hover:opacity-90 transition-opacity">Open App</button>
                </Link>
              ) : (
                <div className="flex space-x-2">
                  <Link to="/login">
                    <button className="border-chat-primary text-chat-primary border px-4 py-2 rounded hover:bg-chat-primary/10">Login</button>
                  </Link>
                  <Link to="/register">
                    <button className="chat-gradient hover:opacity-90 transition-opacity px-4 py-2 rounded text-white">Register</button>
                  </Link>
                </div>
              )}
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg rounded-b-lg animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 rounded-md hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>Features</a>
              <a href="#about" className="block px-3 py-2 rounded-md hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>About</a>
              {currentUser ? (
                <Link to="/login" className="block w-full" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full chat-gradient hover:opacity-90 transition-opacity text-white py-2 rounded">Open App</button>
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="block w-full" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full border-chat-primary text-chat-primary border py-2 rounded hover:bg-chat-primary/10">Login</button>
                  </Link>
                  <Link to="/register" className="block w-full" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full chat-gradient hover:opacity-90 transition-opacity text-white py-2 rounded">Register</button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-8 mb-10 md:mb-0">
            <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">
              Connect with <span className="text-chat-primary">everyone</span>, anywhere, anytime
            </h1>
            <p className="text-lg mb-8 text-gray-600">
              A modern messaging platform built for friends, teams, and communities. Simple, reliable, and secure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {currentUser ? (
                <Link to="/login">
                  <button className="chat-gradient hover:opacity-90 transition-opacity text-lg py-6 px-8 font-semibold rounded-full shadow-lg text-white">Open CONNECT</button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <button className="chat-gradient hover:opacity-90 transition-opacity text-lg py-6 px-8 font-semibold rounded-full shadow-lg text-white">Get Started</button>
                  </Link>
                  <Link to="/login">
                    <button className="text-lg py-6 px-8 border border-chat-primary text-chat-primary hover:bg-chat-primary/10 font-semibold rounded-full shadow">Sign In</button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="md:w-1/2 relative flex justify-center">
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-4 transform rotate-3 hover:rotate-0 transition-all duration-300 border-2 border-chat-primary/20">
              <img src="/Connect New.png" alt="Connect Demo" className="rounded-xl w-60 h-60 object-contain mx-auto mb-4 shadow-lg" />
              <div className="text-center text-xl font-bold text-chat-primary tracking-wide">CONNECT</div>
              <div className="text-center text-gray-500 text-sm mt-1">Your new way to connect</div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-60 h-60 bg-chat-primary/20 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Amazing Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our chat application comes packed with powerful features to enhance your communication experience.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-10 mb-10 md:mb-0">
            <h2 className="text-4xl font-bold mb-6">About CONNECT</h2>
            <p className="text-lg mb-6 text-gray-600">
              CONNECT is designed to bring people together, wherever they are...
            </p>
            <p className="text-lg mb-6 text-gray-600">
              With CONNECT, you get real-time messaging, powerful group chats, instant notifications, and privacy-first technology...
            </p>
            <div className="bg-chat-primary/10 p-4 rounded-lg border-l-4 border-chat-primary italic text-gray-700">
              "CONNECT is more than just a chat app—it's your space to share, collaborate, and grow together."
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&h=200" className="rounded w-full h-auto shadow-md" />
              <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&h=200" className="rounded w-full h-auto shadow-md" />
              <img src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=300&h=200" className="rounded w-full h-auto shadow-md" />
              <img src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=300&h=200" className="rounded w-full h-auto shadow-md" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-br from-chat-dark to-black text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto">Join thousands of users already enjoying our platform.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {currentUser ? (
              <Link to="/login">
                <button className="chat-gradient hover:opacity-90 transition-opacity py-6 px-8 text-lg font-semibold rounded-full shadow-lg text-white">Open CONNECT</button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <button className="chat-gradient hover:opacity-90 transition-opacity py-6 px-8 text-lg font-semibold rounded-full shadow-lg text-white">Create Free Account</button>
                </Link>
                <Link to="/login">
                  <button className="text-black border-white border py-6 px-8 text-lg font-semibold rounded-full shadow">Log In</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
