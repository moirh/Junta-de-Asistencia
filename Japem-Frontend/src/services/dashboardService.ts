import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// 1. Creamos una instancia de Axios configurada
const api = axios.create({
    baseURL: API_URL,
});

// 2. Agregamos un "Interceptor"
// Antes de salir, cada petición revisa si hay un token guardado y lo pega.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Recuperamos el token del Login
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 3. Usamos la instancia 'api' en lugar de 'axios' directo
export const getAcuerdos = async () => {
    const response = await api.get('/acuerdos');
    return response.data;
};

export const createAcuerdo = async (data: { title: string; description: string; date: string }) => {
    const response = await api.post('/acuerdos', data);
    return response.data;
};

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