import { useState, useEffect } from "react";
import { 
  Building2, Plus, Users, Heart, Award, FileCheck, 
  Edit, Trash2, CheckCircle, Activity, History 
} from "lucide-react";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import axios from "axios";
import Swal from 'sweetalert2'; 

const API_URL = "http://127.0.0.1:8000/api";

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

// 1. INTERFAZ DE PROPS
interface IapTableProps {
  userRole: string;
}

// 2. RECIBIMOS EL ROL
export const IapTable = ({ userRole }: IapTableProps) => {
  
  // 3. DEFINIMOS PERMISO LECTURA
  const isReadOnly = userRole === 'lector';

  const [iaps, setIaps] = useState<Iap[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const initialForm: Iap = {
    nombre_iap: '',
    estatus: 'Activa',
    rubro: 'Salud',
    actividad_asistencial: '',
    clasificacion: 'A1',
    tipo_beneficiario: 'Fijos',
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

  // ==========================================
  // LÓGICA DE GUARDAR
  // ==========================================
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // PROTECCIÓN DE SEGURIDAD
    if (isReadOnly) {
        Swal.fire('Error', 'No tienes permisos para realizar esta acción.', 'error');
        return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      if (isEditing && form.id) {
        await axios.put(`${API_URL}/iaps/${form.id}`, form, { headers });
        
        Swal.fire({
            title: '¡Actualizada!',
            text: 'La información de la IAP se actualizó correctamente.',
            icon: 'success',
            confirmButtonColor: '#719c44',
            confirmButtonText: 'Aceptar'
        });

      } else {
        await axios.post(`${API_URL}/iaps`, form, { headers });
        
        Swal.fire({
            title: '¡Registrada!',
            text: 'La nueva IAP ha sido agregada al padrón.',
            icon: 'success',
            confirmButtonColor: '#719c44',
            confirmButtonText: 'Excelente'
        });
      }
      
      setIsModalOpen(false);
      fetchIaps();
      setForm(initialForm);
      setIsEditing(false);

    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al guardar la IAP. Verifica los datos.',
        icon: 'error',
        confirmButtonColor: '#353131'
      });
    }
  };

  // ==========================================
  // LÓGICA DE ELIMINAR
  // ==========================================
  const handleDelete = async (id: number) => {
    // PROTECCIÓN DE SEGURIDAD
    if (isReadOnly) return;

    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Se eliminará esta IAP del padrón y su historial.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/iaps/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            Swal.fire({
                title: '¡Eliminado!',
                text: 'El registro ha sido eliminado correctamente.',
                icon: 'success',
                confirmButtonColor: '#719c44'
            });

            fetchIaps();
        } catch (error) {
            Swal.fire('Error', 'No se pudo eliminar el registro.', 'error');
        }
    }
  };

  const handleEdit = (iap: Iap) => {
    // Protección adicional
    if (isReadOnly) return;

    setForm(iap);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    // Protección adicional
    if (isReadOnly) return;

    setForm(initialForm);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const filteredIaps = iaps.filter(iap => 
    iap.nombre_iap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    iap.rubro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 4. COLUMNAS DINÁMICAS (Ocultar acciones si es lector)
  const columns = [
    { key: "nombre_iap" as keyof Iap, label: "Institución" },
    { key: "rubro" as keyof Iap, label: "Rubro" },
    { key: "necesidad_primaria" as keyof Iap, label: "Necesidad Principal" },
    { key: "es_certificada" as keyof Iap, label: "Validaciones" },
    { key: "veces_donado" as keyof Iap, label: "Historial" },
    // Solo agregamos la columna acciones si NO es lector
    ...(!isReadOnly ? [{ key: "id" as keyof Iap, label: "Acciones" }] : []),
  ];

  return (
    <div className="p-6 animate-fade-in relative w-full max-w-full">
      
      {/* HEADER */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-[#353131] flex items-center justify-center gap-2">
                <Building2 className="text-[#719c44]" size={28} />
                Padrón de IAPs
            </h1>
            <p className="text-[#817e7e] mt-1">Directorio de instituciones y análisis de necesidades.</p>
        </div>
        
        {/* 5. OCULTAR BOTÓN NUEVA IAP SI ES LECTOR */}
        {!isReadOnly && (
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center gap-3">
                <button 
                    onClick={openNewModal}
                    className="cursor-pointer group bg-[#719c44] hover:bg-[#5e8239] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:shadow-xl shadow-[#719c44]/30 font-bold transition-all duration-300 ease-out transform hover:scale-105 active:scale-95"
                >
                    <Plus size={20} className="transition-transform duration-500 group-hover:rotate-180" /> 
                    <span className="hidden sm:inline">Nueva IAP</span>
                </button>
            </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-[#c0c6b6]/30 animate-pulse">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#719c44] mb-4"></div>
           <p className="text-[#817e7e] font-medium">Cargando padrón de instituciones...</p>
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
                          <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] bg-[#f2f5f0] text-[#719c44] px-1.5 py-0.5 rounded border border-[#c0c6b6] font-semibold uppercase">{row.rubro}</span>
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded 
                                  ${row.estatus === 'Activa' ? 'bg-[#f2f5f0] text-[#719c44]' : 'bg-red-50 text-red-700'}`}>
                                  {row.estatus}
                              </span>
                          </div>
                      </div>
                  );
              }
              if (key === "tipo_beneficiario") {
                  return (
                      <div className="flex items-center gap-2 text-sm text-[#817e7e]">
                          <Users size={14} className="text-[#c0c6b6]"/>
                          <span>{value}</span>
                          <span className="bg-[#f2f5f0] text-[#353131] px-1.5 rounded text-xs font-bold" title="Cantidad">
                              {row.personas_beneficiadas}
                          </span>
                      </div>
                  );
              }
              if (key === "necesidad_primaria") {
                  return value ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-[#d97706] bg-[#ffedcc] px-2 py-1 rounded-md border border-[#fed7aa] w-fit uppercase">
                          <Heart size={10} /> {value}
                      </span>
                  ) : <span className="text-[#c0c6b6] text-xs">-</span>;
              }
              
              if (key === "es_certificada") {
                  return (
                      <div className="flex gap-2 justify-start">
                          <div title={row.es_certificada ? "Certificada" : "No Certificada"}>
                              <Award size={18} className={`transition-transform hover:scale-125 ${row.es_certificada ? "text-yellow-500" : "text-[#c0c6b6]"}`}/>
                          </div>
                          <div title={row.tiene_donataria_autorizada ? "Donataria" : "No Donataria"}>
                              <FileCheck size={18} className={`transition-transform hover:scale-125 ${row.tiene_donataria_autorizada ? "text-blue-500" : "text-[#c0c6b6]"}`}/>
                          </div>
                          <div title={row.tiene_padron_beneficiarios ? "Padrón OK" : "Sin Padrón"}>
                              <CheckCircle size={18} className={`transition-transform hover:scale-125 ${row.tiene_padron_beneficiarios ? "text-[#719c44]" : "text-[#c0c6b6]"}`}/>
                          </div>
                      </div>
                  );
              }

              if (key === "veces_donado") {
                  return <div className="flex justify-start"><span className="text-xs font-bold text-[#817e7e] flex items-center gap-1"><History size={12}/> {value}</span></div>;
              }
              if (key === "id") {
                  // Doble chequeo
                  if (isReadOnly) return null;

                  return (
                      <div className="flex gap-2 justify-start">
                          <button onClick={() => handleEdit(row)} className="cursor-pointer p-1.5 hover:bg-[#f2f5f0] text-[#817e7e] hover:text-[#719c44] rounded transition hover:scale-110"><Edit size={16}/></button>
                          <button onClick={() => row.id && handleDelete(row.id)} className="cursor-pointer p-1.5 hover:bg-red-50 text-[#817e7e] hover:text-red-500 rounded transition hover:scale-110"><Trash2 size={16}/></button>
                      </div>
                  );
              }
              return value;
            }}
          />
        </div>
      )}

      {/* --- MODAL (Solo se renderiza si no es lector) --- */}
      {!isReadOnly && (
        <Modal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            title={isEditing ? "Editar IAP" : "Registrar Nueva IAP"} 
            size="extraLarge"
            variant="japem" 
            icon={<Building2 />} 
        >
            <form onSubmit={handleSave} className="space-y-6 p-1">
                {/* ... (Todo tu formulario original, no se toca nada de adentro) ... */}
                {/* 1. SECCIÓN: IDENTIDAD */}
                <div className="p-5 bg-[#f2f5f0] rounded-xl border border-[#c0c6b6]">
                    <h4 className="text-xs font-bold text-[#719c44] uppercase mb-4 flex items-center gap-2">
                        <Building2 size={14}/> Identidad y Estatus
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-[#353131] block mb-1">Nombre de la IAP *</label>
                            <input type="text" required className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm uppercase focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all text-[#353131]" value={form.nombre_iap} onChange={e => setForm({...form, nombre_iap: e.target.value})} />
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-[#353131] block mb-1">Estatus *</label>
                            <select className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all text-[#353131]" value={form.estatus || ""} onChange={e => setForm({...form, estatus: e.target.value})}>
                                <option value="Activa">Activa</option>
                                <option value="Inactiva">Inactiva</option>
                                <option value="Suspendida">Suspendida</option>
                                <option value="En Proceso">En Proceso</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-[#353131] block mb-1">Clasificación</label>
                            <select className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all text-[#353131]" value={form.clasificacion || ""} onChange={e => setForm({...form, clasificacion: e.target.value})}>
                                <option value="A1">A1</option><option value="A2">A2</option><option value="A3">A3</option><option value="A4">A4</option>
                                <option value="B1">B1</option><option value="B2">B2</option><option value="B3">B3</option>
                                <option value="C1">C1</option><option value="C2">C2</option><option value="C3">C3</option><option value="C4">C4</option>
                                <option value="D">D</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. SECCIÓN: ACTIVIDAD */}
                <div className="p-5 bg-[#f9fafb] rounded-xl border border-[#e5e7eb]">
                    <h4 className="text-xs font-bold text-[#817e7e] uppercase mb-4 flex items-center gap-2">
                        <Activity size={14}/> Actividad Asistencial
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-xs font-bold text-[#353131] block mb-1">Rubro *</label>
                            <select className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all text-[#353131]" value={form.rubro || ""} onChange={e => setForm({...form, rubro: e.target.value})}>
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
                            <label className="text-xs font-bold text-[#353131] block mb-1">Actividad Específica</label>
                            <select className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all text-[#353131]" value={form.actividad_asistencial || ''} onChange={e => setForm({...form, actividad_asistencial: e.target.value})} >
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

                {/* 3. SECCIÓN: BENEFICIARIOS Y NECESIDADES */}
                <div className="p-5 bg-[#f2f5f0] rounded-xl border border-[#c0c6b6]">
                    <h4 className="text-xs font-bold text-[#719c44] uppercase mb-4 flex items-center gap-2">
                        <Heart size={14}/> Población y Necesidades
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <label className="text-xs font-bold text-[#353131] block mb-1">Tipo Beneficiario</label>
                            <select className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all text-[#353131]" value={form.tipo_beneficiario || ''} onChange={e => setForm({...form, tipo_beneficiario: e.target.value})} >
                                    <option value="">Seleccione una opción</option>
                                    <option value="Fijos">Fijos</option>
                                    <option value="Temporales">Temporales</option>
                                    <option value="Flotantes">Flotantes</option>
                                </select>
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-[#353131] block mb-1">Población (Cant.)</label>
                            <input 
                                type="number" 
                                min="0" 
                                className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all text-[#353131]" 
                                value={form.personas_beneficiadas === 0 ? "" : form.personas_beneficiadas} 
                                onChange={e => setForm({...form, personas_beneficiadas: e.target.value === "" ? 0 : Number(e.target.value)})} 
                            />
                        </div>
                        <div></div>

                        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-xs font-bold text-[#353131] block mb-1">Necesidad Primaria (Prioridad)</label>
                                <input type="text" className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm uppercase focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all text-[#353131]" placeholder="Ej. ARROZ, MEDICAMENTOS" value={form.necesidad_primaria || ''} onChange={e => setForm({...form, necesidad_primaria: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[#353131] block mb-1">Necesidad Complementaria</label>
                                <input type="text" className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm uppercase focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all text-[#353131]" placeholder="Ej. ROPA, JUGUETES" value={form.necesidad_complementaria || ''} onChange={e => setForm({...form, necesidad_complementaria: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. SECCIÓN: VALIDACIONES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-transparent bg-white rounded-xl shadow-sm hover:border-[#719c44] hover:shadow-md transition-all group has-[:checked]:border-[#719c44] has-[:checked]:bg-[#f2f5f0]">
                        <div className="bg-yellow-100 p-2 rounded-full text-yellow-600 group-has-[:checked]:bg-[#719c44] group-has-[:checked]:text-white transition-colors">
                            <Award size={20} />
                        </div>
                        <div className="flex-1">
                            <span className="font-bold text-[#353131] group-has-[:checked]:text-[#719c44] block text-sm">Certificada</span>
                        </div>
                        <input type="checkbox" className="w-5 h-5 accent-[#719c44] rounded" checked={form.es_certificada} onChange={e => setForm({...form, es_certificada: e.target.checked})} />
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-transparent bg-white rounded-xl shadow-sm hover:border-[#719c44] hover:shadow-md transition-all group has-[:checked]:border-[#719c44] has-[:checked]:bg-[#f2f5f0]">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600 group-has-[:checked]:bg-[#719c44] group-has-[:checked]:text-white transition-colors">
                            <FileCheck size={20} />
                        </div>
                        <div className="flex-1">
                            <span className="font-bold text-[#353131] group-has-[:checked]:text-[#719c44] block text-sm">Donataria</span>
                        </div>
                        <input type="checkbox" className="w-5 h-5 accent-[#719c44] rounded" checked={form.tiene_donataria_autorizada} onChange={e => setForm({...form, tiene_donataria_autorizada: e.target.checked})} />
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-transparent bg-white rounded-xl shadow-sm hover:border-[#719c44] hover:shadow-md transition-all group has-[:checked]:border-[#719c44] has-[:checked]:bg-[#f2f5f0]">
                        <div className="bg-green-100 p-2 rounded-full text-green-600 group-has-[:checked]:bg-[#719c44] group-has-[:checked]:text-white transition-colors">
                            <Users size={20} />
                        </div>
                        <div className="flex-1">
                            <span className="font-bold text-[#353131] group-has-[:checked]:text-[#719c44] block text-sm">Padrón</span>
                        </div>
                        <input type="checkbox" className="w-5 h-5 accent-[#719c44] rounded" checked={form.tiene_padron_beneficiarios} onChange={e => setForm({...form, tiene_padron_beneficiarios: e.target.checked})} />
                    </label>
                </div>

                <div className="flex justify-end gap-3 border-t pt-6 border-[#c0c6b6]/30">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="cursor-pointer px-6 py-3 text-[#817e7e] font-bold hover:bg-[#f2f5f0] rounded-xl transition-all">Cancelar</button>
                    <button type="submit" className="cursor-pointer px-8 py-3 bg-[#719c44] hover:bg-[#5e8239] text-white font-bold rounded-xl shadow-lg shadow-[#719c44]/30 transition-all transform active:scale-95 flex items-center gap-2">
                        <CheckCircle size={20}/>
                        {isEditing ? "Guardar Cambios" : "Registrar IAP"}
                    </button>
                </div>
            </form>
        </Modal>
      )}
    </div>
  );
};