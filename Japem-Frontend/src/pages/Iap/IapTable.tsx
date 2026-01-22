import { useState, useEffect } from "react";
import { 
  Building2, Plus, Users, Heart, Award, FileCheck, 
  Search, Edit, Trash2, CheckCircle, Activity, History 
} from "lucide-react";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

// 1. INTERFACE
interface Iap {
  id?: number; 
  nombre_iap: string;
  estatus: string; 
  rubro: string;
  actividad_asistencial: string;
  clasificacion: string;
  tipo_beneficiario: string;
  personas_beneficiadas: number;
  necesidad_primaria: string;
  necesidad_complementaria: string;
  es_certificada: boolean;
  tiene_donataria_autorizada: boolean;
  tiene_padron_beneficiarios: boolean;
  veces_donado: number;
}

export const IapTable = () => {
  const [iaps, setIaps] = useState<Iap[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Estado Inicial
  const initialForm: Iap = {
    nombre_iap: '',
    estatus: 'Activa',
    rubro: 'Salud',
    actividad_asistencial: '',
    clasificacion: 'I.A.P.',
    tipo_beneficiario: 'Público General',
    personas_beneficiadas: 0,
    necesidad_primaria: '',
    necesidad_complementaria: '',
    es_certificada: false,
    tiene_donataria_autorizada: false,
    tiene_padron_beneficiarios: false,
    veces_donado: 0
  };

  const [form, setForm] = useState<Iap>(initialForm);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      if (isEditing && form.id) {
        await axios.put(`${API_URL}/iaps/${form.id}`, form, { headers });
        alert("✅ IAP actualizada correctamente");
      } else {
        await axios.post(`${API_URL}/iaps`, form, { headers });
        alert("✅ IAP registrada correctamente");
      }
      
      setIsModalOpen(false);
      fetchIaps();
      setForm(initialForm);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("Error al guardar la IAP.");
    }
  };

  const handleEdit = (iap: Iap) => {
    setForm(iap);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta IAP?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/iaps/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchIaps();
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  const filteredIaps = iaps.filter(iap => 
    iap.nombre_iap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    iap.rubro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: "nombre_iap" as keyof Iap, label: "Institución" },
    { key: "tipo_beneficiario" as keyof Iap, label: "Población" },
    { key: "necesidad_primaria" as keyof Iap, label: "Necesidad Principal" },
    { key: "es_certificada" as keyof Iap, label: "Validaciones" },
    { key: "veces_donado" as keyof Iap, label: "Historial" },
    { key: "id" as keyof Iap, label: "Acciones" },
  ];

  return (
    <div className="p-6 animate-fade-in w-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        <div>
           <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
             <Building2 className="text-purple-600" /> Padrón de IAPs
           </h2>
           <p className="text-gray-500 text-sm">Directorio de instituciones y análisis de necesidades.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <input 
                    type="text" placeholder="Buscar institución..." 
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 outline-none"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
            <button 
                onClick={() => { setForm(initialForm); setIsEditing(false); setIsModalOpen(true); }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md font-bold text-sm"
            >
                <Plus size={18} /> Nueva IAP
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
           <p className="text-gray-400 font-medium animate-pulse">Cargando padrón de instituciones...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Table
            data={filteredIaps}
            columns={columns}
            renderCell={(key, value, row) => {
              if (key === "nombre_iap") {
                  return (
                      <div>
                          <div className="font-bold text-gray-800">{value}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-100 font-semibold uppercase">{row.rubro}</span>
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${row.estatus === 'Activa' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {row.estatus}
                              </span>
                          </div>
                      </div>
                  );
              }
              if (key === "tipo_beneficiario") {
                  return (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users size={14} className="text-gray-400"/>
                          <span>{value}</span>
                          <span className="bg-gray-100 text-gray-700 px-1.5 rounded text-xs font-bold" title="Cantidad">
                              {row.personas_beneficiadas}
                          </span>
                      </div>
                  );
              }
              if (key === "necesidad_primaria") {
                  return value ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-50 px-2 py-1 rounded-md border border-orange-100 w-fit uppercase">
                          <Heart size={10} /> {value}
                      </span>
                  ) : <span className="text-gray-300 text-xs">-</span>;
              }
              if (key === "es_certificada") {
                  return (
                      <div className="flex gap-2">
                          <div title={row.es_certificada ? "Certificada" : "No Certificada"}><Award size={18} className={row.es_certificada ? "text-yellow-500" : "text-gray-200"}/></div>
                          <div title={row.tiene_donataria_autorizada ? "Donataria" : "No Donataria"}><FileCheck size={18} className={row.tiene_donataria_autorizada ? "text-blue-500" : "text-gray-200"}/></div>
                          <div title={row.tiene_padron_beneficiarios ? "Padrón OK" : "Sin Padrón"}><CheckCircle size={18} className={row.tiene_padron_beneficiarios ? "text-green-500" : "text-gray-200"}/></div>
                      </div>
                  );
              }
              if (key === "veces_donado") {
                  return <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><History size={12}/> {value}</span>;
              }
              if (key === "id") {
                  return (
                      <div className="flex gap-2">
                          <button onClick={() => handleEdit(row)} className="p-1.5 hover:bg-gray-100 rounded text-blue-600 transition"><Edit size={16}/></button>
                          <button onClick={() => row.id && handleDelete(row.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500 transition"><Trash2 size={16}/></button>
                      </div>
                  );
              }
              return value;
            }}
          />
        </div>
      )}

      {/* MODAL CON LOS 13 CAMPOS */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Editar IAP" : "Registrar Nueva IAP"} size="large">
        <form onSubmit={handleSave} className="space-y-5">
            
            {/* 1. SECCIÓN: IDENTIDAD (4 Campos) */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1"><Building2 size={12}/> Identidad y Estatus</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-700">Nombre de la IAP *</label>
                        <input type="text" required className="w-full p-2 border rounded-lg text-sm uppercase focus:ring-2 focus:ring-purple-200 outline-none" 
                            value={form.nombre_iap} onChange={e => setForm({...form, nombre_iap: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-gray-700">Estatus *</label>
                        {/* --- CORRECCIÓN AQUÍ: Agregamos || "" para evitar error value={null} --- */}
                        <select className="w-full p-2 border rounded-lg text-sm bg-white"
                            value={form.estatus || ""} onChange={e => setForm({...form, estatus: e.target.value})}>
                            <option value="Activa">Activa</option>
                            <option value="Inactiva">Inactiva</option>
                            <option value="Suspendida">Suspendida</option>
                            <option value="En Proceso">En Proceso</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-700">Clasificación</label>
                        {/* --- CORRECCIÓN AQUÍ --- */}
                        <select className="w-full p-2 border rounded-lg text-sm bg-white"
                            value={form.clasificacion || ""} onChange={e => setForm({...form, clasificacion: e.target.value})}>
                            <option value="A1">A1</option>
                            <option value="A2">A2</option>
                            <option value="A3">A3</option>
                            <option value="A4">A4</option>
                            <option value="B1">B1</option>
                            <option value="B2">B2</option>
                            <option value="B3">B3</option>
                            <option value="C1">C1</option>
                            <option value="C2">C2</option>
                            <option value="C3">C3</option>
                            <option value="C4">C4</option>
                            <option value="D">D</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 2. SECCIÓN: ACTIVIDAD (3 Campos) */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="text-xs font-bold text-blue-800 uppercase mb-3 flex items-center gap-1"><Activity size={12}/> Actividad Asistencial</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-700">Rubro *</label>
                        {/* --- CORRECCIÓN AQUÍ --- */}
                        <select className="w-full p-2 border rounded-lg text-sm bg-white"
                            value={form.rubro || ""} onChange={e => setForm({...form, rubro: e.target.value})}>
                            <option value="Ancianos">Ancianos</option>
                            <option value="Desarrollo Social">Desarrollo Social</option>
                            <option value="Educación">Educación</option>
                            <option value="Médico">Médico</option>
                            <option value="Niñas, Niños y Adolescentes">Niñas, Niños y Adolescentes</option>
                            <option value="Personas con Discapacidad">Personas con Discapacidad</option>
                            <option value="No Proporcionado">No Proporcionado</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-700">Actividad Específica</label>
                        <select className="w-full p-2 border border-blue-200 rounded-lg text-sm" 
                            value={form.actividad_asistencial || ''} onChange={e => setForm({...form, actividad_asistencial: e.target.value})} >
                                <option value="">Seleccione una opción</option>
                                <option value="Alojamiento y Asistencia Residencial para Población Vulnerable">Alojamiento y Asistencia Residencial para Población Vulnerable</option>
                                <option value="Capacitación Laboral y Desarrollo de Habilidades">Capacitación Laboral y Desarrollo de Habilidades</option>
                                <option value="Cuidado Residencial Institucional para Niñez y Adolescencia">Cuidado Residencial Institucional para Niñez y Adolescencia</option>
                                <option value="Desarrollo Comunitario y Asistencia Social">Desarrollo Comunitario y Asistencia Social</option>
                                <option value="Educación Formal y Académica">Educación Formal y Académica</option>
                                <option value="Prevención y Tratamiento de Adicciones">Prevención y Tratamiento de Adicciones</option>
                                <option value="Rehabilitación Física, Inclusión y Atención a la Discapacidad">Rehabilitación Física, Inclusión y Atención a la Discapacidad</option>
                                <option value="Salud Mental, Apoyo Psicosocial y Atención a Víctimas">Salud Mental, Apoyo Psicosocial y Atención a Víctimas</option>
                                <option value="Salud Visual y Atención Oftalmológica Integral">Salud Visual y Atención Oftalmológica Integral</option>
                                <option value="Seguridad Alimentaria y Nutrición">Seguridad Alimentaria y Nutrición</option>
                                <option value="Servicios de Atención Médica Clínica y Especializada">Servicios de Atención Médica Clínica y Especializada</option>
                                <option value="No Proporcionado">No Proporcionado</option>
                            </select>
                    </div>
                </div>
            </div>

            {/* 3. SECCIÓN: BENEFICIARIOS Y NECESIDADES (5 Campos) */}
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <h4 className="text-xs font-bold text-purple-800 uppercase mb-3 flex items-center gap-1"><Heart size={12}/> Población y Necesidades</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-700">Tipo Beneficiario</label>
                        <select className="w-full p-2 border border-purple-200 rounded-lg text-sm" 
                            value={form.tipo_beneficiario || ''} onChange={e => setForm({...form, tipo_beneficiario: e.target.value})} >
                                <option value="">Seleccione una opción</option>
                                <option value="Fijos">Fijos</option>
                                <option value="Temporales">Temporales</option>
                                <option value="Flotantes">Flotantes</option>
                            </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-700">Población (Cant.)</label>
                        <input type="number" min="0" className="w-full p-2 border border-purple-200 rounded-lg text-sm" 
                            value={form.personas_beneficiadas} onChange={e => setForm({...form, personas_beneficiadas: Number(e.target.value)})} />
                    </div>
                    <div>
                    </div>

                    <div className="md:col-span-3 grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-700">Necesidad Primaria (Prioridad)</label>
                            <input type="text" className="w-full p-2 border border-purple-200 bg-white rounded-lg text-sm uppercase" 
                                placeholder="Ej. ARROZ, MEDICAMENTOS"
                                value={form.necesidad_primaria || ''} onChange={e => setForm({...form, necesidad_primaria: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-700">Necesidad Complementaria</label>
                            <input type="text" className="w-full p-2 border border-purple-200 bg-white rounded-lg text-sm uppercase" 
                                placeholder="Ej. ROPA, JUGUETES"
                                value={form.necesidad_complementaria || ''} onChange={e => setForm({...form, necesidad_complementaria: e.target.value})} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. SECCIÓN: VALIDACIONES (3 Campos Checkbox) */}
            <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition flex-1">
                    <input type="checkbox" className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        checked={form.es_certificada} onChange={e => setForm({...form, es_certificada: e.target.checked})} />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1"><Award size={16} className="text-yellow-500"/> Certificada</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition flex-1">
                    <input type="checkbox" className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        checked={form.tiene_donataria_autorizada} onChange={e => setForm({...form, tiene_donataria_autorizada: e.target.checked})} />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1"><FileCheck size={16} className="text-blue-500"/> Donataria</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition flex-1">
                    <input type="checkbox" className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        checked={form.tiene_padron_beneficiarios} onChange={e => setForm({...form, tiene_padron_beneficiarios: e.target.checked})} />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1"><Users size={16} className="text-green-500"/> Padrón</span>
                </label>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition-transform active:scale-95">
                    {isEditing ? "Guardar Cambios" : "Registrar IAP"}
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};