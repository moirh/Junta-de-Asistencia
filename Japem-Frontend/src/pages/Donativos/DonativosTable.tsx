import React, { useEffect, useState } from "react"; // Agregué React explícito
import { Table } from "../../components/ui/Table";
import {
  getDonativos,
  createDonativo,
  getDonativoById,
  updateDonativo,
} from "./services/donativosService";

export const DonativosTable = () => {
  const [donativos, setDonativos] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [donativoForm, setDonativoForm] = useState<any>({
    id_japem: "",
    nombre: "",
    estatus: "",
    rubro: "",
    act_asistencial: "",
    poblacion: "",
    necesidad_pri: "",
    necesidad_sec: "",
    necesidad_com: "",
    certificacion: "",
    candidato: "",
    donataria_aut: "",
    padron_ben: "",
    veces_don: "",
  });

  const poblacionOptions = [
    "NIÑAS", "NIÑOS", "NIÑAS Y NIÑOS", "ADOLESCENTES",
    "ADULTOS", "ADULTOS MAYORES", "SIN DATO",
  ];

  const estatusOptions = [
    "ACTIVO", "INACTIVO", "NUEVA CONSTITUCIÓN", "EN PROCESO", "SIN DATO",
  ];

  const rubroOptions = [
    "ANCIANOS", "DESARROLLO SOCIAL", "EDUCACIÓN", "MÉDICO",
    "NIÑAS, NIÑOS Y ADOLESCENTES", "PERSONAS CON DISCAPACIDAD", "SIN DATO",
  ];

  const labels: Record<string, string> = {
    id_japem: "ID",
    nombre: "Nombre",
    estatus: "Estatus",
    rubro: "Rubro",
    act_asistencial: "Actividad Asistencial",
    poblacion: "Población",
    necesidad_pri: "Necesidad Primaria",
    necesidad_sec: "Necesidad Secundaria",
    necesidad_com: "Necesidad Complementaria",
    certificacion: "Certificación",
    candidato: "Candidato",
    donataria_aut: "Donataria Autorizada",
    padron_ben: "Padrón Beneficiarios",
    veces_don: "Veces Donadas",
  };

  const booleanFields = [
    "certificacion", "candidato", "donataria_aut", "padron_ben",
  ];

  useEffect(() => {
    fetchDonativos();
  }, []);

  const fetchDonativos = async () => {
    try {
      const data = await getDonativos();

      const formatted = data.map((item: any) => {
        // EXTRAER DATOS DEL OBJETO ANIDADO 'necesidad'
        // Si la relación no existe (null), usamos un objeto vacío {}
        const necesidades = item.necesidad || {};

        return {
          ...item,
          certificacion: item.certificacion ? "SI" : "NO",
          candidato: item.candidato ? "SI" : "NO",
          donataria_aut: item.donataria_aut ? "SI" : "NO",
          padron_ben: item.padron_ben ? "SI" : "NO",
          // Usamos los datos anidados para mostrarlos en la tabla
          necesidad_pri: formatAsList(necesidades.necesidad_pri),
          necesidad_sec: formatAsList(necesidades.necesidad_sec),
          necesidad_com: formatAsList(necesidades.necesidad_com),
        };
      });

      setDonativos(formatted);
    } catch (err) {
      console.error("Error fetching donativos:", err);
    }
  };

  const formatAsList = (text: string | null) => {
    if (!text) return "";
    const items = text
      .split(/\r?\n|;/)
      .map((t) => t.trim())
      .filter(Boolean);
    return `<ul class="list-disc list-inside text-gray-800 leading-relaxed">${items
      .map((i) => `<li>${i}</li>`)
      .join("")}</ul>`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convertir a mayúsculas
      const uppercaseForm = Object.keys(donativoForm).reduce(
        (acc: any, key) => {
          const value = donativoForm[key];
          acc[key] = typeof value === "string" ? value.toUpperCase() : value;
          return acc;
        },
        {}
      );

      const payload = {
        ...uppercaseForm,
        certificacion: uppercaseForm.certificacion === "SI",
        candidato: uppercaseForm.candidato === "SI",
        donataria_aut: uppercaseForm.donataria_aut === "SI",
        padron_ben: uppercaseForm.padron_ben === "SI",
        veces_don: uppercaseForm.veces_don
          ? Number(uppercaseForm.veces_don)
          : 0,
        // Nota: Enviamos necesidad_pri, etc. en la raíz del payload.
        // El controlador del Backend ya está programado para leerlos de ahí.
      };

      if (editingId) {
        await updateDonativo(editingId, payload);
        alert("✅ Donativo actualizado correctamente");
      } else {
        await createDonativo(payload);
        alert("✅ Donativo creado correctamente");
      }

      await fetchDonativos();
      handleCloseModal();
    } catch (error: any) {
      console.error("Error al guardar donativo:", error);
      alert(error.response?.data?.message || "❌ Error al guardar donativo");
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const data = await getDonativoById(id);
      
      // APLANAR DATOS: Sacar info de 'necesidad' y ponerla en el nivel principal del form
      const necesidades = data.necesidad || {};

      setDonativoForm({
        ...data,
        certificacion: data.certificacion ? "SI" : "NO",
        candidato: data.candidato ? "SI" : "NO",
        donataria_aut: data.donataria_aut ? "SI" : "NO",
        padron_ben: data.padron_ben ? "SI" : "NO",
        // Mapear campos anidados al formulario plano
        necesidad_pri: necesidades.necesidad_pri || "",
        necesidad_sec: necesidades.necesidad_sec || "",
        necesidad_com: necesidades.necesidad_com || "",
      });
      setEditingId(id);
      setShowModal(true);
    } catch (error) {
      console.error("Error al cargar donativo:", error);
      alert("❌ No se pudo cargar el donativo para editar");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setDonativoForm({
      id_japem: "",
      nombre: "",
      estatus: "",
      rubro: "",
      act_asistencial: "",
      poblacion: "",
      necesidad_pri: "",
      necesidad_sec: "",
      necesidad_com: "",
      certificacion: "",
      candidato: "",
      donataria_aut: "",
      padron_ben: "",
      veces_don: "",
    });
  };

  const columns = [
    { key: "id_japem", label: "ID" },
    { key: "nombre", label: "Nombre" },
    { key: "estatus", label: "Estatus" },
    { key: "rubro", label: "Rubro" },
    { key: "act_asistencial", label: "Actividad Asistencial" },
    { key: "poblacion", label: "Población" },
    { key: "necesidad_pri", label: "Necesidad Primaria", isHtml: true },
    { key: "necesidad_sec", label: "Necesidad Secundaria", isHtml: true },
    { key: "necesidad_com", label: "Necesidad Complementaria", isHtml: true },
    { key: "certificacion", label: "Certificación" },
    { key: "candidato", label: "Candidato" },
    { key: "donataria_aut", label: "Donataria Autorizada" },
    { key: "padron_ben", label: "Padrón Beneficiarios" },
    { key: "veces_don", label: "Veces Donadas" },
    { key: "acciones", label: "Acciones" },
  ];

  return (
    <div className="relative uppercase">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 uppercase">
        Lista de Donativos
      </h2>

      <Table
        data={donativos}
        columns={columns}
        rowsPerPage={5}
        renderCell={(key, value, row) =>
          key === "acciones" ? (
            <button
              onClick={() => handleEdit(row.id)}
              className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500 transition"
            >
              Editar
            </button>
          ) : columns.find((c) => c.key === key)?.isHtml ? (
            <div dangerouslySetInnerHTML={{ __html: value }} />
          ) : (
            value
          )
        }
      />

      <button
        className="fixed bottom-8 right-8 bg-blue-600 text-black rounded-full w-16 h-16 text-3xl shadow-lg hover:bg-blue-700 transition"
        onClick={() => setShowModal(true)}
      >
        +
      </button>

      {showModal && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(2px)",
          }}
        >
          <div className="bg-white text-black p-6 rounded-lg w-full max-w-lg relative max-h-[80vh] overflow-y-auto shadow-2xl uppercase">
            <button
              className="absolute top-2 right-2 text-gray-700 text-xl"
              onClick={handleCloseModal}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4 uppercase">
              {editingId ? "Editar Donativo" : "Agregar Donativo"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                "id_japem",
                "nombre",
                "act_asistencial",
              ].map((key) => (
                <div key={key}>
                  <label className="block text-sm font-semibold mb-1 uppercase">
                    {labels[key]}
                  </label>
                  <input
                    type="text"
                    placeholder={labels[key]}
                    value={donativoForm[key]}
                    onChange={(e) =>
                      setDonativoForm({
                        ...donativoForm,
                        [key]: e.target.value.toUpperCase(),
                      })
                    }
                    className="border border-gray-300 p-2 w-full rounded text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 uppercase"
                    required={key === "id_japem" || key === "nombre"}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold mb-1 uppercase">
                  {labels.poblacion}
                </label>
                <select
                  value={donativoForm.poblacion}
                  onChange={(e) =>
                    setDonativoForm({
                      ...donativoForm,
                      poblacion: e.target.value,
                    })
                  }
                  className="border border-gray-300 p-2 w-full rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-400 uppercase"
                  required
                >
                  <option value="">SELECCIONE LA POBLACIÓN</option>
                  {poblacionOptions.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 uppercase">
                  {labels.estatus}
                </label>
                <select
                  value={donativoForm.estatus}
                  onChange={(e) =>
                    setDonativoForm({
                      ...donativoForm,
                      estatus: e.target.value,
                    })
                  }
                  className="border border-gray-300 p-2 w-full rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-400 uppercase"
                  required
                >
                  <option value="">SELECCIONE UN ESTATUS</option>
                  {estatusOptions.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 uppercase">
                  {labels.rubro}
                </label>
                <select
                  value={donativoForm.rubro}
                  onChange={(e) =>
                    setDonativoForm({
                      ...donativoForm,
                      rubro: e.target.value,
                    })
                  }
                  className="border border-gray-300 p-2 w-full rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-400 uppercase"
                  required
                >
                  <option value="">SELECCIONE UN RUBRO</option>
                  {rubroOptions.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </select>
              </div>

              {["necesidad_pri", "necesidad_sec", "necesidad_com"].map(
                (key) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold mb-1 uppercase">
                      {labels[key]}
                    </label>
                    <textarea
                      value={donativoForm[key]}
                      onChange={(e) =>
                        setDonativoForm({
                          ...donativoForm,
                          [key]: e.target.value,
                        })
                      }
                      placeholder={`Escriba la ${labels[key].toLowerCase()}...`}
                      className="border border-gray-300 p-2 w-full rounded text-black h-20 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 uppercase resize-none"
                    />
                  </div>
                )
              )}

              <div className="grid grid-cols-2 gap-4">
                {booleanFields.map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-semibold mb-1 uppercase">
                      {labels[field]}
                    </label>
                    <select
                      value={donativoForm[field] || ""}
                      onChange={(e) =>
                        setDonativoForm({
                          ...donativoForm,
                          [field]: e.target.value.toUpperCase(),
                        })
                      }
                      className="border border-gray-300 p-2 w-full rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-400 uppercase"
                      required
                    >
                      <option value="">SELECCIONE</option>
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="mt-2">
                <label className="block text-sm font-semibold mb-1 uppercase">
                  {labels.veces_don}
                </label>
                <input
                  type="number"
                  placeholder={labels.veces_don}
                  value={donativoForm.veces_don}
                  min={0}
                  onChange={(e) =>
                    setDonativoForm({
                      ...donativoForm,
                      veces_don: Number(e.target.value),
                    })
                  }
                  className="border border-gray-300 p-2 w-full rounded text-black uppercase"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-black px-4 py-2 rounded w-full hover:bg-blue-700 mt-2 uppercase"
              >
                {editingId ? "Actualizar" : "Guardar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};