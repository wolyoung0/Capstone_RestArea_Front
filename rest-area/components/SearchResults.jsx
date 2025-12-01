import React from 'react';
import { RestAreaCard } from './RestAreaCard.jsx';
import { RoadIcon } from './icons/RoadIcon.jsx';
import { ClockIcon } from './icons/ClockIcon.jsx';
import { MapPinIcon } from './icons/MapPinIcon.jsx';
import { MapView } from './MapView.jsx'; // 파일 경로 확인 필요 (./components/MapView.jsx 일 수도 있음)

export const SearchResults = ({ route, favorites, onToggleFavorite, routePath }) => {
  // [방어 코드] 데이터가 없으면 렌더링하지 않음
  if (!route || !route.restAreas) return null;

  const hours = Math.floor(route.totalTimeMinutes / 60);
  const minutes = route.totalTimeMinutes % 60;
  
  return (
    <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center mb-6">
        <MapPinIcon className="w-7 h-7 text-blue-500" />
        <h2 className="text-xl font-bold ml-3 text-gray-800">검색 결과</h2>
      </div>
      
      {/* 요약 정보 박스 */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-around items-center text-center shadow-sm">
        <div className="flex items-center mb-4 md:mb-0">
          <RoadIcon className="w-8 h-8 text-blue-500"/>
          <div className="ml-4 text-left">
            <p className="text-sm text-blue-800 font-medium">총 거리</p>
            <p className="text-2xl font-bold text-blue-900">{route.totalDistanceKm}km</p>
          </div>
        </div>
        <div className="w-px h-12 bg-blue-200 hidden md:block"></div>
        <div className="w-24 h-px bg-blue-200 md:hidden my-4"></div>
        <div className="flex items-center mb-4 md:mb-0">
          <ClockIcon className="w-8 h-8 text-blue-500"/>
          <div className="ml-4 text-left">
            <p className="text-sm text-blue-800 font-medium">예상 시간</p>
            <p className="text-2xl font-bold text-blue-900">{hours > 0 && `${hours}시간 `}{minutes}분</p>
          </div>
        </div>
        <div className="w-px h-12 bg-blue-200 hidden md:block"></div>
        <div className="w-24 h-px bg-blue-200 md:hidden my-4"></div>
        <div className="text-center">
            <p className="text-sm text-blue-800 font-medium">경로상 휴게소</p>
            <p className="text-2xl font-bold text-blue-900">{route.restAreas.length}개</p>
        </div>
      </div>

      {/* 지도 영역 */}
      {routePath && (
        <div className="mb-10 rounded-2xl overflow-hidden shadow-md border border-gray-200 h-[400px]">
            <MapView routePath={routePath} restAreas={route.restAreas}/>
        </div>
      )}

      {/* 휴게소 목록 */}
      <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
        <span>경로상 휴게소 목록</span>
        <span className="text-sm font-normal text-gray-400">({route.restAreas.length})</span>
      </h3>
      
      <div className="space-y-6">
        {route.restAreas.length > 0 ? (
          route.restAreas.map((restArea, index) => {
            // [중요 수정] 백엔드 DTO에 맞춰 ID 추출 (restAreaId 우선 사용)
            const uniqueId = restArea.restAreaId || restArea.id; 
            
            return (
              <RestAreaCard
                key={uniqueId || index}
                restArea={restArea}
                index={index + 1}
                // [중요 수정] 정확한 ID로 비교해야 즐겨찾기가 개별적으로 작동함
                isFavorite={favorites.includes(uniqueId)}
                onToggleFavorite={() => onToggleFavorite(uniqueId)}
              />
            );
          })
        ) : (
          // 휴게소가 없을 때 안내 메시지 표시
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
            경로상에 휴게소가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};