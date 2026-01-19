import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Building2, CheckCircle, XCircle } from "lucide-react";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { getIaps, createIap, updateIap, deleteIap, type Iap } from "../../services/iapService";

export const IapTable = () => {
  const [iaps, setIaps] = useState<Iap[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const initialFormState: Iap = {
    nombre_iap: "",
    rubro: "",
    estatus: "Activo",
    actividad_asistencial: "",
    personas_beneficiadas: 0,
    necesidad_primaria: "",
    necesidad_complementaria: "",
    es_certificada: false,
    tiene_donataria_autorizada: false,
    tiene_padron_beneficiarios: false,
  };

  const [formData, setFormData] = useState<Iap>(initialFormState);

  useEffect(() => {
    fetchIaps();
  }, []);

  const fetchIaps = async () => {
    try {
      setLoading(true);
      const data = await getIaps();
      setIaps(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando IAPs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) {
        await updateIap(formData.id, formData);
      } else {
        await createIap(formData);
      }
      setIsModalOpen(false);
      fetchIaps();
    } catch (error) {
      console.error("Error guardando IAP:", error);
      alert("Error al guardar. Verifica los campos.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Eliminar esta institución?")) {
      await deleteIap(id);
      fetchIaps();
    }
  };

  const openModal = (iap?: Iap) => {
    if (iap) {
      setFormData(iap);
      setIsEditing(true);
    } else {
      setFormData(initialFormState);
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  // Columnas de la tabla
  const columns = [
    { key: "nombre_iap" as keyof Iap, label: "Institución" },
    { key: "rubro" as keyof Iap, label: "Rubro / Giro" },
    { key: "estatus" as keyof Iap, label: "Estatus" },
    { key: "es_certificada" as keyof Iap, label: "Validaciones" }, // Virtual
    { key: "id" as keyof Iap, label: "Acciones" },
  ];

  return (
    <div className="p-6 animate-fade-in relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="text-purple-600" /> Padrón de Instituciones (IAP)
          </h1>
          <p className="text-gray-500">Gestiona los beneficiarios y sus necesidades.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition"
        >
          <Plus size={20} /> Nueva IAP
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
           <p className="text-gray-400 font-medium">Cargando registros...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Table
            data={iaps}
            columns={columns}
            rowsPerPage={8}
            renderCell={(key, value, row) => {
              if (key === "es_certificada") {
                return (
                  <div className="flex gap-2">
                    <span title="Certificada" className={row.es_certificada ? "text-green-600" : "text-gray-300"}>
                      <CheckCircle size={18} />
                    </span>
                    <span title="Donataria Autorizada" className={row.tiene_donataria_autorizada ? "text-blue-600" : "text-gray-300"}>
                      <Building2 size={18} />
                    </span>
                  </div>
                );
              }
              if (key === "estatus") {
                return (
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${value === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {value}
                  </span>
                );
              }
              if (key === "id") {
                return (
                  <div className="flex gap-2">
                    <button onClick={() => openModal(row)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Edit size={18} /></button>
                    <button onClick={() => row.id && handleDelete(row.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded"><Trash2 size={18} /></button>
                  </div>
                );
              }
              return value;
            }}
          />
        </div>
      )}

      {/* FORMULARIO MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Editar IAP" : "Registrar Nueva IAP"}>
        <form onSubmit={handleSave} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nombre de la Institución *</label>
              <input
                type="text" required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 uppercase"
                value={formData.nombre_iap}
                onChange={(e) => setFormData({ ...formData, nombre_iap: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rubro (Salud, Alimentos...)</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg uppercase"
                value={formData.rubro || ""}
                onChange={(e) => setFormData({ ...formData, rubro: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estatus</label>
              <select
                className="w-full p-2 border rounded-lg"
                value={formData.estatus}
                onChange={(e) => setFormData({ ...formData, estatus: e.target.value })}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Nueva Constitución">Nueva Constitución</option>
                <option value="En proceso">En proceso</option>
                <option value="Sin Dato">Sin Dato</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-bold text-gray-500 text-sm mb-3">DATOS PARA EL ALGORITMO (MATCH)</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
                <label className="block text-sm font-medium text-gray-700">Necesidad Primaria</label>
                <input
                    type="text" placeholder="Ej. Arroz, Medicamento"
                    className="w-full p-2 border rounded-lg uppercase bg-yellow-50"
                    value={formData.necesidad_primaria || ""}
                    onChange={(e) => setFormData({ ...formData, necesidad_primaria: e.target.value })}
                />
               </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Necesidad Complementaria</label>
                <input
                    type="text" placeholder="Ej. Ropa, Juguetes"
                    className="w-full p-2 border rounded-lg uppercase"
                    value={formData.necesidad_complementaria || ""}
                    onChange={(e) => setFormData({ ...formData, necesidad_complementaria: e.target.value })}
                />
               </div>
            </div>

            <div className="space-y-2 bg-gray-50 p-3 rounded-lg border">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-purple-600"
                        checked={formData.es_certificada}
                        onChange={(e) => setFormData({ ...formData, es_certificada: e.target.checked })}
                    />
                    <span className="text-sm text-gray-700">Institución Certificada (JAPEM)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-purple-600"
                        checked={formData.tiene_donataria_autorizada}
                        onChange={(e) => setFormData({ ...formData, tiene_donataria_autorizada: e.target.checked })}
                    />
                    <span className="text-sm text-gray-700">Tiene Donataria Autorizada (SAT)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-purple-600"
                        checked={formData.tiene_padron_beneficiarios}
                        onChange={(e) => setFormData({ ...formData, tiene_padron_beneficiarios: e.target.checked })}
                    />
                    <span className="text-sm text-gray-700">Padrón de Beneficiarios Vigente</span>
                </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Guardar Institución</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};