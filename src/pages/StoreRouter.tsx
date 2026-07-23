import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Routes, Route, useParams, useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from '../hooks/useStore';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { CartProvider } from '../hooks/useCart';
import { CustomerInvoice } from './CustomerInvoice';
import { Showroom } from './Showroom';
import { SheetManager } from './SheetManager';
import { InventoryManager } from './InventoryManager';
import { MasterRoom } from './MasterRoom';
import { Placeholder } from './Placeholders';
import { SpotlightManager } from './SpotlightManager';
import { InvoiceReceiptGenerator } from './Invoice';
import { PhotoMatchingBay } from './PhotoMatchingBay';
import { StoreNavigation } from '../components/Navigation';


function FloatingBackButton({ viewMode }: { viewMode: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { storeSlug } = useParams<{ storeSlug: string }>();
  
  const isIframe = window.self !== window.top;
  const isMaster = viewMode === 'master';
  const isMasterRoom = location.pathname.endsWith('/master');
  
  if (!isIframe && (!isMaster || isMasterRoom)) {
    return null;
  }

  const goBack = () => {
    if (isIframe) {
      window.parent.postMessage('backToParent', '*');
      window.parent.postMessage({ type: 'RETURN_TO_PARENT' }, '*');
      window.parent.postMessage('close', '*');
    } else {
      navigate(`/${storeSlug}/master`);
    }
  };

  return (
    <button 
      onClick={goBack}
      className="fixed bottom-6 right-6 z-50 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 shadow-lg backdrop-blur-sm transition-all flex items-center justify-center group"
      aria-label="Go Back"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>
  );
}

function StoreLayout() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  if (!storeSlug) return <div>Store not found</div>;

  return (
    <StoreProvider slug={storeSlug}>
      <StoreContent />
    </StoreProvider>
  );
}

