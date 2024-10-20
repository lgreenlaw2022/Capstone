import axiosInstance from './axiosInstance';
import axios from 'axios';


export const getUserBioData = async () => {
    try {
        const response = await axiosInstance.get('/user/bio-data');
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

export const getUserStats = async () => {
    try {
        const response = await axiosInstance.get('/user/stats');
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
        await logoutUser(); // Ensure users are logged out before registering
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
        await logoutUser(); // Ensure no user is logged in already
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

export const logoutUser = async () => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.log('No access token found, user is already logged out');
            return;
        }

        const response = await axiosInstance.post('/auth/logout');
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


export const deleteUser = async () => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('No access token found');
        }

        const response = await axiosInstance.post('/auth/delete');

        localStorage.removeItem('access_token');
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error deleting user:', error.message);
        } else {
            console.error('Unknown error deleting out user:', error);
          
// Function to get units in the prep course (id 1)
export const getUnitsInPrepCourse = async () => {
    try {
        const response = await axiosInstance.get('content/courses/1/units');
        // considering caching the response
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching units in prep course:', error.message);
        } else {
            console.error('Unknown error fetching units in prep course:', error);
        }
        throw error;
    }
};

export const getModulesInUnit = async (unitId: number) => {
    try {
        const response = await axiosInstance.get(`content/units/${unitId}/modules`);
        return response.data;
    } catch (error) {
        // Extract the error message handlign since its common
        if (error instanceof Error) {
            console.error('Error fetching modules:', error.message);
        } else {
            console.error('Unknown error fetching modules:', error);
        }
        throw error;
    }
};

export const getModuleContent = async (moduleId: number) => {
    try {
        const response = await axiosInstance.get(`content/modules/${moduleId}`);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching module content:', error.message);
        } else {
            console.error('Unknown error fetching module content:', error);
        }
        throw error;
    }
};