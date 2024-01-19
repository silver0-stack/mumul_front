import { customAxios } from "./../customAxios";

export const getFollowingList = async (spaceId) => {
    const path = `/getFollow/following/${spaceId}`;
    const token = localStorage.getItem('token');

    try {
        const response = await customAxios.get(path, {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: 'Bearer ' + token
            }
          });

        return response.data.data;
    } catch (e) {
        console.error('getFollowingList Error: ', e.message);
    }
};