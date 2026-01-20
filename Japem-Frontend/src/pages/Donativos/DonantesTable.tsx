import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal"; 
// Asegúrate de que la ruta a tus servicios sea correcta:
import { 
  getDonantes, 
  createDonante,
  updateDonante, 
  deleteDonante 
} from "../../services/donantesService"; 
import type { Donante } from "../../types"; 

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
    estatus: "Seleccionar",
  };
  const [formData, setFormData] = useState<Donante>(initialFormState);

  // Cargar datos al iniciar
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

  // Manejadores del Modal
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

  // Guardar (Crear o Editar)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) {
        await updateDonante(formData.id, formData);
      } else {
        await createDonante(formData);
      }
      fetchDonantes(); 
      handleCloseModal();
    } catch (error) {
      console.error("Error guardando donante:", error);
      alert("Hubo un error al guardar. Verifica los campos.");
    }
  };

  // Eliminar
  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este donante del directorio?")) {
      try {
        await deleteDonante(id);
        fetchDonantes();
      } catch (error) {
        console.error("Error eliminando:", error);
      }
    }
  };

  // --- AQUÍ ESTÁ LA SOLUCIÓN AL ERROR ---
  // Usamos 'as keyof Donante' para asegurarnos que TypeScript reconozca los campos.
  // IMPORTANTE: Usamos 'id' para la columna de acciones, ya que 'acciones' no existe en la BD.
  const columns = [
    { key: "razon_social" as keyof Donante, label: "Razón Social" },
    { key: "rfc" as keyof Donante, label: "RFC" },
    { key: "contacto" as keyof Donante, label: "Contacto" },
    { key: "direccion" as keyof Donante, label: "Dirección" },
    { key: "email" as keyof Donante, label: "Email" },
    { key: "telefono" as keyof Donante, label: "Teléfono Celular" },
    { key: "telefono_secundario" as keyof Donante, label: "Teléfono Oficina" },
    { key: "estatus" as keyof Donante, label: "Estatus" },
    { key: "id" as keyof Donante, label: "Acciones" }, // Usamos ID aquí para evitar el error
  ];

  return (
    <div className="p-6 animate-fade-in relative w-full">
      {/* --- HEADER CORREGIDO --- */}
      {/* 'relative' permite que el botón se posicione absolutamente respecto a este div */}
      <div className="relative flex items-center justify-center mb-8">
        
        {/* 1. TÍTULO EN EL CENTRO */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Directorio de Donantes</h1>
          <p className="text-gray-500 mt-1">Gestiona la información de empresas y particulares</p>
        </div>

        {/* 2. BOTÓN PEGADO A LA DERECHA */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <button
            onClick={() => handleOpenModal()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg font-bold transform active:scale-95"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nuevo Donante</span>
          </button>
        </div>

      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
           <p className="text-gray-400 font-medium">Cargando registros...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Table
            data={donantes}
            columns={columns}
            rowsPerPage={8}
            renderCell={(key, value, row) => {
              // Renderizado personalizado de Estatus
              if (key === "estatus") {
                return (
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${value === 'Permanente' ? 'bg-green-100 text-green-700' : 
                      value === 'Eventual' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-blue-100 text-blue-700'}`}>
                    {value}
                  </span>
                );
              }
              
              // Renderizado de Botones (Detectamos "id" en lugar de "acciones")
              if (key === "id") {
                return (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(row)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => row.id && handleDelete(row.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              }
              return value;
            }}
          />
        </div>
      )}

      {/* MODAL DE FORMULARIO */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isEditing ? "Editar Donante" : "Registrar Nuevo Donante"}
        size="extraLarge"
      >
        <form onSubmit={handleSave} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social / Nombre *</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                value={formData.razon_social}
                onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RFC</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                value={formData.rfc || ""}
                onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Régimen Fiscal</label>
              <select
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.regimen_fiscal || ""}
                onChange={(e) => setFormData({ ...formData, regimen_fiscal: e.target.value })}
              >
                <option value={0}>-- Seleccionar --</option>
                <option value="Persona Moral">Persona Moral </option>
                <option value="Persona Física">Persona Física</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.cp || ""}
                onChange={(e) => setFormData({ ...formData, cp: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <textarea
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
              rows={2}
              value={formData.direccion || ""}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            />
          </div>

          <div className="border-t border-gray-200 my-2"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Persona de Contacto *</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                value={formData.contacto}
                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estatus *</label>
              <select
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.estatus}
                onChange={(e) => setFormData({ ...formData, estatus: e.target.value as any })}
              >
                <option value={0}>-- Seleccionar --</option>
                <option value="Permanente">Permanente</option>
                <option value="Eventual">Eventual</option>
                <option value="Unica vez">Única vez</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Celular</label>
              <input
                type="tel"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.telefono || ""}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
          </div>

          {/* CAMPO: TELÉFONO SECUNDARIO / CELULAR */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Teléfono Oficina
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.telefono_secundario || ""}
              onChange={(e) => setFormData({ ...formData, telefono_secundario: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-md transition"
            >
              {isEditing ? "Actualizar Datos" : "Guardar Donante"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}