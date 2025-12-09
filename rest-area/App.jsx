import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { RouteSearch } from './components/RouteSearch.jsx';
import { SearchResults } from './components/SearchResults.jsx';
import { CarIcon } from './components/icons/CarIcon.jsx';
import { RestAreaSearchView } from './components/RestAreaSearchView.jsx';
import { FavoritesView } from './components/FavoritesView.jsx';
import { RestAreaDetailView } from './components/RestAreaDetailView.jsx';
import { ALL_REST_AREAS } from './data/restAreas.js'; 

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
  const { activeTab } = useAppStore();

  const [origin, setOrigin] = useState('서울');
  const [destination, setDestination] = useState('부산');
  
  const [route, setRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState(getFavorites());
  const [routePath, setRoutePath] = useState(null);

  const [restAreaSearchFilters, setRestAreaSearchFilters] = useState({});
  const [restAreaSearchResults, setRestAreaSearchResults] = useState([]); 

  const [selectedRestArea, setSelectedRestArea] = useState(null);
  
  useEffect(() => {
    setSelectedRestArea(null);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'search' || activeTab === 'map' || activeTab === 'favorites') {
      const fetchAllRestAreas = async () => {
        try {
          const response = await fetch('http://localhost:8080/api/rest-areas');
          if (!response.ok) throw new Error('데이터 로드 실패');
          const data = await response.json();
          setRestAreaSearchResults(data);
        } catch (error) {
          console.error("초기 휴게소 로드 에러:", error);
          setRestAreaSearchResults(ALL_REST_AREAS); 
        }
      };
      fetchAllRestAreas();
    }
  }, [activeTab]);

  useEffect(() => {
    const updateFavorites = () => setFavorites(getFavorites());
    window.addEventListener('storage', updateFavorites); 
    return () => window.removeEventListener('storage', updateFavorites);
  }, []);

  const handleRestAreas = useCallback((foundRestAreas, summary) => {
    setRoute({ 
        totalDistanceKm: summary.distanceKm,
        totalTimeMinutes: summary.timeMinutes,
        restAreas: foundRestAreas,
    });
    setIsLoading(false);
  }, []);

  const handleSearch = useCallback(() => {
    if (!origin || !destination) {
      alert('출발지와 목적지를 모두 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setRoute(null); 
  }, [origin, destination]);
  
  const handlePresetSearch = useCallback((newOrigin, newDestination) => {
    setOrigin(newOrigin);
    setDestination(newDestination);
    setIsLoading(true);
    setRoute(null);
  }, []);

  const handleOpenDetail = (restArea) => {
    setSelectedRestArea(restArea);
  };

  const handleCloseDetail = () => {
    setSelectedRestArea(null);
  };

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

  const toggleFavorite = useCallback((id) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id];
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const favoritedRestAreas = useMemo(() => {
    const sourceData = restAreaSearchResults.length > 0 ? restAreaSearchResults : ALL_REST_AREAS;
    return sourceData.filter(area => favorites.includes(area.restAreaId || area.id)); 
  }, [restAreaSearchResults, favorites]);

  // --- 화면 렌더링 로직 ---
  const renderMainContent = () => {
    // 상세 페이지는 별도의 흰색 배경 뷰이므로 그대로 둠
    if (selectedRestArea) {
      return (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500">
           <RestAreaDetailView 
              restArea={selectedRestArea} 
              onBack={handleCloseDetail} 
          />
        </div>
      );
    }

    switch (activeTab) {
      case 'route':
        return (
          <div className="flex flex-col items-center justify-center w-full min-h-[60vh] gap-12">
            
            {/* 1. 타이틀 영역: 어두운 배경 위이므로 '흰색 텍스트' 사용 */}
            <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg leading-tight">
                AI와 함께 찾는 <br className="hidden md:block"/>
                <span className="text-blue-300">고속도로 휴게소 맛집</span>
              </h1>
              <p className="text-lg md:text-2xl text-gray-100 drop-shadow-md font-medium">
                목적지까지 가는 길, AI가 <br className="md:hidden"/> 딱 맞는 메뉴를 추천해드립니다.
              </p>
            </div>

            {/* 2. 검색창 영역: 흰색 반투명 박스(Glass)를 깔아서 내부 검은 글씨가 잘 보이게 함 */}
            <div className="w-full max-w-5xl bg-white/95 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/40 ring-1 ring-black/5 animate-in fade-in zoom-in duration-500">
               <RouteSearch
                origin={origin}
                setOrigin={setOrigin}
                destination={destination}
                setDestination={setDestination}
                onSearch={handleSearch}
                onPresetSearch={handlePresetSearch}
                onRouteRestAreas={handleRestAreas} 
                onRoutePathData={setRoutePath}     
              />
            </div>

            {isLoading && (
              <div className="flex flex-col items-center justify-center mt-8 text-white">
                <CarIcon className="w-20 h-20 animate-bounce text-blue-300 drop-shadow-lg" /> 
                <p className="mt-4 text-xl font-bold drop-shadow-md">최적의 경로와 맛집을 찾는 중...</p>
              </div>
            )}
            
            {route && !isLoading && (
                <div className="w-full mt-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
                  {/* 결과 목록도 보통 자체적으로 흰색 카드를 가지고 있으므로 그대로 둠 */}
                  <SearchResults 
                      route={route} 
                      favorites={favorites} 
                      onToggleFavorite={toggleFavorite} 
                      routePath={routePath} 
                      onDetailClick={handleOpenDetail}
                  />
                </div>
            )}
          </div>
        );

      case 'search':
        return (
          // 다른 탭들도 흰색 박스 안에서 렌더링되도록 감싸줌 (가독성 확보)
          <div className="w-full max-w-6xl mx-auto bg-white/95 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] shadow-2xl min-h-[70vh]">
            <RestAreaSearchView 
              allRestAreas={restAreaSearchResults} 
              favorites={favorites} 
              onToggleFavorite={toggleFavorite} 
              filters={restAreaSearchFilters}
              onFiltersChange={setRestAreaSearchFilters}
              onSearch={handleRestAreaSearch}
              onDetailClick={handleOpenDetail}
            />
          </div>
        );

      case 'favorites':
        return (
           <div className="w-full max-w-6xl mx-auto bg-white/95 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] shadow-2xl min-h-[70vh]">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
               <span>⭐</span> 나의 즐겨찾기
            </h2>
            <FavoritesView 
                favoriteRestAreas={favoritedRestAreas} 
                favorites={favorites} 
                onToggleFavorite={toggleFavorite} 
                onDetailClick={handleOpenDetail} 
            />
          </div>
        );
      
      default:
        return <div className="text-white text-center text-xl mt-20">준비 중인 페이지입니다.</div>;
    }
  };

  const bgImage = "https://images.unsplash.com/photo-1519817914152-22d216bb9170?auto=format&fit=crop&q=80&w=2832";

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans">
        
        {/* 1. 배경 이미지 (어두운 오버레이 포함) */}
        <div className="fixed inset-0 z-0">
             <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transform hover:scale-105 transition-transform duration-[60s]"
                style={{ backgroundImage: `url(${bgImage})` }}
            />
            {/* 오버레이: 검은색 60% 투명도 (배경은 어둡게 눌러주고, 위쪽 흰색 컨텐츠는 돋보이게) */}
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]" />
        </div>

        {/* 2. 실제 컨텐츠 영역 (z-10) */}
        <div className="relative z-10 flex flex-col min-h-screen">
            
            {/* 헤더 */}
            {!selectedRestArea && <Header favoriteCount={favorites.length} />}
            
            <main className={`flex-1 w-full mx-auto ${selectedRestArea ? 'max-w-4xl py-8' : 'max-w-7xl px-4 py-12 flex flex-col justify-center'}`}>
                {renderMainContent()}
            </main>
            
            <footer className="text-center py-8 text-sm text-white/60">
                © 2025 AI 휴게소 맛집 찾기. All Rights Reserved.
            </footer>
        </div>
    </div>
  );
};

export default App;