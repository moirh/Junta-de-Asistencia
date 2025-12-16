import React, { useEffect, useState } from "react";
import { Table } from "../../components/ui/Table";
import { Plus, Edit2, Save, X, CheckCircle, FileText } from "lucide-react";
import {
  getDonativos,
  createDonativo,
  getDonativoById,
  updateDonativo,
} from "./services/donativosService";

export const DonativosTable = () => {
  // ... (Todo tu código de lógica, estados y handlers se queda IGUAL) ...
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
    id_japem: "ID JAPEM",
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
    donataria_aut: "Donataria Aut.",
    padron_ben: "Padrón Ben.",
    veces_don: "Veces Donadas",
  };

  const booleanFields = ["certificacion", "candidato", "donataria_aut", "padron_ben"];

  useEffect(() => {
    fetchDonativos();
  }, []);

  const fetchDonativos = async () => {
    try {
      const data = await getDonativos();
      const formatted = data.map((item: any) => {
        return {
          ...item,
          certificacion: item.certificacion ? "SI" : "NO",
          candidato: item.candidato ? "SI" : "NO",
          donataria_aut: item.donataria_aut ? "SI" : "NO",
          padron_ben: item.padron_ben ? "SI" : "NO",
          necesidad_pri: formatAsList(item.necesidad_pri),
          necesidad_sec: formatAsList(item.necesidad_sec),
          necesidad_com: formatAsList(item.necesidad_com),
        };
      });
      setDonativos(formatted);
    } catch (err) {
      console.error("Error fetching donativos:", err);
    }
  };

  const formatAsList = (text: string | null) => {
    if (!text) return "";
    const items = text.split(/\r?\n|;/).map((t) => t.trim()).filter(Boolean);
    if (items.length === 0) return "";
    return `<ul class="list-disc list-inside text-xs text-gray-600 leading-tight min-w-[200px] space-y-1">${items
      .map((i) => `<li>${i}</li>`)
      .join("")}</ul>`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const uppercaseForm = Object.keys(donativoForm).reduce((acc: any, key) => {
        const value = donativoForm[key];
        acc[key] = typeof value === "string" ? value.toUpperCase() : value;
        return acc;
      }, {});

      const payload = {
        ...uppercaseForm,
        certificacion: uppercaseForm.certificacion === "SI",
        candidato: uppercaseForm.candidato === "SI",
        donataria_aut: uppercaseForm.donataria_aut === "SI",
        padron_ben: uppercaseForm.padron_ben === "SI",
        veces_don: uppercaseForm.veces_don ? Number(uppercaseForm.veces_don) : 0,
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
      alert(error.response?.data?.message || "❌ Error al guardar donativo");
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const data = await getDonativoById(id);
      setDonativoForm({
        ...data,
        certificacion: data.certificacion ? "SI" : "NO",
        candidato: data.candidato ? "SI" : "NO",
        donataria_aut: data.donataria_aut ? "SI" : "NO",
        padron_ben: data.padron_ben ? "SI" : "NO",
        necesidad_pri: data.necesidad_pri || "",
        necesidad_sec: data.necesidad_sec || "",
        necesidad_com: data.necesidad_com || "",
      });
      
      setEditingId(id);
      setShowModal(true);
    } catch (error) {
      alert("❌ No se pudo cargar el donativo");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setDonativoForm({
      id_japem: "", nombre: "", estatus: "", rubro: "", act_asistencial: "",
      poblacion: "", necesidad_pri: "", necesidad_sec: "", necesidad_com: "",
      certificacion: "", candidato: "", donataria_aut: "", padron_ben: "", veces_don: "",
    });
  };

  const columns = [
    { key: "id_japem", label: "ID" },
    { key: "nombre", label: "Nombre" },
    { key: "estatus", label: "Estatus" },
    { key: "rubro", label: "Rubro" },
    { key: "act_asistencial", label: "Actividad Asistencial" },
    { key: "poblacion", label: "Población" },
    { key: "necesidad_pri", label: "Nec. Primaria", isHtml: true },
    { key: "necesidad_sec", label: "Nec. Secundaria", isHtml: true },
    { key: "necesidad_com", label: "Nec. Comp.", isHtml: true },
    { key: "certificacion", label: "Cert." },
    { key: "candidato", label: "Cand." },
    { key: "donataria_aut", label: "Donat." },
    { key: "padron_ben", label: "Padrón" },
    { key: "veces_don", label: "Veces" },
    { key: "acciones", label: "Acciones" },
  ];

  const renderFormContent = (isEdit: boolean, submitFn: (e: React.FormEvent) => void) => (
    <form onSubmit={submitFn} className="space-y-5">
      {/* ... (Contenido del formulario se mantiene igual) ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(["id_japem", "nombre", "act_asistencial"] as string[]).map((key) => (
          <div key={key} className={key === "nombre" || key === "act_asistencial" ? "md:col-span-2" : ""}>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
              {labels[key]}
            </label>
            <input
              type="text"
              value={donativoForm[key]}
              onChange={(e) => setDonativoForm({...donativoForm, [key]: e.target.value.toUpperCase()})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-colorPrimarioJAPEM focus:ring-1 focus:ring-colorPrimarioJAPEM transition-all uppercase placeholder:normal-case"
              placeholder={`Ingrese ${labels[key]}`}
              required={key !== "act_asistencial"}
            />
          </div>
        ))}

        {[
          { key: "poblacion", options: poblacionOptions },
          { key: "estatus", options: estatusOptions },
          { key: "rubro", options: rubroOptions }
        ].map(({ key, options }) => (
          <div key={key}>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">{labels[key]}</label>
            <select
              value={donativoForm[key]}
              onChange={(e) => setDonativoForm({...donativoForm, [key]: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-colorPrimarioJAPEM focus:ring-1 focus:ring-colorPrimarioJAPEM transition-all uppercase cursor-pointer"
              required
            >
              <option value="">-- SELECCIONE --</option>
              {options.map(op => <option key={op} value={op}>{op}</option>)}
            </select>
          </div>
        ))}

        {(["necesidad_pri", "necesidad_sec", "necesidad_com"] as string[]).map((key) => (
          <div key={key} className="md:col-span-1">
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">{labels[key]}</label>
            <textarea
              value={donativoForm[key]}
              onChange={(e) => setDonativoForm({...donativoForm, [key]: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-colorPrimarioJAPEM focus:ring-1 focus:ring-colorPrimarioJAPEM transition-all uppercase resize-none h-24 placeholder:normal-case"
              placeholder="Descripción..."
            />
          </div>
        ))}

        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <label className="col-span-full text-xs font-bold text-gray-400 uppercase tracking-wider mb-[-10px]">Indicadores</label>
          {(booleanFields as string[]).map((field) => (
            <div key={field}>
              <label className="text-[10px] font-bold text-gray-600 mb-1 uppercase block">{labels[field]}</label>
              <select
                value={donativoForm[field]}
                onChange={(e) => setDonativoForm({...donativoForm, [field]: e.target.value})}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-colorPrimarioJAPEM focus:ring-1 focus:ring-colorPrimarioJAPEM transition-all uppercase"
                required
              >
                <option value="">--</option>
                <option value="SI">SI</option>
                <option value="NO">NO</option>
              </select>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">{labels.veces_don}</label>
          <input
            type="number"
            min={0}
            value={donativoForm.veces_don}
            onChange={(e) => setDonativoForm({...donativoForm, veces_don: Number(e.target.value)})}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-colorPrimarioJAPEM focus:ring-1 focus:ring-colorPrimarioJAPEM transition-all"
          />
        </div>
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
          LISTADO DE DONATIVOS
        </h2>
      </div>

      <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
        <div className="min-w-[2000px] inline-block w-full">
          <Table
            data={donativos}
            columns={columns}
            rowsPerPage={5}
            renderCell={(key, value, row) => {
              if (key === "acciones") {
                return (
                  <button
                    onClick={() => handleEdit(row.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-colorTerciarioJAPEM text-colorTerciarioJAPEM text-xs font-bold rounded-lg hover:bg-colorTerciarioJAPEM hover:text-white transition-all duration-300 shadow-sm"
                  >
                    <Edit2 className="w-3 h-3" /> Editar
                  </button>
                );
              }
              if (key === "estatus") {
                const color = value === "ACTIVO" ? "text-green-700 bg-green-100" : "text-gray-600 bg-gray-100";
                return <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${color}`}>{value}</span>;
              }
              if (booleanFields.includes(key as string)) {
                 return value === "SI" 
                   ? <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><CheckCircle className="w-3 h-3"/> SI</span> 
                   : <span className="text-gray-300 text-xs">NO</span>;
              }
              if (columns.find((c) => c.key === key)?.isHtml) {
                return <div dangerouslySetInnerHTML={{ __html: value }} />;
              }
              return <span className="text-sm text-gray-600 truncate max-w-[250px] block" title={value}>{value}</span>;
            }}
          />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white p-8 rounded-2xl w-full max-w-4xl relative max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up border border-gray-100">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              onClick={handleCloseModal}
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-colorPrimarioJAPEM border-b pb-2 border-gray-100 uppercase flex items-center gap-2">
              <FileText className="w-6 h-6"/>
              {editingId ? "EDITAR DONATIVO" : "AGREGAR DONATIVO"}
            </h2>
            {renderFormContent(!!editingId, handleSubmit)}
          </div>
        </div>
      )}

      <button
        className="fixed bottom-10 right-10 w-14 h-14 bg-gradient-to-r from-colorPrimarioJAPEM to-[#048066] text-white rounded-full shadow-2xl shadow-colorPrimarioJAPEM/40 flex items-center justify-center hover:scale-110 transition-transform duration-300 z-40 group"
        onClick={() => {
          handleCloseModal();
          setShowModal(true);
        }}
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* ESTA ES LA PARTE IMPORTANTE MODIFICADA */}
      <style>{`
        /* 1. Estiliza la barra EXTERNA (La Gris/Naranja) para que se vea bien */
        .custom-scrollbar::-webkit-scrollbar {
          height: 10px; /* Un poco más alta para agarrarla fácil */
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

        /* 2. SOLUCIÓN NUCLEAR: Desactivar el scroll interno */
        
        /* Esto obliga a la etiqueta <table> a llenar los 2000px */
        .custom-scrollbar table {
          width: 100% !important;
          min-width: 100% !important;
        }

        /* Esto elimina el recorte en cualquier div interno que traiga tu componente Table */
        .custom-scrollbar div, 
        .custom-scrollbar section {
          overflow: visible !important;
        }
        
        /* Asegura que las filas no se corten */
        .custom-scrollbar thead, 
        .custom-scrollbar tbody,
        .custom-scrollbar tr {
           min-width: 100% !important;
           width: 100% !important;
        }
      `}</style>
    </div>
  );
};