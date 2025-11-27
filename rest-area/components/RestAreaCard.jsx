import React, { useState, useCallback } from 'react';
import { Amenity } from '../types.js';
import { SparklesIcon } from './icons/SparklesIcon.jsx';
import { HeartIcon } from './icons/HeartIcon.jsx';
import { MapPinIcon } from './icons/MapPinIcon.jsx';
import { fetchFoodRecommendations } from '../services/apiService.js';

const amenityColors = {
  [Amenity.GasStation]: 'bg-orange-100 text-orange-800 border-orange-200',
  [Amenity.LPGStation]: 'bg-red-100 text-red-800 border-red-200',
  [Amenity.EVStation]: 'bg-green-100 text-green-800 border-green-200',
  [Amenity.ConvenienceStore]: 'bg-sky-100 text-sky-800 border-sky-200',
  [Amenity.Restaurant]: 'bg-amber-100 text-amber-800 border-amber-200',
  [Amenity.Pharmacy]: 'bg-teal-100 text-teal-800 border-teal-200',
  [Amenity.SleepingRoom]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [Amenity.ShowerRoom]: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

const FOOD_STYLES = [
  { id: 'meal', label: '든든한 식사' },
  { id: 'snack', label: '간식' },
  { id: 'spicy', label: '매운맛' },
  { id: 'sweet', label: '달콤한 맛' },
  { id: 'hangover', label: '해장' },
  { id: 'kids', label: '어린이 추천' },
];

export const RestAreaCard = ({ restArea, index, isFavorite, onToggleFavorite, size = 'full', className = '' }) => {
  // 1. 상태 관리
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('meal');
  
  // [추가 2] API 데이터와 로딩 상태 저장
  const [recommendations, setRecommendations] = useState(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  // 2. [수정] 데이터 매핑 (값이 비어있는 문제 해결)
  // 백엔드에서 facilities가 올 수도, amenities가 올 수도 있음
  const visibleAmenities = restArea.facilities || restArea.amenities || [];
  // 방향 정보가 없으면 routeName이라도 사용
  const directionInfo = restArea.direction || restArea.routeName || "";
  
  // 거리/시간 계산
  let displayDistance = 0;
  if (restArea.distanceKm) displayDistance = restArea.distanceKm;
  else if (restArea.distance) displayDistance = (restArea.distance / 1000).toFixed(1);

  let displayTime = 0;
  if (restArea.timeMinutes) displayTime = restArea.timeMinutes;
  else if (restArea.duration) displayTime = Math.round(restArea.duration / 60);


  // 3. [추가] API 호출 함수
  const loadRecommendations = async (style) => {
    setIsLoadingRecs(true);
    // setRecommendations(null); // 로딩 시 기존 데이터 깜빡임 방지를 위해 주석 처리하거나 해제
    try {
      // API 호출: 휴게소 이름과 선택한 스타일 전달
      const data = await fetchFoodRecommendations(restArea.name, style);
      setRecommendations(data);
    } catch (error) {
      console.error("추천 메뉴 로딩 실패:", error);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  // 4. [수정] 토글 핸들러
  const toggleRecommendations = () => {
    const nextState = !showRecommendations;
    setShowRecommendations(nextState);

    // 열릴 때 데이터가 없으면 기본 스타일로 로딩 시작
    if (nextState && !recommendations) {
        loadRecommendations(selectedStyle);
    }
  };

  // 5. [수정] 스타일 클릭 핸들러 (필터링 연동)
  const handleStyleClick = (styleId) => {
    if (selectedStyle === styleId) return; // 같은 거 누르면 무시

    setSelectedStyle(styleId);
    
    // 추천 창이 열려있다면 바로 API 호출해서 데이터 갱신
    if (showRecommendations) {
        loadRecommendations(styleId);
    }
  };

  // 6. 렌더링 할 데이터 결정 (API 결과 우선, 없으면 기본값)
  const currentBestMenu = recommendations?.bestMenu || restArea.bestMenuName;
  const currentReason = recommendations?.reason || restArea.recommendationReason;
  const currentTopMenus = recommendations?.menus || (restArea.foodMenus ? restArea.foodMenus.slice(0, 3) : []);

  return (
    <div className={`bg-white rounded-2xl shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:border-blue-300 border border-transparent relative ${className}`}>
      
      {/* 즐겨찾기 버튼 */}
      <button 
        onClick={onToggleFavorite} 
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-100 transition-colors z-10"
      >
        <HeartIcon className={`w-6 h-6 transition-all duration-200 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-400'}`} />
      </button>

      <div className="flex flex-row items-start gap-4">
        <div className="flex-shrink-0 flex items-center justify-center bg-blue-100 text-blue-600 w-12 h-12 rounded-full font-bold text-xl">
          {index ? index : <MapPinIcon className="w-6 h-6" />}
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-grow min-w-0 md:pr-4">
              <h4 className="text-xl font-bold text-gray-900 min-h-[2rem] flex items-center leading-tight">
                {/* [수정] directionInfo 변수 사용 */}
                <span>{restArea.name} {directionInfo && <span className="text-sm font-normal text-gray-500 ml-1">({directionInfo})</span>}</span>
              </h4>
              
              <div className="flex items-center gap-2 mt-1 text-sm font-medium">
                <span className="text-gray-500">{restArea.highway}</span>
                {displayDistance > 0 && (
                    <>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-blue-600 font-bold">{displayDistance}km</span>
                    </>
                )}
                {displayTime > 0 && (
                    <span className="text-gray-400 ml-1">약 {displayTime}분 후 도착</span>
                )}
              </div>
            </div>
            
            <div className={`w-full ${size === 'compact' ? 'md:w-28' : 'md:w-44'} flex-shrink-0`}>
              <button
                onClick={toggleRecommendations}
                className={`w-full min-h-[3.25rem] flex items-center justify-center text-center px-4 py-2 font-bold text-sm rounded-lg shadow-md transition-all duration-200 
                  ${showRecommendations 
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                    : 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white hover:shadow-lg hover:scale-105'
                  }`}
              >
                <SparklesIcon className={`w-5 h-5 mr-2 flex-shrink-0 ${showRecommendations ? 'text-gray-500' : 'text-white'}`} />
                <span>{showRecommendations ? '추천 닫기' : 'AI 추천 보기'}</span>
              </button>
            </div>
          </div>
          
          {/* 스타일 선택 필터 */}
          <div className="mt-4 mb-3">
             <div className="flex flex-wrap gap-2">
                {FOOD_STYLES.map((style) => (
                    <button
                        key={style.id}
                        onClick={() => handleStyleClick(style.id)}
                        disabled={isLoadingRecs} // 로딩 중 클릭 방지
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border
                            ${selectedStyle === style.id 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'}
                            ${isLoadingRecs ? 'opacity-60 cursor-not-allowed' : ''}
                        `}
                    >
                        {style.label}
                    </button>
                ))}
            </div>
          </div>

          {/* [수정] 안전한 변수 visibleAmenities 사용 */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {visibleAmenities.length > 0 ? visibleAmenities.map((amenity, idx) => (
              <div key={idx} className={`px-2.5 py-1 rounded-full text-xs font-medium border ${amenityColors[amenity] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {amenity}
              </div>
            )) : (
              <span className="text-xs text-gray-400">편의시설 정보 없음</span>
            )}
           </div>
        </div>
      </div>
      
      {/* AI 추천 메뉴 결과 영역 */}
      {showRecommendations && (
        <div className="mt-6 pt-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-3">
            <SparklesIcon className="w-5 h-5 text-yellow-500" />
            <h5 className="font-bold text-md text-gray-800">
                Gemini AI 맞춤 추천 
                <span className="text-xs text-gray-400 font-normal ml-1">
                    ({FOOD_STYLES.find(s=>s.id === selectedStyle)?.label})
                </span>
            </h5>
          </div>

          {/* [추가] 로딩 UI */}
          {isLoadingRecs ? (
            <div className="py-6 flex justify-center items-center text-blue-500 gap-2">
                <SparklesIcon className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">AI가 맛있는 메뉴를 찾고 있어요...</span>
            </div>
          ) : (
            <>
                {currentBestMenu ? (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg font-bold">
                        Best Choice
                    </div>
                    <p className="font-bold text-lg text-blue-900">{currentBestMenu}</p>
                    <p className="text-sm text-blue-700 mt-1 font-medium">
                        💡 {currentReason}
                    </p>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 mb-4">해당 스타일에 맞는 추천 데이터가 없습니다.</p>
                )}

                {currentTopMenus.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {currentTopMenus.map((menu, i) => (
                        <div key={i} className={`p-3 rounded-lg border ${menu.name === currentBestMenu ? 'border-blue-200 bg-blue-50 ring-1 ring-blue-300' : 'bg-gray-50 border-gray-100'}`}>
                        <p className={`font-bold text-sm ${menu.name === currentBestMenu ? 'text-blue-800' : 'text-gray-700'}`}>
                            {menu.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{menu.price ? Number(menu.price).toLocaleString() + '원' : ''}</p>
                        </div>
                    ))}
                    </div>
                )}
            </>
          )}
        </div>
      )}
    </div>
  );
};