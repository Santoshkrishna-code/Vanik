import React, { useState, useEffect } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export default function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stock Adjustment Form
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '1',
    type: 'IN', // IN or OUT
    reason: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inventory/move', {
        productId: formData.productId,
        quantity: parseInt(formData.quantity, 10),
        type: formData.type,
        reason: formData.reason
      });
      setIsModalOpen(false);
      setFormData({ productId: '', quantity: '1', type: 'IN', reason: '' });
      fetchProducts(); // Refresh stock levels
    } catch (error: any) {
      console.error('Failed to adjust stock', error);
      alert(error.response?.data?.message || 'Failed to adjust stock');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track stock levels and manually adjust quantities.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto transition-colors"
        >
          <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
          Adjust Stock
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
              placeholder="Search inventory..."
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
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">Loading inventory...</td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLowStock = product.currentStock <= product.minimumStock;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 font-medium text-gray-900">{product.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-gray-500">{product.sku}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="flex items-center font-semibold">
                          <span className={isLowStock ? 'text-red-600' : 'text-gray-900'}>
                            {product.currentStock}
                          </span>
                          {isLowStock && <AlertTriangle className="ml-2 h-4 w-4 text-red-500" />}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {product.location || '-'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button 
                          onClick={() => {
                            setFormData({...formData, productId: product.id, type: 'IN'});
                            setIsModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mx-2"
                        >
                          +IN
                        </button>
                        <button 
                          onClick={() => {
                            setFormData({...formData, productId: product.id, type: 'OUT'});
                            setIsModalOpen(true);
                          }}
                          className="text-rose-600 hover:text-rose-900"
                        >
                          -OUT
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            <div className="inline-block transform overflow-hidden rounded-xl bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle border border-gray-100">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-bold leading-6 text-gray-900 mb-4">Manual Stock Adjustment</h3>
                <form onSubmit={handleStockAdjustment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product</label>
                    <select required value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm bg-white">
                      <option value="" disabled>Select a product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.sku} - {p.name} (Current: {p.currentStock})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Movement Type</label>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <div 
                          className={`cursor-pointer border rounded-md py-2 px-3 flex items-center justify-center text-sm font-medium ${formData.type === 'IN' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                          onClick={() => setFormData({...formData, type: 'IN'})}
                        >
                          <ArrowDownToLine className="mr-2 h-4 w-4" /> IN
                        </div>
                        <div 
                          className={`cursor-pointer border rounded-md py-2 px-3 flex items-center justify-center text-sm font-medium ${formData.type === 'OUT' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                          onClick={() => setFormData({...formData, type: 'OUT'})}
                        >
                          <ArrowUpFromLine className="mr-2 h-4 w-4" /> OUT
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <input type="number" min="1" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
                    <input type="text" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder="e.g. Returned damaged, Stock take" className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
                  </div>
                  
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button type="submit" className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm">
                      Execute Adjustment
                    </button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
