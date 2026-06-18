import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { apiClient } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        apiClient.get('/events/stats/overview'),
        apiClient.get('/events'),
      ]);
      setStats(statsRes.data.data);
      setEvents(eventsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  const threatDistribution = stats?.byType || [];
  const COLORS = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4d96ff'];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-4xl font-bold mb-8">Security Dashboard</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 mb-2">Total Events</h3>
            <p className="text-3xl font-bold">{stats?.total?.[0]?.count || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 mb-2">Critical</h3>
            <p className="text-3xl font-bold text-red-500">
              {stats?.bySeverity?.find(s => s._id === 'critical')?.count || 0}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 mb-2">High</h3>
            <p className="text-3xl font-bold text-orange-500">
              {stats?.bySeverity?.find(s => s._id === 'high')?.count || 0}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 mb-2">Blocked</h3>
            <p className="text-3xl font-bold text-green-500">{stats?.blocked?.[0]?.count || 0}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Threat Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={threatDistribution}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {threatDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Events by Severity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.bySeverity || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Recent Events</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Severity</th>
                  <th className="pb-2">Source IP</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 10).map(event => (
                  <tr key={event._id} className="border-b border-gray-700">
                    <td className="py-2">{event.eventType}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        event.severity === 'critical' ? 'bg-red-900 text-red-200' :
                        event.severity === 'high' ? 'bg-orange-900 text-orange-200' :
                        'bg-yellow-900 text-yellow-200'
                      }`}>
                        {event.severity}
                      </span>
                    </td>
                    <td className="py-2">{event.source?.ip || 'N/A'}</td>
                    <td className="py-2">{event.blocked ? '🛑 Blocked' : '⚠️ Logged'}</td>
                    <td className="py-2">{new Date(event.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
