import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, CartesianGrid, LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '../context/AppContext.jsx';

const stats = [
  { label: 'Open tasks', value: 24 },
  { label: 'In progress', value: 9 },
  { label: 'Completed', value: 72 },
  { label: 'Import ready', value: 4 }
];

export default function Dashboard() {
  const { translate } = useApp();
  const navigate = useNavigate();
  const chartData = useMemo(() => [
    { name: 'Mon', tasks: 12, trend: 30 },
    { name: 'Tue', tasks: 18, trend: 45 },
    { name: 'Wed', tasks: 20, trend: 52 },
    { name: 'Thu', tasks: 14, trend: 34 },
    { name: 'Fri', tasks: 22, trend: 60 }
  ], []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white mb-4">Welcome to RouteForge</h1>
        <p className="text-xl text-muted max-w-2xl mx-auto">
          Your dynamic app builder is ready. Create, manage, and analyze your data with powerful configuration-driven features.
        </p>
      </div>

      {/* Stats Cards */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={stat.label} className="bg-gradient-to-br from-surface to-surface2 rounded-2xl border border-border p-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                index === 0 ? 'bg-blue-500/20' :
                index === 1 ? 'bg-yellow-500/20' :
                index === 2 ? 'bg-green-500/20' :
                'bg-purple-500/20'
              }`}>
                <svg className={`w-6 h-6 ${
                  index === 0 ? 'text-blue-400' :
                  index === 1 ? 'text-yellow-400' :
                  index === 2 ? 'text-green-400' :
                  'text-purple-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {index === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  {index === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  {index === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  {index === 3 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />}
                </svg>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Charts Section */}
      <section className="grid gap-8 lg:grid-cols-2">
        <div className="bg-surface/80 backdrop-blur-xl rounded-2xl border border-border p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Weekly Performance</h2>
            <div className="flex items-center text-green-400">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">+12% this week</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#2A2A4A" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#A0AEC0" fontSize={12} />
              <YAxis stroke="#A0AEC0" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid #2A2A4A', borderRadius: '8px' }}
                labelStyle={{ color: '#FFFFFF' }}
              />
              <Line 
                type="monotone" 
                dataKey="trend" 
                stroke="#6C63FF" 
                strokeWidth={3} 
                dot={{ fill: '#6C63FF', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#6C63FF', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-surface/80 backdrop-blur-xl rounded-2xl border border-border p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Task Distribution</h2>
            <div className="flex items-center text-blue-400">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span className="text-sm font-medium">Daily breakdown</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#2A2A4A" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#A0AEC0" fontSize={12} />
              <YAxis stroke="#A0AEC0" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid #2A2A4A', borderRadius: '8px' }}
                labelStyle={{ color: '#FFFFFF' }}
              />
              <Bar 
                dataKey="tasks" 
                fill="#6C63FF" 
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="bg-gradient-to-r from-primary/10 to-indigo-500/10 rounded-2xl border border-primary/20 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-muted mb-6 max-w-md mx-auto">
            Navigate to Tasks to create your first items, or use CSV import to bulk upload data.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => navigate('/tasks')}
              className="px-6 py-3 bg-gradient-to-r from-primary to-indigo-500 text-white rounded-xl font-semibold hover:from-primary/80 hover:to-indigo-500/80 transition-all transform hover:scale-105 shadow-lg"
            >
              Go to Tasks
            </button>
            <button 
              onClick={() => navigate('/tasks')}
              className="px-6 py-3 border border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all"
            >
              Import CSV
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
