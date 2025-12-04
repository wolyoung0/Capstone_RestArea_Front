
import React, { useState, useMemo } from 'react';
import { RestAreaCard } from './RestAreaCard.jsx';
import { SearchIcon } from './icons/SearchIcon.jsx';
import { FireIcon } from './icons/FireIcon.jsx';

export const RestAreaSearchView = ({ allRestAreas, favorites, onToggleFavorite, onDetailClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const popularRestAreas = useMemo(() => allRestAreas.slice(0, 5), [allRestAreas]);
//   // (나중에 적용할 코드)
// const popularRestAreas = useMemo(() => {
//     // 좋아요(viewCount)가 많은 순서대로 정렬하고 5개 자르기
//     return [...allRestAreas]
//         .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
//         .slice(0, 5);
// }, [allRestAreas]);

  const filteredRestAreas = useMemo(() => {
    if (!searchTerm) {
      return [];
    }
    return allRestAreas.filter(area =>
        // 1. area.name이 null이 아닐 때만 toLowerCase를 호출합니다.
        (area.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        
        // 2. area.highway가 null이 아닐 때만 toLowerCase를 호출합니다.
        (area.highway?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );
  }, [searchTerm, allRestAreas]);

  return (
    <div>
      <div className="flex items-center mb-6">
        <SearchIcon className="w-8 h-8 text-blue-500" />
        <h1 className="text-3xl font-bold ml-3 text-gray-800">휴게소 검색</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="휴게소 이름 또는 고속도로명으로 검색..."
            className="w-full pl-12 pr-4 py-3 bg-gray-100 border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 transition"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
        </div>
      </div>

      {!searchTerm ? (
        <div>
          <div className="flex items-center mb-4">
            <FireIcon className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-800 ml-2">인기 휴게소</h2>
          </div>
          <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar">
            {popularRestAreas.map((restArea, index) => {
              const uniqueId = restArea.restAreaId || restArea.id;

              return(
                <div key={uniqueId} className="w-[85vw] max-w-sm flex-shrink-0 snap-start">
                <RestAreaCard
                  className="h-full"
                  size="compact"
                  restArea={restArea}
                  isFavorite={favorites.includes(uniqueId)}
                  onToggleFavorite={() => onToggleFavorite(uniqueId)}
                  onDetailClick={onDetailClick}
                  index={0} //인기순 정렬 전 사용, 데이터 쌓이면 수정
                />
              </div>
              )}
            )}
          </div>
        </div>
      ) : (
        <>
          {filteredRestAreas.length > 0 && (
            <p className="mb-4 text-gray-600">'{searchTerm}'에 대한 검색 결과: {filteredRestAreas.length}개</p>
          )}

          <div className="space-y-4">
            {filteredRestAreas.map((restArea) => {
              const uniqueId = restArea.restAreaId || restArea.id;

              return(
                <RestAreaCard
                  key={uniqueId}
                  restArea={restArea}
                  isFavorite={favorites.includes(uniqueId)}
                  onToggleFavorite={() => onToggleFavorite(uniqueId)}
                  onDetailClick={onDetailClick}
                  index={0}
                />
              )
              }
            )}
          </div>

          {filteredRestAreas.length === 0 && (
             <div className="bg-white rounded-2xl shadow-lg p-8 text-center mt-8">
                <p className="text-lg text-gray-600">검색 결과가 없습니다.</p>
                <p className="text-gray-400 mt-2">다른 검색어를 입력해보세요.</p>
             </div>
          )}
        </>
      )}
    </div>
  );
};