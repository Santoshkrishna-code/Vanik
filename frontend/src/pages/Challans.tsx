import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import api from '../services/api';

export default function Challans() {
  const [challans, setChallans] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [challansRes, customersRes, productsRes] = await Promise.all([
        api.get('/challans'),
        api.get('/customers'),
        api.get('/products')
      ]);
      setChallans(challansRes.data.data || []);
      setCustomers(customersRes.data.data || []);
      setProducts(productsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch challan data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Filter out incomplete items
      const validItems = items.filter(i => i.productId && i.quantity > 0);
      
      if (validItems.length === 0) {
        alert('Please add at least one valid product to the challan.');
        return;
      }

      await api.post('/challans', {
        customerId,
        items: validItems
      });
      
      setIsModalOpen(false);
      setCustomerId('');
      setItems([{ productId: '', quantity: 1 }]);
      fetchData();
    } catch (error: any) {
      console.error('Failed to create challan', error);
      alert(error.response?.data?.message || 'Failed to create challan');
    }
  };

  const handleConfirm = async (id: string) => {
    if (!window.confirm('Are you sure you want to confirm this challan? This will permanently deduct stock.')) return;
    try {
      await api.post(`/challans/${id}/confirm`);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to confirm challan');
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this challan?')) return;
    try {
      await api.post(`/challans/${id}/cancel`);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel challan');
    }
  };

  const filteredChallans = challans.filter(c => 
    c.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.customer && c.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sales Challans</h1>
          <p className="text-sm text-gray-500 mt-1">Create delivery challans and process inventory dispatch.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          Create Challan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search challan number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Challan #</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Qty</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">Loading challans...</td>
                </tr>
              ) : filteredChallans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-10 w-10 text-gray-300 mb-2" />
                      <p>No challans found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredChallans.map((challan) => (
                  <tr key={challan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 font-semibold text-gray-900">{challan.challanNumber}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{challan.customer?.name || 'Unknown'}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{challan.totalQuantity} items</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        challan.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        challan.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {challan.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(challan.createdAt).toLocaleDateString()}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      {challan.status === 'Draft' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleConfirm(challan.id)} className="text-green-600 hover:text-green-900" title="Confirm & Deduct Stock">
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleCancel(challan.id)} className="text-red-600 hover:text-red-900" title="Cancel Challan">
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Challan Slide-over */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-hidden z-20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-2xl transform transition-transform">
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                  <div className="bg-indigo-700 px-4 py-6 sm:px-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-white">New Sales Challan</h2>
                      <button onClick={() => setIsModalOpen(false)} className="text-indigo-200 hover:text-white">
                        <span className="sr-only">Close panel</span>
                        <XCircle className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between">
                    <div className="divide-y divide-gray-200 px-4 sm:px-6 flex-1">
                      <div className="space-y-6 pt-6 pb-5">
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">Select Customer</label>
                          <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="block w-full rounded-md border-gray-300 py-2.5 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 border bg-white shadow-sm">
                            <option value="" disabled>Select a customer...</option>
                            {customers.map(c => (
                              <option key={c.id} value={c.id}>{c.name} {c.businessName ? `(${c.businessName})` : ''}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-gray-900">Line Items</label>
                            <button type="button" onClick={handleAddItem} className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
                              <Plus className="mr-1 h-4 w-4" /> Add Line
                            </button>
                          </div>

                          <div className="space-y-3">
                            {items.map((item, index) => (
                              <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex-1">
                                  <select required value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 border bg-white">
                                    <option value="" disabled>Select product</option>
                                    {products.map(p => (
                                      <option key={p.id} value={p.id} disabled={p.currentStock <= 0}>
                                        {p.sku} - {p.name} (Stock: {p.currentStock})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="w-24">
                                  <input type="number" min="1" required value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)} className="block w-full rounded-md border-gray-300 py-2 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 border" placeholder="Qty" />
                                </div>
                                <button type="button" onClick={() => handleRemoveItem(index)} className="text-gray-400 hover:text-red-500 p-2">
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                    
                    <div className="flex flex-shrink-0 justify-end px-4 py-4 sm:px-6 border-t border-gray-200 bg-gray-50">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Cancel
                      </button>
                      <button type="submit" className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Create Draft Challan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
