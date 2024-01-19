import { customAxios } from "./../customAxios";

export const getFollwerNumber = async (spaceId) => {
    const path = `/getFollow/followerNumber/${spaceId}`;
    const token = localStorage.getItem('token');

    try {
        const response = await customAxios.get(path, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: 'Bearer ' + token
            }
          });

        return response.data;
    } catch (e) {
        console.error('getFollowerNumber Error: ', e.message);
        return false;
    }
};