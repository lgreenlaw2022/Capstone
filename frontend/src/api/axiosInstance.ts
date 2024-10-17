import axios from 'axios';

const apiUrl = process.env.LOCAL_API_URL || 'http://127.0.0.1:5000';

const axiosInstance = axios.create({
	baseURL: apiUrl,
});

// this request interceptor adds the auth header to all requests
axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('access_token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export default axiosInstance;