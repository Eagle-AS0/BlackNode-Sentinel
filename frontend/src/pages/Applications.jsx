import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';

const Applications = () => {
  const { apiClient } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', url: '', language: 'javascript', framework: '', environment: 'development' });
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(null);
  const [scanResults, setScanResults] = useState(null);

  useEffect(() => { fetchApps(); }, []);

  const fetchApps = async () => {
    try {
      const res = await apiClient.get('/applications');
      setApps(res.data.data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/applications', form);
      setShowForm(false);
      setForm({ name: '', description: '', url: '', language: 'javascript', framework: '', environment: 'development' });
      fetchApps();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create application');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await apiClient.delete(`/applications/${id}`);
      fetchApps();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const handleScan = async (app) => {
    setScanning(app._id);
    setScanResults(null);
    try {
      const res = await apiClient.post(`/scan/${app._id}`);
      setScanResults(res.data.data);
      // Refresh to show new events
      setTimeout(() => fetchApps(), 500);
    } catch (err) {
      setScanResults({ error: err.response?.data?.message || 'Scan failed' });
    } finally {
      setScanning(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Applications</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold transition"
          >
            {showForm ? 'Cancel' : '+ Add Application'}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">New Application</h2>
            {error && <div className="p-4 bg-red-900 text-red-200 rounded mb-4">{error}</div>}
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="My Website" required />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">URL *</label>
                <input type="url" value={form.url} onChange={e => setForm({...form, url: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="https://example.com" required />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-400 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none" rows="2" />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Language</label>
                <select value={form.language} onChange={e => setForm({...form, language: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none">
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="php">PHP</option>
                  <option value="go">Go</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Framework</label>
                <input type="text" value={form.framework} onChange={e => setForm({...form, framework: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="react, django, etc." />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Environment</label>
                <select value={form.environment} onChange={e => setForm({...form, environment: e.target.value})}
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none">
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-bold transition">
                  Create
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Scan Results */}
        {scanResults && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">🔍 Scan Results</h2>
              <button onClick={() => setScanResults(null)} className="text-gray-400 hover:text-white">✕ Close</button>
            </div>
            {scanResults.error ? (
              <div className="p-4 bg-red-900 text-red-200 rounded">{scanResults.error}</div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-700 rounded p-4 text-center">
                    <p className="text-gray-400 text-sm">Tests Run</p>
                    <p className="text-2xl font-bold">{scanResults.totalTests || 0}</p>
                  </div>
                  <div className="bg-gray-700 rounded p-4 text-center">
                    <p className="text-gray-400 text-sm">Threats Found</p>
                    <p className="text-2xl font-bold text-red-500">{scanResults.threatsFound || 0}</p>
                  </div>
                  <div className="bg-gray-700 rounded p-4 text-center">
                    <p className="text-gray-400 text-sm">Blocked</p>
                    <p className="text-2xl font-bold text-green-500">{scanResults.blocked || 0}</p>
                  </div>
                  <div className="bg-gray-700 rounded p-4 text-center">
                    <p className="text-gray-400 text-sm">Risk Level</p>
                    <p className={`text-2xl font-bold ${scanResults.riskLevel === 'critical' ? 'text-red-500' : scanResults.riskLevel === 'high' ? 'text-orange-500' : scanResults.riskLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                      {(scanResults.riskLevel || 'low').toUpperCase()}
                    </p>
                  </div>
                </div>
                {scanResults.findings && scanResults.findings.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-300">Findings:</h3>
                    {scanResults.findings.map((f, i) => (
                      <div key={i} className={`p-3 rounded flex justify-between items-center ${f.blocked ? 'bg-red-900/30 border border-red-800' : 'bg-yellow-900/30 border border-yellow-800'}`}>
                        <div>
                          <span className={`px-2 py-1 rounded text-xs font-bold mr-2 ${f.severity === 'critical' ? 'bg-red-600' : f.severity === 'high' ? 'bg-orange-600' : f.severity === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'}`}>
                            {f.severity.toUpperCase()}
                          </span>
                          <span className="font-medium">{f.eventType}</span>
                          <span className="text-gray-400 ml-2">— {f.description}</span>
                        </div>
                        <span className="text-sm">{f.blocked ? '🛑 Blocked' : '⚠️ Logged'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : apps.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <p className="text-gray-400 text-lg">No applications yet. Click "+ Add Application" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map(app => (
              <div key={app._id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{app.name}</h3>
                  <button onClick={() => handleDelete(app._id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                </div>
                {app.description && <p className="text-gray-400 mb-4">{app.description}</p>}
                {app.url && <p className="text-blue-400 text-sm mb-2">🔗 {app.url}</p>}
                <div className="flex flex-wrap gap-2 mt-4">
                  {app.language && <span className="bg-gray-700 px-3 py-1 rounded text-sm">{app.language}</span>}
                  {app.framework && <span className="bg-gray-700 px-3 py-1 rounded text-sm">{app.framework}</span>}
                  <span className={`px-3 py-1 rounded text-sm ${
                    app.environment === 'production' ? 'bg-red-900 text-red-200' :
                    app.environment === 'staging' ? 'bg-yellow-900 text-yellow-200' :
                    'bg-green-900 text-green-200'
                  }`}>{app.environment}</span>
                </div>
                <button
                  onClick={() => handleScan(app)}
                  disabled={scanning === app._id}
                  className={`mt-4 w-full py-2 rounded font-bold transition ${
                    scanning === app._id
                      ? 'bg-gray-600 cursor-wait'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {scanning === app._id ? '⏳ Scanning...' : '🔍 Scan for Vulnerabilities'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Applications;
