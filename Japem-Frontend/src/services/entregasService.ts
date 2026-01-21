import axios from "axios";
import {type Iap } from "./iapService";

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

// --- EL CEREBRO: Llamar al algoritmo ---
export const getSugerenciasMatch = async (producto: string) => {
  // Ejemplo: GET /api/iaps/sugerencias?producto=Arroz
  const response = await axios.get<Iap[]>(`${API_URL}/iaps/sugerencias?producto=${producto}`, getAuthConfig());
  return response.data;
};

// --- LA ACCIÓN: Registrar la salida ---
export const realizarEntrega = async (datosEntrega: { iap_id: number, detalles: any[] }) => {
  const response = await axios.post(`${API_URL}/entregas`, datosEntrega, getAuthConfig());
  return response.data;
};
