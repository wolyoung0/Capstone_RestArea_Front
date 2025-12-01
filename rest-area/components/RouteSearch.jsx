import React, { useState } from 'react';
import axios from 'axios';
import { Route, Sparkles, Search } from 'lucide-react';

// Kakao API Key
// const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;

/* 주소 -> 좌표 변환 함수 */
const geocodeAddress = (address) => {
  return new Promise((resolve, reject) => {
    // 1. 카카오 지도 스크립트가 로드되었는지 확인
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      reject(new Error("Kakao Maps SDK가 로드되지 않았습니다."));
      return;
    }

    // 2. 주소-좌표 변환 객체 생성
    const geocoder = new window.kakao.maps.services.Geocoder();

    // 3. 주소 검색 요청
    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        // 성공 시 좌표 반환
        const coords = {
          lng: parseFloat(result[0].x),
          lat: parseFloat(result[0].y),
        };
        resolve(coords);
      } else {
        // 실패 시 에러 처리
        reject(new Error(`'${address}'를 찾을 수 없습니다.`));
      }
    });
  });
};

/* [수정 1] 백엔드 호출 함수: routeNames 파라미터 추가 및 전송 */
const fetchRestAreasFromBackend = async (polylineData, routeNames) => {
  try {
    // 백엔드 DTO(RouteRequestDto) 구조에 맞춰서 polyline과 routeNames를 함께 전송
    const response = await axios.post('http://localhost:8080/api/rest-areas/route-polyline', { 
        polyline: polylineData,
        routeNames: routeNames // ★ 추가된 부분
    });
    return response.data;
  } catch (error) {
    console.error("휴게소 데이터 조회 실패:", error);
    return [];
  }
};

/* 빠른 설정 버튼 컴포넌트 */
const PresetButton = ({ origin, destination, onClick }) => (
    <button
        onClick={() => onClick(origin, destination)}
        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
    >
        {origin} → {destination}
    </button>
);

export const RouteSearch = ({ onRouteRestAreas, onRoutePathData }) => {
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!departure || !destination) {
      alert("출발지와 목적지를 입력하세요.");
      return;
    }

    setIsSearching(true);
    
    if (onRouteRestAreas) onRouteRestAreas([], { distanceKm: 0, timeMinutes: 0 });
    if (onRoutePathData) onRoutePathData([]);

    try {
      // A. 주소 -> 좌표 변환
      const originCoords = await geocodeAddress(departure);
      const destCoords = await geocodeAddress(destination);

      // B. Spring Boot (Kakao Directions) 호출
      const response = await axios.get(`http://localhost:8080/api/rest-areas/route`, {
        params: {
          origin: `${originCoords.lng},${originCoords.lat}`,
          destination: `${destCoords.lng},${destCoords.lat}`
        }
      });

      const pathData = response.data.routes[0];
      const summary = pathData.summary;

      // [수정 2] Polyline 및 도로명(Route Name) 추출
      const allVertexes = [];
      const routeNamesSet = new Set(); // 중복 제거를 위해 Set 사용

      pathData.sections.forEach(section => {
        section.roads.forEach(road => {
          // 1. 도로명 수집 (예: 경부고속도로, 영동고속도로)
          if (road.name) {
             routeNamesSet.add(road.name);
          }

          // 2. 좌표 수집
          for (let i = 0; i < road.vertexes.length; i += 2) {
            allVertexes.push([road.vertexes[i], road.vertexes[i+1]]);
          }
        });
      });

      // Set을 배열로 변환
      const routeNames = Array.from(routeNamesSet);
      console.log("추출된 도로명:", routeNames); // 디버깅용

      // D. 부모에게 경로 데이터 전달 (지도 그리기)
      if (onRoutePathData) {
        onRoutePathData(allVertexes);
      }

      // E. [수정 3] 백엔드 휴게소 검색 (도로명 리스트도 같이 전달)
      const foundRestAreas = await fetchRestAreasFromBackend(allVertexes, routeNames);
      
      // F. 부모에게 결과 전달
      if (onRouteRestAreas) {
        onRouteRestAreas(foundRestAreas, {
            distanceKm: (summary.distance / 1000).toFixed(1),
            timeMinutes: Math.round(summary.duration / 60)
        });
      }

    } catch (error) {
      alert("경로 검색 실패: " + error.message);
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  // [수정 4] 오타 수정 (f 제거)
  const handlePresetClick = (dep, dest) => {
    setDeparture(dep);
    setDestination(dest);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
      <div className="flex items-center mb-6">
        <Route className="w-7 h-7 text-blue-500" />
        <h2 className="text-xl font-bold ml-3 text-gray-800">경로 검색</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="origin" className="block text-sm font-medium text-gray-500 mb-1">출발지</label>
          <input
            type="text"
            id="origin"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            placeholder="예: 서울"
            className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition"
          />
        </div>
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-500 mb-1">목적지</label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="예: 부산"
            className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition"
          />
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={isSearching}
        className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-4 rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-lg ${isSearching ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isSearching ? (
             <>
                <span className="mr-2">검색 중...</span>
                <Sparkles className="animate-spin h-5 w-5 text-white" />
             </>
        ) : (
            <>
                <span className="mr-2">경로 검색</span>
                <Search className="h-5 w-5 text-white" />
            </>
        )}
      </button>

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-500 mb-3 text-center">빠른 설정</p>
        <div className="flex flex-wrap gap-2 justify-center">
            <PresetButton origin="서울" destination="부산" onClick={handlePresetClick} />
            <PresetButton origin="서울" destination="대전" onClick={handlePresetClick} />
            <PresetButton origin="대구" destination="서울" onClick={handlePresetClick} />
        </div>
      </div>
    </div>
  );
};