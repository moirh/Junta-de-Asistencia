import { useState, useEffect } from "react";
// 1. AGREGAMOS EL ÍCONO 'Eye' PARA EL BOTÓN DE DETALLES
import { FileText, Package, Truck, CheckCircle, Clock, MapPin, UserCheck, Calendar, Box, AlertCircle, Eye } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Table } from "../../components/ui/Table";
import { getHistorialEntregas, confirmarEntrega } from "../../services/entregasService";
import Swal from 'sweetalert2'; 

interface EntregaItem {
  id: number;
  nombre_iap: string;
  producto_nombre: string;
  cantidad: number;
  fecha: string;
  estatus?: string;
  fecha_entrega_real?: string;
  responsable_entrega?: string; 
  lugar_entrega?: string;
}

interface EntregaProps {
  userRole: string; 
}

export const Entrega = ({ userRole }: EntregaProps) => {
  const isReadOnly = userRole === 'lector';

  const [entregas, setEntregas] = useState<EntregaItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // MODAL DE CONFIRMACIÓN (Entregar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 2. NUEVO ESTADO: MODAL DE DETALLES (Ver)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false); 

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
      const response = await getHistorialEntregas();
      if (Array.isArray(response)) {
          setEntregas(response);
      } else if (response && response.data && Array.isArray(response.data)) {
          setEntregas(response.data);
      } else {
          setEntregas([]);
      }
    } catch (error) {
      console.error("Error al cargar entregas:", error);
      setEntregas([]);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para ENTREGAR (Acción)
  const handleInitiateEntrega = (item: EntregaItem) => {
    if (isReadOnly) return;
    setSelectedEntrega(item);
    setForm({ responsable_entrega: '', lugar_entrega: 'Oficinas JAPEM' });
    setIsModalOpen(true);
  };

  // 3. NUEVA FUNCIÓN: Abrir modal para VER DETALLES (Lectura)
  const handleViewDetails = (item: EntregaItem) => {
    setSelectedEntrega(item);
    setIsDetailsOpen(true);
  };

  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (isReadOnly) return Swal.fire('Acceso Denegado', 'No tienes permiso.', 'error');
    if (!selectedEntrega) return;
    
    if (!form.responsable_entrega.trim()) {
      return Swal.fire('Faltan datos', 'Escribe el nombre del responsable.', 'warning');
    }

    try {
      await confirmarEntrega({
        asignacion_id: selectedEntrega.id,
        responsable_entrega: form.responsable_entrega,
        lugar_entrega: form.lugar_entrega
      });
      Swal.fire('¡Entrega Registrada!', 'Salida confirmada correctamente.', 'success');
      setIsModalOpen(false);
      cargarDatos(); 
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Hubo un problema al registrar la entrega.', 'error');
    }
  };

  const handleVerVale = (id: number) => {
    Swal.fire({ title: 'Generando Vale...', text: `Folio #${id}`, icon: 'info', timer: 1500, showConfirmButton: false });
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
      <div className="relative flex items-center justify-center mb-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#353131] flex items-center justify-center gap-2">
            <Truck className="text-[#719c44]" size={28} /> Mesa de Control de Entregas
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
              const isEntregado = (row.estatus === 'procesado' || row.estatus === 'entregado');

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

              if (key === "nombre_iap") return <span className="font-bold text-[#353131]">{value}</span>;

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
                // 4. AQUÍ PONEMOS LOS BOTONES CON ESTILO UNIFORME
                return isEntregado ? (
                  <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleVerVale(row.id)}
                        className="cursor-pointer flex items-center gap-2 text-[#817e7e] hover:text-[#719c44] hover:bg-[#f2f5f0] px-3 py-1.5 rounded-lg transition-all transform hover:scale-105 font-medium text-sm"
                        title="Descargar Vale"
                      >
                        <FileText size={18} /> Vale
                      </button>

                      <button 
                        onClick={() => handleViewDetails(row)}
                        className="cursor-pointer flex items-center gap-2 text-[#817e7e] hover:text-[#719c44] hover:bg-[#f2f5f0] px-3 py-1.5 rounded-lg transition-all transform hover:scale-105 font-medium text-sm"
                        title="Ver Detalles"
                      >
                        <Eye size={18} /> Ver Detalles
                      </button>
                  </div>
                ) : (
                  !isReadOnly ? (
                    // CORRECCIÓN APLICADA AQUÍ: Botón "Entregar" con estilo minimalista
                    <button 
                        onClick={() => handleInitiateEntrega(row)}
                        className="cursor-pointer flex items-center gap-2 text-[#817e7e] hover:text-[#719c44] hover:bg-[#f2f5f0] px-3 py-1.5 rounded-lg transition-all transform hover:scale-105 font-medium text-sm"
                        title="Iniciar Entrega"
                    >
                        <Package size={18} /> Entregar
                    </button>
                  ) : <span className="text-xs text-gray-400 italic flex items-center gap-1"><UserCheck size={12}/> Solo Lectura</span>
                );
              }
              return value;
            }}
          />
        </div>
      )}

      {/* --- MODAL DE CONFIRMACIÓN (FORMULARIO) --- */}
      {!isReadOnly && (
        <Modal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            title="Confirmar Salida de Almacén"
            size="large"
            variant="japem" 
        >
            {selectedEntrega && (
            <form onSubmit={handleConfirmar} className="space-y-6 p-1">
                {/* ... (Contenido del formulario de entrega igual que antes) ... */}
                <div className="bg-[#f2f5f0] p-6 rounded-2xl border border-[#c0c6b6]">
                    <h3 className="text-sm font-extrabold text-[#719c44] uppercase tracking-wide flex items-center gap-2 mb-4"><AlertCircle size={18} /> Detalles de la Asignación</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs text-[#817e7e] uppercase font-bold">Beneficiario</p>
                            <p className="text-base font-bold text-[#353131]">{selectedEntrega.nombre_iap}</p>
                        </div>
                        <div>
                            <p className="text-xs text-[#817e7e] uppercase font-bold">Producto</p>
                            <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-[#353131]">{selectedEntrega.producto_nombre}</span>
                                <span className="bg-white text-[#719c44] px-2 py-0.5 rounded border border-[#c0c6b6] text-xs font-bold">Cant: {selectedEntrega.cantidad}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-[#353131] flex items-center gap-2"><UserCheck size={16} className="text-[#817e7e]"/> Responsable JAPEM</label>
                        <select required className="w-full p-3 border border-[#c0c6b6] rounded-xl outline-none text-[#353131] bg-white" value={form.responsable_entrega} onChange={(e) => setForm({...form, responsable_entrega: e.target.value})}>
                            <option value="">-- Seleccionar --</option>
                            <option value="Yuri">Yuri</option>
                            <option value="Alex">Alex</option>
                            <option value="Juanita">Juanita</option>
                            <option value="Marco">Marco</option>
                            <option value="Dafne">Dafne</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-[#353131] flex items-center gap-2"><MapPin size={16} className="text-[#817e7e]"/> Lugar</label>
                        <select className="w-full p-3 border border-[#c0c6b6] rounded-xl outline-none bg-white text-[#353131]" value={form.lugar_entrega} onChange={(e) => setForm({...form, lugar_entrega: e.target.value})}>
                            <option value="Oficinas JAPEM">Oficinas JAPEM</option>
                            <option value="Instalaciones de la IAP">Instalaciones de la IAP</option>
                            <option value="Evento / Otro">Evento / Otro</option>
                        </select>
                    </div>
                </div>
                <div className="pt-4 border-t border-[#c0c6b6]/30 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-[#817e7e] bg-[#f9fafb] hover:bg-[#f2f5f0] rounded-xl font-bold transition-colors">Cancelar</button>
                    <button type="submit" className="px-8 py-3 bg-[#719c44] hover:bg-[#5e8239] text-white font-bold rounded-xl shadow-lg flex items-center gap-2"><CheckCircle size={20} /> Confirmar</button>
                </div>
            </form>
            )}
        </Modal>
      )}

      {/* 5. NUEVO MODAL: VER DETALLES (SOLO LECTURA) */}
      <Modal 
          isOpen={isDetailsOpen} 
          onClose={() => setIsDetailsOpen(false)} 
          title="Detalles de Entrega"
          size="normal"
          variant="japem" 
      >
          {selectedEntrega && (
            <div className="space-y-6 p-2">
                <div className="flex items-center justify-center py-4">
                    <div className="bg-[#f2f5f0] p-4 rounded-full border-4 border-white shadow-lg">
                        <CheckCircle size={48} className="text-[#719c44]" />
                    </div>
                </div>
                
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-[#353131]">Entrega Exitosa</h3>
                    <p className="text-[#817e7e] text-sm">Folio de Referencia: #{selectedEntrega.id}</p>
                </div>

                <div className="bg-white border border-[#c0c6b6]/50 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-[#f2f5f0] bg-[#f9fafb] flex justify-between items-center">
                        <span className="text-xs font-bold text-[#817e7e] uppercase tracking-wider">Fecha Real</span>
                        <span className="text-sm font-bold text-[#353131]">
                            {selectedEntrega.fecha_entrega_real 
                                ? new Date(selectedEntrega.fecha_entrega_real).toLocaleString() 
                                : 'No registrada'}
                        </span>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-[#f2f5f0] rounded-lg text-[#719c44]"><UserCheck size={20}/></div>
                            <div>
                                <p className="text-xs text-[#817e7e] font-bold uppercase">Entregado Por</p>
                                <p className="text-base font-medium text-[#353131]">{selectedEntrega.responsable_entrega || 'Sin dato'}</p>
                            </div>
                        </div>
                        <div className="w-full h-px bg-[#f2f5f0]"></div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-[#f2f5f0] rounded-lg text-[#719c44]"><MapPin size={20}/></div>
                            <div>
                                <p className="text-xs text-[#817e7e] font-bold uppercase">Lugar de Entrega</p>
                                <p className="text-base font-medium text-[#353131]">{selectedEntrega.lugar_entrega || 'Sin dato'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center pt-2">
                    <button 
                        onClick={() => setIsDetailsOpen(false)} 
                        className="w-full py-3 bg-[#353131] text-white rounded-xl font-bold hover:bg-black transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
          )}
      </Modal>

    </div>
  );
};