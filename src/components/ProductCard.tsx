import React from 'react';
import { Product, Brand } from '../types';
import { Pencil } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProductCardProps {
  product: Product;
  brand?: Brand;
  onClick: () => void;
  canEdit: boolean;
  key?: React.Key;
}

export function ProductCard({ product, brand, onClick, canEdit }: ProductCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group relative flex flex-col h-full"
      onClick={onClick}
    >
      {canEdit && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1.5 rounded-full shadow backdrop-blur-sm">
          <Pencil className="w-4 h-4 text-gray-700" />
        </div>
      )}
      <div className="aspect-square bg-gray-50 relative p-4 flex items-center justify-center">
        {(product as any).main_image ? (
          <img src={(product as any).main_image} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
        ) : (
          <div className="text-gray-300 text-sm">No Image</div>
        )}
        <div className="absolute bottom-2 left-2 flex flex-col space-y-1">
          {brand && (
            <span className="bg-white/90 px-2 py-0.5 text-xs font-bold rounded shadow-sm text-gray-800">
              {brand.name}
            </span>
          )}
        </div>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">{product.category}</span>
        <h3 className="text-sm font-medium text-gray-900 leading-tight mb-2 line-clamp-2">{product.name}</h3>
        <div className="mt-auto">
          <div className="text-lg font-bold text-gray-900">
            ₦{product.price?.toLocaleString()}
          </div>
          <div className={cn(
            "text-xs font-medium mt-1",
            product.stock_status === 'In Stock' ? "text-green-600" : "text-red-500"
          )}>
            {product.stock_status || 'Unknown Stock'}
          </div>
        </div>
      </div>
    </div>
  );
}
