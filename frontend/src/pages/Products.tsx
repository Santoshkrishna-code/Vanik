import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data.data)).catch(console.error);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-800">Products List</h3>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          Add Product
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
              <th className="p-4 font-medium">SKU</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4">{p.sku}</td>
                <td className="p-4">{p.name}</td>
                <td className="p-4">₹{p.unitPrice}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${p.currentStock <= p.minimumStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {p.currentStock}
                  </span>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
