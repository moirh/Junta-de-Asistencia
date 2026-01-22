import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// 1. Obtener Sugerencias (Match)
export const getSugerenciasMatch = async (producto: string) => {
  try {
    const response = await axios.get(`${API_URL}/iaps/sugerencias?producto=${producto}`, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error obteniendo sugerencias:", error);
    return [];
  }
};

// 2. Guardar Asignación (Aquí llamamos a la ruta /distribucion que NO pide fecha)
export const guardarAsignacion = async (data: { iap_id: number, detalles: any[] }) => {
  const response = await axios.post(`${API_URL}/distribucion`, data, getAuthConfig());
  return response.data;
};