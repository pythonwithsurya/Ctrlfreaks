import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Profile photo options
const PROFILE_PHOTOS = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHN8ZW58MHx8fHwxNzUyMjcxNjcxfDA&ixlib=rb-4.1.0&q=85",
  "https://images.unsplash.com/photo-1657128344786-360c3f8e57e5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHN8ZW58MHx8fHwxNzUyMjcxNjcxfDA&ixlib=rb-4.1.0&q=85",
  "https://images.unsplash.com/photo-1576558656222-ba66febe3dec?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHN8ZW58MHx8fHwxNzUyMjcxNjcxfDA&ixlib=rb-4.1.0&q=85",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwcGhvdG9zfGVufDB8fHx8MTc1MjI5ODUzMHww&ixlib=rb-4.1.0&q=85",
  "https://images.unsplash.com/photo-1695927621677-ec96e048dce2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxwcm9maWxlJTIwcGhvdG9zfGVufDB8fHx8MTc1MjI5ODUzMHww&ixlib=rb-4.1.0&q=85",
  "https://images.unsplash.com/photo-1584999734482-0361aecad844?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxwcm9maWxlJTIwcGhvdG9zfGVufDB8fHx8MTc1MjI5ODUzMHww&ixlib=rb-4.1.0&q=85",
  "https://images.pexels.com/photos/30004482/pexels-photo-30004482.jpeg",
  "https://images.pexels.com/photos/30004490/pexels-photo-30004490.jpeg"
];

// Set up axios interceptor for auth token
let authToken = localStorage.getItem('authToken');

const setAuthHeader = (token) => {
  authToken = token;
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('authToken', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
  }
};

// Initialize auth header if token exists
if (authToken) {
  setAuthHeader(authToken);
}

