import axiosInstance from './axiosInstance';

// Function to get user stats
export const getUserStats = async (userId: number) => {
    try {
        const response = await axiosInstance.get(`/user/${userId}/stats`);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching user stats:', error.message);
        } else {
            console.error('Unknown error fetching user stats:', error);
        }
        throw error;
    }
};

export default axiosInstance;