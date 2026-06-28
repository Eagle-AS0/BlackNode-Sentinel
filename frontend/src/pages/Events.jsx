import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';

const Events = () => {
  const { apiClient } = useAuth();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (severityFilter) params.severity = severityFilter;
      if (typeFilter) params.eventType = typeFilter;

      const [eventsRes, statsRes] = await Promise.all([
        apiClient.get('/events', { params }),
        apiClient.get('/events/stats/overview'),
      ]);
      setEvents(eventsRes.data.data || []);
      setStats(statsRes.data.data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [apiClient, severityFilter, typeFilter]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getSeverityColor = (s) => {
    switch (s) {
      case 'critical': return 'bg-red-900 text-red-200 border-red-700';
      case 'high': return 'bg-orange-900 text-orange-200 border-orange-700';
      case 'medium': return 'bg-yellow-900 text-yellow-200 border-yellow-700';
      case 'low': return 'bg-blue-900 text-blue-200 border-blue-700';
      default: return 'bg-gray-700 text-gray-200 border-gray-600';
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      sql_injection: '💉', xss: '📜', path_traversal: '🚶',
      command_injection: '⚡', brute_force: '🔨', ddos: '🌐',
      port_scan: '🔍', malware: '🦠', suspicious: '⚠️', anomaly: '📊',
    };
    return icons[type] || '⚠️';
  };

  const totalEvents = stats?.total?.[0]?.count || 0;
  const blockedCount = stats?.blocked?.[0]?.count || 0;
  const criticalCount = stats?.bySeverity?.find(s => s._id === 'critical')?.count || 0;
  const highCount = stats?.bySeverity?.find(s => s._id === 'high')?.count || 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">📋 Security Events</h1>
          <div className="flex items-center gap-4">
            <span className="text-green-400 text-sm animate-pulse">● LIVE</span>
            {lastUpdate && <span className="text-gray-500 text-xs">Updated {lastUpdate.toLocaleTimeString()}</span>}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <h3 className="text-gray-400 text-sm">Total Events</h3>
            <p className="text-3xl font-bold">{totalEvents}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-red-900">
            <h3 className="text-gray-400 text-sm">🔴 Critical</h3>
            <p className="text-3xl font-bold text-red-500">{criticalCount}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-orange-900">
            <h3 className="text-gray-400 text-sm">🟠 High</h3>
            <p className="text-3xl font-bold text-orange-500">{highCount}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-green-900">
            <h3 className="text-gray-400 text-sm">🚫 Blocked</h3>
            <p className="text-3xl font-bold text-green-500">{blockedCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
            className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:outline-none">
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:outline-none">
            <option value="">All Types</option>
            <option value="sql_injection">SQL Injection</option>
            <option value="xss">XSS</option>
            <option value="path_traversal">Path Traversal</option>
            <option value="command_injection">Command Injection</option>
            <option value="brute_force">Brute Force</option>
            <option value="ddos">DDoS</option>
            <option value="port_scan">Port Scan</option>
            <option value="malware">Malware</option>
            <option value="suspicious">Suspicious</option>
            <option value="anomaly">Anomaly</option>
          </select>
        </div>

        {/* Events Table */}
        {events.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <p className="text-gray-400 text-lg mb-2">No security events yet</p>
            <p className="text-gray-500 text-sm">Install the BlackNode agent on your app to start monitoring</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-750 border-b border-gray-700">
                <tr>
                  <th className="p-4 text-gray-400">Type</th>
                  <th className="p-4 text-gray-400">Severity</th>
                  <th className="p-4 text-gray-400">Description</th>
                  <th className="p-4 text-gray-400">Source IP</th>
                  <th className="p-4 text-gray-400">Path</th>
                  <th className="p-4 text-gray-400">Score</th>
                  <th className="p-4 text-gray-400">Status</th>
                  <th className="p-4 text-gray-400">Time</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event._id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition">
                    <td className="p-4">
                      <span className="mr-2">{getTypeIcon(event.eventType)}</span>
                      <span className="font-mono text-xs">{event.eventType?.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                        {event.severity}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300 max-w-xs truncate">{event.description || '-'}</td>
                    <td className="p-4 font-mono text-xs text-gray-400">{event.source?.ip || 'N/A'}</td>
                    <td className="p-4 font-mono text-xs text-gray-400 max-w-[150px] truncate">{event.source?.path || 'N/A'}</td>
                    <td className="p-4 text-xs">{event.mlScore ? (event.mlScore * 100).toFixed(0) + '%' : '-'}</td>
                    <td className="p-4">
                      {event.blocked ? (
                        <span className="text-red-400 font-medium">🛑 Blocked</span>
                      ) : (
                        <span className="text-yellow-400">📝 Logged</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500 text-xs whitespace-nowrap">{new Date(event.createdAt).toLocaleString()}</td>
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
