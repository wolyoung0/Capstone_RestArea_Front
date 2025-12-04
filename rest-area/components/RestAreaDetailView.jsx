import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Phone, Utensils, Info } from 'lucide-react';
import { SparklesIcon } from './icons/SparklesIcon'; // 기존 아이콘 재사용

const parseRestAreaName = (fullName) => {
if (!fullName) return { baseName: '', directionName: '' };
const match = fullName.match(/(.*?)\((.*?)\)/);
if (match && match.length >= 3) {
  const baseName = match[1].replace(/휴게소|주유소/g, '').trim() + '휴게소';
  let direction = match[2].trim();
  if (!direction.endsWith('방향')) {
    direction += '방향';
  }
  return { baseName, directionName: `(${direction})` };
}
const trimmedName = fullName.trim();
const finalName = trimmedName.endsWith('휴게소') ? trimmedName : `${trimmedName}휴게소`;
return { baseName: finalName, directionName: '' };
};

const Amenity = {
  GasStation: 'GasStation',
  LPGStation: 'LPGStation',
  EVStation: 'EVStation',
  ConvenienceStore: 'ConvenienceStore',
  Restaurant: 'Restaurant',
  Cafe: 'Cafe',
  Pharmacy: 'Pharmacy',
  SleepingRoom: 'SleepingRoom',
  ShowerRoom: 'ShowerRoom',
};

const amenityColors = {
  [Amenity.GasStation]: 'bg-orange-100 text-orange-800 border-orange-200',
  [Amenity.LPGStation]: 'bg-red-100 text-red-800 border-red-200',
  [Amenity.EVStation]: 'bg-green-100 text-green-800 border-green-200',
  [Amenity.ConvenienceStore]: 'bg-sky-100 text-sky-800 border-sky-200',
  [Amenity.Restaurant]: 'bg-amber-100 text-amber-800 border-amber-200',
  [Amenity.Cafe]: 'bg-purple-100 text-purple-800 border-purple-200',
  [Amenity.Pharmacy]: 'bg-teal-100 text-teal-800 border-teal-200',
  [Amenity.SleepingRoom]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [Amenity.ShowerRoom]: 'bg-cyan-100 text-cyan-800 border-cyan-500',
};

// 한글 변환 맵 (필요 시 확장)
const amenityLabels = {
  [Amenity.GasStation]: '주유소',
  [Amenity.LPGStation]: 'LPG',
  [Amenity.EVStation]: '전기차충전',
  [Amenity.ConvenienceStore]: '편의점',
  [Amenity.Restaurant]: '식당',
  [Amenity.Cafe]: '카페',
  [Amenity.Pharmacy]: '약국',
  [Amenity.SleepingRoom]: '수면실',
  [Amenity.ShowerRoom]: '샤워실',
};

export const RestAreaDetailView = ({ restArea, onBack }) => {
  // 실제 앱에서는 여기서 restAreaId로 상세 API를 한 번 더 호출해서
  // 더 많은 정보(전체 메뉴 리스트 등)를 가져오기도 합니다.
  
  // 데이터 안전장치
  const amenities = restArea.amenities || restArea.facilities || [];
  const foodMenus = restArea.foodMenus || [];

  const { baseName, directionName } = parseRestAreaName(restArea.name);

  return (
    <div className="bg-white min-h-screen animate-in fade-in slide-in-from-right duration-300">
      
      {/* 1. 상단 헤더 (뒤로가기 + 제목) */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        
        {/* ★ [수정됨] 이름과 방향을 분리해서 스타일링 ★ */}
        <h1 className="text-xl font-bold text-gray-900 truncate flex-1 flex items-baseline gap-1.5">
            {baseName}
            {directionName && (
                <span className="text-base font-normal text-gray-500">
                    {directionName}
                </span>
            )}
        </h1>
      </div>

      <div className="p-5 space-y-8 pb-20">
        
        {/* 2. 기본 정보 섹션 */}
        <section>
            <div className="flex items-baseline gap-2 mb-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">
                    {restArea.routeName}
                </span>
                <span className="text-gray-500 text-sm">
                    {/* 방향 정보 파싱 로직이 필요하다면 여기에 적용 */}
                    {restArea.direction ? `${restArea.direction} 방향` : ''}
                </span>
            </div>
            
            {/* 주소 및 전화번호 (데이터가 있다면 표시) */}
            <div className="space-y-2 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600 leading-snug">
                        {restArea.address || "주소 정보가 없습니다."}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <p className="text-sm text-gray-600">
                        {restArea.tel || "전화번호 정보 없음"}
                    </p>
                </div>
            </div>
        </section>

        {/* 3. 편의시설 섹션 */}
        <section>
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                편의시설
            </h3>
            <div className="flex flex-wrap gap-2">
                {amenities.length > 0 ? (
                    amenities.map((amenity, idx) => (
                        <div 
                            key={idx} 
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 ${amenityColors[amenity] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
                        >
                            {/* 아이콘이 있다면 여기에 추가 가능 */}
                            {amenityLabels[amenity] || amenity}
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-400">등록된 편의시설 정보가 없습니다.</p>
                )}
            </div>
        </section>

        {/* 4. 대표 메뉴 (Ex-Food) */}
        {restArea.bestMenuName && (
             <section>
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-yellow-500" />
                    이 휴게소 대표 메뉴
                </h3>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold">
                        EX-FOOD
                    </div>
                    <h4 className="text-xl font-extrabold text-gray-900 mb-1">
                        {restArea.bestMenuName}
                    </h4>
                    <p className="text-blue-600 font-bold text-sm mb-3">
                        {restArea.bestMenuPrice ? `${Number(restArea.bestMenuPrice).toLocaleString()}원` : '가격 정보 없음'}
                    </p>
                    <p className="text-sm text-gray-600 bg-white/60 p-3 rounded-lg leading-relaxed">
                        {restArea.recommendationReason || "휴게소장 강력 추천 메뉴입니다!"}
                    </p>
                </div>
             </section>
        )}

        {/* 5. 전체 메뉴 리스트 */}
        <section>
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-gray-500" />
                전체 메뉴
            </h3>
            <div className="grid grid-cols-1 divide-y divide-gray-100 border border-gray-100 rounded-xl bg-white">
                {foodMenus.length > 0 ? (
                    foodMenus.map((menu, idx) => (
                        <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                            <span className="text-gray-700 font-medium">{menu.name || menu.menuName}</span>
                            <span className="text-gray-900 font-bold text-sm">
                                {menu.price ? `${Number(menu.price).toLocaleString()}원` : '-'}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="p-6 text-center text-gray-400 text-sm">
                        메뉴 정보가 준비되지 않았습니다.
                    </div>
                )}
            </div>
        </section>

      </div>
    </div>
  );
};