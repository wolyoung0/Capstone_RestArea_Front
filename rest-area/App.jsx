
import React, { useState, useCallback , useMemo, useEffect} from 'react';
import { Header } from './components/Header.jsx';
import { RouteSearch } from './components/RouteSearch.jsx';
import { SearchResults } from './components/SearchResults.jsx';
import { Amenity } from './types.js';
import { CarIcon } from './components/icons/CarIcon.jsx';
import { MapView } from './components/MapView.jsx';
import { RestAreaSearchView } from './components/RestAreaSearchView.jsx';
import { FavoritesView } from './components/FavoritesView.jsx';
import { ALL_REST_AREAS } from './data/restAreas.js';

import useAppStore from './stores/appStore';


const mockRestAreas = [
  {
    id: 1,
    name: '안성휴게소',
    direction: '서울방향',
    highway: '경부고속도로',
    distanceKm: 45,
    timeMinutes: 40,
    amenities: [Amenity.GasStation, Amenity.EVStation, Amenity.ConvenienceStore, Amenity.Pharmacy, Amenity.Cafe],
  },
  {
    id: 2,
    name: '천안휴게소',
    direction: '서울방향',
    highway: '경부고속도로',
    distanceKm: 85,
    timeMinutes: 80,
    amenities: [Amenity.GasStation, Amenity.LPGStation, Amenity.ConvenienceStore, Amenity.Restaurant],
  },
  {
    id: 3,
    name: '옥천휴게소',
    direction: '서울방향',
    highway: '경부고속도로',
    distanceKm: 120,
    timeMinutes: 110,
    amenities: [Amenity.GasStation, Amenity.EVStation, Amenity.ConvenienceStore, Amenity.SleepingRoom, Amenity.ShowerRoom],
  },
];

const mockRoute = {
  totalDistanceKm: 195,
  totalTimeMinutes: 150,
  restAreas: mockRestAreas,
};

