import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { api } from '../lib/axios';
import Modal from '../components/Modal';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [emailError, setEmailError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({ full_name: '', email: '', phone_number: '' });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenModal = (customer: any = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        full_name: customer.full_name,
        email: customer.email,
        phone_number: customer.phone_number || ''
      });
    } else {
      setEditingCustomer(null);
      setFormData({ full_name: '', email: '', phone_number: '' });
    }
    setEmailError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Very strict email validation (only allows common domains to prevent typos)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org|net|co|io|edu|gov)$/i;
    if (!emailRegex.test(formData.email)) {
      setEmailError("Please enter a valid email address ending in .com, .in, .net, etc.");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (formData.phone_number && !phoneRegex.test(formData.phone_number)) {
      alert("Please enter a valid 10-digit phone number (without spaces or dashes)");
      return;
    }

    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      console.error('Failed to save customer', err);
      
      // Check if it's a validation error from the backend (Pydantic)
      if (err.response?.status === 422) {
        alert("Backend Validation Error: The email address is invalid.");
      } else {
        alert(err.response?.data?.detail || 'Failed to save customer. Check if email is unique.');
      }
    }
  };

  const handleDelete = async (id: int) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        fetchCustomers();
      } catch (err) {
        console.error('Failed to delete', err);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-black font-bold mb-2">Customers</h1>
          <p className="text-gray-700 font-bold">Manage your customer relationships.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          <span>Add Customer</span>
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
              placeholder="Search customers..." 
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
                <th className="pb-3 font-medium px-4">Email</th>
                <th className="pb-3 font-medium px-4">Phone</th>
                <th className="pb-3 font-medium px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-700 font-bold">Loading customers...</td></tr>
              ) : customers.filter(c => c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase())).map((customer) => (
                <tr key={customer.id} className="border-b border-black hover:bg-black/5 transition-colors">
                  <td className="py-4 px-4 text-black font-bold font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-sm font-bold">
                      {customer.full_name.charAt(0)}
                    </div>
                    {customer.full_name}
                  </td>
                  <td className="py-4 px-4 text-gray-900 font-bold">{customer.email}</td>
                  <td className="py-4 px-4 text-gray-900 font-bold">{customer.phone_number}</td>
                  <td className="py-4 px-4 flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(customer)} className="p-2 rounded-lg hover:bg-black/10 text-gray-700 font-bold hover:text-primary transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(customer.id)} className="p-2 rounded-lg hover:bg-black/10 text-gray-700 font-bold hover:text-danger transition-colors">
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
        title={editingCustomer ? "Edit Customer" : "Add Customer"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Full Name</label>
            <input 
              required type="text" className="input-glass" 
              value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Email Address</label>
            <input 
              required type="text" className={`input-glass ${emailError ? '!border-danger focus:!ring-danger/50' : ''}`}
              value={formData.email} onChange={e => {
                setFormData({...formData, email: e.target.value});
                if (emailError) setEmailError('');
              }} 
            />
            {emailError && <p className="text-danger text-xs mt-1">{emailError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-bold mb-1">Phone Number (Optional)</label>
            <input 
              type="text" className="input-glass" 
              value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} 
            />
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-black">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Customer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
