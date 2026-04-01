import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (email: string, password: string) =>
  api.post('/auth/register', { email, password });

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

// User
export const getProfile = () => api.get('/user/profile');

// Role
export const assignRole = (userId: number, roleId: number) =>
  api.post('/role/assign', { userId, roleId });

// Product
export const createProduct = (categoryId: number) =>
  api.post('/product/create', { categoryId });

export const addProductDetails = (productId: number, body: object) =>
  api.post(`/product/${productId}/details`, body);

export const activateProduct = (productId: number) =>
  api.post(`/product/${productId}/activate`);

export const getProduct = (productId: number) =>
  api.get(`/product/${productId}`);

export const deleteProduct = (productId: number) =>
  api.delete(`/product/${productId}`);
