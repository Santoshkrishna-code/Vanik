import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Challans() {
  const [challans, setChallans] = useState([]);

  useEffect(() => {
    api.get('/challans').then(res => setChallans(res.data.data)).catch(console.error);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-800">Sales Challans</h3>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          Create Challan
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
              <th className="p-4 font-medium">Challan #</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {challans.map((c: any) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 text-indigo-600 font-medium">{c.challanNumber}</td>
                <td className="p-4">{c.customer?.name || 'Unknown'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs 
                    ${c.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                      c.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'}`
                  }>
                    {c.status}
                  </span>
                </td>
                <td className="p-4">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {challans.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No challans found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
