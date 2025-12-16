import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

// 🔐 Función auxiliar para obtener el token y configurar los headers
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
// 📦 DONATIVOS
// ========================================

// GET: Todos los donativos
export const getDonativos = async () => {
  // Se agrega getAuthConfig() como segundo parámetro
  const response = await axios.get(`${API_URL}/donativos`, getAuthConfig());
  return response.data;
};

// GET: Donativo por ID (para editar)
export const getDonativoById = async (id: string) => {
  const response = await axios.get(`${API_URL}/donativos/${id}`, getAuthConfig());
  return response.data;
};

// POST: Crear donativo
export const createDonativo = async (donativoData: {
  id_japem: string;
  nombre: string;
  estatus?: string;
  rubro?: string;
  act_asistencial?: string;
  poblacion?: string;
  necesidad_pri?: string;
  necesidad_sec?: string;
  necesidad_com?: string;
  certificacion?: string;
  candidato?: string;
  donataria_aut?: string;
  padron_ben?: string;
  veces_don?: number;
}) => {
  const response = await axios.post(`${API_URL}/donativos`, donativoData, getAuthConfig());
  return response.data;
};

// PUT: Actualizar donativo
export const updateDonativo = async (id: string, donativoData: any) => {
  const response = await axios.put(`${API_URL}/donativos/${id}`, donativoData, getAuthConfig());
  return response.data;
};

// ========================================
// 📦 DONANTES
// ========================================

export const getDonantes = async () => {
  const response = await axios.get(`${API_URL}/donantes`, getAuthConfig());
  return response.data;
};

export const getDonanteById = async (id: string) => {
  const response = await axios.get(`${API_URL}/donantes/${id}`, getAuthConfig());
  return response.data;
};

// POST: Crear donante (Tipo actualizado sin catalogo)
export const createDonante = async (donanteData: {
  fecha: string;
  no_oficio: string;
  donante: string;
  municipio?: string;
  descripcion?: string;
  costo_total?: number;
  nota?: string;
}) => {
  const response = await axios.post(`${API_URL}/donantes`, donanteData, getAuthConfig());
  return response.data;
};

// PUT: Actualizar donante
export const updateDonante = async (id: string, donanteData: any) => {
  const response = await axios.put(`${API_URL}/donantes/${id}`, donanteData, getAuthConfig());
  return response.data;
};