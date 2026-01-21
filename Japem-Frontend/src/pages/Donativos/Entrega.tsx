import { useState, useEffect } from "react";
import { Table } from "../../components/ui/Table";
import { Truck, Calendar, Building2, PackageCheck } from "lucide-react";

// Definimos la estructura correcta para una ENTREGA (Salida)
interface DetalleEntrega {
  nombre_producto: string;
  cantidad: number;
  unidad_medida: string;
}

interface EntregaData {
  id: number;
  nombre_iap: string; // Aquí va la IAP, NO el donante
  fecha_entrega: string;
  detalles: DetalleEntrega[];
}

export const Entrega = () => {
  const [entregas, setEntregas] = useState<EntregaData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // --- SIMULACIÓN DE DATOS DE ENTREGAS ---
      // Como 'getDonativos' trae Donantes, aquí simulamos datos de IAPs
      // para que veas la tabla como debe ser.
      const dataSimulada: EntregaData[] = [
        {
          id: 1,
          nombre_iap: "CASA HOGAR ALEGRÍA I.A.P.",
          fecha_entrega: "2026-01-22",
          detalles: [
            { nombre_producto: "ARROZ BOLSA 1KG", cantidad: 50, unidad_medida: "PZA" },
            { nombre_producto: "ACEITE 1L", cantidad: 20, unidad_medida: "LITRO" }
          ]
        },
        {
          id: 2,
          nombre_iap: "ASILO DE ANCIANOS TOLUCA",
          fecha_entrega: "2026-01-20",
          detalles: [
            { nombre_producto: "COBIJAS TÉRMICAS", cantidad: 30, unidad_medida: "PZA" }
          ]
        },
        {
          id: 3,
          nombre_iap: "FUNDACIÓN VAMOS A DAR",
          fecha_entrega: "2026-01-18",
          detalles: [
            { nombre_producto: "LECHE EN POLVO", cantidad: 15, unidad_medida: "LATA" },
            { nombre_producto: "PAÑALES ETAPA 4", cantidad: 10, unidad_medida: "PAQUETE" }
          ]
        }
      ];

      // Simulamos un pequeño tiempo de carga
      setTimeout(() => {
        setEntregas(dataSimulada);
        setLoading(false);
      }, 500);

    } catch (error) {
      console.error("Error cargando entregas:", error);
      setLoading(false);
    }
  };

  const columns = [
    { key: "nombre_iap" as keyof EntregaData, label: "Institución Beneficiaria (IAP)" },
    { key: "detalles" as keyof EntregaData, label: "Artículos Entregados" },
    { key: "fecha_entrega" as keyof EntregaData, label: "Fecha Entrega" },
  ];

  return (
    <div className="w-full animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
           <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
             <Truck className="text-purple-600" /> Registro de Salidas (Entregas)
           </h2>
           <p className="text-gray-500 text-sm">Historial de apoyos entregados a las instituciones.</p>
        </div>
        
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all text-sm flex items-center gap-2 transform active:scale-95">
            <PackageCheck size={18} /> Nueva Entrega
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
           <p className="text-gray-400 font-medium animate-pulse">Cargando historial de entregas...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <Table
              data={entregas}
              columns={columns}
              rowsPerPage={10}
              renderCell={(key, value, row) => {
                
                // 1. COLUMNA: IAP
                if (key === "nombre_iap") {
                    return (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                <Building2 size={16} />
                            </div>
                            <span className="font-bold text-gray-700 text-sm">
                                {value}
                            </span>
                        </div>
                    );
                }

                // 2. COLUMNA: ARTÍCULOS
                if (key === "detalles") {
                    const detalles = row.detalles || [];
                    return (
                        <div className="text-sm space-y-1">
                            {detalles.map((d, i) => (
                                <div key={i} className="flex items-center gap-2 text-gray-600">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
                                    <span className="font-semibold text-gray-800">{d.nombre_producto}</span>
                                    <span className="text-xs text-gray-400 font-mono bg-gray-50 px-1 rounded border border-gray-100">
                                        {d.cantidad} {d.unidad_medida}
                                    </span>
                                </div>
                            ))}
                        </div>
                    );
                }

                // 3. COLUMNA: FECHA
                if (key === "fecha_entrega") {
                    return (
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg w-fit border border-gray-100">
                            <Calendar size={14} className="text-purple-400" />
                            <span className="text-sm font-medium capitalize">
                                {new Date(value).toLocaleDateString("es-MX", { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                    );
                }

                return value;
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};