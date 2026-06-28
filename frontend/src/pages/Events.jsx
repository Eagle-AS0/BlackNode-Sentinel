import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';

const Events = () => {
  const { apiClient } = useAuth();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => { fetchData(); }, [severityFilter, typeFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (severityFilter) params.severity = severityFilter;
      if (typeFilter) params.eventType = typeFilter;

      const [eventsRes, statsRes] = await Promise.all([
        apiClient.get('/events', { params }),
        apiClient.get('/events/stats/overview'),
      ]);
      setEvents(eventsRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-900 text-red-200';
      case 'high': return 'bg-orange-900 text-orange-200';
      case 'medium': return 'bg-yellow-900 text-yellow-200';
      case 'low': return 'bg-blue-900 text-blue-200';
      default: return 'bg-gray-700 text-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sql_injection': return '💉';
      case 'xss': return '📜';
      case 'brute_force': return '🔨';
      case 'ddos': return '🌐';
      case 'port_scan': return '🔍';
      case 'malware': return '🦠';
      default: return '⚠️';
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-4xl font-bold mb-8">Security Events</h1>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-gray-400 mb-2">Total Events</h3>
              <p className="text-3xl font-bold">{stats.total?.[0]?.count || 0}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-gray-400 mb-2">Critical</h3>
              <p className="text-3xl font-bold text-red-500">
                {stats.bySeverity?.find(s => s._id === 'critical')?.count || 0}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-gray-400 mb-2">High</h3>
              <p className="text-3xl font-bold text-orange-500">
                {stats.bySeverity?.find(s => s._id === 'high')?.count || 0}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-gray-400 mb-2">Blocked</h3>
              <p className="text-3xl font-bold text-green-500">{stats.blocked?.[0]?.count || 0}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
            className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:outline-none">
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:outline-none">
            <option value="">All Types</option>
            <option value="sql_injection">SQL Injection</option>
            <option value="xss">XSS</option>
            <option value="brute_force">Brute Force</option>
            <option value="ddos">DDoS</option>
            <option value="port_scan">Port Scan</option>
            <option value="malware">Malware</option>
          </select>
        </div>

        {/* Events Table */}
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : events.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <p className="text-gray-400 text-lg">No security events detected. 🎉</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-750 border-b border-gray-700">
                <tr>
                  <th className="p-4 text-gray-400">Type</th>
                  <th className="p-4 text-gray-400">Severity</th>
                  <th className="p-4 text-gray-400">Source IP</th>
                  <th className="p-4 text-gray-400">Path</th>
                  <th className="p-4 text-gray-400">Status</th>
                  <th className="p-4 text-gray-400">Time</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event._id} className="border-b border-gray-700 hover:bg-gray-750 transition">
                    <td className="p-4">
                      <span className="mr-2">{getTypeIcon(event.eventType)}</span>
                      {event.eventType?.replace('_', ' ')}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded text-sm font-medium ${getSeverityColor(event.severity)}`}>
                        {event.severity}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm">{event.source?.ip || 'N/A'}</td>
                    <td className="p-4 font-mono text-sm text-gray-400">{event.source?.path || 'N/A'}</td>
                    <td className="p-4">
                      {event.blocked ? (
                        <span className="text-red-400">🛑 Blocked</span>
                      ) : (
                        <span className="text-yellow-400">⚠️ Logged</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(event.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Events;
