import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
});

export const fetchProducts = () => API.get('products/');
export const createProduct = (data) => API.post('products/', data);
export const updateProduct = (id, data) => API.patch(`products/${id}/`, data);
export const deleteProduct = (id) => API.delete(`products/${id}/`);

export default API;
