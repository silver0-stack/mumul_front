import axios from "axios";

export const postLoginToken = async (idToken) => {
  const path = 'https://api-mumul.site/v1/oauth/login';

  try {
    const response = await axios.post(path, idToken, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      withCredentials: true,
      crossDomain: true,
    });

    if (response.status !== 200) {
      throw new Error('bad server condition');
    }

    const jwtToken = response.headers['authorization']; // 첫 번째 요소 선택

    // JWT 값을 스토리지에 저장합니다.
    localStorage.setItem('token', jwtToken);

    return true;
  } catch (e) {
    console.error('postLoginToken Error: ', e.message);
    console.error('Login Response errr:', e.response.data); // 에러 응답 확인
    return false;
  }
};