import React from 'react';
import { RestAreaCard } from './RestAreaCard.jsx';
import { RoadIcon } from './icons/RoadIcon.jsx';
import { ClockIcon } from './icons/ClockIcon.jsx';
import { MapPinIcon } from './icons/MapPinIcon.jsx';
import { MapView } from './MapView.jsx'; 

export const SearchResults = ({ route, favorites, onToggleFavorite, routePath, onDetailClick }) => {
  // [방어 코드] 데이터가 없으면 렌더링하지 않음
  if (!route || !route.restAreas) return null;

  const hours = Math.floor(route.totalTimeMinutes / 60);
  const minutes = route.totalTimeMinutes % 60;
  
  return (
    <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. 상단 제목: 검은색 -> 흰색 변경 */}
      <div className="flex items-center mb-6">
        <MapPinIcon className="w-7 h-7 text-blue-300 drop-shadow-md" />
        <h2 className="text-xl font-bold ml-3 text-white drop-shadow-md">검색 결과</h2>
      </div>
      
      {/* 2. 요약 정보 박스: 불투명 흰색 배경 -> 반투명 유리 효과(Glassmorphism)로 변경 */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-around items-center text-center shadow-lg">
        
        {/* 총 거리 */}
        <div className="flex items-center mb-4 md:mb-0">
          <RoadIcon className="w-8 h-8 text-blue-300 drop-shadow"/>
          <div className="ml-4 text-left">
            <p className="text-sm text-blue-100 font-medium">총 거리</p>
            <p className="text-2xl font-bold text-white drop-shadow">{route.totalDistanceKm}km</p>
          </div>
        </div>
        
        {/* 구분선 (데스크탑) */}
        <div className="w-px h-12 bg-white/20 hidden md:block"></div>
        {/* 구분선 (모바일) */}
        <div className="w-24 h-px bg-white/20 md:hidden my-4"></div>
        
        {/* 예상 시간 */}
        <div className="flex items-center mb-4 md:mb-0">
          <ClockIcon className="w-8 h-8 text-blue-300 drop-shadow"/>
          <div className="ml-4 text-left">
            <p className="text-sm text-blue-100 font-medium">예상 시간</p>
            <p className="text-2xl font-bold text-white drop-shadow">{hours > 0 && `${hours}시간 `}{minutes}분</p>
          </div>
        </div>
        
        <div className="w-px h-12 bg-white/20 hidden md:block"></div>
        <div className="w-24 h-px bg-white/20 md:hidden my-4"></div>
        
        {/* 휴게소 개수 */}
        <div className="text-center">
            <p className="text-sm text-blue-100 font-medium">경로상 휴게소</p>
            <p className="text-2xl font-bold text-white drop-shadow">{route.restAreas.length}개</p>
        </div>
      </div>

      {/* 3. 지도 영역 */}
      {routePath && (
        <div className="mb-10 rounded-2xl overflow-hidden shadow-xl border border-white/20 h-[400px]">
            <MapView routePath={routePath} restAreas={route.restAreas}/>
        </div>
      )}

      {/* 4. 휴게소 목록 제목: 검은색 -> 흰색 변경 */}
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 drop-shadow-md">
        <span>경로상 휴게소 목록</span>
        <span className="text-sm font-normal text-gray-300">({route.restAreas.length})</span>
      </h3>
      
      <div className="space-y-6">
        {route.restAreas.length > 0 ? (
          route.restAreas.map((restArea, index) => {
            const uniqueId = restArea.restAreaId || restArea.id; 
            
            return (
              <RestAreaCard
                key={uniqueId || index}
                restArea={restArea}
                index={index + 1}
                isFavorite={favorites.includes(uniqueId)}
                onToggleFavorite={() => onToggleFavorite(uniqueId)}
                onDetailClick={onDetailClick}
              />
            );
          })
        ) : (
          // 5. 휴게소 없음 안내: 배경 및 텍스트 색상 변경
          <div className="text-center py-10 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-gray-200">
            경로상에 휴게소가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};