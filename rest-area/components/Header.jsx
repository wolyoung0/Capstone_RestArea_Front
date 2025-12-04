
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
export const Header = ({ favoriteCount, isDetailView }) => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    // z-50으로 높이고 배경색 지정하여 사라짐 방지
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
      <nav className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. 좌측 로고 */}
          <div className="flex-shrink-0 flex items-center text-blue-600 cursor-pointer mr-4" onClick={() => setActiveTab('route')}>
            <CarIcon className="h-8 w-8" />
            <span className="ml-2 text-xl font-bold text-gray-800 hidden sm:block">휴게소맛집</span>
          </div>

          {/* 2. 중앙 네비게이션 (Flex 사용으로 겹침 해결) */}
          <div className="flex flex-1 justify-center items-center space-x-1 md:space-x-4 lg:space-x-6">
            <NavItem 
                icon={<RouteIcon className="w-5 h-5"/>} 
                label="경로 검색" 
                active={!isDetailView && activeTab === 'route'} 
                onClick={() => setActiveTab('route')} 
            />
            {/* <NavItem icon={<MapPinIcon className="w-5 h-5"/>} label="지도" active={!isDetailView && activeTab === 'map'} onClick={() => setActiveTab('map')} /> */}
            <NavItem 
                icon={<SearchIcon className="w-5 h-5"/>} 
                label="휴게소 검색" 
                active={!isDetailView && activeTab === 'search'} 
                onClick={() => setActiveTab('search')} 
            />
            <NavItem 
                icon={<HeartIcon className="w-5 h-5"/>} 
                label="즐겨찾기" 
                active={!isDetailView && activeTab === 'favorites'} 
                onClick={() => setActiveTab('favorites')} 
            />
          </div>

          {/* 3. 우측 프로필 */}
          <div className="flex-shrink-0 flex items-center ml-4">
            <a href="#" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200">
              <UserIcon className="w-5 h-5"/>
              <span className="ml-2 hidden sm:inline">게스트</span>
            </a>
          </div>

        </div>
      </nav>
    </header>
  );
};