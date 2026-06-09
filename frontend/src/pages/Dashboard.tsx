import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { api } from '../lib/axios';

const StatCard = ({ title, value, icon: Icon, colorClass = "bg-white border-4 border-black" }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[4px] hover:translate-x-[4px] flex items-start gap-4 transition-all duration-200 cursor-pointer"
  >
    <div className={`w-14 h-14 border-4 border-black flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${colorClass}`}>
      <Icon size={28} className="text-black" />
    </div>
    <div>
      <p className="text-black font-black uppercase tracking-widest mb-1 text-sm border-b-2 border-black pb-1 inline-block">{title}</p>
      <h3 className="text-4xl font-black text-black mt-2">{value}</h3>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ products: 0, customers: 0, orders: 0, lowStock: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsRes, customersRes, ordersRes] = await Promise.all([
          api.get('/products'),
          api.get('/customers'),
          api.get('/orders')
        ]);

        const products = productsRes.data;
        const customers = customersRes.data;
        const orders = ordersRes.data;

        const lowStock = products.filter((p: any) => p.quantity < 10);
        setLowStockProducts(lowStock);

        setMetrics({
          products: products.length,
          customers: customers.length,
          orders: orders.length,
          lowStock: lowStock.length
        });

        // Get 5 most recent orders
        const sortedOrders = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        // Map customer names
        const enrichedOrders = sortedOrders.slice(0, 5).map(o => {
          const cust = customers.find((c: any) => c.id === o.customer_id);
          return { ...o, customer_name: cust ? cust.full_name : `Customer ${o.customer_id}` };
        });
        setRecentOrders(enrichedOrders);

        // Group revenue by date (simple implementation)
        const revenueMap: Record<string, number> = {};
        orders.forEach((o: any) => {
          const date = new Date(o.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          revenueMap[date] = (revenueMap[date] || 0) + o.total_amount;
        });
        
        const data = Object.keys(revenueMap).map(date => ({
          name: date,
          revenue: revenueMap[date]
        }));
        
        // Ensure some dummy data if empty
        if (data.length === 0) {
          const today = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          data.push({ name: today, revenue: 0 });
        }
        
        // If there's only 1 point, Recharts won't draw a line. Add a dummy previous day.
        if (data.length === 1) {
          const prevDateStr = "Previous";
          data.unshift({ name: prevDateStr, revenue: 0 });
        }
        setChartData(data);

      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8 text-gray-700 font-bold">Loading dashboard...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-black font-bold mb-2">Dashboard</h1>
        <p className="text-gray-700 font-bold">Welcome back, here's your inventory overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Products" value={metrics.products} icon={Package} />
        <StatCard title="Total Customers" value={metrics.customers} icon={Users} />
        <StatCard title="Total Orders" value={metrics.orders} icon={ShoppingCart} />
        <StatCard title="Low Stock Items" value={metrics.lowStock} icon={AlertTriangle} colorClass={metrics.lowStock > 0 ? "bg-[#EF4444]" : "bg-white"} />
      </div>

      {metrics.lowStock > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card border-danger/30 bg-danger/5"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-danger" />
            <h3 className="text-lg font-bold text-black font-bold">Action Required: Low Stock Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lowStockProducts.slice(0, 3).map(p => (
              <div key={p.id} className="bg-black/20 rounded-lg p-4 border border-black">
                <p className="font-medium text-black font-bold">{p.name}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-700 font-bold">SKU: {p.sku}</span>
                  <span className="text-sm font-bold text-danger">{p.quantity} left</span>
                </div>
              </div>
            ))}
            {lowStockProducts.length > 3 && (
              <div className="bg-black/20 rounded-lg p-4 border border-black flex items-center justify-center">
                <span className="text-sm text-gray-700 font-bold">+{lowStockProducts.length - 3} more low stock items</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
        >
          <h3 className="text-lg font-bold text-black font-bold mb-6">Revenue Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis 
                  stroke="#9ca3af" 
                  width={60}
                  tickFormatter={(value) => `₹${Intl.NumberFormat('en-IN', { notation: "compact", compactDisplay: "short" }).format(value)}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '8px', color: '#FAFAFA' }}
                  itemStyle={{ color: '#FAFAFA' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={6} dot={{ r: 6, fill: '#000000', stroke: '#000000', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <h3 className="text-lg font-bold text-black font-bold mb-6">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-700 font-bold border-b border-border">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-700 font-bold">No orders yet</td></tr>
                ) : recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-black hover:bg-black/5 transition-colors">
                    <td className="py-4 text-black font-bold font-medium">#ORD-{1000 + o.id}</td>
                    <td className="py-4 text-gray-900 font-bold">{o.customer_name}</td>
                    <td className="py-4 text-gray-900 font-bold">₹{o.total_amount.toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-none text-xs font-black border-2 border-black ${
                          o.status === 'Delivered' ? 'bg-[#10B981] text-black' : 
                          o.status === 'Processing' ? 'bg-[#06B6D4] text-black' :
                          'bg-[#FBBF24] text-black'
                        }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
