import React, { useState } from 'react';
import { Amenity } from '../types.js';
import { fetchFoodRecommendations } from '../services/apiService.js';
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

const FOOD_STYLES = [
  { id: 'meal', label: '든든한 식사' },
  { id: 'snack', label: '간식' },
  { id: 'spicy', label: '매운맛' },
  { id: 'sweet', label: '달콤한 맛' },
  { id: 'hangover', label: '해장' },
  { id: 'kids', label: '어린이 추천' },
];

const INITIAL_AMENITIES_LIMIT = 8;

export const RestAreaCard = ({ restArea, index, isFavorite, onToggleFavorite, className = '' }) => {
  // 1. 상태 관리
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('meal');
  const [showFilters, setShowFilters] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [isFetchingRecs, setIsFetchingRecs] = useState(false);
  const [error, setError] = useState(null);
  const [amenitiesExpanded, setAmenitiesExpanded] = useState(false);

  // 데이터 파싱
  const { baseName, directionName } = parseRestAreaName(restArea.name);
  const amenitiesToDisplay = restArea.amenities || restArea.facilities || [];

  // API 호출
  const loadRecommendations = async (style) => {
    setIsFetchingRecs(true);
    setError(null);
    try {
      const data = await fetchFoodRecommendations(restArea.name, style);
      setRecommendations(data);
    } catch (error) {
      console.error("추천 로딩 에러:", error);
      setError('추천 메뉴를 불러오는 데 실패했습니다.');
    } finally {
      setIsFetchingRecs(false);
    }
  };

  // 스타일 클릭 핸들러
  const handleStyleClick = (styleId) => {
    if (selectedStyle === styleId) return; 
    setSelectedStyle(styleId);
    
    // 추천 창이 열려있다면 데이터 갱신
    if (showRecommendations) {
        loadRecommendations(styleId);
    }
  };

  // AI 추천 토글
  const toggleRecommendations = () => {
    const nextState = !showRecommendations;
    setShowRecommendations(nextState);

    // 열릴 때 데이터가 없으면 로딩
    if (nextState && !recommendations) {
        loadRecommendations(selectedStyle);
    }
  };


  // 필터 토글 핸들러
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // 즐겨찾기 핸들러
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(restArea.restAreaId || restArea.id);
  };

  const timeHours = Math.floor((restArea.timeMinutes || 0) / 60);
  const timeMins = (restArea.timeMinutes || 0) % 60;
  
  const visibleAmenities = amenitiesExpanded 
    ? amenitiesToDisplay 
    : amenitiesToDisplay.slice(0, INITIAL_AMENITIES_LIMIT);
  const hiddenAmenitiesCount = amenitiesToDisplay.length - visibleAmenities.length;

  // 렌더링 데이터
  const currentBestMenu = recommendations?.bestMenu || recommendations?.best_menu || restArea.bestMenuName;
  const currentReason = recommendations?.reason || recommendations?.recommendation_reason || restArea.recommendationReason;
  const defaultMenus = (restArea.foodMenus || []).slice(0, 3);
  const currentTopMenus = recommendations?.menus || recommendations?.top_menus || defaultMenus;

  return (
    <div className={`bg-white rounded-2xl shadow-md p-6 transition-all duration-300 hover:shadow-xl border border-transparent relative ${className}`}>
      
      {/* 1. 상단 영역: [순번] [이름/정보] [AI버튼] */}
      <div className="flex flex-row gap-4 mb-4">
        
        {/* 왼쪽: 순번 아이콘 */}
        <div className="flex-shrink-0 flex items-center justify-center bg-blue-100 text-blue-600 w-10 h-10 md:w-12 md:h-12 rounded-full font-bold text-lg md:text-xl mt-1">
          {index > 0 ? index : <MapPinIcon className="w-5 h-5 md:w-6 md:h-6" />}
        </div>

        {/* 가운데: 휴게소 정보 */}
        <div className="flex-grow min-w-0 pr-2">
          <div className="flex items-start justify-between">
            <div>
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                    {baseName} {directionName && <span className="text-base md:text-lg font-normal text-gray-600">{directionName}</span>}
                </h4>
                <div className="mt-1 text-sm text-gray-500 font-medium flex items-center gap-2">
                    <span>{restArea.routeName}</span>
                    {index > 0 && (
                        <>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="text-blue-600 font-bold">{restArea.distanceKm || (restArea.distance ? (restArea.distance/1000).toFixed(1) : 0)}km</span>
                            <span className="text-gray-400">약 {timeHours > 0 && `${timeHours}시간 `}{timeMins}분 후</span>
                        </>
                    )}
                </div>
            </div>
            
            {/* 오른쪽 상단: AI 메뉴 추천 버튼 & 즐겨찾기 (화면 넓을 때) */}
            <div className="hidden md:flex items-center gap-2">
              <button
                    onClick={toggleFilters}
                    className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 border
                        ${showFilters 
                            ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-inner' 
                            : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50 hover:text-gray-600'}
                    `}
                    title="메뉴 스타일 필터 설정"
                 >
                    <FilterIcon className="w-5 h-5" />
                 </button>
                 <button
                    onClick={toggleRecommendations}
                    className={`flex items-center gap-1 px-4 py-2 font-bold text-sm rounded-lg shadow-sm transition-all duration-200 border 
                        ${showRecommendations 
                        ? 'bg-gray-100 text-gray-600 border-gray-200' 
                        : 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white border-transparent hover:shadow-md hover:-translate-y-0.5'}
                    `}
                >
                    <SparklesIcon className={`w-4 h-4 ${showRecommendations ? 'text-gray-500' : 'text-white'}`} />
                    <span>{showRecommendations ? '닫기' : 'AI 메뉴 추천'}</span>
                </button>
                 <button 
                    onClick={handleFavoriteClick}
                    className="p-2 rounded-full hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                >
                    <HeartIcon className={`w-6 h-6 transition-all duration-200 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-300 hover:text-red-400'}`} />
                </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 모바일용 우측 상단 버튼들 (화면 좁을 때) */}
      <div className="flex md:hidden justify-end items-center gap-2 mb-4">
           <button
                onClick={toggleRecommendations}
                className={`flex-grow flex items-center justify-center gap-1 px-3 py-2 font-bold text-sm rounded-lg shadow-sm transition-all duration-200 
                    ${showRecommendations 
                    ? 'bg-gray-100 text-gray-600' 
                    : 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white'}
                `}
            >
                <SparklesIcon className="w-4 h-4" />
                <span>AI 추천</span>
            </button>
            <button 
                onClick={handleFavoriteClick}
                className="p-2 rounded-lg bg-gray-50 border border-gray-100"
            >
                <HeartIcon className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-300'}`} />
            </button>
      </div>

      {/* 2. [수정] 필터링 선택 영역 (사진처럼 정보 바로 아래 배치) */}
      {showFilters && (
        <div className="bg-gray-50/50 rounded-xl p-4 mb-4 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center mb-2.5">
                <p className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1">
                    <span className="w-1 h-3 bg-gray-400 rounded-full"></span>
                    원하는 스타일을 선택하세요:
                </p>
                {/* 닫기 버튼 */}
                <button onClick={() => setShowFilters(false)} className="text-xs text-gray-400 hover:text-gray-600 underline">
                    닫기
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {FOOD_STYLES.map((style) => (
                    <button
                        key={style.id}
                        onClick={() => handleStyleClick(style.id)}
                        disabled={isFetchingRecs}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border
                            ${selectedStyle === style.id 
                                ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-100' 
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}
                            ${isFetchingRecs ? 'opacity-60 cursor-not-allowed' : ''}
                        `}
                    >
                        {style.label}
                    </button>
                ))}
            </div>
        </div>
      )}

      {/* 3. [수정] 편의시설 영역 (필터 아래 배치) */}
      <div className="flex flex-wrap items-center gap-2 mb-2 px-1">
          {visibleAmenities.length > 0 ? (
            visibleAmenities.map((amenity, idx) => (
              <div key={`${amenity}-${idx}`} className={`px-2 py-1 rounded-md text-[11px] font-bold border ${amenityColors[amenity] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {amenity}
              </div>
            ))
          ) : (
            <span className="text-xs text-gray-400 ml-1">편의시설 정보 없음</span>
          )}
          {hiddenAmenitiesCount > 0 && !amenitiesExpanded && (
            <button
              onClick={() => setAmenitiesExpanded(true)}
              className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-[10px] font-bold border border-gray-200 hover:bg-gray-200"
            >
              +{hiddenAmenitiesCount}
            </button>
          )}
      </div>

      {/* 4. AI 추천 결과 표시 영역 */}
      {showRecommendations && (
        <div className="mt-6 pt-5 border-t border-dashed border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-3">
             <SparklesIcon className="w-5 h-5 text-yellow-500" />
             <h5 className="font-bold text-sm text-gray-800">
                Gemini AI 맞춤 추천 
                <span className="text-xs text-gray-400 font-normal ml-1">
                    ({FOOD_STYLES.find(s=>s.id === selectedStyle)?.label})
                </span>
             </h5>
          </div>

          {isFetchingRecs ? (
            <div className="py-8 flex flex-col justify-center items-center text-blue-500 gap-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <SparklesIcon className="w-6 h-6 animate-spin" />
                <span className="text-xs font-bold animate-pulse">AI가 맛있는 메뉴를 찾고 있어요...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-100">{error}</div>
          ) : (
            <div className="flex flex-col gap-3">
                {/* Best Choice */}
                {currentBestMenu ? (
                    <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold z-10 shadow-sm">
                            AI Best Choice
                        </div>
                        <div className="flex flex-col items-start mt-1">
                            <p className="font-extrabold text-lg text-gray-900 mb-1">{currentBestMenu}</p>
                            <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md inline-block mb-3">
                                {Number(currentBestMenu.price || 0) > 0 ? `${Number(currentBestMenu.price).toLocaleString()}원` : '가격 정보 없음'}
                            </p>
                            <div className="w-full h-px bg-gray-100 mb-3"></div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                " {currentReason} "
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 text-center py-4">추천 정보를 불러올 수 없습니다.</p>
                )}

                {/* Sub Menus */}
                {currentTopMenus.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                        {currentTopMenus.map((menu, i) => (
                            <div key={i} className={`p-2 rounded-xl border bg-white text-center flex flex-col justify-center min-h-[70px] ${menu.name === currentBestMenu ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'}`}>
                                <p className={`font-bold text-xs mb-1 truncate px-1 ${menu.name === currentBestMenu ? 'text-blue-700' : 'text-gray-700'}`}>
                                    {menu.name || menu.menu_name}
                                </p>
                                {menu.price && (
                                    <p className="text-[10px] text-gray-400">
                                        {Number(menu.price).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};