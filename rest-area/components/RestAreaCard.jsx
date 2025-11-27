import React, { useState, useCallback } from 'react';
import { Amenity } from '../types.js';
import { fetchFoodRecommendations } from '../services/geminiService.js';
import { SparklesIcon } from './icons/SparklesIcon.jsx';
import { HeartIcon } from './icons/HeartIcon.jsx';
import { MapPinIcon } from './icons/MapPinIcon.jsx';
import { FilterIcon } from './icons/FilterIcon.jsx';


// --- 이름 포맷팅 함수 ---
const parseRestAreaName = (fullName) => {
  if (!fullName) return { baseName: '', directionName: '' };

  const match = fullName.match(/(.*?)\((.*?)\)/);

  if (match && match.length >= 3) {
    const baseName = match[1].replace(/휴게소|주유소/g, '').trim() + '휴게소';
    let direction = match[2].trim();

    if (!direction.endsWith('방향')) {
      direction += '방향';
    }

    return { baseName, directionName: `(${direction})` };
  }

  const trimmedName = fullName.trim();
  const finalName = trimmedName.endsWith('휴게소') ? trimmedName : `${trimmedName}휴게소`;
  
  return { baseName: finalName, directionName: '' };
};

const amenityColors = {
  [Amenity.GasStation]: 'bg-orange-100 text-orange-800 border-orange-200',
  [Amenity.LPGStation]: 'bg-red-100 text-red-800 border-red-200',
  [Amenity.EVStation]: 'bg-green-100 text-green-800 border-green-200',
  [Amenity.ConvenienceStore]: 'bg-sky-100 text-sky-800 border-sky-200',
  [Amenity.Restaurant]: 'bg-amber-100 text-amber-800 border-amber-200',
  [Amenity.Cafe]: 'bg-purple-100 text-purple-800 border-purple-200',
  [Amenity.Pharmacy]: 'bg-teal-100 text-teal-800 border-teal-200',
  [Amenity.SleepingRoom]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [Amenity.ShowerRoom]: 'bg-cyan-100 text-cyan-800 border-cyan-500',
};

const INITIAL_AMENITIES_LIMIT = 8;

