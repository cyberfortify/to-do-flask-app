import React from 'react';

export default function StatsCard({ total, completed, pending }) {
  return (
    <div className="d-flex justify-content-evenly mt-5">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
        <h3 className="text-2xl font-bold text-blue-600">{total}</h3>
        <p className="text-gray-600">Total Tasks</p>
      </div>
      <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
        <h3 className="text-2xl font-bold text-green-600">{completed}</h3>
        <p className="text-gray-600">Completed</p>
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-center">
        <h3 className="text-2xl font-bold text-amber-600">{pending}</h3>
        <p className="text-gray-600">Pending</p>
      </div>
    </div>
  );
}