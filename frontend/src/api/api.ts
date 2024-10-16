import axiosInstance from './axiosInstance';
import axios from 'axios';

// Function to get user stats
export const getUserStats = async () => {
    try {
        const token = localStorage.getItem('access_token');
        const response = await axiosInstance.get(`/user/stats`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
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

export const registerUser = async (username: string, email: string, password: string) => {
    try {
        const response = await axiosInstance.post('/auth/register', { username, email, password });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // throw the error message if the backend returns a known 400 error
            throw new Error(error.response.data.error);
        } else {
            console.error('Unknown error registering user.', error);
            return { error: 'Unknown error occurred' };
        }
    }
};

export const loginUser = async (userIdentifier: string, password: string) => {
    try {
        const response = await axiosInstance.post('/auth/login', { userIdentifier, password });
        const data = response.data;
        localStorage.setItem('access_token', data.access_token);
        return data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error logging in user:', error.message);
        } else {
            console.error('Unknown error logging in user:', error);
        }
        throw error;
    }
};

// Function to logout a user
export const logoutUser = async () => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('No access token found');
        }

        const response = await axiosInstance.post('/auth/logout', {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        localStorage.removeItem('access_token');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error logging out user:', error.message);
        } else {
            console.error('Unknown error logging out user:', error);
        }
        throw error;
    }
};