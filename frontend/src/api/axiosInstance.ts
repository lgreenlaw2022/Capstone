import axios from 'axios';

const apiUrl = process.env.LOCAL_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: apiUrl,
});

export default axiosInstance;