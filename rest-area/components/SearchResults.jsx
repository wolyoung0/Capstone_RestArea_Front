
import React from 'react';
import { RestAreaCard } from './RestAreaCard.jsx';
import { RoadIcon } from './icons/RoadIcon.jsx';
import { ClockIcon } from './icons/ClockIcon.jsx';
import { MapPinIcon } from './icons/MapPinIcon.jsx';
import { MapView } from './MapView.jsx';

export const SearchResults = ({ route, favorites, onToggleFavorite, routePath }) => {
  const hours = Math.floor(route.totalTimeMinutes / 60);
  const minutes = route.totalTimeMinutes % 60;

  console.log("휴게소 데이터 확인:", route.restAreas);
  
  return (
    <div className="mt-12">
      <div className="flex items-center mb-6">
        <MapPinIcon className="w-7 h-7 text-blue-500" />
        <h2 className="text-xl font-bold ml-3 text-gray-800">검색 결과</h2>
      </div>
      
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-around items-center text-center">
        <div className="flex items-center mb-4 md:mb-0">
          <RoadIcon className="w-8 h-8 text-blue-500"/>
          <div className="ml-4 text-left">
            <p className="text-sm text-blue-800">총 거리</p>
            <p className="text-2xl font-bold text-blue-900">{route.totalDistanceKm}km</p>
          </div>
        </div>
        <div className="w-px h-12 bg-blue-200 hidden md:block"></div>
         <div className="w-24 h-px bg-blue-200 md:hidden my-4"></div>
        <div className="flex items-center mb-4 md:mb-0">
          <ClockIcon className="w-8 h-8 text-blue-500"/>
          <div className="ml-4 text-left">
            <p className="text-sm text-blue-800">예상 시간</p>
            <p className="text-2xl font-bold text-blue-900">{hours > 0 && `${hours}시간 `}{minutes}분</p>
          </div>
        </div>
        <div className="w-px h-12 bg-blue-200 hidden md:block"></div>
        <div className="w-24 h-px bg-blue-200 md:hidden my-4"></div>
        <div className="text-center">
            <p className="text-sm text-blue-800">경로상 휴게소</p>
            <p className="text-2xl font-bold text-blue-900">{route.restAreas.length}개</p>
        </div>
      </div>

      {routePath && (
        <div className="mb-10 rounded-2xl overflow-hidden shadow-md border border-gray-200 h-[400px]">
            <MapView routePath={routePath} restAreas={route.restAreas}/>
        </div>
      )}

      <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
        <span>경로상 휴게소 목록</span>
        <span className="text-sm font-normal text-gray-400">({route.restAreas.length})</span>
      </h3>
      <div className="space-y-6">
        {route.restAreas.map((restArea, index) => (
          <RestAreaCard
            key={restArea.id || index}
            restArea={restArea}
            index={index + 1}
            isFavorite={favorites.includes(restArea.id)}
            onToggleFavorite={() => onToggleFavorite(restArea.id)}
          />
        ))}
      </div>
    </div>
  );
};