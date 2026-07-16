import React, { useState } from 'react';

export function InvoiceReceiptGenerator() {
  const [items, setItems] = useState([{ desc: '', price: 0 }]);
  const [customerName, setCustomerName] = useState('');

  const total = items.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Invoice & Receipt Generator</h2>
      
      <div className="bg-white rounded-lg shadow border p-6 flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <h3 className="text-lg font-bold">New Transaction</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Line Items</label>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 p-2 border rounded"
                  value={item.desc}
                  onChange={e => {
                    const newItems = [...items];
                    newItems[idx].desc = e.target.value;
                    setItems(newItems);
                  }}
                  placeholder="Item description"
                />
                <input 
                  type="number" 
                  className="w-24 p-2 border rounded"
                  value={item.price}
                  onChange={e => {
                    const newItems = [...items];
                    newItems[idx].price = Number(e.target.value);
                    setItems(newItems);
                  }}
                  placeholder="Price"
                />
                <button 
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            <button 
              onClick={() => setItems([...items, { desc: '', price: 0 }])}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              + Add Item
            </button>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 p-6 rounded border">
          <h3 className="text-lg font-bold mb-4">Receipt Preview</h3>
          
          <div className="bg-white p-6 rounded shadow-sm min-h-[300px] border border-dashed border-gray-300">
            <div className="text-center mb-6 border-b pb-4">
              <div className="font-bold text-xl uppercase tracking-widest text-gray-800">RECEIPT</div>
            </div>
            
            <div className="mb-4 text-sm">
              <span className="text-gray-500">Billed to:</span>
              <div className="font-bold">{customerName || 'Walk-in Customer'}</div>
            </div>

            <div className="space-y-2 mb-6">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.desc || 'Unknown Item'}</span>
                  <span className="font-mono">${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>TOTAL</span>
              <span className="font-mono">${total.toFixed(2)}</span>
            </div>

            <div className="mt-8 text-center text-xs text-gray-400">
              Thank you for your business!
            </div>
          </div>
          
          <button className="w-full mt-4 bg-gray-800 text-white py-2 rounded shadow hover:bg-black transition-colors font-medium">
            Print / Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
}
