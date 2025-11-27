
import React from 'react';
import { CarIcon } from './icons/CarIcon.jsx';
import { RouteIcon } from './icons/RouteIcon.jsx';
import { MapPinIcon } from './icons/MapPinIcon.jsx';
import { SearchIcon } from './icons/SearchIcon.jsx';
import { HeartIcon } from './icons/HeartIcon.jsx';
import { UserIcon } from './icons/UserIcon.jsx';

import useAppStore from '../stores/appStore.js';

const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
    active 
      ? 'bg-blue-100 text-blue-700' 
      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
  }`}>
    {icon}
    <span className="ml-2">{label}</span>
  </button>
);
export const Header = ({ favoriteCount }) => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
      <nav className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center text-blue-600">
              <CarIcon className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold text-gray-800">휴게소맛집</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavItem icon={<RouteIcon className="w-5 h-5"/>} label="경로 검색" active={activeTab === 'route'} onClick={() => setActiveTab('route')} />
                <NavItem icon={<MapPinIcon className="w-5 h-5"/>} label="지도" active={activeTab === 'map'} onClick={() => setActiveTab('map')} />
                <NavItem icon={<SearchIcon className="w-5 h-5"/>} label="휴게소 검색" active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
                <NavItem icon={<HeartIcon className="w-5 h-5"/>} label="즐겨찾기" active={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} />
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <a href="#" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200">
              <UserIcon className="w-5 h-5"/>
              <span className="ml-2">게스트</span>
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
};