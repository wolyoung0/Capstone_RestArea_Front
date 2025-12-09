
import React from 'react';
import { RestAreaCard } from './RestAreaCard.jsx';
import { HeartIcon } from './icons/HeartIcon.jsx';

export const FavoritesView = ({ favoriteRestAreas, favorites, onToggleFavorite, onDetailClick }) => {
  return (
    <div>
      {/* <div className="flex items-center mb-6">
        <HeartIcon className="w-8 h-8 text-red-500" />
        <h1 className="text-3xl font-bold ml-3 text-gray-800">즐겨찾기</h1>
      </div> */}

      {favoriteRestAreas.length > 0 ? (
        <div className="space-y-4">
          {favoriteRestAreas.map((restArea) => {
            const uniqueId = restArea.restAreaId || restArea.id ;
            return(
            <RestAreaCard
              key={uniqueId}
              restArea={restArea}
              isFavorite={favorites.includes(uniqueId)}
              onToggleFavorite={() => onToggleFavorite(uniqueId)}
              onDetailClick={onDetailClick}
              index={0}
            />
            )}
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-lg text-gray-600">즐겨찾는 휴게소가 없습니다.</p>
          <p className="text-gray-400 mt-2">휴게소 카드에서 하트 아이콘을 눌러 즐겨찾기에 추가해보세요.</p>
        </div>
      )}
    </div>
  );
};