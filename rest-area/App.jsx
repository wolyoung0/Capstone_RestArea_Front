import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { RouteSearch } from './components/RouteSearch.jsx';
import { SearchResults } from './components/SearchResults.jsx';
import { CarIcon } from './components/icons/CarIcon.jsx';
import { MapView } from './components/MapView.jsx';
import { RestAreaSearchView } from './components/RestAreaSearchView.jsx';
import { FavoritesView } from './components/FavoritesView.jsx';
import { RestAreaDetailView } from './components/RestAreaDetailView.jsx';
import { ALL_REST_AREAS } from './data/restAreas.js'; // 만약 API 실패시 비상용으로 로컬 데이터 하나쯤은 남겨둘 수 있음 (선택사항)

import useAppStore from './stores/appStore';

// [유틸] 즐겨찾기 가져오기 헬퍼
const getFavorites = () => {
  try {
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const App = () => {
  // Zustand 전역 상태
  const { activeTab } = useAppStore();

  // [상태 관리]
  const [origin, setOrigin] = useState('서울');
  const [destination, setDestination] = useState('부산');
  
  // API에서 받아온 경로 데이터
  const [route, setRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 즐겨찾기 데이터
  const [favorites, setFavorites] = useState(getFavorites());
  
  // 지도 경로 데이터 (선 그리기용)
  const [routePath, setRoutePath] = useState(null);

  // 휴게소 검색 탭용 필터 및 결과
  const [restAreaSearchFilters, setRestAreaSearchFilters] = useState({});
  const [restAreaSearchResults, setRestAreaSearchResults] = useState([]); 

  //휴게소 상세정보
  const [selectedRestArea, setSelectedRestArea] = useState(null);
  useEffect(() => {
    setSelectedRestArea(null);
  }, [activeTab]);

  // (A) 초기 목록 로드 (검색/지도 탭 진입 시)
  useEffect(() => {
    if (activeTab === 'search' || activeTab === 'map' || activeTab === 'favorites') {
      const fetchAllRestAreas = async () => {
        try {
          const response = await fetch('http://localhost:8080/api/rest-areas');
          if (!response.ok) throw new Error('데이터 로드 실패');
          const data = await response.json();
          setRestAreaSearchResults(data);
        } catch (error) {
          console.error("초기 휴게소 로드 에러 (백엔드 연결 확인 필요):", error);
          // 백엔드 연결 실패 시 빈 배열 혹은 기존 로컬 데이터(ALL_REST_AREAS) 사용 고려
          setRestAreaSearchResults(ALL_REST_AREAS); 
        }
      };
      fetchAllRestAreas();
    }
  }, [activeTab]);

  // (B) 즐겨찾기 상태 동기화 (localStorage 감지)
  useEffect(() => {
    const updateFavorites = () => setFavorites(getFavorites());
    window.addEventListener('storage', updateFavorites); 
    return () => window.removeEventListener('storage', updateFavorites);
  }, []);

  // [핵심] API 검색 결과 처리 핸들러 (RouteSearch에서 호출됨)
  const handleRestAreas = useCallback((foundRestAreas, summary) => {
    setRoute({ 
        totalDistanceKm: summary.distanceKm,
        totalTimeMinutes: summary.timeMinutes,
        restAreas: foundRestAreas,
    });
    setIsLoading(false);
  }, []);

  // [검색 시작] 로딩 상태 표시
  const handleSearch = useCallback(() => {
    if (!origin || !destination) {
      alert('출발지와 목적지를 모두 입력해주세요.');
      return;
    }
    // RouteSearch 컴포넌트가 실제 API 통신을 시작할 때 로딩을 켭니다.
    setIsLoading(true);
    setRoute(null); // 이전 결과 초기화
  }, [origin, destination]);
  
  // [프리셋 검색]
  const handlePresetSearch = useCallback((newOrigin, newDestination) => {
    setOrigin(newOrigin);
    setDestination(newDestination);
    setIsLoading(true);
    setRoute(null);
  }, []);

  const handleOpenDetail = (restArea) => {
    setSelectedRestArea(restArea);
    // 필요하다면 브라우저 히스토리 관리 등을 추가할 수 있음
  };

  // [상세정보 닫기 핸들러]
  const handleCloseDetail = () => {
    setSelectedRestArea(null);
  };

  // [휴게소 이름 검색] (검색 탭용)
  const handleRestAreaSearch = async () => {
    const keyword = restAreaSearchFilters.keyword || "";
    try {
      const queryParams = new URLSearchParams({ keyword: keyword });
      const response = await fetch(
        `http://localhost:8080/api/rest-areas/search?${queryParams}`
      );
      if (!response.ok) throw new Error('검색 실패');
      const data = await response.json();
      setRestAreaSearchResults(data); 
    } catch (error) {
      console.error("휴게소 검색 에러:", error);
      setRestAreaSearchResults([]);
    }
  };

  // [즐겨찾기 토글]
  const toggleFavorite = useCallback((id) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id];
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  // [즐겨찾기 목록 계산]
  const favoritedRestAreas = useMemo(() => {
    // 검색된 결과가 있으면 거기서 찾고, 없으면 전체 로컬 데이터에서 찾음 (안전장치)
    const sourceData = restAreaSearchResults.length > 0 ? restAreaSearchResults : ALL_REST_AREAS;
    return sourceData.filter(area => favorites.includes(area.restAreaId || area.id)); 
  }, [restAreaSearchResults, favorites]);

  // --- 화면 렌더링 로직 ---
  const renderMainContent = () => {
    if (selectedRestArea) {
      return (
        <RestAreaDetailView 
            restArea={selectedRestArea} 
            onBack={handleCloseDetail} 
        />
      );
    }
    switch (activeTab) {
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
              onRouteRestAreas={handleRestAreas} // API 결과 받는 콜백
              onRoutePathData={setRoutePath}     // 경로 데이터 받는 콜백
            />

            {isLoading && (
              <div className="flex flex-col items-center justify-center mt-12 text-blue-600">
                <CarIcon className="w-16 h-16 animate-bounce" /> 
                <p className="mt-4 text-lg font-semibold">최적의 경로와 맛집을 찾고 있습니다...</p>
              </div>
            )}
            
            {/* 결과 표시 */}
            {route && !isLoading && (
                <SearchResults 
                    route={route} 
                    favorites={favorites} 
                    onToggleFavorite={toggleFavorite} 
                    routePath={routePath} 
                    onDetailClick={handleOpenDetail}
                />
            )}
          </>
        );

      // case 'map':
      //   return <MapView routePath={routePath} />;

      case 'search':
        return (
          <RestAreaSearchView 
            allRestAreas={restAreaSearchResults} 
            favorites={favorites} 
            onToggleFavorite={toggleFavorite} 
            filters={restAreaSearchFilters}
            onFiltersChange={setRestAreaSearchFilters}
            onSearch={handleRestAreaSearch}
            onDetailClick={handleOpenDetail}
          />
        );

      case 'favorites':
        return <FavoritesView favoriteRestAreas={favoritedRestAreas} favorites={favorites} onToggleFavorite={toggleFavorite} onDetailClick={handleOpenDetail} />;
      
      case 'restarea-detail':
      case 'menu-detail':
      case 'login':
        return <div>준비 중인 페이지입니다.</div>;
        
      default:
        return <div>페이지를 찾을 수 없습니다.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">
      {/* ★ [수정] 상세페이지가 '아닐 때만' 헤더를 보여줍니다. ★ */}
      {!selectedRestArea && <Header favoriteCount={favorites.length} />}
      
      {/* 상세페이지일 때는 상단 여백(padding) 제거 */}
      <main className={`container mx-auto max-w-4xl ${selectedRestArea ? '' : 'px-4 py-8'}`}>
        {renderMainContent()}
      </main>
      <footer className="text-center py-6 text-sm text-gray-400">
        © 2025 AI 휴게소 맛집 찾기. All Rights Reserved.
      </footer>
    </div>
  );
};

export default App;