import React, { useEffect, useState } from "react";
import { Table } from "../../components/ui/Table";
import { Plus, Edit2, Save } from "lucide-react"; 
import {
  getDonantes,
  createDonante,
  getDonanteById,
  updateDonante,
} from "./services/donativosService";

export const DonantesTable: React.FC = () => {
  const [donantes, setDonantes] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [donanteForm, setDonanteForm] = useState({
    fecha: "",
    no_oficio: "",
    donante: "",
    municipio: "",
    descripcion: "",
    costo_total: "",
    nota: "",
  });

  useEffect(() => {
    fetchDonantes();
  }, []);

  const fetchDonantes = async () => {
    try {
      const data = await getDonantes();
      setDonantes(data);
    } catch (err) {
      console.error("Error cargando donantes:", err);
    }
  };

  const resetForms = () => {
    setDonanteForm({
      fecha: "",
      no_oficio: "",
      donante: "",
      municipio: "",
      descripcion: "",
      costo_total: "",
      nota: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const uppercaseForm = Object.keys(donanteForm).reduce((acc: any, key) => {
        const value = (donanteForm as any)[key];
        acc[key] = typeof value === "string" ? value.toUpperCase() : value;
        return acc;
      }, {});

      await createDonante({
        ...uppercaseForm,
        costo_total: uppercaseForm.costo_total
          ? Number(uppercaseForm.costo_total)
          : undefined,
      });

      await fetchDonantes();
      setShowModal(false);
      resetForms();
      alert("✅ Donante creado correctamente");
    } catch (error: any) {
      alert(error.response?.data?.message || "❌ Error al crear donante");
    }
  };

  const openEditModal = async (id: number) => {
    try {
      const data = await getDonanteById(String(id));
      setDonanteForm({
        fecha: data.fecha ?? "",
        no_oficio: data.no_oficio ?? "",
        donante: data.donante ?? "",
        municipio: data.municipio ?? "",
        descripcion: data.descripcion ?? "",
        costo_total: data.costo_total != null ? String(data.costo_total) : "",
        nota: data.nota ?? "",
      });

      setEditId(id);
      setShowEditModal(true);
    } catch (err) {
      console.error("Error al traer donante:", err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return alert("ID de edición no definido");

    try {
      const uppercaseForm = Object.keys(donanteForm).reduce((acc: any, key) => {
        const value = (donanteForm as any)[key];
        acc[key] = typeof value === "string" ? value.toUpperCase() : value;
        return acc;
      }, {});

      const payload = {
        ...uppercaseForm,
        costo_total: uppercaseForm.costo_total
          ? Number(uppercaseForm.costo_total)
          : undefined,
      };

      await updateDonante(String(editId), payload);
      await fetchDonantes();
      setShowEditModal(false);
      setEditId(null);
      resetForms();
      alert("✅ Donante actualizado correctamente");
    } catch (error: any) {
      alert(error.response?.data?.message || "❌ Error al actualizar donante");
    }
  };

  const columns: any[] = [
    { key: "id_donantes", label: "ID" },
    { key: "fecha", label: "Fecha" },
    { key: "no_oficio", label: "No. Oficio" },
    { key: "donante", label: "Donante" },
    { key: "municipio", label: "Municipio" },
    { key: "descripcion", label: "Descripción" },
    { key: "costo_total", label: "Costo Total" },
    { key: "nota", label: "Nota" },
    { key: "acciones", label: "Acciones" },
  ];

  const renderFormContent = (isEdit: boolean, submitFn: (e: React.FormEvent) => void) => (
    <form onSubmit={submitFn} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(donanteForm).map((key) => (
          <div key={key} className={key === 'descripcion' || key === 'nota' ? 'md:col-span-2' : ''}>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
              {key.replace(/_/g, " ")}
            </label>
            <input
              type={key === "costo_total" ? "number" : key === "fecha" ? "date" : "text"}
              value={(donanteForm as any)[key]}
              onChange={(e) =>
                setDonanteForm({
                  ...donanteForm,
                  [key]: key === "costo_total" || key === "fecha"
                      ? e.target.value
                      : e.target.value.toUpperCase(),
                })
              }
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-colorPrimarioJAPEM focus:ring-1 focus:ring-colorPrimarioJAPEM transition-all uppercase placeholder:normal-case"
              placeholder={`Ingrese ${key.replace(/_/g, " ")}`}
              required={key === "donante" || key === "no_oficio" || key === "fecha"}
            />
          </div>
        ))}
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-colorPrimarioJAPEM to-[#048066] text-white font-bold rounded-xl shadow-lg hover:shadow-colorPrimarioJAPEM/30 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
        >
          <Save className="w-4 h-4" />
          {isEdit ? "Guardar Cambios" : "Guardar Registro"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-colorPrimarioJAPEM rounded-full"></span>
          LISTADO DE DONANTES
        </h2>
      </div>

      {/* Tabla con scroll horizontal mejorado para consistencia */}
      <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
        <div className="min-w-[1200px]">
          <Table
            data={donantes}
            columns={columns}
            rowsPerPage={5}
            renderCell={(key, value, row) => {
              if (key === "acciones") {
                return (
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-colorTerciarioJAPEM text-colorTerciarioJAPEM text-xs font-bold rounded-lg hover:bg-colorTerciarioJAPEM hover:text-white transition-all duration-300"
                    onClick={() => openEditModal(row.id_donantes)}
                  >
                    <Edit2 className="w-3 h-3" /> Editar
                  </button>
                );
              }
              return value ?? "";
            }}
          />
        </div>
      </div>

      {/* Botón Flotante */}
      <button
        className="fixed bottom-10 right-10 w-14 h-14 bg-gradient-to-r from-colorPrimarioJAPEM to-[#048066] text-white rounded-full shadow-2xl shadow-colorPrimarioJAPEM/40 flex items-center justify-center hover:scale-110 transition-transform duration-300 z-40 group"
        onClick={() => {
          resetForms();
          setShowModal(true);
        }}
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* MODAL GENÉRICO CON ESTILO GLASS */}
      {(showModal || showEditModal) && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white p-8 rounded-2xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up border border-gray-100">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              onClick={() => {
                setShowModal(false);
                setShowEditModal(false);
                setEditId(null);
                resetForms();
              }}
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-6 text-colorPrimarioJAPEM border-b pb-2 border-gray-100">
              {showEditModal ? "EDITAR DONANTE" : "NUEVO DONANTE"}
            </h2>
            {renderFormContent(showEditModal, showEditModal ? handleUpdate : handleSubmit)}
          </div>
        </div>
      )}

      <style>{`
        /* Scrollbar personalizada */
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};