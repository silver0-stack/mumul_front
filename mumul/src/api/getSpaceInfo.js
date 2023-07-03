import axios from 'axios';

export const getSpaceInfo = async (spaceId) => {
    const path = '/spaces/' + spaceId;

    try {
        const response = await axios.get(path,{
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
              }
        });
        console.log("getSpaceInfo: "+response.data);
        return response.data;
    } catch(e) {
        console.error('getSpaceInfo Error: ', e.message);
        return false;
    }
};