// Mobile Navigation Component
const MobileNav = ({ isOpen, onClose, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/search', label: 'Find Skills', icon: '🔍' },
    { path: '/sent-requests', label: 'Sent Requests', icon: '📤' },
    { path: '/received-requests', label: 'Received', icon: '📥' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-indigo-600">SkillSwap</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <div className="mt-3 flex items-center space-x-3">
            {user.profile_photo && (
              <img src={user.profile_photo} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
            )}
            <div>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left mb-2 transition-colors ${
                location.pathname === item.path
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span className="text-lg">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

// Header Component
const Header = ({ user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/search', label: 'Find Skills' },
    { path: '/sent-requests', label: 'Sent' },
    { path: '/received-requests', label: 'Received' },
    { path: '/profile', label: 'Profile' }
  ];

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                SkillSwap
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop User Menu */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {user.profile_photo && (
                  <img src={user.profile_photo} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                )}
                <span className="text-gray-700 text-sm">Welcome, {user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileNav 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        user={user} 
        onLogout={onLogout} 
      />
    </>
  );
};

// Login Component
const Login = ({ onLogin, switchToRegister }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/auth/login`, formData);
      setAuthHeader(response.data.access_token);
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-6 sm:p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to SkillSwap</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={switchToRegister}
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Register Component
const Register = ({ onLogin, switchToLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '', name: '', location: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/auth/register`, formData);
      setAuthHeader(response.data.access_token);
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-6 sm:p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Join SkillSwap</h2>
          <p className="mt-2 text-gray-600">Start exchanging skills today</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location (Optional)</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={switchToLogin}
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Dashboard Page
const Dashboard = ({ user }) => {
  const [dashboardStats, setDashboardStats] = useState(null);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API}/dashboard`);
      setDashboardStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-gray-600">Ready to exchange some skills today?</p>
      </div>

      {/* Stats Dashboard */}
      {dashboardStats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{dashboardStats.sent_requests}</div>
            <div className="text-xs sm:text-sm text-gray-600">Sent Requests</div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{dashboardStats.received_requests}</div>
            <div className="text-xs sm:text-sm text-gray-600">Received</div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{dashboardStats.pending_sent}</div>
            <div className="text-xs sm:text-sm text-gray-600">Pending Sent</div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{dashboardStats.pending_received}</div>
            <div className="text-xs sm:text-sm text-gray-600">Pending Received</div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm col-span-2 lg:col-span-1">
            <div className="text-xl sm:text-2xl font-bold text-indigo-600">{dashboardStats.active_swaps}</div>
            <div className="text-xs sm:text-sm text-gray-600">Active Swaps</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <Link
          to="/search"
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🔍</div>
            <div>
              <h3 className="font-semibold text-lg">Find Skills</h3>
              <p className="text-indigo-100 text-sm">Discover people with skills you want to learn</p>
            </div>
          </div>
        </Link>

        <Link
          to="/received-requests"
          className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">📥</div>
            <div>
              <h3 className="font-semibold text-lg">Check Requests</h3>
              <p className="text-green-100 text-sm">Review incoming skill swap requests</p>
            </div>
          </div>
        </Link>

        <Link
          to="/profile"
          className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">👤</div>
            <div>
              <h3 className="font-semibold text-lg">Update Profile</h3>
              <p className="text-orange-100 text-sm">Manage your skills and preferences</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
            <div className="text-blue-600 text-xl">💡</div>
            <div>
              <h3 className="font-medium text-blue-900">Complete your profile</h3>
              <p className="text-blue-700 text-sm">Add your skills and what you want to learn to get started.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
            <div className="text-green-600 text-xl">🎯</div>
            <div>
              <h3 className="font-medium text-green-900">Find your first skill match</h3>
              <p className="text-green-700 text-sm">Search for people who offer skills you want to learn.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
            <div className="text-purple-600 text-xl">🤝</div>
            <div>
              <h3 className="font-medium text-purple-900">Send your first swap request</h3>
              <p className="text-purple-700 text-sm">Offer one of your skills in exchange for learning something new.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Search Page
const SearchPage = ({ user }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchSkill, setSearchSkill] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const searchUsers = async () => {
    if (!searchSkill.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await axios.get(`${API}/users/search?skill=${encodeURIComponent(searchSkill)}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const sendSwapRequest = async (targetUserId, mySkill, theirSkill) => {
    try {
      await axios.post(`${API}/swaps`, {
        requested_user_id: targetUserId,
        requester_skill: mySkill,
        requested_skill: theirSkill,
        message: `Hi! I'd like to teach you ${mySkill} in exchange for learning ${theirSkill}.`
      });
      alert('Swap request sent successfully!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send swap request');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Find Skills</h1>
        <p className="text-gray-600">Discover people with skills you want to learn</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <input
            type="text"
            value={searchSkill}
            onChange={(e) => setSearchSkill(e.target.value)}
            placeholder="Search for a skill (e.g., Photography, Cooking, Spanish)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
          />
          <button
            onClick={searchUsers}
            disabled={isSearching || !searchSkill.trim()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {searchResults.map(person => (
            <div key={person.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4 mb-4">
                {person.profile_photo ? (
                  <img 
                    src={person.profile_photo} 
                    alt={person.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl text-gray-500">👤</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">{person.name}</h3>
                  {person.location && <p className="text-gray-600 text-sm">{person.location}</p>}
                  {person.availability && (
                    <p className="text-sm text-indigo-600 mt-1">
                      <span className="font-medium">Available:</span> {person.availability}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Offers:</h4>
                  <div className="flex flex-wrap gap-2">
                    {person.skills_offered.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Wants to learn:</h4>
                  <div className="flex flex-wrap gap-2">
                    {person.skills_wanted.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 space-y-2">
                  {user.skills_offered.map(mySkill => 
                    person.skills_offered.map(theirSkill => 
                      user.skills_wanted.includes(theirSkill) && (
                        <button
                          key={`${mySkill}-${theirSkill}`}
                          onClick={() => sendSwapRequest(person.id, mySkill, theirSkill)}
                          className="w-full text-left text-sm bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg p-3 transition-colors"
                        >
                          <div className="font-medium text-indigo-900">
                            Offer <span className="text-indigo-700">{mySkill}</span> for <span className="text-indigo-700">{theirSkill}</span>
                          </div>
                        </button>
                      )
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchSkill && searchResults.length === 0 && !isSearching && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">Try searching for a different skill or check your spelling.</p>
        </div>
      )}
    </div>
  );
};

// Sent Requests Page
const SentRequestsPage = () => {
  const [sentRequests, setSentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSentRequests = async () => {
    try {
      const response = await axios.get(`${API}/swaps/sent`);
      setSentRequests(response.data);
    } catch (err) {
      console.error('Failed to fetch sent requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRequest = async (requestId) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    
    try {
      await axios.delete(`${API}/swaps/${requestId}`);
      setSentRequests(sentRequests.filter(req => req.id !== requestId));
    } catch (err) {
      alert('Failed to delete request');
    }
  };

  useEffect(() => {
    fetchSentRequests();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sent Requests</h1>
        <p className="text-gray-600">Track the skill swap requests you've sent</p>
      </div>

      {sentRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📤</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sent requests yet</h3>
          <p className="text-gray-600 mb-6">Start by searching for skills you want to learn!</p>
          <Link
            to="/search"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Find Skills
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sentRequests.map(request => (
            <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                    <div>
                      <p className="text-sm text-gray-600">Offering:</p>
                      <span className="font-medium text-green-700">{request.requester_skill}</span>
                    </div>
                    <div className="hidden sm:block text-gray-400">⇄</div>
                    <div>
                      <p className="text-sm text-gray-600">Requesting:</p>
                      <span className="font-medium text-blue-700">{request.requested_skill}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Sent: {new Date(request.created_at).toLocaleDateString()}
                  </p>
                  {request.message && (
                    <p className="text-sm text-gray-600 mt-1 italic">"{request.message}"</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  
                  {request.status === 'pending' && (
                    <button
                      onClick={() => deleteRequest(request.id)}
                      className="text-red-600 hover:text-red-800 text-sm px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Received Requests Page
const ReceivedRequestsPage = () => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReceivedRequests = async () => {
    try {
      const response = await axios.get(`${API}/swaps/received`);
      setReceivedRequests(response.data);
    } catch (err) {
      console.error('Failed to fetch received requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSwapStatus = async (swapId, status) => {
    try {
      await axios.put(`${API}/swaps/${swapId}`, { status });
      fetchReceivedRequests();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update swap status');
    }
  };

  useEffect(() => {
    fetchReceivedRequests();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Received Requests</h1>
        <p className="text-gray-600">Review and respond to incoming skill swap requests</p>
      </div>

      {receivedRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No received requests yet</h3>
          <p className="text-gray-600 mb-6">When others want to learn your skills, requests will appear here!</p>
          <Link
            to="/profile"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Update Your Skills
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {receivedRequests.map(request => (
            <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                      <div>
                        <p className="text-sm text-gray-600">They're offering:</p>
                        <span className="font-medium text-green-700">{request.requester_skill}</span>
                      </div>
                      <div className="hidden sm:block text-gray-400">⇄</div>
                      <div>
                        <p className="text-sm text-gray-600">They want your:</p>
                        <span className="font-medium text-blue-700">{request.requested_skill}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Received: {new Date(request.created_at).toLocaleDateString()}
                    </p>
                    {request.message && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">"{request.message}"</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                {request.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={() => updateSwapStatus(request.id, 'accepted')}
                      className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
                    >
                      Accept Swap
                    </button>
                    <button
                      onClick={() => updateSwapStatus(request.id, 'rejected')}
                      className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
                
                {request.status === 'accepted' && (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={() => updateSwapStatus(request.id, 'completed')}
                      className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
                    >
                      Mark as Completed
                    </button>
                    <div className="flex-1 sm:flex-none px-4 py-2 bg-green-50 text-green-700 rounded-md text-sm text-center">
                      ✓ Swap accepted - start learning!
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Profile Page
const ProfilePage = ({ user, onUserUpdate }) => {
  const [profile, setProfile] = useState({
    name: user.name || '',
    location: user.location || '',
    profile_photo: user.profile_photo || '',
    skills_offered: user.skills_offered || [],
    skills_wanted: user.skills_wanted || [],
    availability: user.availability || '',
    is_profile_public: user.is_profile_public !== false
  });
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);

  const addSkillOffered = () => {
    if (newSkillOffered.trim() && !profile.skills_offered.includes(newSkillOffered.trim())) {
      setProfile({
        ...profile,
        skills_offered: [...profile.skills_offered, newSkillOffered.trim()]
      });
      setNewSkillOffered('');
    }
  };

  const addSkillWanted = () => {
    if (newSkillWanted.trim() && !profile.skills_wanted.includes(newSkillWanted.trim())) {
      setProfile({
        ...profile,
        skills_wanted: [...profile.skills_wanted, newSkillWanted.trim()]
      });
      setNewSkillWanted('');
    }
  };

  const removeSkillOffered = (skill) => {
    setProfile({
      ...profile,
      skills_offered: profile.skills_offered.filter(s => s !== skill)
    });
  };

  const removeSkillWanted = (skill) => {
    setProfile({
      ...profile,
      skills_wanted: profile.skills_wanted.filter(s => s !== skill)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.put(`${API}/users/me`, profile);
      onUserUpdate(response.data);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Profile update failed:', err);
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
        <p className="text-gray-600">Manage your skills and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Profile Photo Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Profile Photo</label>
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              {profile.profile_photo ? (
                <img
                  src={profile.profile_photo}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                  <span className="text-3xl text-gray-500">👤</span>
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => setShowPhotoSelector(!showPhotoSelector)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
              >
                {profile.profile_photo ? 'Change Photo' : 'Select Photo'}
              </button>
              {profile.profile_photo && (
                <button
                  type="button"
                  onClick={() => setProfile({...profile, profile_photo: ''})}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          {/* Photo Selector */}
          {showPhotoSelector && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Choose a photo:</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {PROFILE_PHOTOS.map((photo, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setProfile({...profile, profile_photo: photo});
                      setShowPhotoSelector(false);
                    }}
                    className={`w-16 h-16 rounded-full object-cover border-2 transition-all ${
                      profile.profile_photo === photo 
                        ? 'border-indigo-500 ring-2 ring-indigo-200' 
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <img src={photo} alt={`Option ${index + 1}`} className="w-full h-full rounded-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile({...profile, location: e.target.value})}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., New York, San Francisco"
            />
          </div>
        </div>

        {/* Skills Offered */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Skills You Offer</label>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-3">
            <input
              type="text"
              value={newSkillOffered}
              onChange={(e) => setNewSkillOffered(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillOffered())}
              placeholder="Add a skill you can teach"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={addSkillOffered}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap"
            >
              Add Skill
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills_offered.map((skill, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkillOffered(skill)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Skills Wanted */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Skills You Want to Learn</label>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-3">
            <input
              type="text"
              value={newSkillWanted}
              onChange={(e) => setNewSkillWanted(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillWanted())}
              placeholder="Add a skill you want to learn"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={addSkillWanted}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
            >
              Add Skill
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills_wanted.map((skill, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkillWanted(skill)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Availability</label>
          <input
            type="text"
            value={profile.availability}
            onChange={(e) => setProfile({...profile, availability: e.target.value})}
            placeholder="e.g., Weekends, Evenings, Flexible"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Privacy Setting */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={profile.is_profile_public}
            onChange={(e) => setProfile({...profile, is_profile_public: e.target.checked})}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Make my profile public (others can find and contact me)
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Layout wrapper for authenticated pages
const AppLayout = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <main>{children}</main>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      if (authToken) {
        try {
          const response = await axios.get(`${API}/users/me`);
          setUser(response.data);
        } catch (err) {
          setAuthHeader(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    setAuthHeader(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <Register 
        onLogin={setUser} 
        switchToLogin={() => setShowRegister(false)} 
      />
    ) : (
      <Login 
        onLogin={setUser} 
        switchToRegister={() => setShowRegister(true)} 
      />
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <AppLayout user={user} onLogout={logout}>
            <Dashboard user={user} />
          </AppLayout>
        } />
        <Route path="/dashboard" element={
          <AppLayout user={user} onLogout={logout}>
            <Dashboard user={user} />
          </AppLayout>
        } />
        <Route path="/search" element={
          <AppLayout user={user} onLogout={logout}>
            <SearchPage user={user} />
          </AppLayout>
        } />
        <Route path="/sent-requests" element={
          <AppLayout user={user} onLogout={logout}>
            <SentRequestsPage />
          </AppLayout>
        } />
        <Route path="/received-requests" element={
          <AppLayout user={user} onLogout={logout}>
            <ReceivedRequestsPage />
          </AppLayout>
        } />
        <Route path="/profile" element={
          <AppLayout user={user} onLogout={logout}>
            <ProfilePage user={user} onUserUpdate={updateUser} />
          </AppLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;