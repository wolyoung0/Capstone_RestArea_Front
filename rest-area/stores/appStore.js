import { create } from 'zustand';

// Zustand 라이브러리를 사용해 전역 스토어를 정의합니다.
const useAppStore = create((set) => ({
    
    // 1. 상태(State): 현재 활성화된 탭의 이름입니다. 
    //    '경로 검색' 탭을 초기값으로 설정합니다.
    activeTab: 'route', 

    // 2. 액션(Action): 상태를 변경하는 함수입니다.
    //    Header.jsx의 탭 버튼 클릭 시 호출되어 탭을 전환합니다.
    setActiveTab: (tabName) => set({ activeTab: tabName }),
}));

export default useAppStore;