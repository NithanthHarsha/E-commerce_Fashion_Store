import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

const API = axios.create({
    baseURL: `${API_BASE_URL}/api/`,
});

export const getMediaUrl = (path) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
};

export const fetchProducts = () => API.get('products/');
export const createProduct = (data) => API.post('products/', data);
export const updateProduct = (id, data) => API.patch(`products/${id}/`, data);
export const deleteProduct = (id) => API.delete(`products/${id}/`);

export default API;
