import axios from "axios";
// Asegúrate de definir esta interfaz en tu archivo types.ts o aquí mismo
export interface Iap {
  id?: number;
  nombre_iap: string;
  rubro?: string;
  estatus: string;
  actividad_asistencial?: string;
  personas_beneficiadas?: number;
  necesidad_primaria?: string;
  necesidad_complementaria?: string;
  es_certificada: boolean;
  tiene_donataria_autorizada: boolean;
  tiene_padron_beneficiarios: boolean;
  veces_donado?: number;
}

const API_URL = "http://192.168.1.90:8000/api/iaps";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const getIaps = async () => {
  const response = await axios.get<Iap[]>(API_URL, getAuthConfig());
  return response.data;
};

export const createIap = async (iap: Iap) => {
  const response = await axios.post(API_URL, iap, getAuthConfig());
  return response.data;
};

export const updateIap = async (id: number, iap: Iap) => {
  const response = await axios.put(`${API_URL}/${id}`, iap, getAuthConfig());
  return response.data;
};

export const deleteIap = async (id: number) => {
  await axios.delete(`${API_URL}/${id}`, getAuthConfig());
};