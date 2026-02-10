// src/services/donantesService.ts
import axios from 'axios';
import type { Donante } from '../types'; // Asegúrate de que types.ts esté en src/

// Ajusta la URL si tu backend corre en otro puerto
const API_URL = 'http://192.168.1.90:8000/api/donantes';

// Configuración para enviar el token en cada petición
const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    };
};

// --- OBTENER TODOS ---
export const getDonantes = async () => {
    const response = await axios.get<Donante[]>(API_URL, getAuthConfig());
    return response.data;
};

// --- OBTENER UNO POR ID ---
export const getDonanteById = async (id: number) => {
    const response = await axios.get<Donante>(`${API_URL}/${id}`, getAuthConfig());
    return response.data;
};

// --- CREAR (POST) ---
export const createDonante = async (donante: Donante) => {
    const response = await axios.post(API_URL, donante, getAuthConfig());
    return response.data;
};

// --- ACTUALIZAR (PUT) ---
export const updateDonante = async (id: number, donante: Donante) => {
    const response = await axios.put(`${API_URL}/${id}`, donante, getAuthConfig());
    return response.data;
};

// --- ELIMINAR (DELETE) - Esta es la función que te faltaba ---
export const deleteDonante = async (id: number) => {
    await axios.delete(`${API_URL}/${id}`, getAuthConfig());
};