import axios from 'axios';

// Use NEXT_PUBLIC prefix for client-side environment variables in Next.js
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
console.log('API URL being used:', apiUrl);

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