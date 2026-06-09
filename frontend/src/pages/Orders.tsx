import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Download, Package } from 'lucide-react';
import { api } from '../lib/axios';
import Modal from '../components/Modal';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/customers'),
        api.get('/products')
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleOpenModal = () => {
    setCustomerId('');
    setItems([{ product_id: '', quantity: 1 }]);
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const handleUpdateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || items.some(item => !item.product_id)) {
      alert("Please select a customer and products.");
      return;
    }

    const payload = {
      customer_id: parseInt(customerId),
      items: items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity.toString()) }))
    };

    try {
      await api.post('/orders', payload);
      setIsModalOpen(false);
      fetchAll();
    } catch (err: any) {
      console.error('Failed to create order', err);
      alert(err.response?.data?.detail || 'Failed to create order. Check stock availability.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to cancel and delete this order? (Stock will be restored)')) {
      try {
        await api.delete(`/orders/${id}`);
        fetchAll();
      } catch (err) {
        console.error('Failed to delete order', err);
      }
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.put(`/orders/${id}/status?status=${status}`);
      fetchAll();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const exportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer ID', 'Total Amount', 'Status'];
    const rows = orders.map(o => [
      `#ORD-${1000 + o.id}`, 
      new Date(o.created_at).toLocaleDateString(), 
      `CUST-${o.customer_id}`, 
      o.total_amount.toFixed(2), 
      o.status
    ]);
    const csvString = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvString);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-black font-bold mb-2">Orders</h1>
          <p className="text-gray-700 font-bold">Manage and track customer orders.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            <span>Export CSV</span>
          </button>
          <button onClick={handleOpenModal} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 font-bold" size={18} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="input-glass !pl-10 w-80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-700 font-bold border-b border-border">
                <th className="pb-3 font-medium px-4">Order ID</th>
                <th className="pb-3 font-medium px-4">Date</th>
                <th className="pb-3 font-medium px-4">Customer</th>
                <th className="pb-3 font-medium px-4">Total</th>
                <th className="pb-3 font-medium px-4">Status</th>
                <th className="pb-3 font-medium px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-700 font-bold">Loading orders...</td></tr>
              ) : orders.filter(o => o.status.toLowerCase().includes(searchQuery.toLowerCase()) || `ORD-${1000 + o.id}`.toLowerCase().includes(searchQuery.toLowerCase())).map((order) => {
                const customer = customers.find(c => c.id === order.customer_id);
                return (
                  <tr key={order.id} className="border-b border-black hover:bg-black/5 transition-colors">
                    <td className="py-4 px-4 text-black font-bold font-medium">#ORD-{1000 + order.id}</td>
                    <td className="py-4 px-4 text-gray-700 font-bold">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-gray-900 font-bold">{customer ? customer.full_name : `CUST-${order.customer_id}`}</td>
                    <td className="py-4 px-4 text-gray-900 font-bold">₹{order.total_amount.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border appearance-none cursor-pointer outline-none ${
                          order.status === 'Delivered' ? 'bg-success/20 text-success border-success/30' : 
                          order.status === 'Processing' ? 'bg-accent/20 text-accent border-accent/30' :
                          'bg-primary/20 text-primary border-primary/30'
                        }`}
                      >
                        <option value="Pending" className="bg-white">Pending</option>
                        <option value="Processing" className="bg-white">Processing</option>
                        <option value="Delivered" className="bg-white">Delivered</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 flex justify-end gap-2">
                      <button onClick={() => handleDelete(order.id)} className="p-2 rounded-lg hover:bg-black/10 text-gray-700 font-bold hover:text-danger transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Order"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Select Customer</label>
            <select 
              required className="input-glass"
              value={customerId} onChange={e => setCustomerId(e.target.value)}
            >
              <option value="" className="bg-white">-- Select Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id} className="bg-white">{c.full_name} ({c.email})</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 font-bold mb-2">Order Items</label>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-start">
                <select 
                  required className="input-glass flex-1"
                  value={item.product_id} onChange={e => handleUpdateItem(idx, 'product_id', e.target.value)}
                >
                  <option value="" className="bg-white">-- Select Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.quantity <= 0} className="bg-white">
                      {p.name} (₹{p.price}) - {p.quantity} in stock
                    </option>
                  ))}
                </select>
                <input 
                  required type="number" min="1" className="input-glass !w-24" placeholder="Qty"
                  value={item.quantity} onChange={e => handleUpdateItem(idx, 'quantity', e.target.value)} 
                />
                {items.length > 1 && (
                  <button type="button" onClick={() => handleRemoveItem(idx)} className="p-2 mt-1 text-danger hover:bg-danger/20 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddItem} className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 mt-2">
              <Package size={14} /> Add another product
            </button>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-black">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Order</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
