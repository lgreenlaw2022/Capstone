import axios from 'axios';

const apiUrl = process.env.LOCAL_API_URL || 'http://127.0.0.1:5000';

const axiosInstance = axios.create({
  baseURL: apiUrl,
});

export default axiosInstance;