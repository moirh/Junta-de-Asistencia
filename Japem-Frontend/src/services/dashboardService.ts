import axios from 'axios';

// Ajusta la URL base si es diferente
const API_URL = 'http://localhost:8000/api'; 

export const getAcuerdos = async () => {
    const response = await axios.get(`${API_URL}/acuerdos`);
    return response.data;
};

export const getRecordatorios = async () => {
    const response = await axios.get(`${API_URL}/recordatorios`);
    return response.data;
};

export const createRecordatorio = async (data: { title: string, date: string }) => {
    const response = await axios.post(`${API_URL}/recordatorios`, data);
    return response.data;
};

export const toggleRecordatorio = async (id: number, done: boolean) => {
    const response = await axios.put(`${API_URL}/recordatorios/${id}`, { done });
    return response.data;
};