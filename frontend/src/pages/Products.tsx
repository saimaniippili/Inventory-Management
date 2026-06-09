import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { api } from '../lib/axios';
import Modal from '../components/Modal';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', sku: '', price: '', quantity: '' });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        name: product.name, 
        sku: product.sku, 
        price: product.price.toString(), 
        quantity: product.quantity.toString() 
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', sku: '', price: '', quantity: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      sku: formData.sku,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity)
    };
    
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Failed to save product', err);
      alert('Failed to save product. Check if SKU is unique.');
    }
  };

  const handleDelete = async (id: int) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error('Failed to delete', err);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-black font-bold mb-2">Products</h1>
          <p className="text-gray-700 font-bold">Manage your inventory catalog.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          <span>Add Product</span>
        </button>
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
              placeholder="Search products..." 
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
                <th className="pb-3 font-medium px-4">Name</th>
                <th className="pb-3 font-medium px-4">SKU</th>
                <th className="pb-3 font-medium px-4">Price</th>
                <th className="pb-3 font-medium px-4">Stock</th>
                <th className="pb-3 font-medium px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-700 font-bold">Loading products...</td></tr>
              ) : products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase())).map((product) => (
                <tr key={product.id} className="border-b border-black hover:bg-black/5 transition-colors">
                  <td className="py-4 px-4 text-black font-bold font-medium">{product.name}</td>
                  <td className="py-4 px-4 text-gray-700 font-bold font-mono text-sm">{product.sku}</td>
                  <td className="py-4 px-4 text-gray-900 font-bold">₹{product.price.toFixed(2)}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      product.quantity > 10 ? 'bg-success/20 text-success border-success/30' : 
                      product.quantity > 0 ? 'bg-accent/20 text-accent border-accent/30' : 
                      'bg-danger/20 text-danger border-danger/30'
                    }`}>
                      {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td className="py-4 px-4 flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(product)} className="p-2 rounded-lg hover:bg-black/10 text-gray-700 font-bold hover:text-primary transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg hover:bg-black/10 text-gray-700 font-bold hover:text-danger transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProduct ? "Edit Product" : "Add Product"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Product Name</label>
            <input 
              required type="text" className="input-glass" 
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-bold mb-1">SKU</label>
            <input 
              required type="text" className="input-glass" 
              value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Price (₹)</label>
              <input 
                required type="number" step="0.01" min="0" className="input-glass" 
                value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Initial Stock</label>
              <input 
                required type="number" min="0" className="input-glass" 
                value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-black">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Product</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
