import axios from "axios";

const API_URL = "http://192.168.1.90:8000/api";

// 1. DEFINIMOS LA ESTRUCTURA DE LOS DATOS (EL MOLDE)
interface ConfirmarEntregaData {
    asignacion_id: number;
    responsable_entrega: string;
    lugar_entrega: string;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    };
};

// Obtener lista de entregas (Ahora apunta al historial completo)
export const getHistorialEntregas = async () => {
    const response = await axios.get(`${API_URL}/entregas/historial`, getAuthHeaders());
    return response.data;
};

// 2. USAMOS LA INTERFAZ AQUÍ PARA CORREGIR EL ERROR
export const confirmarEntrega = async (data: ConfirmarEntregaData) => {
    const response = await axios.post(`${API_URL}/entregas/procesar`, data, getAuthHeaders());
    return response.data;
};