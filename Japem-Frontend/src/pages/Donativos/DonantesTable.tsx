import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Users, Building2, Phone, Mail, FileText, MapPin } from "lucide-react"; 
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal"; 
import { 
  getDonantes, 
  createDonante,
  updateDonante, 
  deleteDonante 
} from "../../services/donantesService"; 
import type { Donante } from "../../types"; 
import Swal from 'sweetalert2';

export default function DonantesTable() {
  const [donantes, setDonantes] = useState<Donante[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado del Formulario
  const initialFormState: Donante = {
    razon_social: "",
    rfc: "",
    regimen_fiscal: "",
    direccion: "",
    cp: "",
    contacto: "",
    email: "",
    telefono: "",
    estatus: "Permanente", 
  };
  const [formData, setFormData] = useState<Donante>(initialFormState);

  useEffect(() => {
    fetchDonantes();
  }, []);

  const fetchDonantes = async () => {
    try {
      setLoading(true);
      const data = await getDonantes();
      setDonantes(data);
    } catch (error) {
      console.error("Error cargando donantes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (donante?: Donante) => {
    if (donante) {
      setFormData(donante);
      setIsEditing(true);
    } else {
      setFormData(initialFormState);
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
  };

  // LÓGICA DE GUARDAR

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) {
        await updateDonante(formData.id, formData);
        
        // Alerta de Éxito al Editar
        Swal.fire({
          title: '¡Actualizado!',
          text: 'La información del donante se actualizó correctamente.',
          icon: 'success',
          confirmButtonColor: '#719c44',
          confirmButtonText: 'Aceptar'
        });

      } else {
        await createDonante(formData);

        // Alerta de Éxito al Registrar
        Swal.fire({
          title: '¡Registrado!',
          text: 'El nuevo donante ha sido agregado al directorio.',
          icon: 'success',
          confirmButtonColor: '#719c44',
          confirmButtonText: 'Excelente'
        });
      }
      
      fetchDonantes(); 
      handleCloseModal();

    } catch (error) {
      console.error("Error guardando donante:", error);
      
      // Alerta de Error
      Swal.fire({
        title: 'Error',
        text: 'Hubo un error al guardar. Verifica los campos obligatorios.',
        icon: 'error',
        confirmButtonColor: '#353131'
      });
    }
  };

  // LÓGICA DE ELIMINAR

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Se eliminará este donante del directorio permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteDonante(id);
        
        Swal.fire({
          title: '¡Eliminado!',
          text: 'El registro ha sido eliminado.',
          icon: 'success',
          confirmButtonColor: '#719c44'
        });

        fetchDonantes();
      } catch (error) {
        console.error("Error eliminando:", error);
        Swal.fire('Error', 'No se pudo eliminar el registro.', 'error');
      }
    }
  };

  const columns = [
    { key: "razon_social" as keyof Donante, label: "Razón Social" },
    { key: "rfc" as keyof Donante, label: "RFC" },
    { key: "contacto" as keyof Donante, label: "Contacto" },
    { key: "direccion" as keyof Donante, label: "Dirección" },
    { key: "email" as keyof Donante, label: "Email" },
    { key: "telefono" as keyof Donante, label: "Teléfono Celular" },
    { key: "telefono_secundario" as keyof Donante, label: "Teléfono Oficina" },
    { key: "estatus" as keyof Donante, label: "Estatus" },
    { key: "id" as keyof Donante, label: "Acciones" },
  ];

  return (
    <div className="p-6 animate-fade-in relative w-full max-w-full">
      
      {/* HEADER */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-[#353131] flex items-center justify-center gap-2">
                <Users className="text-[#719c44]" size={28} />
                Directorio de Donantes
            </h1>
            <p className="text-[#817e7e] mt-1">Gestiona la información de empresas y particulares</p>
        </div>

        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <button
            onClick={() => handleOpenModal()}
            className="cursor-pointer group bg-[#719c44] hover:bg-[#5e8239] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:shadow-xl shadow-[#719c44]/30 font-bold transition-all duration-300 ease-out transform hover:scale-105 active:scale-95"
          >
            <Plus size={20} className="transition-transform duration-500 group-hover:rotate-180" />
            <span className="hidden sm:inline">Nuevo Donante</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-[#c0c6b6]/30 animate-pulse">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#719c44] mb-4"></div>
           <p className="text-[#817e7e] font-medium">Cargando registros...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xl shadow-[#c0c6b6]/20 border border-[#c0c6b6]/30 overflow-hidden">
          <Table
            data={donantes}
            columns={columns}
            rowsPerPage={8}
            renderCell={(key, value, row) => {
              if (key === "estatus") {
                return (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase 
                    ${value === 'Permanente' ? 'bg-[#f2f5f0] text-[#719c44]' : 
                      value === 'Eventual' ? 'bg-[#ffedcc] text-[#d97706]' : 
                      'bg-[#e0f2fe] text-[#0284c7]'}`}>
                    {value}
                  </span>
                );
              }
              if (key === "id") {
                return (
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => handleOpenModal(row)} className="cursor-pointer p-1.5 text-[#817e7e] hover:bg-[#f2f5f0] hover:text-[#719c44] rounded-md transition transform hover:scale-110" title="Editar"><Edit size={18} /></button>
                    <button onClick={() => row.id && handleDelete(row.id)} className="cursor-pointer p-1.5 text-[#817e7e] hover:bg-red-50 hover:text-red-500 rounded-md transition transform hover:scale-110" title="Eliminar"><Trash2 size={18} /></button>
                  </div>
                );
              }
              return value;
            }}
          />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isEditing ? "Editar Donante" : "Registrar Nuevo Donante"}
        size="extraLarge"
        variant="japem" 
        icon={<Users />} 
      >
        <form onSubmit={handleSave} className="space-y-6 p-1">
          
          {/* SECCIÓN 1: DATOS FISCALES */}
          <div className="p-5 bg-[#f2f5f0] rounded-xl border border-[#c0c6b6]">
             <h4 className="text-xs font-bold text-[#817e7e] uppercase mb-4 flex items-center gap-2">
                <Building2 size={14}/> Datos Fiscales
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#353131] mb-1">Razón Social / Nombre *</label>
                  <input type="text" required className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all uppercase text-[#353131]" value={formData.razon_social} onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353131] mb-1">RFC</label>
                  <input type="text" className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all uppercase text-[#353131]" value={formData.rfc || ""} onChange={(e) => setFormData({ ...formData, rfc: e.target.value })} />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                <div>
                  <label className="block text-xs font-bold text-[#353131] mb-1">Régimen Fiscal</label>
                  <select className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all text-[#353131]" value={formData.regimen_fiscal || ""} onChange={(e) => setFormData({ ...formData, regimen_fiscal: e.target.value })}>
                    <option value="">-- Seleccionar --</option>
                    <option value="Persona Moral">Persona Moral </option>
                    <option value="Persona Física">Persona Física</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353131] mb-1">Código Postal</label>
                  <input type="text" className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all text-[#353131]" value={formData.cp || ""} onChange={(e) => setFormData({ ...formData, cp: e.target.value })} />
                </div>
             </div>

             <div className="mt-4">
                <label className="block text-xs font-bold text-[#353131] mb-1">Dirección Fiscal</label>
                <div className="relative">
                    <MapPin className="absolute top-3 left-3 text-[#817e7e]" size={16}/>
                    <textarea className="w-full pl-10 pr-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all uppercase text-[#353131]" rows={2} value={formData.direccion || ""} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} />
                </div>
             </div>
          </div>

          {/* SECCIÓN 2: CONTACTO */}
          <div className="p-5 bg-[#f9fafb] rounded-xl border border-[#e5e7eb]">
             <h4 className="text-xs font-bold text-[#817e7e] uppercase mb-4 flex items-center gap-2">
                <FileText size={14}/> Datos de Contacto
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#353131] mb-1">Persona de Contacto *</label>
                  <input type="text" required className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all uppercase text-[#353131]" value={formData.contacto} onChange={(e) => setFormData({ ...formData, contacto: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353131] mb-1">Estatus *</label>
                  <select className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all text-[#353131]" value={formData.estatus} onChange={(e) => setFormData({ ...formData, estatus: e.target.value as any })}>
                    <option value="">-- Seleccionar --</option>
                    <option value="Permanente">Permanente</option>
                    <option value="Eventual">Eventual</option>
                    <option value="Unica vez">Única vez</option>
                  </select>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                <div>
                  <label className="block text-xs font-bold text-[#353131] mb-1">Email</label>
                  <div className="relative">
                      <Mail className="absolute top-1/2 -translate-y-1/2 left-3 text-[#817e7e]" size={16}/>
                      <input type="email" className="w-full pl-10 pr-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all text-[#353131]" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#353131] mb-1">Teléfono Celular</label>
                  <div className="relative">
                      <Phone className="absolute top-1/2 -translate-y-1/2 left-3 text-[#817e7e]" size={16}/>
                      <input type="tel" className="w-full pl-10 pr-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all text-[#353131]" value={formData.telefono || ""} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
                  </div>
                </div>
             </div>

             <div className="mt-4">
                <label className="block text-xs font-bold text-[#353131] mb-1">Teléfono Oficina</label>
                <div className="relative">
                    <Building2 className="absolute top-1/2 -translate-y-1/2 left-3 text-[#817e7e]" size={16}/>
                    <input type="text" className="w-full pl-10 pr-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all text-[#353131]" value={formData.telefono_secundario || ""} onChange={(e) => setFormData({ ...formData, telefono_secundario: e.target.value })} />
                </div>
             </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#c0c6b6]/30">
            <button type="button" onClick={handleCloseModal} className="cursor-pointer px-6 py-3 text-[#817e7e] font-bold hover:bg-[#f2f5f0] rounded-xl transition-all">Cancelar</button>
            <button type="submit" className="cursor-pointer px-8 py-3 bg-[#719c44] hover:bg-[#5e8239] text-white font-bold rounded-xl shadow-lg shadow-[#719c44]/30 transition-all transform active:scale-95">
              {isEditing ? "Actualizar Datos" : "Guardar Donante"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}