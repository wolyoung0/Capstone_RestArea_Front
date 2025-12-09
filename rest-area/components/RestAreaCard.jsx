import React, { useState, useMemo, useRef } from 'react';
import { fetchFoodRecommendations } from '../services/apiService.js';
import { SparklesIcon } from './icons/SparklesIcon.jsx';
import { HeartIcon } from './icons/HeartIcon.jsx';
import { MapPinIcon } from './icons/MapPinIcon.jsx';
import { 
  SlidersHorizontal, ChevronRight, 
  Fuel, Zap, Utensils, Coffee, Store, Pill, 
  Baby, Bed, Bus, Stethoscope, 
  Wrench, Shirt, ShoppingBag, Banknote, Truck, 
  Car, Info 
} from 'lucide-react';

// --- 아이콘 설정 (기존 유지) ---
const getAmenityConfig = (name) => {
  const n = name || '';
  if (n.includes('주유소') || n.includes('GasStation')) return { style: 'bg-orange-100 text-orange-800 border-orange-200', icon: <Fuel className="w-3.5 h-3.5"/> };
  if (n.includes('LPG') || n.includes('충전소')) return { style: 'bg-rose-100 text-rose-800 border-rose-200', icon: <Fuel className="w-3.5 h-3.5"/> };
  if (n.includes('전기차') || n.includes('EV')) return { style: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <Zap className="w-3.5 h-3.5"/> };
  if (n.includes('식당') || n.includes('Restaurant')) return { style: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Utensils className="w-3.5 h-3.5"/> };
  if (n.includes('카페') || n.includes('커피')) return { style: 'bg-amber-50 text-amber-900 border-amber-200', icon: <Coffee className="w-3.5 h-3.5"/> };
  if (n.includes('편의점') || n.includes('매점')) return { style: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Store className="w-3.5 h-3.5"/> };
  if (n.includes('열린매장') || n.includes('간식')) return { style: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <ShoppingBag className="w-3.5 h-3.5"/> };
  if (n.includes('약국') || n.includes('Pharmacy')) return { style: 'bg-teal-100 text-teal-800 border-teal-200', icon: <Pill className="w-3.5 h-3.5"/> };
  if (n.includes('휴게소의원') || n.includes('병원')) return { style: 'bg-red-50 text-red-700 border-red-200', icon: <Stethoscope className="w-3.5 h-3.5"/> };
  if (n.includes('수유실') || n.includes('기저귀')) return { style: 'bg-pink-100 text-pink-700 border-pink-200', icon: <Baby className="w-3.5 h-3.5"/> };
  if (n.includes('세탁실') || n.includes('샤워실')) return { style: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: <Shirt className="w-3.5 h-3.5"/> };
  if (n.includes('수면실') || n.includes('쉼터')) return { style: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: <Bed className="w-3.5 h-3.5"/> };
  if (n.includes('버스환승')) return { style: 'bg-violet-100 text-violet-800 border-violet-200', icon: <Bus className="w-3.5 h-3.5"/> };
  if (n.includes('경정비') || n.includes('정비소')) return { style: 'bg-slate-200 text-slate-700 border-slate-300', icon: <Wrench className="w-3.5 h-3.5"/> };
  if (n.includes('세차장')) return { style: 'bg-sky-100 text-sky-800 border-sky-200', icon: <Car className="w-3.5 h-3.5"/> };
  if (n.includes('화물차라운지')) return { style: 'bg-slate-100 text-slate-800 border-slate-300', icon: <Truck className="w-3.5 h-3.5"/> };
  if (n.includes('내고장특산물')) return { style: 'bg-lime-100 text-lime-800 border-lime-200', icon: <ShoppingBag className="w-3.5 h-3.5"/> };
  if (n.includes('ATM') || n.includes('은행')) return { style: 'bg-green-100 text-green-800 border-green-200', icon: <Banknote className="w-3.5 h-3.5"/> };
  return { style: 'bg-gray-100 text-gray-600 border-gray-200', icon: <Info className="w-3.5 h-3.5"/> };
};

