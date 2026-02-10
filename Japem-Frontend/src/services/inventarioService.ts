import axios from "axios";

const API_URL = "http://192.168.1.90:8000/api";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// 1. ACTUALIZAMOS LA INTERFAZ (Le agregué stock_actual por si acaso lo usas en otros lados)
export interface ItemInventario {
  id: number;
  nombre_producto: string;
  categoria_producto: string;
  cantidad: number;
  stock_actual?: number; // Agregado opcional para compatibilidad
  unidad_medida: string;
  precio_total?: number;
  clave_sat?: string; 
}

export const getInventario = async () => {
  try {
    const response = await axios.get<any[]>(`${API_URL}/inventario`, getAuthConfig());
    
    // 2. EL TRUCO DE MAGIA (ADAPTADOR) 🪄
    const datosAdaptados = response.data.map((item) => ({
      id: item.catalogo_id || item.id,
      nombre_producto: item.nombre_producto,
      categoria_producto: item.categoria_producto,
      cantidad: Number(item.cantidad),
      stock_actual: Number(item.stock_actual),
      unidad_medida: item.clave_unidad || item.unidad_medida,
      precio_total: Number(item.precio_total || 0),
      clave_sat: item.clave_sat 
    }));

    return datosAdaptados;

  } catch (error) {
    console.error("Error al obtener inventario:", error);
    return [];
  }
};

// --- AGREGADO: ESTA ES LA FUNCIÓN QUE TE FALTABA ---
export const updateInventarioPrecios = async (items: any[]) => {
  try {
    // Usamos 'put' para actualizar. Enviamos el array de items modificado.
    const response = await axios.put(`${API_URL}/inventario/precios`, items, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error("Error actualizando precios:", error);
    throw error; // Re-lanzamos el error para que el componente lo capture
  }
};