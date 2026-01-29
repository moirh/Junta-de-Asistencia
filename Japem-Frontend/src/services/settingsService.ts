import axios from "axios";

// Ajusta si tu puerto es diferente (ej. 8000 o 8080)
const API_URL = "http://localhost:8000/api";

// Helper para obtener el token actual
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
};

// --- PERFIL ---

// ✅ ¡ESTA ES LA QUE FALTABA!
export const getProfile = async () => {
  const response = await axios.get(`${API_URL}/profile`, getHeaders());
  return response.data;
};

export const updateProfile = async (data: any) => {
  // Espera: { name, email }
  const response = await axios.put(`${API_URL}/profile/update`, data, getHeaders());
  return response.data;
};

export const changePassword = async (data: any) => {
  // Espera: { current_password, new_password }
  const response = await axios.put(`${API_URL}/profile/password`, data, getHeaders());
  return response.data;
};

// --- USUARIOS ---
export const getUsers = async () => {
  const response = await axios.get(`${API_URL}/users`, getHeaders());
  return response.data;
};

export const createUser = async (user: any) => {
  const response = await axios.post(`${API_URL}/users`, user, getHeaders());
  return response.data;
};

export const updateUser = async (id: number, data: any) => {
    const response = await axios.put(`${API_URL}/users/${id}`, data, getHeaders()); 
    return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await axios.delete(`${API_URL}/users/${id}`, getHeaders());
  return response.data;
};