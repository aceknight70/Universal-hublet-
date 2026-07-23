import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../hooks/useAuth';
import { Brand, Product, SHARED_CATEGORIES } from '../types';
import { cn } from '../lib/utils';
import { ProductCard } from '../components/ProductCard';
import { ProductDetail } from '../components/ProductDetail';
import { Plus } from 'lucide-react';

export function Showroom({ tagFilter }: { tagFilter?: string }) {
  const { client } = useStore();
  const { profile } = useAuth();
  const viewMode = profile?.role || 'customer';
  const [brands, setBrands] = useState<(Brand & { tier: number, display_order: number })[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!client) return;

    async function loadData() {
      setLoading(true);
      // Load assigned brands
      const { data: brandLinks } = await supabase
        .from('manifest_client_brands')
        .select(`
          brand_id,
          tier,
          display_order,
          manifest_brands (*)
        `)
        .eq('client_id', client.id)
        .eq('is_assigned', true)
        .order('tier', { ascending: true })
        .order('display_order', { ascending: true });

      if (brandLinks && brandLinks.length > 0) {
        const parsedBrands = brandLinks.map((bl: any) => ({
          ...bl.manifest_brands,
          tier: bl.tier,
          display_order: bl.display_order
        }));
        setBrands(parsedBrands);
      } else {
        // Fallback for demo/unseeded database
        setBrands([
          { id: 'brand-1', name: 'Samsung', logo_url: null, tier: 1, display_order: 1 },
          { id: 'brand-6', name: 'Bruhm', logo_url: null, tier: 1, display_order: 2 },
          { id: 'brand-7', name: 'Polystar', logo_url: null, tier: 1, display_order: 3 },
          { id: 'brand-2', name: 'LG', logo_url: null, tier: 1, display_order: 4 },
          { id: 'brand-3', name: 'Sony', logo_url: null, tier: 1, display_order: 5 },
          { id: 'brand-4', name: 'TCL', logo_url: null, tier: 2, display_order: 6 },
          { id: 'brand-5', name: 'Hisense', logo_url: null, tier: 2, display_order: 7 },
          { id: 'brand-8', name: 'MEWE', logo_url: null, tier: 2, display_order: 8 }
        ]);
      }

      // Load products
      // Load from inventory + catalog
      let query = supabase
        .from('manifest_inventory')
        .select('*, manifest_catalog!inner(*)')
        .eq('client_id', client.id);

      if (tagFilter) {
        query = query.eq('tag', tagFilter);
      }
      
      const { data: invData, error } = await query;
      if (error || !invData || invData.length === 0) {
         console.warn("Inventory empty or fetch failed, falling back to legacy products", error);
         
         // FALLBACK to old manifest_products table if inventory fails
         let fallbackQuery = supabase.from('manifest_products').select('*, manifest_product_images(slot, image_url)');
         if (selectedBrandIds.length > 0) {
           fallbackQuery = fallbackQuery.in('brand_id', selectedBrandIds);
         }
         if (selectedCategory) {
           fallbackQuery = fallbackQuery.eq('category', selectedCategory);
         }
         const { data: prodData, error: fallbackError } = await fallbackQuery;
         if (fallbackError) console.error("Fallback query failed:", fallbackError);
         if (prodData) {
           const productsWithImages = prodData.map((p: any) => {
             const formatted = { ...p };
             if (p.manifest_product_images) {
                p.manifest_product_images.forEach((img: any) => {
                   if (img.slot === 'main') formatted.main_image = img.image_url;
                   if (img.slot === 'front') formatted.front_image = img.image_url;
                   if (img.slot === 'left') formatted.left_image = img.image_url;
                   if (img.slot === 'right') formatted.right_image = img.image_url;
                   if (img.slot === 'back') formatted.back_image = img.image_url;
                });
                delete formatted.manifest_product_images;
             }
             return formatted;
           });
           setProducts(productsWithImages);
         }
         setLoading(false);
         return; // Skip the rest of inventory logic
      }
      if (invData) {
        let formattedProducts = invData.map((inv: any) => {
           const catalog = inv.manifest_catalog;
           return {
             ...catalog,
             inventory_id: inv.id,
             client_id: inv.client_id,
             price: inv.price,
             tag: inv.tag,
             // Map reference photo to main_image so components don't break
             main_image: catalog.reference_photo_url
           };
        });
        
        // Filter by brand/category locally since we joined
        if (selectedBrandIds.length > 0) {
           formattedProducts = formattedProducts.filter((p: any) => selectedBrandIds.includes(p.brand_id || p.brand));
        }
        if (selectedCategory) {
           formattedProducts = formattedProducts.filter((p: any) => p.category === selectedCategory);
        }
        
        setProducts(formattedProducts);
      }

      // Load specific extra categories from client
      let clientCats: string[] = [];
      try {
        if (typeof client.categories === 'string') {
          clientCats = JSON.parse(client.categories);
        } else if (Array.isArray(client.categories)) {
          clientCats = client.categories;
        }
      } catch (e) {}
      
      // Merge with shared categories without duplicates
      const allCats = Array.from(new Set([...SHARED_CATEGORIES, ...clientCats]));
      setCategories(allCats);

      setLoading(false);
    }
    
    loadData();
  }, [client, selectedBrandIds.join(","), selectedCategory]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-blue-50 text-blue-800 px-4 py-2 text-sm text-center font-medium flex justify-between items-center">
        <span>Showroom • Browse brands and categories.</span>
        {['staff', 'manager', 'master'].includes(viewMode) && (
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center text-xs bg-white text-blue-800 px-2 py-1 rounded shadow-sm hover:bg-blue-100"
          >
            <Plus className="w-3 h-3 mr-1" /> New Product
          </button>
        )}
      </div>
      
      {/* Brand Nav */}
      <div className="bg-white border-b overflow-x-auto whitespace-nowrap p-4 scrollbar-hide">
        <div className="flex space-x-4 items-center">
          <button 
            onClick={() => setSelectedBrandIds([])}
            className={cn(
              "flex items-center space-x-3 border rounded-xl overflow-hidden transition-all flex-shrink-0 bg-white",
              selectedBrandIds.length === 0 ? "ring-2 ring-[var(--theme-accent)] border-[var(--theme-accent)]" : "border-gray-200 hover:border-gray-300",
              "h-14 px-5"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
              selectedBrandIds.length === 0 ? "bg-[var(--theme-accent)] border-[var(--theme-accent)]" : "border-gray-300"
            )}>
              {selectedBrandIds.length === 0 && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={cn("font-medium text-gray-800 text-base")}>All Brands</span>
          </button>
          {brands.map(b => {
            const isSelected = selectedBrandIds.includes(b.id);
            return (
              <button
                key={b.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedBrandIds(selectedBrandIds.filter(id => id !== b.id));
                  } else {
                    setSelectedBrandIds([...selectedBrandIds, b.id]);
                  }
                }}
                className={cn(
                  "flex items-center space-x-3 border rounded-xl overflow-hidden transition-all flex-shrink-0 bg-white",
                  isSelected ? "ring-2 ring-[var(--theme-accent)] border-[var(--theme-accent)]" : "border-gray-200 hover:border-gray-300",
                  "h-14 px-5"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                  isSelected ? "bg-[var(--theme-accent)] border-[var(--theme-accent)]" : "border-gray-300"
                )}>
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={cn("font-medium text-gray-800 text-base")}>{b.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Nav */}
      <div className="bg-white border-b overflow-x-auto whitespace-nowrap px-4 py-3 scrollbar-hide shadow-sm">
        <div className="flex space-x-2">
           <button 
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-3 py-1.5 rounded text-sm transition-colors",
              !selectedCategory ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            All Categories
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c === selectedCategory ? null : c)}
              className={cn(
                "px-3 py-1.5 rounded text-sm transition-colors",
                c === selectedCategory ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Arcade / Grid */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {loading ? (
           <div className="text-center text-gray-500 mt-10">Loading catalog...</div>
        ) : products.length === 0 ? (
           <div className="text-center text-gray-500 mt-10">No products found matching filters.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {products.map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                brand={brands.find(b => b.id === p.brand_id)} 
                onClick={() => setSelectedProduct(p)}
                canEdit={['staff', 'manager', 'master'].includes(viewMode)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal overlay */}
      {(selectedProduct || isCreating) && (
        <ProductDetail 
          product={selectedProduct || {
            id: 'new',
            code: '',
            brand_id: null,
            category: 'Television',
            name: 'New Product',
            description_headline: '',
            description_bullets: [],
            specs: null,
            extra_details: '',
            price: 0,
            assurance_layer: false,
            assurance_text: null,
            contact_link: null,
            laggard_layer: false,
            laggard_promo_text: null,
            stock_count: null,
            main_image: null,
            front_image: null,
            left_image: null,
            right_image: null,
            back_image: null,
            video_url: null,
            stock_status: 'In Stock',
            staff_notes: null,
            search_keywords: null,
            preset_tags: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }} 
          brand={brands.find(b => b.id === (selectedProduct?.brand_id || null))}
          onClose={() => {
            setSelectedProduct(null);
            setIsCreating(false);
          }} 
          canEdit={['staff', 'manager', 'master'].includes(viewMode)}
          onUpdate={(updatedProduct) => {
            if (isCreating) {
              setProducts([updatedProduct, ...products]);
            } else {
              setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
            }
            setSelectedProduct(updatedProduct);
            setIsCreating(false);
          }}
          isNew={isCreating}
        />
      )}
    </div>
  );
}
