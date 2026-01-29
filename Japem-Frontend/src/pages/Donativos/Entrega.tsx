import { useState, useEffect } from "react";
import { FileText, Package, Truck, CheckCircle, Clock, MapPin, UserCheck, Calendar, Box, AlertCircle } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Table } from "../../components/ui/Table";
import { getHistorialEntregas, confirmarEntrega } from "../../services/entregasService";
import Swal from 'sweetalert2'; // <--- 1. IMPORTAR SWEETALERT

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
  const [entregas, setEntregas] = useState<EntregaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState<EntregaItem | null>(null);

  const [form, setForm] = useState({
    responsable_entrega: '',
    lugar_entrega: 'Oficinas JAPEM'
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await getHistorialEntregas();
      setEntregas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar entregas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateEntrega = (item: EntregaItem) => {
    setSelectedEntrega(item);
    setForm({ responsable_entrega: '', lugar_entrega: 'Oficinas JAPEM' });
    setIsModalOpen(true);
  };

  // ==========================================
  // LÓGICA CONFIRMAR ENTREGA (CON SWAL)
  // ==========================================
  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!selectedEntrega) return;
    
    // Validación
    if (!form.responsable_entrega.trim()) {
      Swal.fire({
        title: 'Faltan datos',
        text: 'Por favor escribe el nombre de la persona responsable de la entrega.',
        icon: 'warning',
        confirmButtonColor: '#719c44'
      });
      return;
    }

    try {
      await confirmarEntrega({
        asignacion_id: selectedEntrega.id,
        responsable_entrega: form.responsable_entrega,
        lugar_entrega: form.lugar_entrega
      });
      
      // Mensaje de Éxito
      Swal.fire({
        title: '¡Entrega Registrada!',
        text: 'La salida de almacén se ha confirmado correctamente.',
        icon: 'success',
        confirmButtonColor: '#719c44',
        confirmButtonText: 'Excelente'
      });

      setIsModalOpen(false);
      cargarDatos(); 

    } catch (error) {
      console.error(error);
      // Mensaje de Error
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al registrar la entrega. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonColor: '#353131'
      });
    }
  };

  const handleVerVale = (id: number) => {
    Swal.fire({
        title: 'Generando Vale...',
        text: `Procesando documento PDF para el folio #${id}`,
        icon: 'info',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true
    });
  };

  const columns = [
    { key: "fecha" as keyof EntregaItem, label: "Fecha Asignación" },
    { key: "nombre_iap" as keyof EntregaItem, label: "Beneficiario" },
    { key: "producto_nombre" as keyof EntregaItem, label: "Producto" },
    { key: "estatus" as keyof EntregaItem, label: "Estatus" },
    { key: "id" as keyof EntregaItem, label: "Acciones" },
  ];

  return (
    <div className="p-6 animate-fade-in relative w-full max-w-full">
      
      {/* HEADER */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#353131] flex items-center justify-center gap-2">
            <Truck className="text-[#719c44]" size={28} />
            Mesa de Control de Entregas
          </h1>
          <p className="text-[#817e7e] mt-1">Gestiona las salidas de almacén pendientes y el historial.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-[#c0c6b6]/30 animate-pulse">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#719c44] mb-4"></div>
           <p className="text-[#817e7e] font-medium">Cargando mesa de control...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl shadow-[#c0c6b6]/20 border border-[#c0c6b6]/30 overflow-hidden">
          <Table
            data={entregas}
            columns={columns}
            renderCell={(key, value, row) => {
              const isEntregado = (row.fecha_entrega_real && row.fecha_entrega_real !== null) || row.estatus === 'procesado';

              if (key === "fecha") {
                return (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-[#353131]">
                      <Calendar size={16} className="text-[#719c44]" />
                      <span className="capitalize">
                        {new Date(value as string).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>
                    {isEntregado && row.fecha_entrega_real && (
                      <span className="text-[10px] text-[#719c44] font-bold mt-1 pl-6">
                        Entregado: {new Date(row.fecha_entrega_real).toLocaleDateString("es-MX")}
                      </span>
                    )}
                  </div>
                );
              }

              if (key === "nombre_iap") {
                return <span className="font-bold text-[#353131]">{value}</span>;
              }

              if (key === "producto_nombre") {
                return (
                  <div className="flex items-center gap-2 text-[#817e7e]">
                    <Box size={16} className="text-[#c0c6b6]" />
                    <span className="font-medium text-[#353131]">{value}</span>
                    <span className="bg-[#f2f5f0] text-[#719c44] text-xs px-2 py-0.5 rounded-full font-bold border border-[#c0c6b6]/50">x{row.cantidad}</span>
                  </div>
                );
              }

              if (key === "estatus") {
                return isEntregado ? (
                  <span className="bg-[#f2f5f0] text-[#719c44] px-3 py-1 rounded-full font-bold text-xs border border-[#c0c6b6] flex items-center gap-1 w-fit">
                    <CheckCircle size={12}/> ENTREGADO
                  </span>
                ) : (
                  <span className="bg-[#ffedcc] text-[#d97706] px-3 py-1 rounded-full font-bold text-xs border border-[#fed7aa] flex items-center gap-1 w-fit">
                    <Clock size={12}/> PENDIENTE
                  </span>
                );
              }

              if (key === "id") {
                return isEntregado ? (
                  <button 
                    onClick={() => handleVerVale(row.id)}
                    className="flex items-center gap-2 text-[#817e7e] hover:text-[#719c44] hover:bg-[#f2f5f0] px-3 py-1.5 rounded-lg transition-colors font-medium text-sm"
                  >
                    <FileText size={16} /> Vale
                  </button>
                ) : (
                  <button 
                    onClick={() => handleInitiateEntrega(row)}
                    className="bg-[#719c44] hover:bg-[#5e8239] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-transform transform active:scale-95 flex items-center gap-2 shadow-[#719c44]/30"
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

      {/* --- MODAL DE CONFIRMACIÓN --- */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Confirmar Salida de Almacén"
        size="large"
        variant="japem" 
      >
        {selectedEntrega && (
          <form onSubmit={handleConfirmar} className="space-y-6 p-1">
            
            {/* Tarjeta de Resumen */}
            <div className="bg-[#f2f5f0] p-6 rounded-2xl border border-[#c0c6b6]">
              <h3 className="text-sm font-extrabold text-[#719c44] uppercase tracking-wide flex items-center gap-2 mb-4">
                <AlertCircle size={18} /> Detalles de la Asignación
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <p className="text-xs text-[#817e7e] uppercase font-bold">Beneficiario</p>
                    <p className="text-base font-bold text-[#353131]">{selectedEntrega.nombre_iap}</p>
                </div>
                <div>
                    <p className="text-xs text-[#817e7e] uppercase font-bold">Producto a Entregar</p>
                    <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-[#353131]">{selectedEntrega.producto_nombre}</span>
                        <span className="bg-white text-[#719c44] px-2 py-0.5 rounded border border-[#c0c6b6] text-xs font-bold">Cant: {selectedEntrega.cantidad}</span>
                    </div>
                </div>
              </div>
            </div>

            {/* Inputs del Formulario */}
            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-[#353131] flex items-center gap-2">
                        <UserCheck size={16} className="text-[#817e7e]"/> Responsable de Entrega (JAPEM) *
                    </label>
                    <input 
                        type="text" 
                        required
                        className="w-full p-3 border border-[#c0c6b6] rounded-xl focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none text-[#353131]"
                        placeholder="Nombre de quien entrega..."
                        value={form.responsable_entrega}
                        onChange={(e) => setForm({...form, responsable_entrega: e.target.value})}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-[#353131] flex items-center gap-2">
                        <MapPin size={16} className="text-[#817e7e]"/> Lugar de Entrega *
                    </label>
                    <select 
                        className="w-full p-3 border border-[#c0c6b6] rounded-xl focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none bg-white text-[#353131]"
                        value={form.lugar_entrega}
                        onChange={(e) => setForm({...form, lugar_entrega: e.target.value})}
                    >
                        <option value="Oficinas JAPEM">Oficinas JAPEM</option>
                        <option value="Instalaciones de la IAP">Instalaciones de la IAP</option>
                        <option value="Evento / Otro">Evento / Otro</option>
                    </select>
                </div>
            </div>

            {/* Botones de Acción */}
            <div className="pt-4 border-t border-[#c0c6b6]/30 flex justify-end gap-3">
                <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-6 py-3 text-[#817e7e] bg-[#f9fafb] hover:bg-[#f2f5f0] rounded-xl font-bold transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    className="px-8 py-3 bg-[#719c44] hover:bg-[#5e8239] text-white font-bold rounded-xl shadow-lg transition-transform transform active:scale-95 flex items-center gap-2 shadow-[#719c44]/30"
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