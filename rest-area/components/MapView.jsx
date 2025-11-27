// components/MapView.jsx
import React, { useEffect, useRef } from 'react';

export const MapView = ({ routePath, restAreas }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const polylineInstance = useRef(null);
    const markersInstance = useRef([]);

    // 1. 지도 초기화 (화면에 빈 지도라도 먼저 띄우기)
    useEffect(() => {
        if (!mapRef.current || typeof window.kakao === 'undefined') {
            console.error("Kakao Map 스크립트가 로드되지 않았거나 mapRef가 없습니다.");
            return;
        }

        // 이미 지도가 만들어져 있다면 패스
        if (mapInstance.current) return;

        const container = mapRef.current;
        const options = {
            center: new window.kakao.maps.LatLng(36.5, 127.8), // 대한민국 중심
            level: 13
        };

        const map = new window.kakao.maps.Map(container, options);
        mapInstance.current = map;
        console.log("지도 객체 생성 완료");
    }, []);

    // 2. 경로 그리기 (데이터가 들어오면 실행)
    useEffect(() => {
        if (!mapInstance.current || !routePath || routePath.length === 0) {
            console.log("경로 데이터 없음 또는 지도 미생성 상태");
            return;
        }

        console.log("받은 경로 데이터 개수:", routePath.length); // 데이터 확인용 로그

        try {
            const map = mapInstance.current;

            // 기존 선 지우기
            if (polylineInstance.current) {
                polylineInstance.current.setMap(null);
            }

            // 데이터 변환 (에러 방지 로직 추가)
            const linePath = routePath.map(coord => {
                // 데이터가 숫자인지 확인
                if (!coord || coord.length < 2 || isNaN(coord[0]) || isNaN(coord[1])) {
                    return null;
                }
                // 카카오는 (위도, 경도) 순서, 보통 데이터는 (경도, 위도) 순서인 경우가 많음
                // 현재 코드 기준: coord[0]=lng(x), coord[1]=lat(y) 라고 가정
                return new window.kakao.maps.LatLng(coord[1], coord[0]);
            }).filter(p => p !== null); // 잘못된 좌표 제거

            if (linePath.length === 0) {
                console.error("유효한 좌표가 없습니다.");
                return;
            }

            const polyline = new window.kakao.maps.Polyline({
                path: linePath,
                strokeWeight: 5,
                strokeColor: '#007AFF', // 파란색
                strokeOpacity: 0.8,
                strokeStyle: 'solid'
            });

            polyline.setMap(map);
            polylineInstance.current = polyline;

            // 경로가 보이도록 지도 범위 재설정
            const bounds = new window.kakao.maps.LatLngBounds();
            linePath.forEach(point => bounds.extend(point));
            map.setBounds(bounds);
            
        } catch (error) {
            console.error("경로 그리기 중 에러 발생:", error);
        }

    }, [routePath]);

    useEffect(() => {
        if (!mapInstance.current || !restAreas || restAreas.length === 0) return;

        const map = mapInstance.current;

        // (1) 기존 마커들 삭제 (초기화)
        if (markersInstance.current.length > 0) {
            markersInstance.current.forEach(marker => marker.setMap(null));
            markersInstance.current = [];
        }

        // (2) 새 마커 생성
        restAreas.forEach((area) => {
            // 위도(latitude), 경도(longitude)가 있는지 확인
            if (!area.latitude || !area.longitude) return;

            const markerPosition = new window.kakao.maps.LatLng(area.latitude, area.longitude);

            // 마커 생성
            const marker = new window.kakao.maps.Marker({
                position: markerPosition,
                title: area.name, // 마우스 올리면 이름 나옴
                clickable: true,   // 클릭 가능 여부
                // image: markerImage // 원한다면 커스텀 이미지 추가 가능
            });

            // 지도에 표시
            marker.setMap(map);

            // [선택 사항] 마커 클릭 시 인포윈도우(이름 표시) 
            // 필요 없다면 이 부분은 주석 처리하세요.
            const iwContent = `<div style="padding:5px; font-size:12px;">${area.name}</div>`;
            const infowindow = new window.kakao.maps.InfoWindow({
                content: iwContent
            });
            
            // 마커에 마우스 오버/아웃 이벤트 등록
            window.kakao.maps.event.addListener(marker, 'mouseover', function() {
                infowindow.open(map, marker);
            });
            window.kakao.maps.event.addListener(marker, 'mouseout', function() {
                infowindow.close();
            });

            // 배열에 저장 (나중에 지우기 위함)
            markersInstance.current.push(marker);
        });

    }, [restAreas]); // restAreas가 바뀔 때마다 실행

    return (
        <div className="w-full h-full relative bg-gray-100 rounded-xl overflow-hidden">
            <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />
        </div>
    );
};