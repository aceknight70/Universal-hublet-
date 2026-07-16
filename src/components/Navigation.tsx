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
    { name: 'Sheet Manager', path: 'sheet-manager' },
  ];

  const masterLinks = [
    { name: 'Master Room', path: 'master' },
  ];

  const isStaff = ['staff', 'manager', 'master'].includes(viewMode);
  const isManager = ['manager', 'master'].includes(viewMode);
  const isMaster = viewMode === 'master';

  const NavGroup = ({ title, links, isHighlighted = false }: { title: string, links: any[], isHighlighted?: boolean }) => {
    return (
      <div className="relative group inline-block">
        <button 
          className={`text-sm font-medium flex items-center space-x-1 whitespace-nowrap ${isHighlighted ? 'font-bold' : ''}`}
          style={{ color: headerTextColor, opacity: isHighlighted ? 1 : 0.85 }}
        >
          <span>{title}</span>
          <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
          {links.map(link => {
            const isActive = currentPath === link.path || (currentPath === clientSlug && link.path === '');
            return (
              <Link 
                key={link.path}
                to={`/${clientSlug}/${link.path}`}
                className={`block px-4 py-2 text-sm ${isActive ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center gap-4 md:gap-6 overflow-x-auto pb-2 scrollbar-hide max-w-full">
      <NavGroup title="Customer Rooms" links={customerLinks} />
      {isStaff && <NavGroup title="Staff Modules" links={staffLinks} isHighlighted={viewMode === 'staff'} />}
      {isManager && <NavGroup title="Manager Modules" links={managerLinks} isHighlighted={viewMode === 'manager'} />}
      {isMaster && <NavGroup title="Master Modules" links={masterLinks} isHighlighted={true} />}
    </div>
  );
}
