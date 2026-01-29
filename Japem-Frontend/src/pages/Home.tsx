import { useEffect, useState } from "react";
import { Header } from "../components/layout/Header";
import { Slider } from "../components/ui/Slider";
import { AgreementCard } from "../components/ui/AgreementCard";
import { ReminderCard } from "../components/ui/ReminderCard";
import { Calendar, type CalendarEvent } from "../components/ui/Calendar";
import { Modal } from "../components/ui/Modal";
import { 
  Plus, LayoutDashboard, ListTodo, CalendarDays, 
  Handshake, Bell, FileText, AlertTriangle, CheckCircle, Users // <--- 1. Importar Icono
} from "lucide-react";

import {
  getDashboardData,
  toggleRecordatorio,
  toggleAcuerdo,
  createAcuerdo,
  createRecordatorio,
  deleteAcuerdo,
  deleteRecordatorio,
} from "../services/dashboardService";

// <--- 2. Importar servicio para obtener usuarios
import { getUsers } from "../services/settingsService"; 

interface Agreement { id: number; title: string; description: string; date: string; }
interface Reminder { id: number; title: string; date: string; done: boolean; }
interface UserOption { id: number; name: string; username: string; } // <--- Interfaz usuario

export default function Home() {
  const [acuerdos, setAcuerdos] = useState<Agreement[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"acuerdo" | "recordatorio" | null>(null);

  // <--- 3. Estado para usuarios disponibles
  const [availableUsers, setAvailableUsers] = useState<UserOption[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    shared_with: [] as number[] // <--- 4. Array para IDs de usuarios compartidos
  });

  const sortByDate = (a: any, b: any) => a.date.localeCompare(b.date);
  
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "";
    const cleanDate = dateString.split('T')[0];
    const [year, month, day] = cleanDate.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getDashboardData();
      const cleanDates = (items: any[]) => items.map(item => ({
          ...item,
          date: item.date ? item.date.split('T')[0] : item.date
      }));
      setAcuerdos(cleanDates(data.acuerdos).sort(sortByDate));
      setReminders(cleanDates(data.recordatorios).sort(sortByDate));
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // <--- 5. Función para cargar usuarios
  const loadUsersForSelect = async () => {
    try {
        const users = await getUsers();
        // Aseguramos que sea un array
        setAvailableUsers(Array.isArray(users) ? users : []);
    } catch (e) { console.error("Error cargando usuarios", e); }
  };

  const handleDeleteAcuerdo = async (id: number) => { 
    if (confirm("¿Eliminar este acuerdo?")) { 
        await deleteAcuerdo(id); 
        setAcuerdos(p => p.filter(a => a.id !== id)); 
    } 
  };

  const handleDeleteRecordatorio = async (id: number) => { 
    if (confirm("¿Eliminar este recordatorio?")) { 
        await deleteRecordatorio(id); 
        setReminders(p => p.filter(r => r.id !== id)); 
    } 
  };
  
  const handleToggleReminder = async (id: number, currentStatus: boolean) => {
    try {
      if (!currentStatus) {
        await toggleRecordatorio(id, true);
        setReminders((prev) => prev.filter((r) => r.id !== id));
      } else {
        await toggleRecordatorio(id, false);
        fetchData(); 
      }
    } catch (error) { console.error(error); }
  };

  const handleToggleAcuerdo = async (id: number) => {
    try {
      await toggleAcuerdo(id, true);
      setAcuerdos((prev) => prev.filter((a) => a.id !== id));
    } catch (error) { console.error(error); }
  };

  // <--- 6. Manejador de selección de usuarios
  const toggleUserShare = (userId: number) => {
    setFormData(prev => {
        const isSelected = prev.shared_with.includes(userId);
        return {
            ...prev,
            shared_with: isSelected 
                ? prev.shared_with.filter(id => id !== userId) // Quitar
                : [...prev.shared_with, userId] // Agregar
        };
    });
  };

  const openModal = (type: "acuerdo" | "recordatorio") => {
    setModalType(type);
    setFormData({ 
        title: "", 
        description: "", 
        date: new Date().toISOString().split("T")[0],
        shared_with: [] // Reiniciar selección
    });
    
    // Si es acuerdo, cargamos los usuarios
    if(type === "acuerdo") {
        loadUsersForSelect();
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === "acuerdo") await createAcuerdo(formData);
    else await createRecordatorio({ title: formData.title, date: formData.date });
    setIsModalOpen(false);
    fetchData();
  };

  const todos = [...acuerdos, ...reminders].sort((a, b) => a.date.localeCompare(b.date));
  const nextEvent = todos.find(e => e.date >= new Date().toISOString().split("T")[0]) || todos[0];
  const proximoTexto = nextEvent ? `${nextEvent.title} - ${formatDateDisplay(nextEvent.date)}` : "Sin pendientes";

  const calendarEvents: CalendarEvent[] = [
    ...acuerdos.map(a => ({ date: a.date, title: a.title, type: "acuerdo" as const })),
    ...reminders.map(r => ({ date: r.date, title: r.title, type: "recordatorio" as const }))
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb] font-inter text-[#353131]">
      <Header />

      <main className="w-full pb-12 animate-fade-in-up">
        {/* Slider Section */}
        <div className="w-full relative shadow-lg z-0">
          <Slider />
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#f9fafb] to-transparent pointer-events-none"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
          
          {/* --- WIDGETS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-[#719c44] hover:-translate-y-1 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[#817e7e] text-xs font-bold uppercase tracking-wider">Acuerdos</p>
                  <h3 className="text-4xl font-extrabold text-[#719c44] mt-1">{acuerdos.length}</h3>
                </div>
                <div className="p-3 bg-[#719c44]/10 text-[#719c44] rounded-xl">
                  <LayoutDashboard className="w-8 h-8" />
                </div>
              </div>
              <div className="w-full bg-[#f2f5f0] rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#719c44] h-1.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-[#817e7e] hover:-translate-y-1 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[#817e7e] text-xs font-bold uppercase tracking-wider">Pendientes</p>
                  <h3 className="text-4xl font-extrabold text-[#353131] mt-1">{reminders.length}</h3>
                </div>
                <div className="p-3 bg-[#c0c6b6]/30 text-[#353131] rounded-xl">
                  <ListTodo className="w-8 h-8" />
                </div>
              </div>
              <div className="w-full bg-[#f2f5f0] rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#817e7e] h-1.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-[#c0c6b6] hover:-translate-y-1 transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="overflow-hidden pr-2">
                  <p className="text-[#817e7e] text-xs font-bold uppercase tracking-wider">Próximo Evento</p>
                  <h3 className="text-lg font-bold text-[#353131] mt-2 truncate" title={proximoTexto}>
                    {proximoTexto}
                  </h3>
                </div>
                <div className="p-3 bg-[#c0c6b6]/30 text-[#719c44] rounded-xl shrink-0">
                  <CalendarDays className="w-8 h-8" />
                </div>
              </div>
              <div className="w-full bg-[#f2f5f0] rounded-full h-1.5">
                <div className="bg-[#c0c6b6] h-1.5 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>

          {/* --- CONTENIDO PRINCIPAL --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-[#c0c6b6]/30 overflow-hidden flex flex-col h-full max-h-[800px]">
                <div className="p-6 border-b border-[#f2f5f0] flex justify-between items-center bg-white sticky top-0 z-10">
                  <h2 className="text-xl font-bold text-[#353131] flex items-center gap-2">
                    <Handshake className="text-[#719c44]" size={24} />
                    Mis Acuerdos
                  </h2>
                  <button
                    onClick={() => openModal("acuerdo")}
                    className="group bg-[#719c44] hover:bg-[#5e8239] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:shadow-xl shadow-[#719c44]/20 font-bold transition-all transform hover:scale-105 active:scale-95"
                  >
                    <Plus size={20} className="transition-transform duration-500 group-hover:rotate-180" />
                    <span className="hidden sm:inline">Nuevo</span>
                  </button>
                </div>
                
                <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1 bg-[#f9fafb]">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                      <div className="animate-spin h-8 w-8 border-4 border-[#719c44] border-t-transparent rounded-full mb-3"></div>
                    </div>
                  ) : acuerdos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-[#817e7e]">
                      <LayoutDashboard className="w-12 h-12 mb-2 opacity-20" />
                      <p className="italic">No hay acuerdos pendientes.</p>
                    </div>
                  ) : (
                    acuerdos.map((a) => (
                      <div key={a.id} className="transform transition-all duration-500 hover:scale-[1.01]">
                        <AgreementCard
                          agreement={a}
                          onDelete={handleDeleteAcuerdo}
                          onToggle={() => handleToggleAcuerdo(a.id)}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-[#c0c6b6]/30 overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-[#f2f5f0] flex justify-between items-center bg-white">
                  <h2 className="text-xl font-bold text-[#353131] flex items-center gap-2">
                    <Bell className="text-[#817e7e]" size={24} />
                    Mis Recordatorios
                  </h2>
                  <button
                    onClick={() => openModal("recordatorio")}
                    className="group bg-[#f2f5f0] border border-[#c0c6b6] text-[#817e7e] hover:bg-[#817e7e] hover:text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md font-bold transition-all transform hover:scale-105 active:scale-95"
                  >
                    <Plus size={20} className="transition-transform duration-500 group-hover:rotate-180" />
                    <span className="hidden sm:inline">Nuevo</span>
                  </button>
                </div>

                <div className="p-6 grid lg:grid-cols-2 gap-8 bg-[#f9fafb]">
                  <div className="space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar pr-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                           <div className="animate-spin h-8 w-8 border-4 border-[#719c44] border-t-transparent rounded-full mb-3"></div>
                        </div>
                    ) : reminders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-[#817e7e]">
                          <ListTodo className="w-10 h-10 mb-2 opacity-20" />
                          <p>¡Todo al día!</p>
                        </div>
                    ) : (
                      reminders.map((r) => (
                        <div key={r.id} className="transform transition-all duration-500 hover:translate-x-1">
                          <ReminderCard
                            reminder={r}
                            onToggle={() => handleToggleReminder(r.id, r.done)}
                            onDelete={handleDeleteRecordatorio}
                          />
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#c0c6b6]/30">
                    <Calendar events={calendarEvents} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL UNIFICADO --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === "acuerdo" ? "Nuevo Acuerdo" : "Nuevo Recordatorio"}
        size="large"
        variant="japem" 
        icon={modalType === "acuerdo" ? <Handshake /> : <Bell />}
      >
        <form onSubmit={handleSubmit} className="space-y-6 p-1">
          <div className={`p-6 rounded-2xl border ${modalType === "acuerdo" ? "bg-[#f2f5f0] border-[#c0c6b6]" : "bg-[#f9fafb] border-[#e5e7eb]"}`}>
             <h4 className={`text-xs font-bold uppercase mb-4 flex items-center gap-2 ${modalType === "acuerdo" ? "text-[#719c44]" : "text-[#817e7e]"}`}>
                {modalType === "acuerdo" ? <FileText size={14}/> : <AlertTriangle size={14}/>} 
                {modalType === "acuerdo" ? "Detalles del Compromiso" : "Datos del Recordatorio"}
             </h4>

             <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-[#353131] block mb-1">Título *</label>
                    <input
                      type="text" required
                      className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                {modalType === "acuerdo" && (
                    <>
                    <div className="animate-fade-in">
                        <label className="text-xs font-bold text-[#353131] block mb-1">Descripción</label>
                        <textarea
                          required rows={3}
                          className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all resize-none"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    
                    {/* --- 7. SECCIÓN DE COMPARTIR --- */}
                    <div className="animate-fade-in border-t border-dashed border-[#c0c6b6] pt-4 mt-2">
                        <label className="text-xs font-bold text-[#353131] mb-2 flex items-center gap-2">
                            <Users size={14} className="text-[#719c44]"/> 
                            Compartir con (Opcional):
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto custom-scrollbar bg-white p-2 rounded-lg border border-[#c0c6b6]/50">
                            {availableUsers.map(user => (
                                <label key={user.id} className="flex items-center gap-2 text-xs p-1 hover:bg-[#f2f5f0] rounded cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="accent-[#719c44] rounded"
                                        checked={formData.shared_with.includes(user.id)}
                                        onChange={() => toggleUserShare(user.id)}
                                    />
                                    <span className="truncate">{user.name}</span>
                                </label>
                            ))}
                            {availableUsers.length === 0 && <p className="text-[10px] text-gray-400">Cargando usuarios...</p>}
                        </div>
                    </div>
                    </>
                )}

                <div>
                    <label className="text-xs font-bold text-[#353131] block mb-1">Fecha Límite</label>
                    <input
                      type="date" required
                      className="w-full px-4 py-2.5 border border-[#c0c6b6] rounded-lg text-sm focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none transition-all"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-[#817e7e] font-bold hover:bg-[#f2f5f0] rounded-xl transition-all"
            >
                Cancelar
            </button>
            <button
              type="submit"
              className={`px-8 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2 ${
                  modalType === "acuerdo" 
                  ? "bg-[#719c44] hover:bg-[#5e8239] shadow-[#719c44]/30" 
                  : "bg-[#817e7e] hover:bg-[#6b6868] shadow-[#817e7e]/30"
              }`}
            >
              <CheckCircle size={18}/> Guardar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}