import React, { useState, useMemo } from 'react';
import { RestAreaCard } from './RestAreaCard.jsx';
import { SearchIcon } from './icons/SearchIcon.jsx';
import { FireIcon } from './icons/FireIcon.jsx';

export const RestAreaSearchView = ({ allRestAreas, favorites, onToggleFavorite, onDetailClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // [상태 유지] 어떤 카드가 펼쳐졌는지 저장
  const [expandedIds, setExpandedIds] = useState([]);

  const popularRestAreas = useMemo(() => allRestAreas.slice(0, 5), [allRestAreas]);

  // [함수 유지] 토글 함수
  const toggleExpansion = (id) => {
    setExpandedIds(prev => 
      prev.includes(id) 
        ? prev.filter(currentId => currentId !== id)
        : [...prev, id]
    );
  };

  const filteredRestAreas = useMemo(() => {
    if (!searchTerm) {
      return [];
    }
    return allRestAreas.filter(area =>
        (area.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
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
          {/* items-start 유지: 카드가 길어져도 서로 영향받지 않게 함 */}
          <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory scroll-smooth no-scrollbar items-start">
            {popularRestAreas.map((restArea, index) => {
              const uniqueId = restArea.restAreaId || restArea.id;
              const isExpanded = expandedIds.includes(uniqueId);

              return(
                <div 
                  key={uniqueId} 
                  // [핵심 수정] 너비를 다시 넓게(max-w-2xl) 복구했습니다.
                  // w-[85vw]는 모바일 화면 너비의 85%를 차지하겠다는 의미입니다.
                  className="w-[85vw] max-w-2xl flex-shrink-0 snap-start"
                >
                  <RestAreaCard
                    // h-full 제거: 내용물만큼 높이가 자동으로 늘어나도록 함
                    className="bg-white shadow-sm rounded-xl overflow-hidden" 
                    size="compact"
                    restArea={restArea}
                    isFavorite={favorites.includes(uniqueId)}
                    onToggleFavorite={() => onToggleFavorite(uniqueId)}
                    onDetailClick={onDetailClick}
                    index={0} 
                    variant="compact"
                    
                    // [상태 전달] 카드가 펼쳐졌는지(isExpanded)와 토글 함수 전달
                    isExpanded={isExpanded}
                    onRecommendationClick={() => toggleExpansion(uniqueId)}
                  />
                </div>
              )}
            )}
          </div>
        </div>
      ) : (
        // 검색 결과 부분 (기존과 동일)
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
            })}
           </div>
           {filteredRestAreas.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center mt-8">
                 <p className="text-lg text-gray-600">검색 결과가 없습니다.</p>
              </div>
           )}
        </>
      )}
    </div>
  );
};