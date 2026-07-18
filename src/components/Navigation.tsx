import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Role } from '../types';

interface NavProps {
  clientSlug: string;
  viewMode: Role | 'customer';
  headerTextColor: string;
}

export function StoreNavigation({ clientSlug, viewMode, headerTextColor }: NavProps) {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop() || '';

  const customerLinks = [
    { name: 'Showroom', path: '' },
    { name: 'Arcade', path: 'arcade' },
    { name: 'Display Floor', path: 'display-floor' },
    { name: 'Hot Deals', path: 'hot-deals' },
    { name: 'Videos', path: 'videos' },
    { name: 'Gallery', path: 'gallery' },
    { name: 'AI Desk', path: 'ai-desk' },
    { name: 'Channels', path: 'channels' },
    { name: 'Live Sheet', path: 'live-sheet' },
    { name: 'Spotlight', path: 'spotlight' },
    { name: 'Pickup & Dispatch', path: 'pickup-dispatch' },
    { name: 'Warranty', path: 'warranty' },
    { name: 'Contact', path: 'contact' },
    { name: 'Feedback', path: 'feedback' },
    { name: 'Education', path: 'education' },
    { name: 'Comparison Tool', path: 'compare' },
  ];

  const staffLinks = [
    { name: 'Photo Matching Bay', path: 'photo-matching' },
    { name: 'Workbook', path: 'workbook' },
    { name: 'Invoice / Receipts', path: 'invoice' },
  ];

  const managerLinks = [
    { name: 'Manager Room', path: 'manager' },
    
  ];

  const masterLinks = [
    { name: 'Master Room', path: 'master' },
  ];

  const isStaff = ['staff', 'manager', 'master'].includes(viewMode);
  const isManager = ['manager', 'master'].includes(viewMode);
  const isMaster = viewMode === 'master';

  const isSheetManagerActive = currentPath === 'sheet-manager';
  const NavGroup = ({ title, links, isHighlighted = false }: { title: string, links: any[], isHighlighted?: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="relative inline-block" onMouseLeave={() => setIsOpen(false)}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`text-sm font-medium flex items-center space-x-1 whitespace-nowrap ${isHighlighted ? 'font-bold' : ''}`}
          style={{ color: headerTextColor, opacity: isHighlighted ? 1 : 0.85 }}
        >
          <span>{title}</span>
          <svg className={`w-4 h-4 opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {isOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg transition-all z-50 overflow-hidden">
            {links.map(link => {
              const isActive = currentPath === link.path || (currentPath === clientSlug && link.path === '');
              return (
                <Link 
                  key={link.path}
                  onClick={() => setIsOpen(false)}
                  to={`/${clientSlug}/${link.path}`}
                  className={`block px-4 py-2 text-sm ${isActive ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-3 md:gap-6 pb-1 max-w-full">
      <NavGroup title="Customer Rooms" links={customerLinks} />
      {isStaff && <NavGroup title="Staff Modules" links={staffLinks} isHighlighted={viewMode === 'staff'} />}
      {isManager && <NavGroup title="Manager Modules" links={managerLinks} isHighlighted={viewMode === 'manager' && !isSheetManagerActive} />}
      {isManager && (
        <Link 
          to={`/${clientSlug}/sheet-manager`}
          className={`text-sm font-bold whitespace-nowrap px-3 py-1.5 rounded-md border-2 transition-all ${isSheetManagerActive ? 'bg-black/10' : 'hover:bg-black/5'}`}
          style={{ color: headerTextColor, borderColor: headerTextColor }}
        >
          Sheet Manager
        </Link>
      )}

      {isMaster && <NavGroup title="Master Modules" links={masterLinks} isHighlighted={true} />}
    </div>
  );
}
