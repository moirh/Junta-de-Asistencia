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

// DEFINICIÓN DE TIPO (Esto evita los errores de "Property does not exist")
export interface ItemInventario {
  id: number;
  nombre_producto: string;
  categoria_producto: string;
  cantidad: number;      // Asegúrate que tu BD devuelve 'cantidad'
  stock_actual?: number; // O 'stock_actual', soportamos ambos
  unidad_medida: string;
}

export const getInventario = async () => {
  try {
    const response = await axios.get<ItemInventario[]>(`${API_URL}/inventario`, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    return [];
  }
};