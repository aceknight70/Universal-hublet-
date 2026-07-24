import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import { useStore } from '../hooks/useStore';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {}
});

// Generate a random session ID that stays in memory for the duration of the visit
const session_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { client } = useStore();
  const storeSlug = client?.id || "adanehouse";

  // Load cart from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCart() {
      try {
        const { data } = await (supabase
          .from('manifest_cart') as any)
          .select('items')
          .eq('client_id', storeSlug)
          .eq('session_id', session_id)
          .maybeSingle();
        
        if (isMounted) {
          if (data && data.items) {
            setItems(data.items);
          }
          setIsLoaded(true);
        }
      } catch (err) {
        if (isMounted) setIsLoaded(true);
      }
    }
    loadCart();
    return () => { isMounted = false; };
  }, [storeSlug]);

  // Save cart to Supabase on items change
  useEffect(() => {
    if (!isLoaded) return;
    
    async function saveCart() {
      try {
        await (supabase
          .from('manifest_cart') as any)
          .upsert({
            client_id: storeSlug,
            session_id: session_id,
            items: items,
            updated_at: new Date().toISOString()
          }, { onConflict: 'client_id, session_id' });
      } catch (err) {
        console.error("Failed to sync cart", err);
      }
    }
    saveCart();
  }, [items, storeSlug, isLoaded]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
