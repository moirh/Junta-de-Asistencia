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

// 1. ACTUALIZAMOS LA INTERFAZ
export interface ItemInventario {
  id: number;
  nombre_producto: string;
  categoria_producto: string;
  cantidad: number;
  unidad_medida: string;
  precio_total?: number;
  clave_sat?: string; // <--- ¡AGREGADO! IMPORTANTE PARA QUE NO DE ERROR DE TIPO
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
      
      // --- ¡AQUÍ ESTABA EL CULPABLE! ---
      // Faltaba pasar este dato. Ahora ya pasará al componente.
      clave_sat: item.clave_sat 
      // --------------------------------
    }));

    return datosAdaptados;

  } catch (error) {
    console.error("Error al obtener inventario:", error);
    return [];
  }
};