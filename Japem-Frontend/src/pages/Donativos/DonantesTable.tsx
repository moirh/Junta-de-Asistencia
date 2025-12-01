import React, { useEffect, useState } from "react";
import { Table } from "../../components/ui/Table";
import {
  getDonantes,
  createDonante,
  getDonanteById,
  updateDonante,
} from "./services/donativosService";

interface CatalogoItem {
  articulo: string;
}

export const DonantesTable: React.FC = () => {
  const [donantes, setDonantes] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Estado del formulario
  const [donanteForm, setDonanteForm] = useState({
    fecha: "",
    no_oficio: "",
    donante: "",
    municipio: "",
    descripcion: "",
    costo_total: "",
    nota: "",
  });

  // NUEVO: Estado para manejar la lista dinámica de artículos del catálogo
  const [catalogoForm, setCatalogoForm] = useState<CatalogoItem[]>([]);

  useEffect(() => {
    fetchDonantes();
  }, []);

  const fetchDonantes = async () => {
    try {
      const data = await getDonantes();
      setDonantes(data);
    } catch (err) {
      console.error("Error cargando donantes:", err);
      alert("Error al cargar donantes");
    }
  };

  // Funciones para manejar el catálogo dinámico
  const handleAddArticulo = () => {
    setCatalogoForm([...catalogoForm, { articulo: "" }]);
  };

  const handleRemoveArticulo = (index: number) => {
    const nuevoCatalogo = [...catalogoForm];
    nuevoCatalogo.splice(index, 1);
    setCatalogoForm(nuevoCatalogo);
  };

  const handleArticuloChange = (index: number, value: string) => {
    const nuevoCatalogo = [...catalogoForm];
    nuevoCatalogo[index].articulo = value.toUpperCase();
    setCatalogoForm(nuevoCatalogo);
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
    setCatalogoForm([]);
  };

  // CREAR DONANTE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const uppercaseForm = Object.keys(donanteForm).reduce((acc: any, key) => {
        const value = (donanteForm as any)[key];
        acc[key] = typeof value === "string" ? value.toUpperCase() : value;
        return acc;
      }, {});

      // Filtramos artículos vacíos antes de enviar
      const catalogoValido = catalogoForm.filter(item => item.articulo.trim() !== "");

      await createDonante({
        ...uppercaseForm,
        costo_total: uppercaseForm.costo_total
          ? Number(uppercaseForm.costo_total)
          : undefined,
        catalogo: catalogoValido // Enviamos el array al backend
      });

      await fetchDonantes();
      setShowModal(false);
      resetForms();

      alert("✅ Donante creado correctamente");
    } catch (error: any) {
      alert(error.response?.data?.message || "❌ Error al crear donante");
    }
  };

  // ABRIR MODAL EDICIÓN
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

      // Cargar catálogo existente si viene de la API
      // Nota: Asegúrate de que el backend devuelva 'catalogo' (la relación)
      if (data.catalogo && Array.isArray(data.catalogo)) {
        setCatalogoForm(data.catalogo.map((item: any) => ({ articulo: item.articulo })));
      } else {
        setCatalogoForm([]);
      }

      setEditId(id);
      setShowEditModal(true);
    } catch (err) {
      console.error("Error al traer donante:", err);
      alert("No se pudo cargar el donante para editar");
    }
  };

  // ACTUALIZAR DONANTE
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return alert("ID de edición no definido");

    try {
      const uppercaseForm = Object.keys(donanteForm).reduce((acc: any, key) => {
        const value = (donanteForm as any)[key];
        acc[key] = typeof value === "string" ? value.toUpperCase() : value;
        return acc;
      }, {});

      const catalogoValido = catalogoForm.filter(item => item.articulo.trim() !== "");

      const payload = {
        ...uppercaseForm,
        costo_total: uppercaseForm.costo_total
          ? Number(uppercaseForm.costo_total)
          : undefined,
        catalogo: catalogoValido // Backend sincronizará estos items
      };

      await updateDonante(String(editId), payload);

      await fetchDonantes();
      setShowEditModal(false);
      setEditId(null);
      resetForms();

      alert("✅ Donante actualizado correctamente");
    } catch (error: any) {
      console.error("Error actualizando donante:", error);
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

  // Componente interno para reutilizar el formulario (opcional, aquí lo dejo inline)
  const renderFormContent = (isEdit: boolean, submitFn: (e: React.FormEvent) => void) => (
    <form onSubmit={submitFn} className="space-y-3">
      {Object.keys(donanteForm).map((key) => (
        <div key={key}>
          <input
            type={key === "costo_total" ? "number" : key === "fecha" ? "date" : "text"}
            placeholder={key.replace(/_/g, " ").toUpperCase()}
            value={(donanteForm as any)[key]}
            onChange={(e) =>
              setDonanteForm({
                ...donanteForm,
                [key]: key === "costo_total" || key === "fecha"
                    ? e.target.value
                    : e.target.value.toUpperCase(),
              })
            }
            className="border border-gray-300 p-2 w-full rounded text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 uppercase"
            required={key === "donante" || key === "no_oficio" || key === "fecha"}
          />
        </div>
      ))}

      {/* SECCIÓN DE CATÁLOGO */}
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <label className="font-bold text-gray-700 uppercase">Artículos (Catálogo)</label>
          <button
            type="button"
            onClick={handleAddArticulo}
            className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
          >
            + AGREGAR ARTÍCULO
          </button>
        </div>
        
        {catalogoForm.length === 0 && (
          <p className="text-xs text-gray-500 italic">No hay artículos agregados.</p>
        )}

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {catalogoForm.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                placeholder="NOMBRE DEL ARTÍCULO"
                value={item.articulo}
                onChange={(e) => handleArticuloChange(index, e.target.value)}
                className="border border-gray-300 p-2 w-full rounded text-black text-sm uppercase focus:outline-none focus:ring-1 focus:ring-blue-400"
                required
              />
              <button
                type="button"
                onClick={() => handleRemoveArticulo(index)}
                className="bg-red-500 text-white px-3 rounded hover:bg-red-600"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className={`w-full text-black px-4 py-2 rounded mt-4 uppercase transition ${
          isEdit ? "bg-yellow-400 hover:bg-yellow-500" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isEdit ? "Guardar Cambios" : "Guardar"}
      </button>
    </form>
  );

  return (
    <div className="relative uppercase">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 uppercase">
        Lista de Donantes
      </h2>

      <Table
        data={donantes}
        columns={columns}
        rowsPerPage={5}
        renderCell={(key, value, row) => {
          if (key === "acciones") {
            return (
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-500"
                  onClick={() => openEditModal(row.id_donantes)}
                >
                  Editar
                </button>
              </div>
            );
          }
          return value ?? "";
        }}
      />

      <button
        className="fixed bottom-8 right-8 bg-blue-600 text-black rounded-full w-16 h-16 text-3xl shadow-lg hover:bg-blue-700 transition"
        onClick={() => {
          resetForms();
          setShowModal(true);
        }}
      >
        +
      </button>

      {/* MODAL CREAR */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/40 backdrop-blur-sm">
          <div className="bg-white text-black p-6 rounded-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              className="absolute top-2 right-2 text-gray-700 text-xl hover:text-black"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-center uppercase">Agregar Donante</h2>
            {renderFormContent(false, handleSubmit)}
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {showEditModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-700 text-xl"
              onClick={() => {
                setShowEditModal(false);
                setEditId(null);
                resetForms();
              }}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-center uppercase">Editar Donante</h2>
            {renderFormContent(true, handleUpdate)}
          </div>
        </div>
      )}
    </div>
  );
};