import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Join SkillSwap</h2>
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

// Profile Setup Component
const ProfileSetup = ({ user, onProfileUpdate }) => {
  const [profile, setProfile] = useState({
    name: user.name || '',
    location: user.location || '',
    skills_offered: user.skills_offered || [],
    skills_wanted: user.skills_wanted || [],
    availability: user.availability || '',
    is_profile_public: user.is_profile_public !== false
  });
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      onProfileUpdate(response.data);
    } catch (err) {
      console.error('Profile update failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Profile</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Skills You Offer</label>
          <div className="flex space-x-2 mb-2">
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Add
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Skills You Want to Learn</label>
          <div className="flex space-x-2 mb-2">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchResults, setSearchResults] = useState([]);
  const [searchSkill, setSearchSkill] = useState('');
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API}/dashboard`);
      setDashboardStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    }
  };

  const searchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users/search?skill=${encodeURIComponent(searchSkill)}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const response = await axios.get(`${API}/swaps/sent`);
      setSentRequests(response.data);
    } catch (err) {
      console.error('Failed to fetch sent requests:', err);
    }
  };

  const fetchReceivedRequests = async () => {
    try {
      const response = await axios.get(`${API}/swaps/received`);
      setReceivedRequests(response.data);
    } catch (err) {
      console.error('Failed to fetch received requests:', err);
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
      fetchSentRequests();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send swap request');
    }
  };

  const updateSwapStatus = async (swapId, status) => {
    try {
      await axios.put(`${API}/swaps/${swapId}`, { status });
      fetchReceivedRequests();
      fetchSentRequests();
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update swap status');
    }
  };

  useEffect(() => {
    fetchDashboard();
    if (activeTab === 'sent') fetchSentRequests();
    if (activeTab === 'received') fetchReceivedRequests();
  }, [activeTab]);

  const logout = () => {
    setAuthHeader(null);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">SkillSwap</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user.name}</span>
            <button
              onClick={() => setActiveTab('profile')}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Edit Profile
            </button>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Dashboard */}
        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{dashboardStats.sent_requests}</div>
              <div className="text-sm text-gray-600">Sent Requests</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">{dashboardStats.received_requests}</div>
              <div className="text-sm text-gray-600">Received Requests</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">{dashboardStats.pending_sent}</div>
              <div className="text-sm text-gray-600">Pending Sent</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{dashboardStats.pending_received}</div>
              <div className="text-sm text-gray-600">Pending Received</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">{dashboardStats.active_swaps}</div>
              <div className="text-sm text-gray-600">Active Swaps</div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg shadow-sm">
          {[
            { key: 'search', label: 'Find Skills' },
            { key: 'sent', label: 'Sent Requests' },
            { key: 'received', label: 'Received Requests' },
            { key: 'profile', label: 'Edit Profile' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'search' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Find People to Swap Skills With</h2>
            
            <div className="flex space-x-2 mb-6">
              <input
                type="text"
                value={searchSkill}
                onChange={(e) => setSearchSkill(e.target.value)}
                placeholder="Search for a skill (e.g., Photography, Cooking, Spanish)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              />
              <button
                onClick={searchUsers}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Search
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map(person => (
                <div key={person.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg">{person.name}</h3>
                  {person.location && <p className="text-gray-600 text-sm">{person.location}</p>}
                  
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700">Offers:</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {person.skills_offered.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700">Wants to learn:</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {person.skills_wanted.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {person.availability && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Available:</span> {person.availability}
                    </p>
                  )}

                  <div className="mt-3 space-y-2">
                    {user.skills_offered.map(mySkill => 
                      person.skills_offered.map(theirSkill => 
                        user.skills_wanted.includes(theirSkill) && (
                          <button
                            key={`${mySkill}-${theirSkill}`}
                            onClick={() => sendSwapRequest(person.id, mySkill, theirSkill)}
                            className="w-full text-left text-xs bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded p-2 transition-colors"
                          >
                            Offer <span className="font-medium">{mySkill}</span> for <span className="font-medium">{theirSkill}</span>
                          </button>
                        )
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sent' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Swap Requests You've Sent</h2>
            
            <div className="space-y-4">
              {sentRequests.map(request => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p><span className="font-medium">Offering:</span> {request.requester_skill}</p>
                    <p><span className="font-medium">Requesting:</span> {request.requested_skill}</p>
                    <p className="text-sm text-gray-600">Sent: {new Date(request.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'received' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Swap Requests You've Received</h2>
            
            <div className="space-y-4">
              {receivedRequests.map(request => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p><span className="font-medium">They're offering:</span> {request.requester_skill}</p>
                      <p><span className="font-medium">They want your:</span> {request.requested_skill}</p>
                      {request.message && <p className="text-sm text-gray-600 mt-1">{request.message}</p>}
                      <p className="text-sm text-gray-600">Received: {new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateSwapStatus(request.id, 'accepted')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateSwapStatus(request.id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {request.status === 'accepted' && (
                        <button
                          onClick={() => updateSwapStatus(request.id, 'completed')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Mark Complete
                        </button>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <ProfileSetup user={user} onProfileUpdate={(updatedUser) => {
            // You could update the user state here if needed
            setActiveTab('search');
          }} />
        )}
      </div>
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

  return <Dashboard user={user} onLogout={() => setUser(null)} />;
}

export default App;