import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// 1. Instancia de Axios
const api = axios.create({
    baseURL: API_URL,
});

// 2. Interceptor para el Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ==========================================
// DASHBOARD UNIFICADO
// ==========================================
export const getDashboardData = async () => {
    const response = await api.get('/dashboard');
    return response.data; 
};

// ==========================================
// ACUERDOS
// ==========================================

export const getAcuerdos = async () => {
    const response = await api.get('/acuerdos');
    return response.data;
};

// CORRECCIÓN AQUÍ: Agregamos 'shared_with' (opcional) al tipo de datos
export const createAcuerdo = async (data: { 
    title: string; 
    description: string; 
    date: string;
    shared_with?: number[]; // <--- ¡Esto faltaba!
}) => {
    const response = await api.post('/acuerdos', data);
    return response.data;
};

export const toggleAcuerdo = async (id: number, done: boolean) => {
    const response = await api.put(`/acuerdos/${id}`, { done });
    return response.data;
};

export const deleteAcuerdo = async (id: number) => {
    const response = await api.delete(`/acuerdos/${id}`);
    return response.data;
};

// ==========================================
// RECORDATORIOS
// ==========================================

export const getRecordatorios = async () => {
    const response = await api.get('/recordatorios');
    return response.data;
};

export const createRecordatorio = async (data: { title: string; date: string }) => {
    const response = await api.post('/recordatorios', data);
    return response.data;
};

export const toggleRecordatorio = async (id: number, done: boolean) => {
    const response = await api.put(`/recordatorios/${id}`, { done });
    return response.data;
};

export const deleteRecordatorio = async (id: number) => {
    const response = await api.delete(`/recordatorios/${id}`);
    return response.data;
};