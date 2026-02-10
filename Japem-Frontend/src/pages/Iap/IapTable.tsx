import { useState, useEffect, useRef } from "react"; // Agregamos useRef
import { 
  Building2, Plus, Users, Heart, Award, FileCheck, 
  Edit, Trash2, CheckCircle, Activity, History, Eye, Upload // Agregamos Upload
} from "lucide-react";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import axios from "axios";
import Swal from 'sweetalert2'; 

const API_URL = import.meta.env.VITE_API_URL || "http://192.168.1.90:8000/api";

// SEPARATOR PIPE (|)
const SEPARATOR = "|"; 

interface Iap {
  id?: number; 
  nombre_iap: string;
  estatus: string; 
  rubro: string;
  actividad_asistencial: string; 
  clasificacion: string;         
  tipo_beneficiario: string;     
  personas_beneficiadas: number; 
  necesidad_complementaria: string;
  es_certificada: boolean;
  tiene_donataria_autorizada: boolean;
  tiene_padron_beneficiarios: boolean;
  veces_donado: number;
}

interface IapTableProps {
  userRole: string;
}

export const IapTable = ({ userRole }: IapTableProps) => {
  
  const isReadOnly = userRole === 'lector';

  const [iaps, setIaps] = useState<Iap[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedIap, setSelectedIap] = useState<Iap | null>(null);
  const [searchTerm] = useState("");

  // ESTADOS DE POBLACIÓN
  const [cantFijos, setCantFijos] = useState<string>("");
  const [cantTemp, setCantTemp] = useState<string>("");
  const [cantFlot, setCantFlot] = useState<string>("");

  // REFERENCIA PARA INPUT DE ARCHIVO (IMPORTAR)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialForm: Iap = {
    nombre_iap: '',
    estatus: 'Activa',
    rubro: 'Salud',
    actividad_asistencial: '',
    clasificacion: 'A1',
    tipo_beneficiario: '',
    personas_beneficiadas: 0,
    necesidad_complementaria: '',
    es_certificada: false,
    tiene_donataria_autorizada: false,
    tiene_padron_beneficiarios: false,
    veces_donado: 0
  };

  const [form, setForm] = useState<Iap>(initialForm);

  const listaClasificaciones = ["A1","A2","A3","A4","B1","B2","B3","C1","C2","C3","C4","D"];
  const listaActividades = [
      "ESTABLECIMIENTO DE ASISTENCIA SOCIAL PERMAMENTE",
      "AGRICULTURA SOSTENIBLE",
      "ALBERGUE TEMPORAL",
      "BANCO DE ALIMENTOS",
      "CENTRO DE APOYO A LOCUTORES",
      "CENTRO DE ATENCIÓN A VÍCTIMAS",
      "CENTRO DE ATENCIÓN SOCIAL COMUNITARIA",
      "CENTRO DE DESARROLLO COMUNITARIO",
      "ENTREGA DE BECAS",
      "ENTREGA DE DESPENSAS",
      "GRUPO DE AYUDA MUTUA",
      "PREVENCIÓN DEL CONSUMO NO TERAPÉUTICO DE SUSTANCIAS PSICOACTIVAS",
      "PROGRAMAS DE VIVIENDA Y MEJORAMIENTO URBANO",
      "REFUGIO DE SERES SINTIENTES",
      "SEGUNDO PISO",
      "TALLER ARTÍSTICO Y CULTURAL",
      "TALLER DE CAPACITACIÓN LABORAL",
      "TALLERES DE FORTALECIMIENTO DE LA AUTONOMÍA ECONÓMICA DE LAS MUJERES",
      "TALLERES DE ORIENTACIÓN SOCIAL",
      "TALLERES SOBRE EMPRENDIMIENTO SOCIAL",
      "TERAPIA PSICOLÓGICA",
      "ESCUELA DE EDUCACIÓN PRESCOLAR",
      "ESCUELA DE EDUCACIÓN SUPERIOR",
      "COMUNIDAD EDUCATIVA",
      "ESCUELA DE EDUCACIÓN BÁSICA",
      "HOSPICIOS Y CUIDADOS PALIATIVOS",
      "ATENCIÓN MÉDICA DE ESPECILIDAD",
      "CENTRO DE ATENCIÓN INTEGRAL PARA ENFERMEDAD RENAL CRÓNICA",
      "CLÍNICA Y DISPENSARIO MÉDICO",
      "CONSULTORIO MÉDICO",
      "DISPENSARIO MÉDICO",
      "HOSPITAL DE SEGUNDO NIVEL",
      "PROMOCIÓN A LA SALUD",
      "SERVICIOS DE MEDICINA ALTERNATIVA",
      "CENTRO DE ATENCIÓN PARA ADICCIONES",
      "CASA CUNA",
      "CASA HOGAR",
      "INTERNADO",
      "COMEDOR COMUNITARIO",
      "COMEDOR INFANTIL",
      "ATENCIÓN INSTITUCIONAL",
      "LUDOTECA PARA NIÑOS CON CÁNCER",
      "REFUGIO PARA MUJERES VICTIMAS DE VIOLENCIA",
      "SALUD VISUAL", 
      "TALLER DE MÚSICA",
      "TALLER PREVENCIÓN DE VIOLENCIA",
      "TALLER PREVENCIÓN DE VIOLENCIA Y SALUD",
      "APOYOS Y AYUDAS TÉCNICAS PARA LA INCLUSIÓN",
      "CENTRO DE REHABILITACIÓN",
      "CENTROS DE INCLUSIÓN EDUCATIVA O LABORAL",
      "ESTABLECIMIENTO DE ASISTENCIA SOCIAL PERMAMENTE PARA PERSONAS CON DISCAPACIDAD",
      "TERAPIAS DE REHABILITACIÓN",
      "NO PROPORCIONADO"
  ];

  useEffect(() => {
    fetchIaps();
  }, []);

  const fetchIaps = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/iaps`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setIaps(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error cargando IAPs:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE IMPORTACIÓN CSV ---
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
        Swal.fire('Formato incorrecto', 'Por favor sube un archivo .CSV', 'warning');
        return;
    }

    const formData = new FormData();
    formData.append('archivo', file);

    try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/iaps/importar`, formData, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        Swal.fire('¡Importación Exitosa!', response.data.message || 'Datos cargados.', 'success');
        fetchIaps();
    } catch (error: any) {
        console.error(error);
        const msg = error.response?.data?.message || 'No se pudo procesar el archivo.';
        Swal.fire('Error', msg, 'error');
    } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  // --------------------------------

  const handleViewDetails = (iap: Iap) => {
    setSelectedIap(iap);
    setIsViewModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    let detalles = [];
    let total = 0;

    if (cantFijos && Number(cantFijos) > 0) {
        detalles.push(`Fijos: ${cantFijos}`);
        total += Number(cantFijos);
    }
    if (cantTemp && Number(cantTemp) > 0) {
        detalles.push(`Temporales: ${cantTemp}`);
        total += Number(cantTemp);
    }
    if (cantFlot && Number(cantFlot) > 0) {
        detalles.push(`Flotantes: ${cantFlot}`);
        total += Number(cantFlot);
    }

    const dataToSend = {
        ...form,
        tipo_beneficiario: detalles.join(SEPARATOR), 
        personas_beneficiadas: total
    };

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      if (isEditing && form.id) {
        await axios.put(`${API_URL}/iaps/${form.id}`, dataToSend, { headers });
        Swal.fire('¡Actualizada!', 'Información actualizada.', 'success');
      } else {
        await axios.post(`${API_URL}/iaps`, dataToSend, { headers });
        Swal.fire('¡Registrada!', 'Nueva IAP agregada.', 'success');
      }
      setIsModalOpen(false);
      fetchIaps();
      resetForm();
      setIsEditing(false);
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al guardar.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (isReadOnly) return;
    const result = await Swal.fire({
        title: '¿Estás seguro?', text: "Se eliminará permanentemente.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Sí, eliminar'
    });
    if (result.isConfirmed) {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/iaps/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            Swal.fire('¡Eliminado!', 'Registro eliminado.', 'success');
            fetchIaps();
        } catch (error) { Swal.fire('Error', 'No se pudo eliminar.', 'error'); }
    }
  };

  const parsePoblacion = (str: string) => {
      const fijos = str.match(/Fijos:\s*(\d+)/)?.[1] || "";
      const temp = str.match(/Temporales:\s*(\d+)/)?.[1] || "";
      const flot = str.match(/Flotantes:\s*(\d+)/)?.[1] || "";
      return { fijos, temp, flot };
  };

  const handleEdit = (iap: Iap) => {
    if (isReadOnly) return;
    setForm(iap);
    const { fijos, temp, flot } = parsePoblacion(iap.tipo_beneficiario || "");
    setCantFijos(fijos);
    setCantTemp(temp);
    setCantFlot(flot);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const resetForm = () => {
      setForm(initialForm);
      setCantFijos("");
      setCantTemp("");
      setCantFlot("");
  };

  const openNewModal = () => {
    if (isReadOnly) return;
    resetForm();
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const toggleMultiSelect = (field: keyof Iap, value: string) => {
      const currentString = String(form[field] || ""); 
      const currentArray = currentString ? currentString.split(SEPARATOR) : [];
      let newArray: string[];
      if (currentArray.includes(value)) {
          newArray = currentArray.filter(item => item !== value);
      } else {
          newArray = [...currentArray, value];
      }
      setForm({ ...form, [field]: newArray.join(SEPARATOR) });
  };

  const filteredIaps = iaps.filter(iap => 
    iap.nombre_iap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    iap.rubro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getClasifColor = (c: string) => {
    if(!c) return 'bg-gray-100 text-gray-600 border-gray-200';
    if(c.startsWith('A')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if(c.startsWith('B')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if(c.startsWith('C')) return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const columns = [
    { key: "nombre_iap" as keyof Iap, label: "Institución" },
    { key: "clasificacion" as keyof Iap, label: "Clasif." },
    { key: "actividad_asistencial" as keyof Iap, label: "Actividad" },
    { key: "necesidad_complementaria" as keyof Iap, label: "Nec. Extra" },
    { key: "es_certificada" as keyof Iap, label: "Validaciones" },
    { key: "veces_donado" as keyof Iap, label: "Historial" },
    { key: "id" as keyof Iap, label: "Acciones" },
  ];

  return (
    <div className="p-6 animate-fade-in relative w-full max-w-full">
      {/* HEADER */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-[#353131] flex items-center justify-center gap-2">
                <Building2 className="text-[#719c44]" size={28} /> Padrón de IAPs
            </h1>
            <p className="text-[#817e7e] mt-1">Directorio de instituciones y análisis de necesidades.</p>
        </div>
        
        {!isReadOnly && (
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center gap-3">
                
                {/* --- BOTÓN IMPORTAR CSV (NUEVO) --- */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept=".csv"
                />
                <button 
                    onClick={handleImportClick}
                    className="cursor-pointer bg-white border border-[#719c44] text-[#719c44] hover:bg-[#f2f5f0] px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm font-bold transition-all active:scale-95"
                >
                    <Upload size={20} /> 
                    <span className="hidden sm:inline">Importar CSV</span>
                </button>
                {/* ---------------------------------- */}

                <button onClick={openNewModal} className="cursor-pointer group bg-[#719c44] hover:bg-[#5e8239] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:shadow-xl font-bold transition-all active:scale-95">
                    <Plus size={20} /> <span className="hidden sm:inline">Nueva IAP</span>
                </button>
            </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-[#c0c6b6]/30 animate-pulse">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#719c44] mb-4"></div>
           <p className="text-[#817e7e] font-medium">Cargando padrón...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xl shadow-[#c0c6b6]/20 border border-[#c0c6b6]/30 overflow-hidden">
          <Table
            data={filteredIaps}
            columns={columns}
            renderCell={(key, value, row) => {
              if (key === "nombre_iap") {
                  return (
                      <div>
                          <div className="font-bold text-[#353131]">{value}</div>
                          <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] bg-[#f2f5f0] text-[#719c44] px-1.5 py-0.5 rounded border border-[#c0c6b6] font-bold uppercase tracking-wide">{row.rubro}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${row.estatus === 'Activa' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{row.estatus}</span>
                          </div>
                      </div>
                  );
              }
              if (key === "clasificacion") {
                  const items = value ? String(value).split(SEPARATOR) : [];
                  return (
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {items.map((item, idx) => (
                              <span key={idx} className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getClasifColor(item.trim())}`}>
                                  {item.trim()}
                              </span>
                          ))}
                      </div>
                  );
              }
              if (key === "actividad_asistencial") {
                  const items = value ? String(value).split(SEPARATOR) : [];
                  return (
                      <div className="max-w-[250px]" title={items.join('\n')}>
                          {items.length > 0 ? (
                              <div className="flex flex-col gap-0.5">
                                  <p className="text-xs text-gray-600 truncate font-medium">• {items[0]}</p>
                                  {items.length > 1 && <p className="text-[10px] text-gray-400 italic">+{items.length - 1} más...</p>}
                              </div>
                          ) : <span className="text-xs text-gray-400">Sin actividad</span>}
                      </div>
                  );
              }
              if (key === "es_certificada") {
                  return (
                      <div className="flex gap-2 justify-start">
                          <Award size={18} className={`transition-transform ${row.es_certificada ? "text-yellow-500" : "text-[#c0c6b6]"}`}/>
                          <FileCheck size={18} className={`transition-transform ${row.tiene_donataria_autorizada ? "text-blue-500" : "text-[#c0c6b6]"}`}/>
                          <CheckCircle size={18} className={`transition-transform ${row.tiene_padron_beneficiarios ? "text-[#719c44]" : "text-[#c0c6b6]"}`}/>
                      </div>
                  );
              }
              if (key === "veces_donado") {
                  return <div className="flex justify-start"><span className="text-xs font-bold text-[#817e7e] flex items-center gap-1"><History size={12}/> {value}</span></div>;
              }
              if (key === "id") {
                  return (
                      <div className="flex gap-2 justify-start">
                          <button onClick={() => handleViewDetails(row)} className="cursor-pointer p-1.5 hover:bg-blue-50 text-[#817e7e] hover:text-blue-600 rounded transition hover:scale-110" title="Ver Detalles"><Eye size={16}/></button>
                          {!isReadOnly && (
                              <>
                                <button onClick={() => handleEdit(row)} className="cursor-pointer p-1.5 hover:bg-[#f2f5f0] text-[#817e7e] hover:text-[#719c44] rounded transition hover:scale-110"><Edit size={16}/></button>
                                <button onClick={() => row.id && handleDelete(row.id)} className="cursor-pointer p-1.5 hover:bg-red-50 text-[#817e7e] hover:text-red-500 rounded transition hover:scale-110"><Trash2 size={16}/></button>
                              </>
                          )}
                      </div>
                  );
              }
              return value;
            }}
          />
        </div>
      )}

      {/* --- MODAL FORMULARIO --- */}
      {!isReadOnly && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Editar IAP" : "Registrar Nueva IAP"} size="extraLarge" variant="japem" icon={<Building2 />}>
            <form onSubmit={handleSave} className="space-y-6 p-1">
                {/* 1. IDENTIDAD */}
                <div className="p-5 bg-[#f2f5f0] rounded-xl border border-[#c0c6b6]">
                    <h4 className="text-xs font-bold text-[#719c44] uppercase mb-4 flex items-center gap-2"><Building2 size={14}/> Identidad y Estatus</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-[#353131] block mb-1">Nombre de la IAP *</label>
                            <input type="text" required className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm uppercase focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none text-[#353131]" value={form.nombre_iap} onChange={e => setForm({...form, nombre_iap: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[#353131] block mb-1">Estatus *</label>
                            <select className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white" value={form.estatus || ""} onChange={e => setForm({...form, estatus: e.target.value})}>
                                <option value="Activa">Activa</option><option value="Inactiva">Inactiva</option><option value="Suspendida">Suspendida</option><option value="En Proceso">En Proceso</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-[#353131] block mb-2">Clasificación (Múltiple)</label>
                            <div className="grid grid-cols-4 gap-2 bg-white p-3 border border-[#c0c6b6] rounded-xl max-h-32 overflow-y-auto custom-scrollbar">
                                {listaClasificaciones.map(clasif => (
                                    <label key={clasif} className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 rounded p-1">
                                        <input 
                                            type="checkbox" 
                                            className="accent-[#719c44] w-4 h-4 cursor-pointer"
                                            checked={String(form.clasificacion || "").split(SEPARATOR).includes(clasif)}
                                            onChange={() => toggleMultiSelect('clasificacion', clasif)}
                                        />
                                        <span className="text-xs text-[#555] font-bold">{clasif}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. ACTIVIDAD */}
                <div className="p-5 bg-[#f9fafb] rounded-xl border border-[#e5e7eb]">
                    <h4 className="text-xs font-bold text-[#817e7e] uppercase mb-4 flex items-center gap-2"><Activity size={14}/> Actividad Asistencial</h4>
                    <div className="grid grid-cols-1 gap-5">
                        <div>
                            <label className="text-xs font-bold text-[#353131] block mb-1">Rubro Principal</label>
                            <select className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white" value={form.rubro || ""} onChange={e => setForm({...form, rubro: e.target.value})}>
                                <option value="Ancianos">Ancianos</option><option value="Desarrollo Social">Desarrollo Social</option><option value="Educación">Educación</option><option value="Médico">Médico</option><option value="Niñas, Niños y Adolescentes">Niñas, Niños y Adolescentes</option><option value="Personas con Discapacidad">Personas con Discapacidad</option><option value="No Proporcionado">No Proporcionado</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[#353131] block mb-2">Actividades Específicas (Múltiple)</label>
                            <div className="bg-white p-3 border border-[#c0c6b6] rounded-xl max-h-40 overflow-y-auto custom-scrollbar space-y-1">
                                {listaActividades.map((act, i) => (
                                    <label key={i} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors border-b border-gray-50 last:border-0">
                                        <input 
                                            type="checkbox" 
                                            className="accent-[#719c44] w-4 h-4 mt-0.5 cursor-pointer flex-shrink-0"
                                            checked={String(form.actividad_asistencial || "").split(SEPARATOR).includes(act)}
                                            onChange={() => toggleMultiSelect('actividad_asistencial', act)}
                                        />
                                        <span className="text-xs text-[#555] leading-tight select-none">{act}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. POBLACIÓN */}
                <div className="p-5 bg-[#f2f5f0] rounded-xl border border-[#c0c6b6]">
                    <h4 className="text-xs font-bold text-[#719c44] uppercase mb-4 flex items-center gap-2"><Heart size={14}/> Población y Necesidades</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                        <div>
                            <label className="text-xs font-bold text-[#353131] block mb-1">Cant. Fijos</label>
                            <input type="number" min="0" placeholder="0" className="w-full px-3 py-2 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:border-[#719c44] outline-none" value={cantFijos} onChange={e => setCantFijos(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[#353131] block mb-1">Cant. Temporales</label>
                            <input type="number" min="0" placeholder="0" className="w-full px-3 py-2 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:border-[#719c44] outline-none" value={cantTemp} onChange={e => setCantTemp(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[#353131] block mb-1">Cant. Flotantes</label>
                            <input type="number" min="0" placeholder="0" className="w-full px-3 py-2 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:border-[#719c44] outline-none" value={cantFlot} onChange={e => setCantFlot(e.target.value)} />
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-[#353131] block mb-1">Necesidad Complementaria</label>
                        <input type="text" className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm uppercase focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all text-[#353131]" placeholder="Ej. JUGUETES, ROPA..." value={form.necesidad_complementaria || ''} onChange={e => setForm({...form, necesidad_complementaria: e.target.value})} />
                    </div>
                </div>

                {/* 4. VALIDACIONES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-transparent bg-white rounded-xl shadow-sm group has-[:checked]:border-[#719c44] has-[:checked]:bg-[#f2f5f0]">
                        <div className="bg-yellow-100 p-2 rounded-full text-yellow-600"><Award size={20} /></div>
                        <div className="flex-1"><span className="font-bold text-[#353131] text-sm">Certificada</span></div>
                        <input type="checkbox" className="w-5 h-5 accent-[#719c44]" checked={form.es_certificada} onChange={e => setForm({...form, es_certificada: e.target.checked})} />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-transparent bg-white rounded-xl shadow-sm group has-[:checked]:border-[#719c44] has-[:checked]:bg-[#f2f5f0]">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600"><FileCheck size={20} /></div>
                        <div className="flex-1"><span className="font-bold text-[#353131] text-sm">Donataria</span></div>
                        <input type="checkbox" className="w-5 h-5 accent-[#719c44]" checked={form.tiene_donataria_autorizada} onChange={e => setForm({...form, tiene_donataria_autorizada: e.target.checked})} />
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-transparent bg-white rounded-xl shadow-sm group has-[:checked]:border-[#719c44] has-[:checked]:bg-[#f2f5f0]">
                        <div className="bg-green-100 p-2 rounded-full text-green-600"><Users size={20} /></div>
                        <div className="flex-1"><span className="font-bold text-[#353131] text-sm">Padrón</span></div>
                        <input type="checkbox" className="w-5 h-5 accent-[#719c44]" checked={form.tiene_padron_beneficiarios} onChange={e => setForm({...form, tiene_padron_beneficiarios: e.target.checked})} />
                    </label>
                </div>

                <div className="flex justify-end gap-3 border-t pt-6 border-[#c0c6b6]/30">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="cursor-pointer px-6 py-3 text-[#817e7e] font-bold hover:bg-[#f2f5f0] rounded-xl">Cancelar</button>
                    <button type="submit" className="cursor-pointer px-8 py-3 bg-[#719c44] hover:bg-[#5e8239] text-white font-bold rounded-xl shadow-lg flex items-center gap-2"><CheckCircle size={20}/> Guardar</button>
                </div>
            </form>
        </Modal>
      )}

      {/* MODAL VER DETALLES */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Ficha Técnica" size="large" variant="japem">
        {selectedIap && (
            <div className="space-y-6 p-2">
                <div className="text-center border-b border-[#f2f5f0] pb-6">
                    <div className="inline-block p-4 bg-[#f2f5f0] rounded-full mb-3 border-4 border-white shadow-sm"><Building2 size={40} className="text-[#719c44]" /></div>
                    <h2 className="text-xl font-bold text-[#353131] uppercase">{selectedIap.nombre_iap}</h2>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase mt-2 inline-block">{selectedIap.rubro}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-sm">
                        <p className="text-xs font-bold text-[#817e7e] uppercase mb-2">Clasificación & Actividad</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                            {selectedIap.clasificacion?.split(SEPARATOR).map((c, i) => (
                                <span key={i} className={`px-2 py-0.5 text-xs font-bold border rounded ${getClasifColor(c.trim())}`}>{c.trim()}</span>
                            ))}
                        </div>
                        <ul className="text-sm text-[#353131] list-disc list-inside space-y-1">
                            {selectedIap.actividad_asistencial?.split(SEPARATOR).map((a, i) => (
                                <li key={i} className="leading-snug">{a.trim()}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-[#e5e7eb] shadow-sm">
                        <p className="text-xs font-bold text-[#817e7e] uppercase mb-2">Población Atendida</p>
                        <span className="text-3xl font-extrabold text-[#353131] block mb-2">{selectedIap.personas_beneficiadas} Total</span>
                        <div className="flex flex-col gap-1">
                            {selectedIap.tipo_beneficiario?.split(SEPARATOR).map((t, i) => (
                                <span key={i} className="bg-[#f2f5f0] text-[#719c44] px-3 py-1 rounded text-xs font-bold border border-[#c0c6b6]">{t.trim()}</span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="bg-[#f9fafb] p-5 rounded-2xl border border-[#e5e7eb]">
                    <h4 className="text-sm font-bold text-[#353131] flex items-center gap-2 mb-3"><Heart size={16} className="text-[#719c44]" /> Necesidades Especiales</h4>
                    <p className="text-sm text-[#555] bg-white p-3 rounded-xl border border-[#e5e7eb]">{selectedIap.necesidad_complementaria || "Sin registro."}</p>
                </div>
                <div className="pt-2">
                    <button onClick={() => setIsViewModalOpen(false)} className="cursor-pointer w-full py-3 bg-[#353131] hover:bg-black text-white font-bold rounded-xl">Cerrar Ficha</button>
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
};