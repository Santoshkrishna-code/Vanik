import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import api from '../services/api';

// Generate some dummy historical data for the beautiful chart
const salesData = [
  { name: 'Jan', total: 4000, expected: 2400 },
  { name: 'Feb', total: 3000, expected: 1398 },
  { name: 'Mar', total: 2000, expected: 9800 },
  { name: 'Apr', total: 2780, expected: 3908 },
  { name: 'May', total: 1890, expected: 4800 },
  { name: 'Jun', total: 2390, expected: 3800 },
  { name: 'Jul', total: 3490, expected: 4300 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    challans: 0,
    lowStock: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all necessary data to compute stats
        const [customersRes, productsRes, challansRes, movementsRes] = await Promise.all([
          api.get('/customers'),
          api.get('/products'),
          api.get('/challans'),
          api.get('/inventory/movements')
        ]);

        const products = productsRes.data.data || [];
        const challans = challansRes.data.data || [];
        const movements = movementsRes.data.data || [];

        // Compute KPIs
        const lowStockCount = products.filter((p: any) => p.currentStock <= p.minimumStock).length;
        
        // Estimate revenue from Confirmed challans (if we had total amount, otherwise use mock for now or calculate from items)
        // For now, let's just use the challan count as a metric
        const confirmedChallans = challans.filter((c: any) => c.status === 'Confirmed');

        setStats({
          customers: customersRes.data.data?.length || 0,
          products: products.length,
          challans: challans.length,
          lowStock: lowStockCount,
          totalRevenue: confirmedChallans.length * 15000 // Mock average order value for aesthetics
        });

        // Mix movements and challans for recent activity feed
        const activities = [
          ...challans.map((c: any) => ({
            id: c.id,
            title: `New Challan: ${c.challanNumber}`,
            subtitle: `Status: ${c.status}`,
            date: c.createdAt,
            type: 'challan'
          })),
          ...movements.map((m: any) => ({
            id: m.id,
            title: `Stock ${m.type}: ${m.quantity} units`,
            subtitle: m.reason || 'Inventory update',
            date: m.createdAt,
            type: 'stock'
          }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        setRecentActivities(activities);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
        <div className="bg-white rounded-md shadow-sm border border-gray-200 px-4 py-2 text-sm text-gray-600 font-medium">
          Last 30 Days
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-50 rounded-lg p-3">
                <IndianRupee className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{stats.totalRevenue.toLocaleString()}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <ArrowUpRight className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                      <span className="sr-only">Increased by</span>
                      12%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-50 rounded-lg p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-gray-900">{stats.customers}</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <ArrowUpRight className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                      4.5%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:border-emerald-100 transition-colors">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-emerald-50 rounded-lg p-3">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Sales Challans</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-gray-900">{stats.challans}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:border-rose-100 transition-colors">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-rose-50 rounded-lg p-3">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Alerts</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-rose-600">{stats.lowStock}</div>
                    {stats.lowStock > 0 && (
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-rose-600">
                        Needs attention
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue Overview</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivities.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivities.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            activity.type === 'challan' ? 'bg-indigo-500' : 'bg-emerald-500'
                          }`}>
                            {activity.type === 'challan' ? (
                              <Package className="h-4 w-4 text-white" />
                            ) : (
                              <TrendingUp className="h-4 w-4 text-white" />
                            )}
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-900 font-medium">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.subtitle}</p>
                          </div>
                          <div className="whitespace-nowrap text-right text-xs text-gray-500">
                            {new Date(activity.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
                {recentActivities.length === 0 && (
                  <li className="text-sm text-gray-500 text-center py-4">No recent activity found.</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
