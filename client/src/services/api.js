import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const uploadProject = (formData) => API.post('/upload', formData);
export const uploadProjectJSON = (data) => API.post('/upload', data, { headers: { 'Content-Type': 'application/json' } });
export const getLatestResult = () => API.get('/results/latest');
export const getAllResults = () => API.get('/results');
export const getResultById = (id) => API.get(`/results/${id}`);
export const getInventory = (filters = {}) => API.get('/inventory', { params: filters });
export const updatePanel = (qrCode, data) => API.patch(`/inventory/${qrCode}`, data);
export const getAlerts = () => API.get('/inventory/alerts/list');

export default API;
