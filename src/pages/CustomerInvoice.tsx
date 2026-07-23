import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useStore } from '../hooks/useStore';

export function CustomerInvoice() {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const { client } = useStore();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const total = items.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);

  const handleSubmit = () => {
    // In a real implementation, this would save to a database table like 'manifest_invoice_requests'
    // For now, we simulate a successful submission.
    setTimeout(() => {
      setIsSubmitted(true);
      clearCart();
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Request Submitted</h2>
        <p className="text-gray-600 text-center max-w-md">
          Your invoice request has been sent to the store. A representative will process your request shortly.
        </p>
        <button 
          onClick={() => setIsSubmitted(false)}
          className="mt-8 px-6 py-3 bg-[var(--theme-accent)] text-white rounded-lg font-bold shadow hover:opacity-90 transition-opacity"
        >
          Return to Invoice
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Invoice</h1>
          <p className="text-gray-600">Review your selected items and submit to {client?.name}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
          <p className="text-gray-500 mb-4">Your invoice is currently empty.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(item => (
                  <tr key={item.product.id}>
                    <td className="px-6 py-4 flex items-center space-x-4">
                      {item.product.main_image ? (
                        <img src={item.product.main_image} alt={item.product.name} className="w-12 h-12 rounded object-cover border" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-100 border flex items-center justify-center text-gray-400 text-xs">No img</div>
                      )}
                      <div>
                        <div className="font-bold">{item.product.name}</div>
                        <div className="text-xs text-gray-500">{item.product.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {item.product.price ? '₦' + item.product.price.toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 border rounded-lg w-fit px-2 py-1">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
                        >-</button>
                        <span className="w-6 text-center font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded"
                        >+</button>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {item.product.price ? '₦' + ((item.product.price || 0) * item.quantity).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 p-6 flex flex-col md:flex-row items-center justify-between border-t">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Estimated Total</p>
              <p className="text-3xl font-bold">₦{total.toLocaleString()}</p>
            </div>
            
            <button 
              onClick={handleSubmit}
              className="w-full md:w-auto px-8 py-3 bg-[var(--theme-accent)] text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Submit Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