const App = () => {
  //Zustand에서 전역 상태를 가져옵니다.
  const { activeTab, setActiveTab } = useAppStore();

  const [origin, setOrigin] = useState('서울');
  const [destination, setDestination] = useState('부산');
  const [route, setRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // const [activeView, setActiveView] = useState('route');
  const [favorites, setFavorites] = useState([1, 3]);

  // const [selectedRestArea, setSelectedRestArea] = useState(null);
  // const [menuSearchFilters, setMenuSearchFilters] = useState({});
  // const [menuSearchResults, setMenuSearchResults] = useState([]);

  // const [favorites, setFavorites] = useState(getFavorites());
  // const [routeRestAreas, setRouteRestAreas] = useState([]);

  const [restAreaSearchFilters, setRestAreaSearchFilters] = useState({});
  const [restAreaSearchResults, setRestAreaSearchResults] = useState([]); // API로 채워질 최종 목록

  // (A) 초기 목록 로드 (앱이 켜지거나 탭이 바뀔 때 실행)
  React.useEffect(() => {
    // 'search' 또는 'map' 탭이 활성화될 때만 백엔드 데이터 로드
    if (activeTab === 'search' || activeTab === 'map') {
      const fetchAllRestAreas = async () => {
        try {
          // [API 1] 전체 목록 조회 API 호출
          const response = await fetch('http://localhost:8080/api/rest-areas');
          if (!response.ok) throw new Error('데이터 로드 실패');
          const data = await response.json();
          setRestAreaSearchResults(data);
        } catch (error) {
          console.error("초기 휴게소 로드 에러:", error);
        }
      };
      fetchAllRestAreas();
    }
  }, [activeTab]); // 탭이 바뀔 때마다 실행

  // (B) 즐겨찾기 상태 동기화 
  React.useEffect(() => {
    const updateFavorites = () => setFavorites(getFavorites());
    
    // 1. 브라우저 저장소(storage)의 변화를 감지하는 리스너 등록
    window.addEventListener('storage', updateFavorites); 
    
    // 2. 컴포넌트가 사라질 때 리스너를 제거하는 클린업 함수 반환
    return () => window.removeEventListener('storage', updateFavorites);
  }, []);

  const handleSearch = useCallback(() => {
    if (!origin || !destination) {
      alert('출발지와 목적지를 모두 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setRoute(null);
    setTimeout(() => {
      setRoute(mockRoute);
      setIsLoading(false);
    }, 1500);
  }, [origin, destination]);
  
  const handlePresetSearch = useCallback((newOrigin, newDestination) => {
    setOrigin(newOrigin);
    setDestination(newDestination);
    setIsLoading(true);
    setRoute(null);
    setTimeout(() => {
      setRoute(mockRoute);
      setIsLoading(false);
    }, 1500);
  }, []);

  // 휴게소 검색 핸들러 (API 호출 로직)
  const handleRestAreaSearch = async () => {
    const keyword = restAreaSearchFilters.keyword || "";
    try {
      // [API 2] 키워드를 포함하여 검색 API 호출
      const queryParams = new URLSearchParams({ keyword: keyword });
      const response = await fetch(
        `http://localhost:8080/api/rest-areas/search?${queryParams}`
      );
      if (!response.ok) throw new Error('검색 실패');
      const data = await response.json();
      setRestAreaSearchResults(data); // ⬅️ state를 '검색 결과'로 덮어쓰기
    } catch (error) {
      console.error("휴게소 검색 에러:", error);
      setRestAreaSearchResults([]);
    }
  };

  const toggleFavorite = useCallback((id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  }, []);

  const favoritedRestAreas = useMemo(() => {
    // restAreaSearchResults를 사용해 즐겨찾기 목록 계산
    return restAreaSearchResults.filter(area => favorites.includes(area.restAreaId)); 
  }, [restAreaSearchResults, favorites]);

  // --- Render Logic (activeView -> activeTab conversion) ---
  
  const renderMainContent = () => {
    
    // Zustand의 'activeTab'으로 렌더링 제어
    switch (activeTab) {
      
      // (A) '경로 검색' 탭
      case 'route':
        return (
          <>
            <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-2">
              AI와 함께 찾는 고속도로 휴게소 맛집
            </h1>
            <p className="text-center text-gray-500 mb-8">
              경로를 검색하고 Gemini AI에게 휴게소별 인기 메뉴를 추천받아보세요!
            </p>

            <RouteSearch
              origin={origin}
              setOrigin={setOrigin}
              destination={destination}
              setDestination={setDestination}
              onSearch={handleSearch}
              onPresetSearch={handlePresetSearch}
            />

            {isLoading && (
              <div className="flex flex-col items-center justify-center mt-12 text-blue-600">
                {/* CarIcon은 'ui' 폴더에서 가져옵니다 */}
                <CarIcon className="w-16 h-16 animate-bounce" /> 
                <p className="mt-4 text-lg font-semibold">경로를 검색하고 있습니다...</p>
              </div>
            )}
            
            {/* Mock Data 대신 로컬 route state 사용 */}
            {route && !isLoading && <SearchResults route={route} favorites={favorites} onToggleFavorite={toggleFavorite} />}
          </>
        );

      // (B) '지도' 탭
      case 'map':
        return <MapView />;

      // (C) '휴게소 검색' 탭 (API 데이터 사용)
      case 'search':
        return (
          <RestAreaSearchView 
            // ❗️ Mock Data 대신 API에서 가져온 restAreaSearchResults를 전달
            allRestAreas={restAreaSearchResults} 
            favorites={favorites} 
            onToggleFavorite={toggleFavorite} 
            // ❗️ RestAreaSearchView의 내부 필터링을 제거하고, App.jsx의 로직을 연결
            filters={restAreaSearchFilters}
            onFiltersChange={setRestAreaSearchFilters}
            onSearch={handleRestAreaSearch}
          />
        );

      // (D) '즐겨찾기' 탭 (API 데이터 사용)
      case 'favorites':
        // ❗️ API 데이터로 필터링한 목록을 FavoritesView에 전달
        const finalFavoritedRestAreas = restAreaSearchResults.filter(area => favorites.includes(area.restAreaId)); 
        return <FavoritesView favoriteRestAreas={finalFavoritedRestAreas} favorites={favorites} onToggleFavorite={toggleFavorite} />;
      
      // (E) 'restarea-detail', 'menu-detail' 등 다른 탭도 모두 복구
      case 'restarea-detail':
      case 'menu-detail':
      case 'login':
        return <div>상세/로그인 탭</div>; // 임시로 둡니다.
        
      default:
        // 'route' 탭을 기본 화면으로
        return <div>페이지를 찾을 수 없습니다. (기본 탭: route)</div>;
    }
  };

  return (
    // 이 부분은 App.jsx의 가장 마지막 return 문입니다.
    <div className="min-h-screen bg-slate-50 text-gray-800">
      {/* 1. (수정) Header에 activeView prop을 제거하고 favoriteCount를 전달 */}
      <Header favoriteCount={favorites.length} />

      <main className="container mx-auto max-w-4xl px-4 py-8">
        {/* 2. (수정) activeView가 아니라 renderMainContent 함수를 직접 호출 */}
        {renderMainContent()}
      </main>

      <footer className="text-center py-6 text-sm text-gray-400">
        © 2024 AI 휴게소 맛집 찾기. All Rights Reserved.
      </footer>
    </div>
  );
};

export default App;