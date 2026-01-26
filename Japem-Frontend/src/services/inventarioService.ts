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
// Agregamos los campos opcionales (?) para que soporte lo viejo y lo nuevo
export interface ItemInventario {
  id: number;              // En la vista usas .id
  nombre_producto: string;
  categoria_producto: string;
  cantidad: number;
  unidad_medida: string;   // En la vista usas .unidad_medida
  precio_total?: number;   // ¡NUEVO! Para mostrar el dinero $$
}

export const getInventario = async () => {
  try {
    // Pedimos los datos al backend (que vienen con nombres nuevos)
    const response = await axios.get<any[]>(`${API_URL}/inventario`, getAuthConfig());
    
    // 2. EL TRUCO DE MAGIA (ADAPTADOR) 🪄
    // Convertimos los nombres "nuevos" del backend a los "viejos" que tu tabla espera.
    const datosAdaptados = response.data.map((item) => ({
      id: item.catalogo_id || item.id, // Si viene como catalogo_id, lo guardamos como id
      nombre_producto: item.nombre_producto,
      categoria_producto: item.categoria_producto,
      cantidad: Number(item.cantidad), // Aseguramos que sea número
      stock_actual: Number(item.stock_actual),
      unidad_medida: item.clave_unidad || item.unidad_medida, // Mapeamos clave_unidad -> unidad_medida
      precio_total: Number(item.precio_total || 0) // Agregamos el precio
    }));

    return datosAdaptados;

  } catch (error) {
    console.error("Error al obtener inventario:", error);
    return [];
  }
};