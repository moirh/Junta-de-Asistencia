import { useState, useEffect } from "react";
import { FileText, Package, CheckCircle, Clock, MapPin, UserCheck, Calendar, Box, AlertCircle } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Table } from "../../components/ui/Table";
import { getHistorialEntregas, confirmarEntrega } from "../../services/entregasService";

interface EntregaItem {
  id: number;
  nombre_iap: string;
  producto_nombre: string;
  cantidad: number;
  fecha: string;
  estatus?: string;
  fecha_entrega_real?: string;
}

export const Entrega = () => {
  // --- ESTADOS ---
  const [entregas, setEntregas] = useState<EntregaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState<EntregaItem | null>(null);

  // Estado del formulario
  const [form, setForm] = useState({
    responsable_entrega: '',
    lugar_entrega: 'Oficinas JAPEM'
  });

  // --- EFECTOS ---
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await getHistorialEntregas();
      // Aseguramos que sea array para evitar errores en la Tabla
      setEntregas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar entregas:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleInitiateEntrega = (item: EntregaItem) => {
    setSelectedEntrega(item);
    setForm({ responsable_entrega: '', lugar_entrega: 'Oficinas JAPEM' });
    setIsModalOpen(true);
  };

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevenir reload si se usa dentro de form
    if (!selectedEntrega) return;
    if (!form.responsable_entrega.trim()) {
      alert("Por favor escribe el nombre del responsable.");
      return;
    }

    try {
      await confirmarEntrega({
        asignacion_id: selectedEntrega.id,
        responsable_entrega: form.responsable_entrega,
        lugar_entrega: form.lugar_entrega
      });
      
      // Feedback visual similar a Donativos (alert simple o podrías usar un toast)
      setIsModalOpen(false);
      cargarDatos(); 
    } catch (error) {
      console.error(error);
      alert("Error al registrar la entrega.");
    }
  };

  const handleVerVale = (id: number) => {
    alert(`Generando vale PDF para folio #${id}...`);
  };

  // --- CONFIGURACIÓN DE COLUMNAS (Igual que en Donativos) ---
  const columns = [
    { key: "fecha" as keyof EntregaItem, label: "Fecha Asignación" },
    { key: "nombre_iap" as keyof EntregaItem, label: "Beneficiario" },
    { key: "producto_nombre" as keyof EntregaItem, label: "Producto" },
    { key: "estatus" as keyof EntregaItem, label: "Estatus" },
    { key: "id" as keyof EntregaItem, label: "Acciones" },
  ];

  return (
    <div className="p-6 animate-fade-in relative w-full max-w-full">
      
      {/* --- HEADER (Estilo IDÉNTICO a Donativos) --- */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Mesa de Control de Entregas</h1>
          <p className="text-gray-500 mt-1">Gestiona las salidas de almacén pendientes y el historial.</p>
        </div>
        {/* Si quisieras un botón a la derecha (ej. Refrescar), iría aquí con absolute right-0 */}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
           <p className="text-gray-400 font-medium animate-pulse">Cargando mesa de control...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
          {/* USAMOS TU COMPONENTE TABLE */}
          <Table
            data={entregas}
            columns={columns}
            renderCell={(key, value, row) => {
              const isEntregado = (row.fecha_entrega_real && row.fecha_entrega_real !== null) || row.estatus === 'procesado';

              // 1. FECHA (Estilo Donativos)
              if (key === "fecha") {
                return (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar size={16} className="text-purple-400" />
                      <span className="capitalize">
                        {new Date(value as string).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>
                    {isEntregado && row.fecha_entrega_real && (
                      <span className="text-[10px] text-green-600 font-bold mt-1 pl-6">
                        Entregado: {new Date(row.fecha_entrega_real).toLocaleDateString("es-MX")}
                      </span>
                    )}
                  </div>
                );
              }

              // 2. BENEFICIARIO
              if (key === "nombre_iap") {
                return <span className="font-bold text-gray-700">{value}</span>;
              }

              // 3. PRODUCTO (Estilo Donativos "Resumen")
              if (key === "producto_nombre") {
                return (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Box size={16} className="text-blue-400" />
                    <span className="font-medium text-gray-800">{value}</span>
                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-bold">x{row.cantidad}</span>
                  </div>
                );
              }

              // 4. ESTATUS (Badges)
              if (key === "estatus") {
                return isEntregado ? (
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold text-xs border border-green-100 flex items-center gap-1 w-fit">
                    <CheckCircle size={12}/> ENTREGADO
                  </span>
                ) : (
                  <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-bold text-xs border border-yellow-100 flex items-center gap-1 w-fit">
                    <Clock size={12}/> PENDIENTE
                  </span>
                );
              }

              // 5. ACCIONES
              if (key === "id") {
                return isEntregado ? (
                  <button 
                    onClick={() => handleVerVale(row.id)}
                    className="flex items-center gap-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm"
                  >
                    <FileText size={16} /> Vale
                  </button>
                ) : (
                  <button 
                    onClick={() => handleInitiateEntrega(row)}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-transform transform active:scale-95 flex items-center gap-2"
                  >
                    <Package size={16} /> Entregar
                  </button>
                );
              }

              return value;
            }}
          />
        </div>
      )}

      {/* --- MODAL DE CONFIRMACIÓN (Estilo Donativos) --- */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Confirmar Salida de Almacén"
        size="large" // Ajusta según tus tamaños definidos (medium/large)
      >
        {selectedEntrega && (
          <form onSubmit={handleConfirmar} className="space-y-6">
            
            {/* Tarjeta de Resumen (Igual a Donativos 'Info del Donante') */}
            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
              <h3 className="text-sm font-extrabold text-purple-800 uppercase tracking-wide flex items-center gap-2 mb-4">
                <AlertCircle size={18} /> Detalles de la Asignación
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Beneficiario</p>
                    <p className="text-base font-bold text-gray-800">{selectedEntrega.nombre_iap}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Producto a Entregar</p>
                    <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-gray-800">{selectedEntrega.producto_nombre}</span>
                        <span className="bg-white text-purple-600 px-2 py-0.5 rounded border border-purple-200 text-xs font-bold">Cant: {selectedEntrega.cantidad}</span>
                    </div>
                </div>
              </div>
            </div>

            {/* Inputs del Formulario */}
            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <UserCheck size={16} className="text-gray-400"/> Responsable de Entrega (JAPEM) *
                    </label>
                    <input 
                        type="text" 
                        required
                        className="w-full p-3 border border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-200 outline-none"
                        placeholder="Nombre de quien entrega..."
                        value={form.responsable_entrega}
                        onChange={(e) => setForm({...form, responsable_entrega: e.target.value})}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400"/> Lugar de Entrega *
                    </label>
                    <select 
                        className="w-full p-3 border border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-200 outline-none bg-white"
                        value={form.lugar_entrega}
                        onChange={(e) => setForm({...form, lugar_entrega: e.target.value})}
                    >
                        <option value="Oficinas JAPEM">Oficinas JAPEM</option>
                        <option value="Instalaciones de la IAP">Instalaciones de la IAP</option>
                        <option value="Evento / Otro">Evento / Otro</option>
                    </select>
                </div>
            </div>

            {/* Botones de Acción (Igual a Donativos) */}
            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition-transform transform active:scale-95 flex items-center gap-2"
                >
                    <CheckCircle size={20} /> Confirmar Entrega
                </button>
            </div>

          </form>
        )}
      </Modal>
    </div>
  );
};