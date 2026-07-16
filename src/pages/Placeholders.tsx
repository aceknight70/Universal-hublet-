import React from 'react';

export function Placeholder({ title, roleRequired }: { title: string, roleRequired?: string }) {
  return (
    <div className="p-8 text-center flex-1 flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-sm border max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        {roleRequired && <p className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-4">{roleRequired} Only</p>}
        <p className="text-gray-600">This module is currently under construction per the master specification.</p>
      </div>
    </div>
  );
}
