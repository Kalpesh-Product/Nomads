// src/utils/axios.js
import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL,
//   withCredentials: true,
// });

// export const api = axios.create({
//   baseURL: import.meta.env.VITE_DEV_LINK,
// });

// export const axiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_DEV_LINK,
//   withCredentials: true,
// });

export const api = axios.create({
  baseURL: import.meta.env.VITE_PROD_LINK,
});

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_PROD_LINK,
  withCredentials: true,
});

export default axiosInstance;
