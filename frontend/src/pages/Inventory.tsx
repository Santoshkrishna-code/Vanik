import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Inventory() {
  const [movements, setMovements] = useState([]);

  useEffect(() => {
    api.get('/stock-movements').then(res => setMovements(res.data.data)).catch(console.error);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-800">Stock Movements</h3>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          Stock Entry
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Qty</th>
              <th className="p-4 font-medium">Reason</th>
              <th className="p-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m: any) => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 font-medium">{m.product?.name} <span className="text-gray-400 text-xs block">{m.product?.sku}</span></td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${m.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {m.type}
                  </span>
                </td>
                <td className="p-4">{m.quantity}</td>
                <td className="p-4 text-sm text-gray-600">{m.reason || '-'}</td>
                <td className="p-4 text-sm text-gray-500">{new Date(m.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {movements.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No stock movements found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
