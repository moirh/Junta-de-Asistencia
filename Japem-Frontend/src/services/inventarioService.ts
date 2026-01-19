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

// --- ESTO ES LO QUE TE FALTA ---
export interface ItemInventario {
  nombre_producto: string;
  categoria_producto: string;
  clave_unidad: string;
  total_entradas: number;
  total_salidas: number;
  stock_actual: number;
}
// -------------------------------

export const getInventario = async () => {
  const response = await axios.get<ItemInventario[]>(`${API_URL}/inventario`, getAuthConfig());
  return response.data;
};