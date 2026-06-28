import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';

const Applications = () => {
  const { apiClient } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showInstall, setShowInstall] = useState(null);
  const [scanning, setScanning] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [form, setForm] = useState({ name: '', url: '', description: '', language: 'javascript', framework: '', environment: 'development' });

  const fetchApps = async () => {
    try {
      const res = await apiClient.get('/applications');
      setApps(res.data.data || []);
    } catch (err) {
      console.error('Error fetching apps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApps(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/applications', form);
      setShowForm(false);
      setForm({ name: '', url: '', description: '', language: 'javascript', framework: '', environment: 'development' });
      fetchApps();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating application');
    }
  };

  const handleScan = async (appId) => {
    setScanning(appId);
    setScanResult(null);
    try {
      const res = await apiClient.post(`/scan/${appId}`);
      setScanResult(res.data.data);
    } catch (err) {
      alert('Scan failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setScanning(null);
    }
  };

  const handleDelete = async (appId) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await apiClient.delete(`/applications/${appId}`);
      fetchApps();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const installCode = (agentKey) => `# Install the BlackNode monitoring agent
npm install blacknode-agent

# Add to your Express/Node.js app:
const BlackNodeAgent = require('blacknode-agent');

const agent = new BlackNodeAgent({
  serverUrl: '${window.location.origin}/api',
  agentKey: '${agentKey}',
  appUrl: '${form.url || 'http://your-app.com'}',
});

app.use(agent.middleware());

# That's it! All HTTP traffic is now monitored in real-time.`;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">📦 Applications</h1>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-lg font-medium transition">
            + Add Application
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
            <h2 className="text-xl font-bold mb-4">Register New Application</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <input placeholder="App Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none" required />
              <input placeholder="URL (https://your-app.com)" value={form.url} onChange={e => setForm({...form, url: e.target.value})}
                className="px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none" required />
              <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none col-span-2" />
              <select value={form.language} onChange={e => setForm({...form, language: e.target.value})}
                className="px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none">
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="php">PHP</option>
                <option value="go">Go</option>
                <option value="other">Other</option>
              </select>
              <input placeholder="Framework (Express, Django, etc.)" value={form.framework} onChange={e => setForm({...form, framework: e.target.value})}
                className="px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none" />
              <select value={form.environment} onChange={e => setForm({...form, environment: e.target.value})}
                className="px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none">
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
              <div className="col-span-2 flex gap-3">
                <button type="submit" className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium transition">Create</button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg transition">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Install Instructions Modal */}
        {showInstall && (
          <div className="bg-gray-800 rounded-lg p-6 border border-indigo-700 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-indigo-400">📡 Install Monitoring Agent</h2>
              <button onClick={() => setShowInstall(null)} className="text-gray-400 hover:text-white text-xl">&times;</button>
            </div>
            <p className="text-gray-400 text-sm mb-4">Add this middleware to your app to monitor traffic in real-time:</p>
            <pre className="bg-gray-900 p-4 rounded text-sm text-green-400 overflow-x-auto whitespace-pre-wrap">{installCode(showInstall.agentKey)}</pre>
            <div className="mt-4 p-3 bg-gray-900 rounded border border-gray-700">
              <p className="text-gray-400 text-xs mb-1">Agent Key (auto-generated):</p>
              <code className="text-indigo-400 text-sm font-mono break-all">{showInstall.agentKey}</code>
            </div>
          </div>
        )}

        {/* Scan Results */}
        {scanResult && (
          <div className="bg-gray-800 rounded-lg p-6 border border-yellow-700 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-yellow-400">🔍 Scan Results: {scanResult.url}</h2>
              <button onClick={() => setScanResult(null)} className="text-gray-400 hover:text-white text-xl">&times;</button>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div><span className="text-gray-400 text-sm">Total Tests</span><p className="text-2xl font-bold">{scanResult.totalTests}</p></div>
              <div><span className="text-gray-400 text-sm">Threats Found</span><p className="text-2xl font-bold text-red-500">{scanResult.threatsFound}</p></div>
              <div><span className="text-gray-400 text-sm">Blocked</span><p className="text-2xl font-bold text-yellow-500">{scanResult.blocked}</p></div>
              <div><span className="text-gray-400 text-sm">Risk Level</span><p className={`text-2xl font-bold ${scanResult.riskLevel === 'critical' ? 'text-red-500' : scanResult.riskLevel === 'high' ? 'text-orange-500' : 'text-yellow-500'}`}>{scanResult.riskLevel?.toUpperCase()}</p></div>
            </div>
            {scanResult.findings?.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-gray-400 border-b border-gray-700">
                    <th className="p-2 text-left">Type</th><th className="p-2 text-left">Severity</th><th className="p-2 text-left">Description</th><th className="p-2 text-left">Status</th>
                  </tr></thead>
                  <tbody>
                    {scanResult.findings.map((f, i) => (
                      <tr key={i} className="border-b border-gray-700/50">
                        <td className="p-2 font-mono text-xs">{f.eventType}</td>
                        <td className="p-2"><span className={`px-2 py-1 rounded text-xs ${f.severity === 'critical' ? 'bg-red-900 text-red-200' : f.severity === 'high' ? 'bg-orange-900 text-orange-200' : 'bg-yellow-900 text-yellow-200'}`}>{f.severity}</span></td>
                        <td className="p-2 text-gray-300">{f.description}</td>
                        <td className="p-2">{f.blocked ? '🛑' : '📝'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Applications Grid */}
        {loading ? (
          <div className="text-center py-10 text-gray-400 animate-pulse">Loading applications...</div>
        ) : apps.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <p className="text-gray-400 text-lg mb-4">No applications registered yet</p>
            <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg">+ Add Your First App</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map(app => (
              <div key={app._id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-500 transition">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold">{app.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    app.status === 'active' ? 'bg-green-900 text-green-200' :
                    app.status === 'inactive' ? 'bg-gray-600 text-gray-300' :
                    'bg-red-900 text-red-200'
                  }`}>{app.status}</span>
                </div>
                <p className="text-gray-400 text-sm mb-2 truncate">{app.url || 'No URL set'}</p>
                <div className="flex gap-2 text-xs text-gray-500 mb-4">
                  <span className="bg-gray-700 px-2 py-1 rounded">{app.language}</span>
                  {app.framework && <span className="bg-gray-700 px-2 py-1 rounded">{app.framework}</span>}
                  <span className="bg-gray-700 px-2 py-1 rounded">{app.environment}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleScan(app._id)} disabled={scanning === app._id}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-900 px-3 py-2 rounded text-sm font-medium transition">
                    {scanning === app._id ? '⏳ Scanning...' : '🔍 Scan'}
                  </button>
                  <button onClick={() => setShowInstall(app)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded text-sm font-medium transition">
                    📡 Install Agent
                  </button>
                  <button onClick={() => handleDelete(app._id)}
                    className="bg-red-900 hover:bg-red-800 px-3 py-2 rounded text-sm transition">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Applications;