export const RestAreaCard = ({ restArea, index, isFavorite, onToggleFavorite, size = 'full', className = '' }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [isFetchingRecs, setIsFetchingRecs] = useState(false);
  const [error, setError] = useState(null);
  const [amenitiesExpanded, setAmenitiesExpanded] = useState(false);

  const { baseName, directionName } = parseRestAreaName(restArea.name);
  const amenitiesToDisplay = restArea.amenities || restArea.facilities || [];

  const getRecommendations = useCallback(async () => {
    setIsFetchingRecs(true);
    setError(null);
    setRecommendations(null);
    try {
      const id = restArea.restAreaId || restArea.id;
      const response = await fetch(
        `http://localhost:8080/api/rest-areas/${id}/recommend/menus`
      );
      
      if (!response.ok) {
        throw new Error('메뉴 추천 정보를 가져올 수 없습니다.');
      }

      const result = await response.json();
      setRecommendations(result);
    } catch (e) {
      setError('추천 메뉴를 불러오는 데 실패했습니다.');
      console.error(e);
    } finally {
      setIsFetchingRecs(false);
    }
  }, [restArea]);


  const timeHours = Math.floor((restArea.timeMinutes || 0) / 60);
  const timeMins = (restArea.timeMinutes || 0) % 60;
  
  const visibleAmenities = amenitiesExpanded 
    ? amenitiesToDisplay 
    : amenitiesToDisplay.slice(0, INITIAL_AMENITIES_LIMIT);

  const hiddenAmenitiesCount = amenitiesToDisplay.length - visibleAmenities.length;

  return (
    <div className={`bg-white rounded-2xl shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:border-blue-300 border border-transparent relative ${className}`}>
      
      {/* [하트 아이콘] 절대 위치로 우측 상단 고정 */}
      <button 
        onClick={onToggleFavorite} 
        className="absolute top-5 right-5 p-2 rounded-full hover:bg-red-100 transition-colors z-20"
        aria-label={isFavorite ? '즐겨찾기에서 제거' : '즐겨찾기에 추가'}
      >
        <HeartIcon className={`w-6 h-6 transition-all duration-200 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-400'}`} />
      </button>


      {/* ================= [상단 영역] 핀 + 텍스트 정보 ================= */}
      <div className="flex items-start gap-4 mb-4 pr-12"> {/* pr-12: 하트 아이콘 공간 확보 */}
        
        {/* 1. 핀/번호 아이콘 */}
        <div className="flex-shrink-0 flex items-center justify-center bg-blue-100 text-blue-600 w-12 h-12 rounded-full font-bold text-xl mt-1">
          {index > 0 ? index : <MapPinIcon className="w-6 h-6" />}
        </div>

        {/* 2. 텍스트 정보 (이름, 방향, 노선, 거리) */}
        <div className="flex-grow min-w-0">
          <div className="mb-1">
            <h4 className="text-xl font-bold text-gray-900 leading-tight whitespace-nowrap overflow-x-auto no-scrollbar">
              {baseName}
            </h4>
            {directionName && (
              <span className="block text-lg font-bold text-gray-900 mt-0.5">
                {directionName}
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-500 font-medium">{restArea.routeName}</p>
          
          {index > 0 && (
            <div className="flex items-center space-x-4 text-sm text-blue-700 font-semibold mt-2">
                <span>{restArea.distanceKm}km</span>
                <span>약 {timeHours > 0 && `${timeHours}시간 `}{timeMins}분 후</span>
            </div>
          )}
        </div>
      </div>


      {/* ================= [하단 영역] 편의시설 + 버튼 그룹 ================= */}
      {/* items-end: 바닥 정렬, justify-between: 양끝 정렬 */}
      <div className="flex flex-wrap items-end justify-between gap-4 pt-2 border-t border-transparent">
        
        {/* 1. 편의시설 (왼쪽) */}
        <div className="flex flex-wrap items-center gap-2">
          {visibleAmenities.length > 0 ? (
            visibleAmenities.map((amenity, idx) => (
              <div key={`${amenity}-${idx}`} className={`px-2.5 py-1 rounded-full text-xs font-medium border ${amenityColors[amenity] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {amenity}
              </div>
            ))
          ) : (
            <span className="text-xs text-gray-400">편의시설 정보 없음</span>
          )}
          
          {hiddenAmenitiesCount > 0 && !amenitiesExpanded && (
            <button
              onClick={() => setAmenitiesExpanded(true)}
              className="px-2.5 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium hover:bg-gray-300 transition-colors border border-gray-300"
            >
              +{hiddenAmenitiesCount}
            </button>
          )}
        </div>

        {/* 2. 버튼 그룹 (오른쪽 끝) - 필터 + AI 추천 */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {/* 필터 버튼 */}
          <button className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
             <FilterIcon className="w-5 h-5 text-gray-500" />
          </button>

          {/* AI 메뉴 추천 버튼 */}
          <button
            onClick={getRecommendations}
            disabled={isFetchingRecs}
            className="flex flex-col items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-200 h-10 md:h-12 min-w-[7rem] md:min-w-[8rem]"
          >
            <div className="flex items-center gap-1">
              <SparklesIcon className="w-4 h-4" />
              <span>AI 메뉴 추천</span>
            </div>
          </button>
        </div>

      </div>
      
      {/* AI 추천 결과 표시 영역 */}
      {isFetchingRecs && <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center text-gray-600 animate-pulse">AI가 열심히 메뉴를 찾고 있습니다...</div>}
      {error && <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}
      
      {recommendations && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h5 className="font-bold text-md text-gray-800 mb-3">✨ Gemini AI 추천 메뉴</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                <p className="font-bold text-blue-800">{item.name}</p>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};