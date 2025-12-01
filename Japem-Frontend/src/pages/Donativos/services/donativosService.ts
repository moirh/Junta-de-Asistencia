import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

// ========================================
// 📦 DONATIVOS
// ========================================

// GET: Todos los donativos
export const getDonativos = async () => {
  const response = await axios.get(`${API_URL}/donativos`);
  return response.data;
};

// GET: Donativo por ID (para editar)
export const getDonativoById = async (id: string) => {
  const response = await axios.get(`${API_URL}/donativos/${id}`);
  return response.data;
};

// POST: Crear donativo
// Nota: Enviamos las necesidades planas, el backend se encarga de guardarlas en su tabla
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
  const response = await axios.post(`${API_URL}/donativos`, donativoData);
  return response.data;
};

// PUT: Actualizar donativo
export const updateDonativo = async (id: string, donativoData: any) => {
  const response = await axios.put(`${API_URL}/donativos/${id}`, donativoData);
  return response.data;
};

// ========================================
// 📦 DONANTES
// ========================================

// GET: Todos los donantes
export const getDonantes = async () => {
  const response = await axios.get(`${API_URL}/donantes`);
  return response.data;
};

// GET: Donante por ID (para editar)
export const getDonanteById = async (id: string) => {
  const response = await axios.get(`${API_URL}/donantes/${id}`);
  return response.data;
};

// POST: Crear donante
// ⚠️ ACTUALIZADO: Ahora acepta el arreglo opcional 'catalogo'
export const createDonante = async (donanteData: {
  fecha: string;
  no_oficio: string;
  donante: string;
  municipio?: string;
  descripcion?: string;
  costo_total?: number;
  nota?: string;
  catalogo?: { articulo: string }[]; // <--- NUEVO CAMPO
}) => {
  const response = await axios.post(`${API_URL}/donantes`, donanteData);
  return response.data;
};

// PUT: Actualizar donante
export const updateDonante = async (id: string, donanteData: any) => {
  const response = await axios.put(`${API_URL}/donantes/${id}`, donanteData);
  return response.data;
};