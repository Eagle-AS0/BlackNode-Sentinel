import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { apiClient } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        apiClient.get('/events/stats/overview'),
        apiClient.get('/events?limit=20'),
      ]);
      setStats(statsRes.data.data);
      setEvents(eventsRes.data.data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 seconds for real-time feel
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) return <><Navbar /><div className="min-h-screen bg-gray-900 text-white flex items-center justify-center"><div className="text-xl animate-pulse">Loading dashboard...</div></div></>;

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#6b7280'];

  const totalEvents = stats?.total?.[0]?.count || 0;
  const criticalCount = stats?.bySeverity?.find(s => s._id === 'critical')?.count || 0;
  const highCount = stats?.bySeverity?.find(s => s._id === 'high')?.count || 0;
  const mediumCount = stats?.bySeverity?.find(s => s._id === 'medium')?.count || 0;
  const blockedCount = stats?.blocked?.[0]?.count || 0;
  const blockedPct = totalEvents > 0 ? Math.round((blockedCount / totalEvents) * 100) : 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">🛡️ Security Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-green-400 text-sm animate-pulse">● LIVE</span>
            {lastUpdate && <span className="text-gray-500 text-xs">Updated {lastUpdate.toLocaleTimeString()}</span>}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-1">Total Events</h3>
            <p className="text-3xl font-bold text-white">{totalEvents}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-red-900">
            <h3 className="text-gray-400 text-sm mb-1">🔴 Critical</h3>
            <p className="text-3xl font-bold text-red-500">{criticalCount}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-orange-900">
            <h3 className="text-gray-400 text-sm mb-1">🟠 High</h3>
            <p className="text-3xl font-bold text-orange-500">{highCount}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-yellow-900">
            <h3 className="text-gray-400 text-sm mb-1">🟡 Medium</h3>
            <p className="text-3xl font-bold text-yellow-500">{mediumCount}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5 border border-green-900">
            <h3 className="text-gray-400 text-sm mb-1">🚫 Blocked</h3>
            <p className="text-3xl font-bold text-green-500">{blockedCount} <span className="text-lg">({blockedPct}%)</span></p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-bold mb-4">Threat Distribution</h2>
            {stats?.byType?.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={stats.byType} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label={({ _id, count }) => `${_id} (${count})`}>
                    {stats.byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-[280px] flex items-center justify-center text-gray-500">No data yet — send traffic to your monitored apps</div>}
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-lg font-bold mb-4">Severity Breakdown</h2>
            {stats?.bySeverity?.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.bySeverity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="_id" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                  <Bar dataKey="count" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-[280px] flex items-center justify-center text-gray-500">No data yet</div>}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-bold mb-4">🚨 Recent Security Events</h2>
          {events.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg">No events detected yet</p>
              <p className="text-sm mt-2">Install the BlackNode agent on your app to start monitoring</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-700 text-gray-400">
                  <tr>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Severity</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Source</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 15).map(event => (
                    <tr key={event._id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition">
                      <td className="py-3 font-mono text-xs">{event.eventType?.replace(/_/g, ' ')}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          event.severity === 'critical' ? 'bg-red-900 text-red-200' :
                          event.severity === 'high' ? 'bg-orange-900 text-orange-200' :
                          event.severity === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                          event.severity === 'low' ? 'bg-blue-900 text-blue-200' :
                          'bg-gray-700 text-gray-300'
                        }`}>{event.severity}</span>
                      </td>
                      <td className="py-3 text-gray-300 max-w-xs truncate">{event.description || '-'}</td>
                      <td className="py-3 font-mono text-xs text-gray-400">{event.source?.ip || 'N/A'}</td>
                      <td className="py-3">{event.blocked ? <span className="text-red-400">🛑 Blocked</span> : <span className="text-yellow-400">📝 Logged</span>}</td>
                      <td className="py-3 text-gray-500 text-xs">{new Date(event.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
