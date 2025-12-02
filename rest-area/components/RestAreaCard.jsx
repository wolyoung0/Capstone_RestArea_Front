import React, { useState } from 'react';
import { fetchFoodRecommendations } from '../services/apiService.js';
import { SparklesIcon } from './icons/SparklesIcon.jsx';
import { HeartIcon } from './icons/HeartIcon.jsx';
import { MapPinIcon } from './icons/MapPinIcon.jsx';
import { SlidersHorizontal } from 'lucide-react';

// --- 유틸리티 및 상수 ---
const Amenity = {
  GasStation: 'GasStation',
  LPGStation: 'LPGStation',
  EVStation: 'EVStation',
  ConvenienceStore: 'ConvenienceStore',
  Restaurant: 'Restaurant',
  Cafe: 'Cafe',
  Pharmacy: 'Pharmacy',
  SleepingRoom: 'SleepingRoom',
  ShowerRoom: 'ShowerRoom',
};

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
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('meal');
  const [showFilters, setShowFilters] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [isFetchingRecs, setIsFetchingRecs] = useState(false);
  const [error, setError] = useState(null);
  const [amenitiesExpanded, setAmenitiesExpanded] = useState(false);

  const { baseName, directionName } = parseRestAreaName(restArea.name);
  const amenitiesToDisplay = restArea.amenities || restArea.facilities || [];

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

  const handleStyleClick = (styleId) => {
    if (selectedStyle === styleId) return; 
    setSelectedStyle(styleId);
    if (showRecommendations) {
        loadRecommendations(styleId);
    }
  };

  const toggleRecommendations = () => {
    const nextState = !showRecommendations;
    setShowRecommendations(nextState);
    if (nextState && !recommendations) {
        loadRecommendations(selectedStyle);
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleFavorite(restArea.restAreaId || restArea.id);
  };

  const timeHours = Math.floor((restArea.timeMinutes || 0) / 60);
  const timeMins = (restArea.timeMinutes || 0) % 60;
  
  const visibleAmenities = amenitiesExpanded 
    ? amenitiesToDisplay 
    : amenitiesToDisplay.slice(0, INITIAL_AMENITIES_LIMIT);
  const hiddenAmenitiesCount = amenitiesToDisplay.length - visibleAmenities.length;

  const currentBestMenu = recommendations?.bestMenu || recommendations?.best_menu || restArea.bestMenuName;
  const currentReason = recommendations?.reason || recommendations?.recommendation_reason || restArea.recommendationReason;
  const defaultMenus = (restArea.foodMenus || []).slice(0, 3);
  const currentTopMenus = recommendations?.menus || recommendations?.top_menus || defaultMenus;

  return (
    <div className={`bg-white rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl border border-transparent relative flex flex-col ${className}`}>
      
      {/* =====================================================================================
          메인 컨텐츠 영역 (순수 Stack 구조: 위 -> 아래)
      ===================================================================================== */}
      <div className="p-5 flex flex-col">
        
        {/* [1층] 헤더: 아이콘 + 제목 + 하트 (양 끝 정렬) */}
        <div className="flex justify-between items-start">
            <div className="flex gap-3">
                {/* 순번 아이콘 */}
                <div className="flex-shrink-0 flex items-center justify-center bg-blue-100 text-blue-600 w-10 h-10 rounded-full font-bold text-lg mt-0.5">
                    {index > 0 ? index : <MapPinIcon className="w-5 h-5" />}
                </div>

                {/* 텍스트 그룹 (제목 + 노선명) */}
                <div className="flex flex-col">
                    {/* 제목 */}
                    <div className="flex flex-col md:flex-row md:items-baseline md:gap-1.5">
                        <h4 className="text-lg md:text-xl font-bold text-gray-900 leading-tight break-keep">
                            {baseName}
                        </h4>
                        {directionName && (
                            <span className="text-sm md:text-base text-gray-600 font-normal leading-tight break-keep">
                                {directionName}
                            </span>
                        )}
                    </div>
                    
                    {/* ★ [2층] 노선명 및 거리 정보 (제목 바로 아래에 바짝 붙임) ★ */}
                    <div className="mt-1 text-sm text-gray-500 font-medium flex flex-wrap items-center gap-2">
                        <span className="text-gray-600 font-semibold">{restArea.routeName}</span>
                        {index > 0 && (
                            <>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span>{restArea.distanceKm || (restArea.distance ? (restArea.distance/1000).toFixed(1) : 0)}km</span>
                                <span className="text-gray-400 hidden sm:inline">| 약 {timeHours > 0 && `${timeHours}시간 `}{timeMins}분 후</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 하트 버튼 (우측 상단 고정) */}
            <button 
                onClick={handleFavoriteClick}
                className="p-2 -mt-2 -mr-2 rounded-full hover:bg-red-50 transition-colors active:scale-95"
            >
                <HeartIcon className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-300'}`} />
            </button>
        </div>


        {/* ★ [3층] 버튼 영역 (중간에 배치 / 우측 정렬) ★ */}
        {/* 노선명과는 줄바꿈이 되며, 편의시설보다는 위에 위치함 */}
        <div className="flex justify-end items-center gap-2 mt-4 mb-2">
             {/* 필터 버튼 */}
             <button
                onClick={toggleFilters}
                className={`p-2 rounded-lg border transition-all text-gray-400 border-gray-200 bg-white hover:text-blue-600 hover:border-blue-200 active:scale-95
                    ${showFilters ? 'bg-blue-50 text-blue-600 border-blue-200 ring-1 ring-blue-100' : ''}`}
                title="필터"
            >
                <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* AI 추천 버튼 */}
            <button
                onClick={toggleRecommendations}
                className={`flex items-center justify-center gap-1 py-2 px-3 rounded-lg shadow-sm font-bold text-xs md:text-sm transition-all active:scale-95 whitespace-nowrap
                    ${showRecommendations 
                    ? 'bg-gray-200 text-gray-600 shadow-inner' 
                    : 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white hover:shadow-md hover:-translate-y-0.5'}`}
            >
                <SparklesIcon className={`w-3.5 h-3.5 ${showRecommendations ? 'text-gray-500' : 'text-white'}`} />
                <span>{showRecommendations ? '닫기' : 'AI 메뉴 추천'}</span>
            </button>
        </div>


        {/* ★ [4층] 편의시설 영역 (맨 아래) ★ */}
        <div className="pt-2 border-t border-dashed border-gray-100">
            <div className="flex flex-wrap items-center gap-1.5">
                {visibleAmenities.length > 0 ? (
                    visibleAmenities.map((amenity, idx) => (
                    <div key={`${amenity}-${idx}`} className={`px-1.5 py-0.5 rounded-md text-[10px] md:text-[11px] font-bold border ${amenityColors[amenity] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {amenity}
                    </div>
                    ))
                ) : (
                    <span className="text-xs text-gray-400 py-1">편의시설 정보 없음</span>
                )}
                
                {hiddenAmenitiesCount > 0 && !amenitiesExpanded && (
                    <button
                    onClick={(e) => { e.stopPropagation(); setAmenitiesExpanded(true); }}
                    className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[10px] font-bold border border-gray-200 hover:bg-gray-200"
                    >
                    +{hiddenAmenitiesCount}
                    </button>
                )}
            </div>
        </div>

      </div>

      {/* =====================================================================================
          하단 확장 패널 (필터창 & 추천 결과창) - 기존 유지
      ===================================================================================== */}
      {showFilters && (
        <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-200 border-t border-gray-100 pt-4">
             <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-2.5">
                    <p className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1">
                        <span className="w-1 h-3 bg-gray-400 rounded-full"></span>
                        원하는 스타일을 선택하세요:
                    </p>
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
        </div>
      )}

      {showRecommendations && (
        <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-gray-100 pt-4">
             <div className="pt-2">
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
        </div>
      )}
    </div>
  );
};