const parseRestAreaName = (fullName) => {
  if (!fullName) return { baseName: '', directionName: '' };
  const match = fullName.match(/(.*?)\((.*?)\)/);
  if (match && match.length >= 3) {
    const baseName = match[1].replace(/휴게소|주유소/g, '').trim() + '휴게소';
    let direction = match[2].trim();
    if (!direction.endsWith('방향')) direction += '방향';
    return { baseName, directionName: `(${direction})` };
  }
  return { baseName: fullName, directionName: '' };
};

const FOOD_STYLES = [
  { id: 'meal', label: '든든한 식사' },
  { id: 'snack', label: '간식' },
  { id: 'spicy', label: '매운맛' },
  { id: 'sweet', label: '달콤한 맛' },
  { id: 'hangover', label: '해장' },
  { id: 'kids', label: '어린이 추천' },
];

const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// variant: 'expanded' (경로탐색용 - 우측패널, 이미지확장) | 'compact' (휴게소검색용 - 하단패널, 이미지고정)
export const RestAreaCard = ({ restArea, index, isFavorite, onToggleFavorite, onDetailClick, className = '', variant = 'expanded' }) => {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('meal');
  const [showFilters, setShowFilters] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [isFetchingRecs, setIsFetchingRecs] = useState(false);
  const [error, setError] = useState(null);
  
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);

  // 드래그 핸들러
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setStartScrollLeft(sliderRef.current.scrollLeft);
  };
  const handleStopDragging = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = startScrollLeft - walk;
  };

  const { baseName, directionName } = parseRestAreaName(restArea.name);
  const amenitiesToDisplay = restArea.amenities || restArea.facilities || [];

  // ★ 모드별 설정 ★
  const isCompact = variant === 'compact';
  // Compact는 3개만 표시, Expanded는 8개 표시
  const VISIBLE_AMENITIES_COUNT = isCompact ? 3 : 8; 
  // Compact는 슬라이더 숨김, Expanded는 슬라이더 표시
  const SHOW_SLIDER = !isCompact; 

  const visibleAmenities = amenitiesToDisplay.slice(0, VISIBLE_AMENITIES_COUNT);
  const hiddenCount = amenitiesToDisplay.length - VISIBLE_AMENITIES_COUNT;

  const loadRecommendations = async (style) => {
    setIsFetchingRecs(true);
    setError(null);
    try {
      const data = await fetchFoodRecommendations(restArea.name, style);
      setRecommendations(data);
    } catch (error) {
      console.error("추천 로딩 에러:", error);
      setError('추천 실패');
    } finally {
      setIsFetchingRecs(false);
    }
  };

  const handleDetailClick = (e) => {
    e.stopPropagation();
    if (onDetailClick) onDetailClick(restArea);
  };

  const handleStyleClick = (styleId) => {
    if (selectedStyle === styleId) return;
    setSelectedStyle(styleId);
    if (showRecommendations) loadRecommendations(styleId);
  };

  const toggleRecommendations = () => {
    const nextState = !showRecommendations;
    setShowRecommendations(nextState);
    if (nextState && !recommendations) loadRecommendations(selectedStyle);
  };

  const toggleFilters = () => setShowFilters(!showFilters);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleFavorite(restArea.restAreaId || restArea.id);
  };

  const timeHours = Math.floor((restArea.timeMinutes || 0) / 60);
  const timeMins = (restArea.timeMinutes || 0) % 60;

  const defaultMenus = (restArea.foodMenus || []).slice(0, 3);
  let aiMenus = defaultMenus;
  
  if (recommendations) {
    if (recommendations.menus && recommendations.menus.length > 0) {
      aiMenus = recommendations.menus;
    } else if (recommendations.bestMenu) {
      const aiBestMenu = {
        name: recommendations.bestMenu,
        price: recommendations.price || restArea.bestMenuPrice || 0,
        reason: recommendations.reason
      };
      aiMenus = [aiBestMenu, ...defaultMenus.slice(1)];
    }
  }

  const allMenusRandom = useMemo(() => {
    const source = (restArea.foodMenus || []);
    return shuffleArray(source);
  }, [restArea.foodMenus]);

  const currentReason = recommendations?.reason || recommendations?.recommendation_reason || restArea.recommendationReason;
  const fallbackImage = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800";
  const mainImage = restArea.imageUrl || fallbackImage;

  // --- 렌더링 헬퍼: 필터 패널 ---
  const renderFilterPanel = () => (
    <div className={`animate-in fade-in slide-in-from-top-1 duration-200 
        ${isCompact 
            ? 'mt-0 pt-3 border-t border-gray-100 bg-gray-50/50 p-4' // Compact: 하단에 붙음
            : 'mt-3 pt-3 border-t border-gray-100 bg-gray-50/50 p-4 rounded-xl' // Expanded: 우측 내부에 둥글게
        }`}>
        <div className="flex flex-wrap gap-2">
        {FOOD_STYLES.map((style) => (
            <button
                key={style.id}
                onClick={() => handleStyleClick(style.id)}
                className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm
                    ${selectedStyle === style.id 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-blue-50'}
                `}
            >
                {style.label}
            </button>
        ))}
        </div>
    </div>
  );

  // --- 렌더링 헬퍼: 추천 결과 패널 ---
  const renderRecommendationPanel = () => (
    <div className={`animate-in fade-in slide-in-from-top-1 duration-300 
        ${isCompact 
            ? 'mt-0 pt-4 border-t border-gray-100 bg-white p-6' // Compact: 하단 전체 너비
            : 'mt-3 pt-3 border-t border-gray-100 bg-blue-50/20 p-4 rounded-xl' // Expanded: 우측 내부에 둥글게
        }`}>
        
        <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-4 h-4 text-yellow-500 animate-pulse" />
            <h5 className="font-bold text-sm text-gray-800">
                AI 추천: <span className="text-blue-600">{FOOD_STYLES.find(s=>s.id === selectedStyle)?.label}</span>
            </h5>
        </div>

        {isFetchingRecs ? (
            <div className="py-6 text-center text-blue-500 text-xs font-bold animate-pulse">
                AI가 맛있는 메뉴를 찾는 중...
            </div>
        ) : error ? (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs">{error}</div>
        ) : (
            <div className="flex flex-col gap-4">
                {/* [1] Top 2 메뉴 Grid */}
                {/* Compact(휴게소검색) = 가로 Grid, Expanded(경로검색) = 가로 Grid (동일) */}
                {aiMenus.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                        {aiMenus.slice(0, 2).map((menu, idx) => (
                            <div key={idx} className="bg-white border-2 border-blue-50 rounded-xl p-3 relative flex flex-col justify-between min-h-[90px] hover:bg-blue-50/30 transition-colors">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded text-white font-bold ${idx === 0 ? 'bg-blue-600' : 'bg-gray-400'}`}>
                                            {idx === 0 ? 'BEST' : 'HOT'}
                                        </span>
                                    </div>
                                    <p className="font-bold text-sm text-gray-900 mb-1 leading-tight line-clamp-2">
                                        {menu.name || menu.menu_name || restArea.bestMenuName}
                                    </p>
                                    {idx === 0 && (
                                        <p className="text-[10px] text-gray-500 bg-gray-50 inline-block px-1.5 py-0.5 rounded line-clamp-1">
                                            {currentReason || '강력 추천!'}
                                        </p>
                                    )}
                                </div>
                                <p className="text-sm text-blue-600 font-extrabold text-right mt-1">
                                    {Number(menu.price || (idx === 0 ? restArea.bestMenuPrice : 0)).toLocaleString()}원
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* [2] 슬라이더 (Expanded 모드일 때만 보임) */}
                {SHOW_SLIDER && allMenusRandom.length > 0 && (
                    <div className="mt-1">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <span className="text-xs font-bold text-gray-500">전체 메뉴 (랜덤)</span>
                            <span className="text-[10px] text-gray-400">옆으로 넘겨보세요 👉</span>
                        </div>
                        <div 
                            ref={sliderRef}
                            onMouseDown={handleMouseDown}
                            onMouseLeave={handleStopDragging}
                            onMouseUp={handleStopDragging}
                            onMouseMove={handleMouseMove}
                            className="flex overflow-x-auto gap-2 pb-2 -mx-2 px-2 snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing"
                        >
                            {allMenusRandom.map((menu, i) => ( 
                                <div key={i} className="snap-start flex-shrink-0 w-[120px] bg-white border border-gray-100 rounded-xl p-3 flex flex-col justify-between shadow-sm hover:border-blue-300 transition-colors min-h-[80px] select-none">
                                    <p className="font-medium text-xs text-gray-700 leading-tight line-clamp-2 mb-1">
                                        {menu.name || menu.menu_name}
                                    </p>
                                    <p className="text-[11px] text-gray-400 text-right">
                                        {menu.price ? `${Number(menu.price).toLocaleString()}원` : '-'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
  );

  return (
    // Compact 모드: flex-col (패널이 하단으로 떨어짐)
    // Expanded 모드: flex-col (하지만 패널은 우측 div 안에 있음)
    <div className={`bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col ${className}`}>
      
      {/* 카드 상단 영역 (이미지 + 정보) */}
      <div className="flex flex-col md:flex-row flex-1">
          
          {/* 1. 이미지 영역 (좌측 35%) */}
          <div className="w-full md:w-[35%] h-56 md:h-auto min-h-[220px] relative overflow-hidden group cursor-pointer" onClick={handleDetailClick}>
            <img 
                src={mainImage} 
                alt={baseName} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => { e.target.src = fallbackImage; }} 
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 z-10">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-extrabold">
                    {index > 0 ? index : <MapPinIcon className="w-3 h-3"/>}
                </div>
                <span className="text-xs font-bold text-gray-800">추천 휴게소</span>
            </div>
            <button onClick={handleFavoriteClick} className="absolute top-4 right-4 p-2.5 bg-white/60 backdrop-blur-sm rounded-full hover:bg-white text-white hover:text-red-500 transition-all shadow-md active:scale-95 z-10">
                <HeartIcon className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-800'}`} />
            </button>
          </div>

          {/* 2. 우측: 정보 및 버튼 */}
          <div className="w-full md:w-[65%] p-6 flex flex-col justify-between">
            <div className="flex-1">
                {/* 상단 정보 */}
                <div className="mb-3">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-2xl font-extrabold text-gray-900 leading-tight flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors" onClick={handleDetailClick}>
                            {baseName}
                            <ChevronRight className="w-6 h-6 text-gray-300" />
                        </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500">
                        {directionName && <span>{directionName}</span>}
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">{restArea.routeName}</span>
                        <span className="text-blue-600 font-bold">{restArea.distanceKm ? `${restArea.distanceKm}km` : '0km'}</span>
                        <span className="text-gray-400">({timeHours > 0 && `${timeHours}시간 `}{timeMins}분 소요)</span>
                    </div>
                </div>

                {/* 편의시설 */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {visibleAmenities.map((amenity, idx) => {
                        const { style, icon } = getAmenityConfig(amenity); 
                        return (
                            <div key={idx} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 select-none ${style}`}>
                                {icon} {amenity}
                            </div>
                        );
                    })}
                    {hiddenCount > 0 && (
                        <div className="px-2 py-1 text-xs font-bold text-gray-400 bg-gray-50 rounded-lg border border-gray-200">
                            +{hiddenCount}
                        </div>
                    )}
                </div>
            </div>

            {/* 버튼들 */}
            <div className="flex items-center justify-between mt-auto pt-2">
                <button onClick={toggleFilters} className="p-2 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600">
                    <SlidersHorizontal className="w-4 h-4"/> <span>필터</span>
                </button>
                <button onClick={toggleRecommendations} className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95 bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:shadow-md hover:-translate-y-0.5">
                    <SparklesIcon className={`w-3.5 h-3.5 ${showRecommendations ? 'text-gray-500' : 'text-yellow-200'}`} />
                    <span>{showRecommendations ? '닫기' : 'AI 메뉴 추천'}</span>
                </button>
            </div>

            {/* ★★★ [EXPANDED 모드: 경로 검색] ★★★ */}
            {/* 패널이 우측 컬럼 내부에 위치 -> 내용이 길어지면 우측 컬럼이 길어짐 -> flex로 인해 좌측 이미지도 같이 길어짐 */}
            {!isCompact && (
                <>
                    {showFilters && renderFilterPanel()}
                    {showRecommendations && renderRecommendationPanel()}
                </>
            )}
          </div>
      </div>

      {/* ★★★ [COMPACT 모드: 휴게소 검색] ★★★ */}
      {/* 패널이 카드 전체 하단에 위치 -> 좌측 이미지는 고정된 상태로 카드 길이만 늘어남 */}
      {isCompact && (
         <>
            {showFilters && renderFilterPanel()}
            {showRecommendations && renderRecommendationPanel()}
         </>
      )}

    </div>
  );
};