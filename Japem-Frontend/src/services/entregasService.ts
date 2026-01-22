import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

// Helper para obtener cabeceras con el token actual
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    };
};

// Obtener lista de entregas (Pendientes e Historial)
export const getHistorialEntregas = async () => {
    const response = await axios.get(`${API_URL}/entregas/pendientes`, getAuthHeaders());
    return response.data;
};

// Nueva función para confirmar la entrega (POST)
export const confirmarEntrega = async (data: { asignacion_id: number; responsable_entrega: string; lugar_entrega: string }) => {
    const response = await axios.post(`${API_URL}/entregas/confirmar`, data, getAuthHeaders());
    return response.data;
};