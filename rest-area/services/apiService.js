import axios from 'axios';

// [수정] FastAPI(8000)가 아니라 Spring Boot(8080) 주소로 변경
// Spring Boot에 "/api/recommend" 라는 엔드포인트가 만들어져 있어야 함
const API_BASE_URL = 'http://localhost:8080'; 

export const fetchFoodRecommendations = async (restAreaName, style) => {
  try {
    // Spring Boot로 요청 전송
    const response = await axios.get(`${API_BASE_URL}/api/recommend`, {
      params: {
        restAreaName: restAreaName, // Spring Boot 컨트롤러가 받을 변수명
        style: style
      }
    });
    
    return response.data; 
  } catch (error) {
    console.error("추천 메뉴 요청 실패:", error);
    throw error;
  }
};