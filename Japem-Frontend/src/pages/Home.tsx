import { useEffect, useState } from "react";
import { Header } from "../components/layout/Header";
import { Slider } from "../components/ui/Slider";
import { AgreementCard } from "../components/ui/AgreementCard";
import { ReminderCard } from "../components/ui/ReminderCard";
import { Calendar, type CalendarEvent } from "../components/ui/Calendar";
import { Modal } from "../components/ui/Modal";
import { Plus, LayoutDashboard, ListTodo, CalendarDays } from "lucide-react";

import {
  getAcuerdos,
  getRecordatorios,
  toggleRecordatorio,
  toggleAcuerdo,
  createAcuerdo,
  createRecordatorio,
  deleteAcuerdo,
  deleteRecordatorio,
} from "../services/dashboardService";

interface Agreement {
  id: number;
  title: string;
  description: string;
  date: string;
}

interface Reminder {
  id: number;
  title: string;
  date: string;
  done: boolean;
}

export default function Home() {
  const [acuerdos, setAcuerdos] = useState<Agreement[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"acuerdo" | "recordatorio" | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const sortByDate = (a: { date: string }, b: { date: string }) => {
    return a.date.localeCompare(b.date);
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [acuerdosData, remindersData] = await Promise.all([
        getAcuerdos(),
        getRecordatorios(),
      ]);
      setAcuerdos(acuerdosData.sort(sortByDate));
      setReminders(remindersData.sort(sortByDate));
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteAcuerdo = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este acuerdo?")) return;
    try {
      await deleteAcuerdo(id);
      setAcuerdos((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteRecordatorio = async (id: number) => {
    if (!confirm("¿Borrar este recordatorio?")) return;
    try {
      await deleteRecordatorio(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleReminder = async (id: number, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      if (newStatus === true) {
        await toggleRecordatorio(id, true);
        setReminders((prev) => prev.filter((r) => r.id !== id));
      } else {
        const updated = await toggleRecordatorio(id, false);
        setReminders((prev) =>
          prev.map((r) => (r.id === id ? updated : r)).sort(sortByDate)
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleAcuerdo = async (id: number) => {
    try {
      await toggleAcuerdo(id, true);
      setAcuerdos((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = (type: "acuerdo" | "recordatorio") => {
    setModalType(type);
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === "acuerdo") await createAcuerdo(formData);
      else
        await createRecordatorio({
          title: formData.title,
          date: formData.date,
        });

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const todosLosEventos = [
    ...acuerdos.map((a) => ({ ...a, type: "Acuerdo" })),
    ...reminders.map((r) => ({ ...r, type: "Recordatorio" })),
  ];

  todosLosEventos.sort((a, b) => a.date.localeCompare(b.date));
  const nextEvent = todosLosEventos[0];

  const totalAcuerdos = acuerdos.length;
  const recordatoriosPendientes = reminders.length;
  const proximoTexto = nextEvent
    ? `${nextEvent.title} - ${formatDateDisplay(nextEvent.date)}`
    : "Todo al día";

  const calendarEvents: CalendarEvent[] = [
    ...acuerdos.map((a) => ({
      date: a.date,
      title: a.title,
      type: "acuerdo" as const,
    })),
    ...reminders.map((r) => ({
      date: r.date,
      title: r.title,
      type: "recordatorio" as const,
    })),
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-inter text-gray-800">
      
      {/* --- HEADER STICKY --- */}
      {/* Asegúrate de que NO haya otro <Header /> en App.tsx o main.tsx */}
      <div className="sticky top-0 z-50 shadow-sm bg-white/90 backdrop-blur-md transition-all duration-300">
        <Header />
      </div>

      <main className="w-full pb-12 animate-fade-in-up">
        {/* Slider Section */}
        <div className="w-full relative shadow-lg z-0">
          <Slider />
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
          
          {/* --- WIDGETS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Widget Acuerdos */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-colorPrimarioJAPEM hover-lift transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Acuerdos Activos</p>
                  <h3 className="text-4xl font-extrabold text-colorPrimarioJAPEM mt-1">{totalAcuerdos}</h3>
                </div>
                <div className="p-3 bg-green-50 text-colorPrimarioJAPEM rounded-xl">
                  <LayoutDashboard className="w-8 h-8" />
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-colorPrimarioJAPEM h-1.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            {/* Widget Pendientes */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-colorTerciarioJAPEM hover-lift transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pendientes</p>
                  <h3 className="text-4xl font-extrabold text-colorTerciarioJAPEM mt-1">{recordatoriosPendientes}</h3>
                </div>
                <div className="p-3 bg-yellow-50 text-colorTerciarioJAPEM rounded-xl">
                  <ListTodo className="w-8 h-8" />
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-colorTerciarioJAPEM h-1.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            {/* Widget Próximo Evento */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-blue-600 hover-lift transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="overflow-hidden pr-2">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Próximo Evento</p>
                  <h3 className="text-lg font-bold text-gray-800 mt-2 truncate" title={proximoTexto}>
                    {proximoTexto}
                  </h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                  <CalendarDays className="w-8 h-8" />
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>

          {/* --- CONTENIDO PRINCIPAL --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Columna Izquierda: Acuerdos */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full max-h-[800px]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
                  <h2 className="text-xl font-bold text-colorPrimarioJAPEM flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-colorPrimarioJAPEM rounded-full inline-block"></span>
                    Acuerdos
                  </h2>
                  <button
                    onClick={() => openModal("acuerdo")}
                    className="group flex items-center justify-center w-10 h-10 bg-white border border-gray-200 text-colorPrimarioJAPEM rounded-xl hover:bg-colorPrimarioJAPEM hover:text-white hover:border-colorPrimarioJAPEM transition-all duration-300 shadow-sm"
                  >
                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                  </button>
                </div>
                
                <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin h-8 w-8 border-4 border-colorPrimarioJAPEM border-t-transparent rounded-full"></div>
                    </div>
                  ) : acuerdos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                      <LayoutDashboard className="w-12 h-12 mb-2 opacity-20" />
                      <p className="italic">No hay acuerdos registrados.</p>
                    </div>
                  ) : (
                    acuerdos.map((a) => (
                      <div key={a.id} className="transform transition-all duration-200 hover:scale-[1.01]">
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

            {/* Columna Derecha: Recordatorios y Calendario */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur-sm">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-colorTerciarioJAPEM rounded-full inline-block"></span>
                    Recordatorios
                  </h2>
                  <button
                    onClick={() => openModal("recordatorio")}
                    className="group flex items-center justify-center w-10 h-10 bg-white border border-gray-200 text-colorTerciarioJAPEM rounded-xl hover:bg-colorTerciarioJAPEM hover:text-white hover:border-colorTerciarioJAPEM transition-all duration-300 shadow-sm"
                  >
                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                  </button>
                </div>

                <div className="p-6 grid lg:grid-cols-2 gap-8">
                  <div className="space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar pr-2">
                    {loading ? (
                       <p className="text-center py-4 text-gray-500">Cargando...</p>
                    ) : reminders.length === 0 ? (
                       <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                          <ListTodo className="w-10 h-10 mb-2 opacity-20" />
                          <p>¡Todo al día!</p>
                       </div>
                    ) : (
                      reminders.map((r) => (
                        <div key={r.id} className="transform transition-all duration-200 hover:translate-x-1">
                          <ReminderCard
                            reminder={r}
                            onToggle={() => handleToggleReminder(r.id, r.done)}
                            onDelete={handleDeleteRecordatorio}
                          />
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-4 shadow-inner border border-gray-100">
                    <Calendar events={calendarEvents} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === "acuerdo" ? "Nuevo Acuerdo" : "Nuevo Recordatorio"}
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="form-field delay-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">Título</label>
            <input
              type="text"
              required
              placeholder="Escribe un título..."
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-colorPrimarioJAPEM focus:ring-0 transition-colors text-gray-800 placeholder-gray-400"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          {modalType === "acuerdo" && (
            <div className="form-field delay-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Descripción</label>
              <textarea
                required
                rows={3}
                placeholder="Detalles del acuerdo..."
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-colorPrimarioJAPEM focus:ring-0 transition-colors text-gray-800 placeholder-gray-400 resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          )}
          <div className="form-field delay-3">
            <label className="block text-sm font-bold text-gray-700 mb-2">Fecha</label>
            <input
              type="date"
              required
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:border-colorPrimarioJAPEM focus:ring-0 transition-colors text-gray-800 [color-scheme:light]"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="pt-4 form-field delay-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-colorPrimarioJAPEM to-[#048066] text-white py-3.5 rounded-xl hover:shadow-lg hover:shadow-colorPrimarioJAPEM/30 transition-all duration-300 font-bold transform active:scale-95 flex justify-center items-center gap-2"
            >
              <span>Guardar</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}