function StoreContent() {
  const { client, loading, error } = useStore();
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    if (client?.id) {
      supabase.from('manifest_brand_ads').select('*').eq('client_id', client.id)
        .then(({data, error}) => {
          if (data && data.length > 0 && !error) {
            setAds(data);
          } else {
            setAds([]);
          }
        });
    }
  }, [client]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading store...</div>;
  if (error || !client) return <div className="p-8 text-center text-red-500">Store not found or error loading store.</div>;

  let themeObj = client.theme;
  if (typeof themeObj === 'string') {
    try {
      themeObj = JSON.parse(themeObj);
    } catch(e) {
      themeObj = {};
    }
  } else if (!themeObj) {
    themeObj = {};
  }
  
  const accentColor = themeObj.accent_color || '#000000';
  const backgroundColor = themeObj.background_color || '#f9fafb';
  const headerBackgroundColor = themeObj.header_background_color || '#ffffff';
  const headerTextColor = themeObj.header_text_color || accentColor;

  const viewMode = profile?.role || 'customer';

  return (
    <div style={{ '--theme-accent': accentColor, backgroundColor: backgroundColor } as React.CSSProperties} className="min-h-screen flex flex-col">
      <header 
        className="shadow-sm flex flex-col"
        style={{ backgroundColor: headerBackgroundColor }}
      >
        <div className="px-4 md:px-6 py-3 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2 shrink-0">
            <Link to={`/${client.slug}`} className="text-xl md:text-2xl font-bold" style={{ color: headerTextColor }}>{client.name}</Link>
            
            <div className="flex items-center space-x-2 md:space-x-4" style={{ borderColor: headerTextColor }}>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider hidden md:inline-block" style={{ color: headerTextColor, opacity: 0.6 }}>Store:</span>
              <select 
                value={client.slug}
                onChange={e => {
                  window.location.href = `/${e.target.value}`;
                }}
                className="text-xs border border-white border-opacity-20 rounded p-1 bg-transparent max-w-[100px] md:max-w-none"
                style={{ color: headerTextColor }}
              >
                <option value="ugomenz" className="text-black">Ugomenz</option>
                <option value="o-frank" className="text-black">O Frank</option>
                <option value="allsufficiency" className="text-black">AllSufficiency</option>
                <option value="linz" className="text-black">Linz</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 md:border-l md:pl-4 border-opacity-20" style={{ borderColor: headerTextColor }}>
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold uppercase px-2 py-1 bg-black bg-opacity-10 rounded" style={{ color: headerTextColor }}>
                    {profile?.role || 'No Role'}
                  </span>
                  <button 
                    onClick={() => logout().then(() => navigate(`/${client.slug}`))}
                    className="text-xs border border-white border-opacity-20 rounded px-2 py-1 hover:bg-black hover:bg-opacity-5"
                    style={{ color: headerTextColor }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  to={`/${client.slug}/login`}
                  className="text-xs border border-white border-opacity-20 rounded px-3 py-1 hover:bg-black hover:bg-opacity-5"
                  style={{ color: headerTextColor }}
                >
                  Staff Login
                </Link>
              )}
            </div>
          </div>
          </div>
          
          <div className="flex-1 flex justify-end items-start gap-2 overflow-x-auto">
            {ads.map(ad => (
              <a 
                key={ad.id}
                href={ad.cta_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-3 py-2 rounded bg-black/5 hover:bg-black/10 transition-colors flex-shrink-0"
                style={{ color: headerTextColor }}
                title={ad.description}
              >
                {ad.banner_image_url && (
                  <img src={ad.banner_image_url} alt={ad.brand_name} className="w-10 h-10 rounded object-cover shadow-sm bg-white" />
                )}
                <div className="flex flex-col text-left justify-center hidden sm:flex">
                  <span className="text-sm font-bold leading-none">{ad.brand_name}</span>
                  {ad.tagline && <span className="text-[10px] opacity-80 leading-tight mt-0.5">{ad.tagline}</span>}
                </div>
              </a>
            ))}
            {ads.length === 0 && (viewMode === 'master' || viewMode === 'manager') && (
              <Link
                to={`/${client.slug}/spotlight`}
                className="flex items-center justify-center px-3 py-2 border-2 border-dashed rounded text-xs font-bold transition-colors hover:bg-black/5 flex-shrink-0"
                style={{ color: headerTextColor, borderColor: headerTextColor, opacity: 0.6 }}
                title="This space is for Business Spotlight banners"
              >
                + Add Business Spotlight Ad
              </Link>
            )}
          </div>
        </div>
        
        {/* Navigation Row */}
        <div className="border-t border-black/5 w-full">
          <StoreNavigation clientSlug={client.slug} viewMode={viewMode} headerTextColor={headerTextColor} />
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto flex flex-col relative">
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Showroom />} />
          <Route path="/arcade" element={<Showroom tagFilter="arcade" />} />
          <Route path="/display-floor" element={<Showroom tagFilter="display_floor" />} />
          <Route path="/hot-deals" element={<Showroom tagFilter="hot_deal" />} />
          <Route path="/videos" element={<Placeholder title="Videos" />} />
          <Route path="/gallery" element={<Placeholder title="Gallery" />} />
          <Route path="/ai-desk" element={<Placeholder title="AI Desk" />} />
          <Route path="/channels" element={<Placeholder title="Channels" />} />
          <Route path="/live-sheet" element={<Showroom tagFilter="live_sheet" />} />
          <Route path="/customer-invoice" element={<CustomerInvoice />} />
          <Route path="/spotlight" element={<SpotlightManager />} />
          <Route path="/pickup-dispatch" element={<Placeholder title="Pickup & Dispatch" />} />
          <Route path="/warranty" element={<Placeholder title="Warranty" />} />
          <Route path="/contact" element={<Placeholder title="Contact" />} />
          <Route path="/feedback" element={<Placeholder title="Feedback" />} />
          <Route path="/education" element={<Placeholder title="Education" />} />
          <Route path="/compare" element={<Placeholder title="Comparison Tool" />} />

          {/* Login */}
          <Route path="/login" element={
            <div className="py-12"><ProtectedRoute><div className="text-center mt-10">Logged in successfully. <Link to={`/${client.slug}`} className="text-blue-600 underline">Go to Showroom</Link></div></ProtectedRoute></div>
          } />

          {/* Staff Routes */}
          <Route path="/photo-matching" element={<ProtectedRoute roleRequired="staff"><PhotoMatchingBay /></ProtectedRoute>} />
          <Route path="/workbook" element={<ProtectedRoute roleRequired="staff"><Placeholder title="Workbook" roleRequired="Staff" /></ProtectedRoute>} />
          <Route path="/invoice" element={<ProtectedRoute roleRequired="staff"><InvoiceReceiptGenerator /></ProtectedRoute>} />

          {/* Manager Routes */}
          <Route path="/manager" element={<ProtectedRoute roleRequired="manager"><Placeholder title="Manager's Room" roleRequired="Manager" /></ProtectedRoute>} />
          <Route path="/sheet-manager" element={<ProtectedRoute roleRequired="manager"><SheetManager /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute roleRequired="manager"><InventoryManager /></ProtectedRoute>} />

          {/* Master Routes */}
          <Route path="/master/*" element={<ProtectedRoute roleRequired="master"><MasterRoom /></ProtectedRoute>} />
        </Routes>
        {<FloatingBackButton viewMode={viewMode} />}
      </main>
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/:storeSlug/*" element={<StoreLayout />} />
      <Route path="/" element={<Navigate to="/ugomenz" replace />} />
    </Routes>
  );
}
