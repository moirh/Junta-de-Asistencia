import { useState, useEffect } from "react";
import { Package, Filter, AlertTriangle, Flame, Leaf, Calendar } from "lucide-react";
import { Table } from "../../components/ui/Table";
import axios from "axios"; 

const API_URL = "http://127.0.0.1:8000/api";

interface InventarioItem {
  id: number;
  nombre_producto: string;
  categoria_producto: string;
  cantidad_actual: number; 
  cantidad: number; 
  clave_unidad: string;
  fecha_caducidad?: string;
  estado: string; 
  clave_sat?: string;
  dias_en_almacen: number;
  semaforo_rotacion: 'fresco' | 'atencion' | 'critico'; 
}

// 1. DEFINIMOS LA INTERFAZ PARA RECIBIR EL ROL
interface InventarioTableProps {
  userRole: string;
}

// 2. RECIBIMOS LA PROP (Esto evita errores con el index.tsx)
export const InventarioTable = ({ userRole }: InventarioTableProps) => {
  const [productos, setProductos] = useState<InventarioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  
  // 3. DEBUG: Verifica en la consola (F12) que aquí diga "lector"
  console.log("Rol en Inventario:", userRole);

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
      setProductos(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  const productosProcesados = productos
    .filter(p => 
        filtroCategoria === "Todas" || Number(filtroCategoria) === 0 
            ? true 
            : p.categoria_producto === filtroCategoria
    )
    .map(p => ({
        ...p,
        _busqueda: `${p.nombre_producto} ${p.categoria_producto} ${p.clave_sat || ''}`
    }));

  const getCaducidadStatus = (fecha?: string) => {
    if (!fecha) return { color: "bg-[#f9fafb] text-[#817e7e] border border-[#e5e7eb]", label: "NO APLICA" };
    const hoy = new Date();
    const caducidad = new Date(fecha);
    const diferenciaDias = Math.ceil((caducidad.getTime() - hoy.getTime()) / (1000 * 3600 * 24));

    if (diferenciaDias < 0) return { color: "bg-red-100 text-red-700 font-bold border border-red-200", label: "VENCIDO" };
    if (diferenciaDias < 30) return { color: "bg-orange-100 text-orange-700 font-bold border border-orange-200", label: "POR VENCER" };
    
    return { color: "bg-[#f2f5f0] text-[#719c44] border border-[#c0c6b6]", label: "VIGENTE" };
  };

  const columns = [
    { key: "nombre_producto" as keyof InventarioItem, label: "Producto" },
    { key: "categoria_producto" as keyof InventarioItem, label: "Categoría" },
    { key: "cantidad_actual" as keyof InventarioItem, label: "Stock Disponible" },
    { key: "semaforo_rotacion" as keyof InventarioItem, label: "Estatus" },
    { key: "fecha_caducidad" as keyof InventarioItem, label: "Caducidad" },
    { key: "estado" as keyof InventarioItem, label: "Condición" },
  ];

  return (
    <div className="p-6 animate-fade-in relative w-full max-w-full">
      
      <div className="relative flex items-center justify-center mb-8">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-[#353131] flex items-center justify-center gap-2">
              <Package className="text-[#719c44]" size={28} /> Inventario General
            </h2>
            <p className="text-[#817e7e] mt-1">Monitoreo de stock disponible y rotación.</p>
        </div>

        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-2.5 border border-[#c0c6b6] rounded-xl shadow-sm hover:shadow-md transition-all">
                <Filter size={16} className="text-[#719c44]" />
                <select 
                    className="bg-transparent outline-none text-sm text-[#353131] cursor-pointer font-bold pr-2"
                    value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                    <option value={0}>-- Seleccionar --</option>
                    <option value="Alimentos">Alimentos</option>
                    <option value="Medicamentos">Medicamentos</option>
                    <option value="Ropa">Ropa</option>
                    <option value="Juguetes">Juguetes</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Otros">Otros</option>
                </select>
            </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-[#c0c6b6]/30">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#719c44] mb-4"></div>
           <p className="text-[#817e7e] font-medium animate-pulse">Analizando inventario...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xl shadow-[#c0c6b6]/20 border border-[#c0c6b6]/30 overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <Table
              data={productosProcesados}
              columns={columns}
              renderCell={(key, value, row) => {
                
                if (key === "nombre_producto") return (
                    <div className="text-left pl-2">
                        <div className="font-bold text-[#353131] text-sm uppercase">{value}</div>
                        {row.clave_sat && <div className="text-[10px] text-[#817e7e] font-mono">SAT: {row.clave_sat}</div>}
                    </div>
                );

                if (key === "categoria_producto") return (
                    <div className="flex justify-start">
                        <span className="text-[10px] font-extrabold text-[#719c44] uppercase tracking-widest bg-[#f2f5f0] px-2 py-1 rounded-md border border-[#c0c6b6]">
                            {value}
                        </span>
                    </div>
                );

                if (key === "semaforo_rotacion") {
                    if (value === 'critico') return (
                        <div className="flex justify-start">
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-red-200 flex items-center gap-1"><Flame size={10} /> URGENTE</span>
                        </div>
                    );
                    if (value === 'atencion') return (
                        <div className="flex justify-start">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold text-[10px] border border-yellow-200 flex items-center gap-1"><AlertTriangle size={10} /> LENTO</span>
                        </div>
                    );
                    return (
                        <div className="flex justify-start">
                          <span className="bg-[#f2f5f0] text-[#719c44] px-2 py-0.5 rounded-full font-bold text-[10px] border border-[#c0c6b6] flex items-center gap-1"><Leaf size={10} /> RECIENTE</span>
                        </div>
                    );
                }

                if (key === "cantidad_actual") {
                    return (
                        <div className="flex justify-start items-center gap-1.5">
                            <span className={`text-lg font-bold ${Number(value) < 5 ? 'text-red-500' : 'text-[#719c44]'}`}>
                                {parseFloat(value ?? 0).toString()}
                            </span>
                            <span className="text-[10px] text-[#817e7e] font-bold bg-[#f9fafb] px-1.5 py-0.5 rounded uppercase border border-[#e5e7eb]">
                                {row.clave_unidad || "PZA"}
                            </span>
                        </div>
                    );
                }

                if (key === "estado") {
                    return (
                      <div className="flex justify-start">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${
                            value === 'Nuevo' ? 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]' : 
                            value === 'Buen Estado' ? 'bg-[#f0f9ff] text-[#0369a1] border-[#bae6fd]' :
                            'bg-[#f9fafb] text-[#817e7e] border-[#e5e7eb]'
                          }`}>
                            {value || "N/A"}
                          </span>
                      </div>
                    );
                }

                if (key === "fecha_caducidad") {
                    const status = getCaducidadStatus(row.fecha_caducidad);
                    return (
                        <div className="flex flex-col items-start gap-1">
                             <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${status.color}`}>
                               {status.label}
                             </span>
                            {row.fecha_caducidad && (
                               <div className="flex items-center gap-1 text-xs text-[#817e7e] font-medium">
                                 <Calendar size={12} />
                                 {new Date(row.fecha_caducidad).toLocaleDateString("es-MX")}
                               </div>
                            )}
                        </div>
                    );
                }

                return <div className="text-left">{value}</div>;
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};