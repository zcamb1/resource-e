'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

interface Resource {
  api_keys: Array<{
    id: string;
    api_key: string;
    is_active: boolean;
    created_at: string;
  }>;
  proxies: Array<{
    id: string;
    proxy_url: string;
    is_active: boolean;
    created_at: string;
  }>;
  rotating_proxy_keys: Array<{
    id: string;
    api_key: string;
    key_name: string;
    is_active: boolean;
    created_at: string;
  }>;
  elevenlabs_accounts: Array<{
    id: string;
    email: string;
    password: string;
    credits: number;
    tier: string;
    status: string;
    is_active: boolean;
    created_at: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [adminUsername, setAdminUsername] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resources, setResources] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'api_keys' | 'proxies' | 'rotating_keys' | 'elevenlabs_accounts'>('elevenlabs_accounts');

  // Form states
  const [showUserForm, setShowUserForm] = useState(false);
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [showProxyForm, setShowProxyForm] = useState(false);
  const [showRotatingKeyForm, setShowRotatingKeyForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [newProxy, setNewProxy] = useState('');
  const [newRotatingKey, setNewRotatingKey] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, loading: false });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');

    if (!token) {
      router.push('/login');
      return;
    }

    setAdminUsername(storedUsername || '');
    fetchUsers();
    setLoading(false);
  }, [router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUserResources = async (userId: string) => {
    try {
      const response = await fetch(`/api/resources/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    fetchUserResources(user.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    router.push('/login');
  };

  const createUser = async () => {
    if (!newUsername.trim()) return;

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          username: newUsername.trim(),
        }),
      });

      if (response.ok) {
        setNewUsername('');
        setShowUserForm(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const addApiKey = async () => {
    if (!selectedUser || !newApiKey.trim()) return;

    try {
      if (bulkMode) {
        // Bulk mode: use bulk insert API
        const keys = newApiKey.split('\n')
          .map(k => k.trim())
          .filter(k => k.length > 0);
        
        if (keys.length === 0) return;
        
        setBulkProgress({ current: 0, total: keys.length, loading: true });
        
        const response = await fetch('/api/resources/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            userId: selectedUser.id,
            type: 'api_keys',
            items: keys,
          }),
        });

        const data = await response.json();
        setBulkProgress({ current: 0, total: 0, loading: false });
        
        if (response.ok) {
          alert(`✅ Đã thêm ${data.count}/${keys.length} API keys!`);
        } else {
          alert(`❌ Lỗi: ${data.error}`);
          return;
        }
      } else {
        // Single mode
        const response = await fetch('/api/resources/api-keys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            userId: selectedUser.id,
            apiKey: newApiKey.trim(),
          }),
        });

        if (!response.ok) {
          alert('❌ Lỗi thêm API key!');
          return;
        }
      }

      setNewApiKey('');
      setShowApiKeyForm(false);
      setBulkMode(false);
      fetchUserResources(selectedUser.id);
    } catch (error) {
      console.error('Error adding API key:', error);
      setBulkProgress({ current: 0, total: 0, loading: false });
      alert('❌ Lỗi kết nối server!');
    }
  };

  // NEW: Add ElevenLabs Account
  const addElevenLabsAccount = async () => {
    if (!selectedUser || !newApiKey.trim()) return;

    try {
      if (bulkMode) {
        // Bulk mode: Parse email:password or email|password
        const accounts = newApiKey.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => {
            const delimiter = line.includes('|') ? '|' : ':';
            const [email, password] = line.split(delimiter, 2);
            return { email: email?.trim(), password: password?.trim() };
          })
          .filter(acc => acc.email && acc.password && acc.email.includes('@'));
        
        if (accounts.length === 0) {
          alert('❌ Không có account hợp lệ! Format: email:password hoặc email|password');
          return;
        }
        
        setBulkProgress({ current: 0, total: accounts.length, loading: true });
        
        let successCount = 0;
        for (let i = 0; i < accounts.length; i++) {
          const acc = accounts[i];
          
          const response = await fetch('/api/resources/elevenlabs-accounts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              email: acc.email,
              password: acc.password,
            }),
          });
          
          if (response.ok) {
            successCount++;
          }
          
          setBulkProgress({ current: i + 1, total: accounts.length, loading: true });
        }
        
        setBulkProgress({ current: 0, total: 0, loading: false });
        alert(`✅ Đã thêm ${successCount}/${accounts.length} accounts!`);
      } else {
        // Single mode: email:password format
        const [email, password] = newApiKey.split(':').map(s => s.trim());
        
        if (!email || !password || !email.includes('@')) {
          alert('❌ Format không đúng! Vui lòng nhập email và password.');
          return;
        }
        
        const response = await fetch('/api/resources/elevenlabs-accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          alert(`❌ Lỗi thêm account: ${data.error}`);
          return;
        }
        
        alert('✅ Đã thêm account thành công!');
      }

      setNewApiKey('');
      setShowApiKeyForm(false);
      setBulkMode(false);
      fetchUserResources(selectedUser.id);
    } catch (error) {
      console.error('Error adding ElevenLabs account:', error);
      setBulkProgress({ current: 0, total: 0, loading: false });
      alert('❌ Lỗi kết nối server!');
    }
  };

  const addProxy = async () => {
    if (!selectedUser || !newProxy.trim()) return;

    try {
      if (bulkMode) {
        const proxies = newProxy.split('\n')
          .map(p => p.trim())
          .filter(p => p.length > 0);
        
        if (proxies.length === 0) return;
        
        setBulkProgress({ current: 0, total: proxies.length, loading: true });
        
        const response = await fetch('/api/resources/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            userId: selectedUser.id,
            type: 'proxies',
            items: proxies,
          }),
        });

        const data = await response.json();
        setBulkProgress({ current: 0, total: 0, loading: false });
        
        if (response.ok) {
          alert(`✅ Đã thêm ${data.count}/${proxies.length} proxies!`);
        } else {
          alert(`❌ Lỗi: ${data.error}`);
          return;
        }
      } else {
        const response = await fetch('/api/resources/proxies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            userId: selectedUser.id,
            proxyUrl: newProxy.trim(),
          }),
        });

        if (!response.ok) {
          alert('❌ Lỗi thêm proxy!');
          return;
        }
      }

      setNewProxy('');
      setShowProxyForm(false);
      setBulkMode(false);
      fetchUserResources(selectedUser.id);
    } catch (error) {
      console.error('Error adding proxy:', error);
      setBulkProgress({ current: 0, total: 0, loading: false });
      alert('❌ Lỗi kết nối server!');
    }
  };

  const addRotatingKey = async () => {
    if (!selectedUser || !newRotatingKey.trim()) return;

    try {
      if (bulkMode) {
        const keys = newRotatingKey.split('\n')
          .map(k => k.trim())
          .filter(k => k.length > 0);
        
        if (keys.length === 0) return;
        
        setBulkProgress({ current: 0, total: keys.length, loading: true });
        
        const response = await fetch('/api/resources/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            userId: selectedUser.id,
            type: 'rotating_keys',
            items: keys,
          }),
        });

        const data = await response.json();
        setBulkProgress({ current: 0, total: 0, loading: false });
        
        if (response.ok) {
          alert(`✅ Đã thêm ${data.count}/${keys.length} rotating keys!`);
        } else {
          alert(`❌ Lỗi: ${data.error}`);
          return;
        }
      } else {
        const response = await fetch('/api/resources/rotating-keys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            userId: selectedUser.id,
            keyValue: newRotatingKey.trim(),
          }),
        });

        if (!response.ok) {
          alert('❌ Lỗi thêm rotating key!');
          return;
        }
      }

      setNewRotatingKey('');
      setShowRotatingKeyForm(false);
      setBulkMode(false);
      fetchUserResources(selectedUser.id);
    } catch (error) {
      console.error('Error adding rotating key:', error);
      setBulkProgress({ current: 0, total: 0, loading: false });
      alert('❌ Lỗi kết nối server!');
    }
  };

  const deleteResource = async (type: string, id: string) => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/resources/${type}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        fetchUserResources(selectedUser.id);
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const deleteAllResources = async (type: 'api_keys' | 'proxies' | 'rotating_keys' | 'elevenlabs_accounts') => {
    if (!selectedUser) return;

    const typeNames = {
      api_keys: 'API Keys',
      proxies: 'Proxies',
      rotating_keys: 'Rotating Keys',
      elevenlabs_accounts: 'ElevenLabs Accounts',
    };

    const count = type === 'api_keys' 
      ? resources?.api_keys?.length 
      : type === 'proxies' 
      ? resources?.proxies?.length 
      : type === 'rotating_keys'
      ? resources?.rotating_proxy_keys?.length
      : resources?.elevenlabs_accounts?.length;

    if (!count || count === 0) {
      alert('Không có gì để xóa!');
      return;
    }

    if (!confirm(`⚠️ Xóa TẤT CẢ ${count} ${typeNames[type]} của user "${selectedUser.username}"?\n\nHành động này KHÔNG THỂ HOÀN TÁC!`)) {
      return;
    }

    try {
      const response = await fetch('/api/resources/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          type: type,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Đã xóa ${data.count} ${typeNames[type]}!`);
        fetchUserResources(selectedUser.id);
      } else {
        alert(`❌ Lỗi: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting all resources:', error);
      alert('❌ Lỗi kết nối server!');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Xóa user này? Tất cả resources của user sẽ bị xóa!')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        if (selectedUser?.id === userId) {
          setSelectedUser(null);
          setResources(null);
        }
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🎙️ ElevenLabs Resource Manager</h1>
              <p className="text-sm text-gray-600">Admin: {adminUsername}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - User List */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">👥 Users ({users.length})</h2>
                <button
                  onClick={() => setShowUserForm(!showUserForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  + New
                </button>
              </div>

              {showUserForm && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full px-3 py-2 border rounded mb-2 text-sm"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={createUser}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex-1"
                    >
                      Tạo
                    </button>
                    <button
                      onClick={() => setShowUserForm(false)}
                      className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 rounded-lg cursor-pointer border-2 transition ${
                      selectedUser?.id === user.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{user.username}</div>
                        <div className="text-xs text-gray-500">User ID: {user.id.slice(0, 8)}...</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteUser(user.id);
                        }}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-gray-500 text-center py-8 text-sm">Chưa có user nào</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Resources */}
          <div className="col-span-9">
            {selectedUser ? (
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-xl font-semibold">
                    Resources của {selectedUser.username}
                  </h2>
                  <p className="text-sm text-gray-500">User ID: {selectedUser.id}</p>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab('api_keys')}
                      className={`px-6 py-4 text-sm font-medium ${
                        activeTab === 'api_keys'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🔑 API Keys ({resources?.api_keys?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab('proxies')}
                      className={`px-6 py-4 text-sm font-medium ${
                        activeTab === 'proxies'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🌐 Proxies ({resources?.proxies?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab('rotating_keys')}
                      className={`px-6 py-4 text-sm font-medium ${
                        activeTab === 'rotating_keys'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🔄 Rotating Keys ({resources?.rotating_proxy_keys?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab('elevenlabs_accounts')}
                      className={`px-6 py-4 text-sm font-medium ${
                        activeTab === 'elevenlabs_accounts'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      👤 ElevenLabs Accounts ({resources?.elevenlabs_accounts?.length || 0})
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {/* API Keys Tab */}
                  {activeTab === 'api_keys' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">API Keys</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteAllResources('api_keys')}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                          >
                            🗑️ Xóa tất cả
                          </button>
                          <button
                            onClick={() => setShowApiKeyForm(!showApiKeyForm)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                          >
                            + Thêm API Key
                          </button>
                        </div>
                      </div>

                      {showApiKeyForm && (
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <div className="flex gap-2 mb-2">
                            <button
                              onClick={() => setBulkMode(false)}
                              className={`px-3 py-1 rounded text-sm ${!bulkMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            >
                              Thêm 1 key
                            </button>
                            <button
                              onClick={() => setBulkMode(true)}
                              className={`px-3 py-1 rounded text-sm ${bulkMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            >
                              Thêm nhiều keys (bulk)
                            </button>
                          </div>
                          
                          {bulkMode ? (
                            <textarea
                              placeholder="Paste nhiều API keys, mỗi key 1 dòng&#10;sk_key1&#10;sk_key2&#10;sk_key3"
                              className="w-full px-4 py-2 border rounded mb-2 font-mono text-sm"
                              rows={10}
                              value={newApiKey}
                              onChange={(e) => setNewApiKey(e.target.value)}
                            />
                          ) : (
                            <input
                              type="text"
                              placeholder="Nhập API key (sk_...)"
                              className="w-full px-4 py-2 border rounded mb-2"
                              value={newApiKey}
                              onChange={(e) => setNewApiKey(e.target.value)}
                            />
                          )}
                          
                          {bulkProgress.loading && (
                            <div className="mb-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Đang thêm...</span>
                                <span>{bulkProgress.current}/{bulkProgress.total}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <button
                              onClick={addApiKey}
                              disabled={bulkProgress.loading}
                              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {bulkProgress.loading ? 'Đang xử lý...' : (bulkMode ? 'Thêm tất cả' : 'Thêm')}
                            </button>
                            <button
                              onClick={() => {
                                setShowApiKeyForm(false);
                                setBulkMode(false);
                                setNewApiKey('');
                              }}
                              disabled={bulkProgress.loading}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {resources?.api_keys?.map((key) => (
                          <div
                            key={key.id}
                            className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
                          >
                            <div className="flex-1">
                              <code className="text-sm">{key.api_key.slice(0, 10)}...{key.api_key.slice(-6)}</code>
                              <span className={`ml-3 text-xs px-2 py-1 rounded ${key.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {key.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <button
                              onClick={() => deleteResource('api-keys', key.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        ))}
                        {(!resources?.api_keys || resources.api_keys.length === 0) && (
                          <p className="text-gray-500 text-center py-8">Chưa có API key nào</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Proxies Tab */}
                  {activeTab === 'proxies' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Proxies</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteAllResources('proxies')}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                          >
                            🗑️ Xóa tất cả
                          </button>
                          <button
                            onClick={() => setShowProxyForm(!showProxyForm)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                          >
                            + Thêm Proxy
                          </button>
                        </div>
                      </div>

                      {showProxyForm && (
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <div className="flex gap-2 mb-2">
                            <button
                              onClick={() => setBulkMode(false)}
                              className={`px-3 py-1 rounded text-sm ${!bulkMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            >
                              Thêm 1 proxy
                            </button>
                            <button
                              onClick={() => setBulkMode(true)}
                              className={`px-3 py-1 rounded text-sm ${bulkMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            >
                              Thêm nhiều proxies (bulk)
                            </button>
                          </div>
                          
                          {bulkMode ? (
                            <textarea
                              placeholder="Paste nhiều proxies, mỗi proxy 1 dòng&#10;socks5://ip1:port&#10;socks5://ip2:port"
                              className="w-full px-4 py-2 border rounded mb-2 font-mono text-sm"
                              rows={10}
                              value={newProxy}
                              onChange={(e) => setNewProxy(e.target.value)}
                            />
                          ) : (
                            <input
                              type="text"
                              placeholder="Nhập proxy URL (socks5://...)"
                              className="w-full px-4 py-2 border rounded mb-2"
                              value={newProxy}
                              onChange={(e) => setNewProxy(e.target.value)}
                            />
                          )}
                          
                          {bulkProgress.loading && (
                            <div className="mb-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Đang thêm...</span>
                                <span>{bulkProgress.current}/{bulkProgress.total}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <button
                              onClick={addProxy}
                              disabled={bulkProgress.loading}
                              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {bulkProgress.loading ? 'Đang xử lý...' : (bulkMode ? 'Thêm tất cả' : 'Thêm')}
                            </button>
                            <button
                              onClick={() => {
                                setShowProxyForm(false);
                                setBulkMode(false);
                                setNewProxy('');
                              }}
                              disabled={bulkProgress.loading}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {resources?.proxies?.map((proxy) => (
                          <div
                            key={proxy.id}
                            className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
                          >
                            <div className="flex-1">
                              <code className="text-sm">{proxy.proxy_url}</code>
                              <span className={`ml-3 text-xs px-2 py-1 rounded ${proxy.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {proxy.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <button
                              onClick={() => deleteResource('proxies', proxy.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        ))}
                        {(!resources?.proxies || resources.proxies.length === 0) && (
                          <p className="text-gray-500 text-center py-8">Chưa có proxy nào</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rotating Keys Tab */}
                  {activeTab === 'rotating_keys' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Rotating Proxy Keys</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteAllResources('rotating_keys')}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                          >
                            🗑️ Xóa tất cả
                          </button>
                          <button
                            onClick={() => setShowRotatingKeyForm(!showRotatingKeyForm)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                          >
                            + Thêm Rotating Key
                          </button>
                        </div>
                      </div>

                      {showRotatingKeyForm && (
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <div className="flex gap-2 mb-2">
                            <button
                              onClick={() => setBulkMode(false)}
                              className={`px-3 py-1 rounded text-sm ${!bulkMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            >
                              Thêm 1 key
                            </button>
                            <button
                              onClick={() => setBulkMode(true)}
                              className={`px-3 py-1 rounded text-sm ${bulkMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            >
                              Thêm nhiều keys (bulk)
                            </button>
                          </div>
                          
                          {bulkMode ? (
                            <textarea
                              placeholder="Paste nhiều rotating keys, mỗi key 1 dòng&#10;key1&#10;key2&#10;key3"
                              className="w-full px-4 py-2 border rounded mb-2 font-mono text-sm"
                              rows={10}
                              value={newRotatingKey}
                              onChange={(e) => setNewRotatingKey(e.target.value)}
                            />
                          ) : (
                            <input
                              type="text"
                              placeholder="Nhập rotating key"
                              className="w-full px-4 py-2 border rounded mb-2"
                              value={newRotatingKey}
                              onChange={(e) => setNewRotatingKey(e.target.value)}
                            />
                          )}
                          
                          {bulkProgress.loading && (
                            <div className="mb-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Đang thêm...</span>
                                <span>{bulkProgress.current}/{bulkProgress.total}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <button
                              onClick={addRotatingKey}
                              disabled={bulkProgress.loading}
                              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {bulkProgress.loading ? 'Đang xử lý...' : (bulkMode ? 'Thêm tất cả' : 'Thêm')}
                            </button>
                            <button
                              onClick={() => {
                                setShowRotatingKeyForm(false);
                                setBulkMode(false);
                                setNewRotatingKey('');
                              }}
                              disabled={bulkProgress.loading}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {resources?.rotating_proxy_keys?.map((key) => (
                          <div
                            key={key.id}
                            className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
                          >
                            <div className="flex-1">
                              <code className="text-sm">{key.api_key.slice(0, 15)}...{key.api_key.slice(-10)}</code>
                              <span className={`ml-3 text-xs px-2 py-1 rounded ${key.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {key.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <button
                              onClick={() => deleteResource('rotating-keys', key.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        ))}
                        {(!resources?.rotating_proxy_keys || resources.rotating_proxy_keys.length === 0) && (
                          <p className="text-gray-500 text-center py-8">Chưa có rotating key nào</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ==================== ELEVENLABS ACCOUNTS TAB ==================== */}
                  {activeTab === 'elevenlabs_accounts' && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">👤 ElevenLabs Accounts</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteAllResources('elevenlabs_accounts')}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                          >
                            🗑️ Xóa tất cả
                          </button>
                          <button
                            onClick={() => setShowApiKeyForm(!showApiKeyForm)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                          >
                            + Thêm Account
                          </button>
                        </div>
                      </div>

                      {showApiKeyForm && (
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <div className="flex gap-2 mb-2">
                            <button
                              onClick={() => setBulkMode(false)}
                              className={`px-3 py-1 rounded text-sm ${!bulkMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            >
                              Thêm 1 account
                            </button>
                            <button
                              onClick={() => setBulkMode(true)}
                              className={`px-3 py-1 rounded text-sm ${bulkMode ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            >
                              Thêm nhiều accounts (bulk)
                            </button>
                          </div>
                          
                          {bulkMode ? (
                            <textarea
                              placeholder="Paste nhiều accounts, mỗi account 1 dòng (email:password hoặc email|password)&#10;user1@example.com:password1&#10;user2@example.com|password2"
                              className="w-full px-4 py-2 border rounded mb-2 font-mono text-sm"
                              rows={10}
                              value={newApiKey}
                              onChange={(e) => setNewApiKey(e.target.value)}
                            />
                          ) : (
                            <div className="space-y-2">
                              <input
                                type="email"
                                placeholder="Email (example@hotmail.com)"
                                className="w-full px-4 py-2 border rounded"
                                value={newApiKey.split(':')[0] || ''}
                                onChange={(e) => {
                                  const password = newApiKey.split(':')[1] || '';
                                  setNewApiKey(`${e.target.value}:${password}`);
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Password"
                                className="w-full px-4 py-2 border rounded"
                                value={newApiKey.split(':')[1] || ''}
                                onChange={(e) => {
                                  const email = newApiKey.split(':')[0] || '';
                                  setNewApiKey(`${email}:${e.target.value}`);
                                }}
                              />
                            </div>
                          )}
                          
                          {bulkProgress.loading && (
                            <div className="mb-2 mt-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Đang thêm...</span>
                                <span>{bulkProgress.current}/{bulkProgress.total}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={addElevenLabsAccount}
                              disabled={bulkProgress.loading}
                              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {bulkProgress.loading ? 'Đang xử lý...' : (bulkMode ? 'Thêm tất cả' : 'Thêm')}
                            </button>
                            <button
                              onClick={() => {
                                setShowApiKeyForm(false);
                                setBulkMode(false);
                                setNewApiKey('');
                              }}
                              disabled={bulkProgress.loading}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {resources?.elevenlabs_accounts?.map((acc) => (
                          <div
                            key={acc.id}
                            className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{acc.email}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                <span className="inline-block mr-3">💰 {acc.credits} credits</span>
                                <span className="inline-block mr-3">🎯 {acc.tier}</span>
                                <span className={`inline-block px-2 py-0.5 rounded text-xs ${acc.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {acc.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteResource('elevenlabs-accounts', acc.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        ))}
                        {(!resources?.elevenlabs_accounts || resources.elevenlabs_accounts.length === 0) && (
                          <p className="text-gray-500 text-center py-8">Chưa có account nào</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-6xl mb-4">👈</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Chọn một user để quản lý resources
                </h3>
                <p className="text-gray-500">
                  Hoặc tạo user mới bằng nút "+ New" bên trái
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
