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

// --- 편의시설 아이콘 설정 (유지) ---
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
    if (!direction.endsWith('방향')) { direction += '방향'; }
    return { baseName, directionName: `(${direction})` };
  }
  const trimmedName = fullName.trim();
  const finalName = trimmedName.endsWith('휴게소') ? trimmedName : `${trimmedName}휴게소`;
  return { baseName: finalName, directionName: '' };
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

const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const RestAreaCard = ({ restArea, index, isFavorite, onToggleFavorite, onDetailClick, className = '' }) => {
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('meal');
  const [showFilters, setShowFilters] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [isFetchingRecs, setIsFetchingRecs] = useState(false);
  const [error, setError] = useState(null);
  const [amenitiesExpanded, setAmenitiesExpanded] = useState(false);

  const { baseName, directionName } = parseRestAreaName(restArea.name);
  const amenitiesToDisplay = restArea.amenities || restArea.facilities || [];

  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);

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

  const handleDetailClick = (e) => {
    e.stopPropagation();
    if (onDetailClick) onDetailClick(restArea);
  };

  const handleStyleClick = (styleId) => {
    if (selectedStyle === styleId) return;
    setSelectedStyle(styleId);
    if (showRecommendations) loadRecommendations(styleId);
    else setRecommendations(null); 
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
  
  const visibleAmenities = amenitiesExpanded 
    ? amenitiesToDisplay 
    : amenitiesToDisplay.slice(0, INITIAL_AMENITIES_LIMIT);
  const hiddenAmenitiesCount = amenitiesToDisplay.length - visibleAmenities.length;

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

  return (
    <div className={`bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col md:flex-row ${className}`}>
      
      {/* 좌측: 이미지 */}
      <div className="w-full md:w-[35%] h-56 md:h-auto min-h-[250px] relative overflow-hidden group cursor-pointer" onClick={handleDetailClick}>
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
        <button 
            onClick={handleFavoriteClick}
            className="absolute top-4 right-4 p-2.5 bg-white/60 backdrop-blur-sm rounded-full hover:bg-white text-white hover:text-red-500 transition-all shadow-md active:scale-95 z-10"
        >
            <HeartIcon className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-800'}`} />
        </button>
      </div>

      {/* 우측: 정보 및 추천 결과 컨테이너 */}
      {/* ★ flex flex-col로 설정하여 내부 요소들이 수직으로 쌓이게 함 */}
      <div className="w-full md:w-[65%] p-6 flex flex-col">
        
        {/* 상단 정보 영역 */}
        <div className="mb-4">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <h3 className="text-2xl font-extrabold text-gray-900 leading-tight mb-2 flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors" onClick={handleDetailClick}>
                        {baseName}
                        <ChevronRight className="w-6 h-6 text-gray-300" />
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        {directionName && <span className="text-gray-500">{directionName}</span>}
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">{restArea.routeName}</span>
                        <span className="text-blue-600 font-bold">{restArea.distanceKm ? `${restArea.distanceKm}km` : '0km'}</span>
                        <span className="text-gray-400">({timeHours > 0 && `${timeHours}시간 `}{timeMins}분 소요)</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {visibleAmenities.map((amenity, idx) => {
                    const { style, icon } = getAmenityConfig(amenity); 
                    return (
                        <div key={idx} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 select-none ${style}`}>
                            {icon} {amenity}
                        </div>
                    );
                })}
                {hiddenAmenitiesCount > 0 && !amenitiesExpanded && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setAmenitiesExpanded(true); }}
                        className="px-2 py-1 text-xs font-bold text-gray-400 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                        +{hiddenAmenitiesCount}
                    </button>
                )}
            </div>
        </div>

        {/* 버튼 영역 (mt-auto로 가능한 하단으로 밀어냄) */}
        <div className="flex items-center justify-between mt-auto pt-4">
            <div className="flex items-center gap-2">
                <button 
                    onClick={toggleFilters} 
                    className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-sm font-bold
                        ${showFilters 
                            ? 'bg-blue-50 border-blue-200 text-blue-600' 
                            : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600'}
                    `}
                >
                    <SlidersHorizontal className="w-4 h-4"/>
                    <span className="hidden sm:inline">취향 필터</span>
                </button>
            </div>
            
            <button
                onClick={toggleRecommendations}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95
                    ${showRecommendations 
                        ? 'bg-gray-100 text-gray-600 shadow-inner' 
                        : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:shadow-lg hover:-translate-y-0.5'}
                `}
            >
                <SparklesIcon className={`w-4 h-4 ${showRecommendations ? 'text-gray-500' : 'text-yellow-200'}`} />
                <span>{showRecommendations ? '추천 닫기' : 'AI 메뉴 추천'}</span>
            </button>
        </div>

        {/* ============================================================ */}
        {/* ★ 여기로 이동! 우측 컬럼 내부 하단에 필터/추천 패널 배치 ★ */}
        {/* ============================================================ */}

        {/* (A) 필터 패널 */}
        {showFilters && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200 mt-4 p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                 <div className="flex flex-wrap gap-2">
                    {FOOD_STYLES.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => handleStyleClick(style.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm
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
        )}

        {/* (B) AI 추천 결과 패널 */}
        {showRecommendations && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-300 mt-4 p-4 bg-blue-50/30 rounded-2xl border border-blue-100">
                
                <div className="flex items-center gap-2 mb-4">
                     <SparklesIcon className="w-5 h-5 text-yellow-500 animate-pulse" />
                     <h5 className="font-bold text-sm text-gray-800">
                        AI 추천: <span className="text-blue-600">{FOOD_STYLES.find(s=>s.id === selectedStyle)?.label}</span>
                     </h5>
                </div>

                {isFetchingRecs ? (
                    <div className="py-8 flex flex-col justify-center items-center text-blue-500 gap-3">
                        <SparklesIcon className="w-6 h-6 animate-spin" />
                        <span className="text-xs font-bold animate-pulse">최고의 메뉴를 찾는 중...</span>
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-100">{error}</div>
                ) : (
                    <div className="flex flex-col gap-6">
                        
                        {/* [1] Top 2 메뉴 그리드 (★ grid-cols-2로 강제하여 항상 가로 배치 ★) */}
                        {aiMenus.length > 0 && (
                            <div className="grid grid-cols-2 gap-3">
                                {aiMenus.slice(0, 2).map((menu, idx) => (
                                    <div key={idx} className="bg-white border-2 border-blue-50 rounded-2xl p-3 relative overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[100px]">
                                        <div className={`absolute top-0 right-0 text-white text-[9px] px-2 py-0.5 rounded-bl-xl font-bold z-10 ${idx === 0 ? 'bg-blue-600' : 'bg-gray-400'}`}>
                                            {idx === 0 ? 'BEST' : 'HOT'}
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-sm text-gray-900 mb-1 leading-tight line-clamp-2">
                                                {menu.name || menu.menu_name || restArea.bestMenuName}
                                            </p>
                                            <p className="text-[10px] text-gray-500 bg-gray-50 inline-block px-1.5 py-0.5 rounded line-clamp-1">
                                                {idx === 0 ? (currentReason || '강력 추천!') : "인기 메뉴"}
                                            </p>
                                        </div>
                                        <p className="text-sm text-blue-600 font-extrabold text-right mt-2">
                                            {Number(menu.price || (idx === 0 ? restArea.bestMenuPrice : 0)).toLocaleString()}원
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* [2] 전체 메뉴 랜덤 슬라이더 */}
                        {allMenusRandom.length > 0 && (
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
                                    className="flex overflow-x-auto gap-2 pb-2 -mx-1 px-1 snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing"
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
        )}
      </div>
    </div>
  );
};