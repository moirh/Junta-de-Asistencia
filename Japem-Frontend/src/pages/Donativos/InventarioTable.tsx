import { useState, useEffect } from "react";
import { Package, Search, Filter, AlertTriangle, Flame, Leaf, Calendar } from "lucide-react";
import { Table } from "../../components/ui/Table";
import axios from "axios"; 

const API_URL = "http://127.0.0.1:8000/api";

// 1. INTERFACE CORREGIDA (Coincide con la Base de Datos)
interface InventarioItem {
  id: number;
  nombre_producto: string;
  categoria_producto: string;
  cantidad: number;        // Asegúrate que tu BD tenga esta columna
  clave_unidad: string;
  fecha_caducidad?: string;
  
  // CORRECCIÓN: Usamos 'estatus_producto' en lugar de 'estado'
  estado: string; 
  clave_sat?: string;
  
  // Campos virtuales (Semáforo)
  dias_en_almacen: number;
  semaforo_rotacion: 'fresco' | 'atencion' | 'critico'; 
}

export const InventarioTable = () => {
  const [productos, setProductos] = useState<InventarioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/inventario`, {
          headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
          }
      });
      console.log("Datos recibidos del backend:", response.data); // <--- DEBUG: Mira la consola del navegador
      setProductos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  const productosFiltrados = productos.filter(p => {
    const cumpleCategoria = filtroCategoria === "Todas" ? true : p.categoria_producto === filtroCategoria;
    const cumpleBusqueda = 
      p.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.clave_sat && p.clave_sat.includes(searchTerm));
    return cumpleCategoria && cumpleBusqueda;
  });

  const getCaducidadStatus = (fecha?: string) => {
    if (!fecha) return { color: "bg-gray-100 text-gray-600", label: "NO APLICA" };
    const hoy = new Date();
    const caducidad = new Date(fecha);
    const diferenciaDias = Math.ceil((caducidad.getTime() - hoy.getTime()) / (1000 * 3600 * 24));

    if (diferenciaDias < 0) return { color: "bg-red-100 text-red-700 font-bold border border-red-200", label: "VENCIDO" };
    if (diferenciaDias < 30) return { color: "bg-orange-100 text-orange-700 font-bold border border-orange-200", label: "POR VENCER" };
    return { color: "bg-green-100 text-green-700 border border-green-200", label: "VIGENTE" };
  };

  // 2. COLUMNAS CORREGIDAS
  const columns = [
    { key: "categoria_producto" as keyof InventarioItem, label: "Categoría" },
    { key: "nombre_producto" as keyof InventarioItem, label: "Producto" },
    { key: "cantidad" as keyof InventarioItem, label: "Stock" },
    { key: "semaforo_rotacion" as keyof InventarioItem, label: "Estatus" },
    { key: "fecha_caducidad" as keyof InventarioItem, label: "Caducidad" },
    // --- CORRECCIÓN 2: Usamos la llave 'estado' ---
    { key: "estado" as keyof InventarioItem, label: "Condición" },
  ];

  return (
    <div className="animate-fade-in w-full">
      {/* ... (Header y Filtros igual que antes) ... */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        <div>
           <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
             <Package className="text-purple-600" /> Inventario General
           </h2>
           <p className="text-gray-500 text-sm">Monitoreo de stock y rotación de productos.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <input 
                    type="text" placeholder="Buscar producto..." 
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 outline-none"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
            <div className="flex items-center gap-2 bg-white px-2 py-1 border border-gray-200 rounded-xl shadow-sm">
                <Filter size={16} className="text-purple-500 ml-1" />
                <select 
                    className="bg-transparent outline-none text-sm text-gray-700 cursor-pointer font-medium py-1"
                    value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                    <option value="Todas">Todas</option>
                    <option value="Alimentos">Alimentos</option>
                    <option value="Medicamentos">Medicamentos</option>
                    <option value="Ropa">Ropa</option>
                    <option value="Otros">Otros</option>
                </select>
            </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
           <p className="text-gray-400 font-medium animate-pulse">Analizando inventario...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <Table
              data={productosFiltrados}
              columns={columns}
              rowsPerPage={10}
             renderCell={(key, value, row) => {
                
                // RENDER: SEMÁFORO (Con corrección de decimales)
                if (key === "semaforo_rotacion") {
                    
                    if (value === 'critico') return (
                        <div className="flex flex-col items-start">
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-red-200 flex items-center gap-1"><Flame size={10} /> URGENTE</span>
                        </div>
                    );
                    if (value === 'atencion') return (
                        <div className="flex flex-col items-start">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold text-[10px] border border-yellow-200 flex items-center gap-1"><AlertTriangle size={10} /> LENTO</span>
                        </div>
                    );
                    return (
                        <div className="flex flex-col items-start">
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-green-200 flex items-center gap-1"><Leaf size={10} /> RECIENTE</span>
                        </div>
                    );
                }

                // RENDER: CANTIDAD (STOCK)
                if (key === "cantidad") {
                    // Usamos row.cantidad directamente por seguridad
                    return (
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg font-bold text-purple-700">{row.cantidad ?? 0}</span>
                            <span className="text-xs text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded uppercase">
                                {row.clave_unidad || "PZA"}
                            </span>
                        </div>
                    );
                }

                // RENDER: CONDICIÓN (Estatus Producto)
                if (key === "estado") {
                    return (
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${
                        value === 'Nuevo' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                        value === 'Buen Estado' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                        'bg-gray-50 text-gray-600 border-gray-100'
                      }`}>
                        {value || "N/A"}
                      </span>
                    );
                }

                // RENDER: CADUCIDAD
                if (key === "fecha_caducidad") {
                    const status = getCaducidadStatus(row.fecha_caducidad);
                    return (
                        <div className="flex flex-col items-start gap-1">
                             <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${status.color}`}>
                               {status.label}
                             </span>
                            {row.fecha_caducidad && (
                               <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                 <Calendar size={12} />
                                 {new Date(row.fecha_caducidad).toLocaleDateString("es-MX")}
                               </div>
                            )}
                        </div>
                    );
                }

                // Resto de columnas simples
                if (key === "categoria_producto") return <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{value}</span>;
                if (key === "nombre_producto") return <div><div className="font-bold text-gray-800 text-sm uppercase">{value}</div>{row.clave_sat && <div className="text-[10px] text-gray-400 font-mono">SAT: {row.clave_sat}</div>}</div>;

                return value;
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};