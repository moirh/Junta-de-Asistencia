import axios from "axios";
import type { Donativo } from '../types'; 

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

// ========================================
// 📦 DONATIVOS (NUEVA ESTRUCTURA)
// ========================================

export const getDonativos = async () => {
  const response = await axios.get<Donativo[]>(`${API_URL}/donativos`, getAuthConfig());
  return response.data;
};

export const getDonativoById = async (id: number) => {
  const response = await axios.get<Donativo>(`${API_URL}/donativos/${id}`, getAuthConfig());
  return response.data;
};

// POST: Crear donativo con la estructura compleja (Cabecera + Detalles)
export const createDonativo = async (donativoData: any) => {
  // El backend espera: { donante_id, fecha_donativo, productos: [...] }
  // O la estructura que definimos en el Controller.
  const response = await axios.post(`${API_URL}/donativos`, donativoData, getAuthConfig());
  return response.data;
};

export const updateDonativo = async (id: number, donativoData: any) => {
  const response = await axios.put(`${API_URL}/donativos/${id}`, donativoData, getAuthConfig());
  return response.data;
};

export const deleteDonativo = async (id: number) => {
  await axios.delete(`${API_URL}/donativos/${id}`, getAuthConfig());
};