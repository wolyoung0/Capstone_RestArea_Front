import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Phone, Utensils, Info, Star } from 'lucide-react';
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // 데이터 안전장치
  const amenities = restArea.amenities || restArea.facilities || [];
  const foodMenus = restArea.foodMenus || [];
  const { baseName, directionName } = parseRestAreaName(restArea.name);

  const heroImage = restArea.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=2000";

  return (
    <div className="bg-white min-h-screen animate-in fade-in slide-in-from-bottom-10 duration-500">
      
      {/* 1. 히어로 이미지 영역 (상단 배경) */}
      <div className="relative h-64 md:h-80 w-full">
        <img 
            src={heroImage} 
            alt={baseName} 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = fallbackImage; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {/* 뒤로가기 버튼 (이미지 위) */}
        <button 
            onClick={onBack}
            className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
        >
            <ArrowLeft className="w-6 h-6" />
        </button>

        {/* 타이틀 정보 (이미지 하단) */}
        <div className="absolute bottom-0 left-0 w-full p-6 text-white">
             <div className="container mx-auto max-w-4xl">
                <span className="px-2 py-1 bg-blue-600 text-xs font-bold rounded-md mb-2 inline-block">
                    {restArea.routeName}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold flex items-end gap-2 text-shadow-lg">
                    {baseName}
                    {directionName && <span className="text-xl font-normal opacity-80 mb-1">{directionName}</span>}
                </h1>
             </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl p-6 -mt-6 relative z-10">
        
        {/* 2. 정보 카드 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-8 flex flex-col md:flex-row gap-6">
             <div className="flex-1 space-y-3">
                <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                    <p className="text-gray-600 leading-snug">{restArea.address || "주소 정보 없음"}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-500" />
                    <p className="text-gray-600">{restArea.tel || "전화번호 없음"}</p>
                </div>
             </div>
             
             {/* 편의시설 */}
             <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500"/> 편의시설
                </h3>
                <div className="flex flex-wrap gap-2">
                    {amenities.map((amenity, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 rounded-md text-xs font-bold text-gray-600">
                            {amenity}
                        </span>
                    ))}
                </div>
             </div>
        </div>

        {/* 3. 대표 메뉴 (EX-FOOD) */}
        {restArea.bestMenuName && (
             <section className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-yellow-500" /> 이 휴게소 대표 메뉴
                </h3>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 relative overflow-hidden flex items-center gap-6">
                    {/* 대표 메뉴 이미지 (없으면 아이콘) */}
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden">
                        {/* 백엔드에서 bestMenuImage도 보내준다고 가정, 없으면 아이콘 */}
                        <Utensils className="w-10 h-10 text-blue-300" />
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-blue-600 font-extrabold text-xs tracking-wider mb-1 block">PREMIUM EX-FOOD</span>
                                <h4 className="text-2xl font-extrabold text-gray-900 mb-1">{restArea.bestMenuName}</h4>
                            </div>
                            <span className="text-xl font-bold text-blue-600">
                                {restArea.bestMenuPrice ? `${Number(restArea.bestMenuPrice).toLocaleString()}원` : ''}
                            </span>
                        </div>
                        <p className="text-gray-600 mt-2 text-sm leading-relaxed bg-white/60 p-3 rounded-lg border border-blue-100/50">
                            {restArea.recommendationReason || "휴게소장이 강력 추천하는 실패 없는 메뉴입니다!"}
                        </p>
                    </div>
                </div>
             </section>
        )}

        {/* 4. 전체 메뉴 리스트 (이미지 썸네일 포함) */}
        <section>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-gray-400" /> 전체 메뉴
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {foodMenus.map((menu, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex justify-between items-center">
                        {/* 이미지 영역 삭제함 */}
                        
                        {/* 왼쪽: 메뉴 이름 */}
                        <div className="flex items-center gap-2">
                            <h5 className="font-bold text-gray-800 text-sm">{menu.name}</h5>
                            {menu.isPremium && (
                                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold shrink-0">Best</span>
                            )}
                        </div>

                        {/* 오른쪽: 가격 */}
                        <span className="text-sm font-bold text-blue-600">
                            {menu.price ? `${Number(menu.price).toLocaleString()}원` : '-'}
                        </span>
                    </div>
                ))}
            </div>
        </section>
      </div>
    </div>
  );
};