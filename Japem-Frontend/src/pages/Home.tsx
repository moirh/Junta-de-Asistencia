import { useEffect, useState } from "react";
import { Header } from "../components/layout/Header";
import { Slider } from "../components/ui/Slider";
import { AgreementCard } from "../components/ui/AgreementCard";
import { ReminderCard } from "../components/ui/ReminderCard";
import { Calendar } from "../components/ui/Calendar";
import { Modal } from "../components/ui/Modal";
import { Plus, LayoutDashboard, ListTodo, CalendarDays } from "lucide-react";

import {
  getAcuerdos,
  getRecordatorios,
  toggleRecordatorio,
  toggleAcuerdo, // <--- NUEVO: Importamos la función para acuerdos
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
  const [modalType, setModalType] = useState<"acuerdo" | "recordatorio" | null>(
    null
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [acuerdosData, remindersData] = await Promise.all([
        getAcuerdos(),
        getRecordatorios(),
      ]);
      setAcuerdos(acuerdosData);
      setReminders(remindersData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LÓGICA DE ELIMINAR ---
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

  // --- LÓGICA DE MARCAR COMO HECHO (PALOMITA) ---

  // 1. Para Recordatorios
  const handleToggleReminder = async (id: number, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      if (newStatus === true) {
        // Si se marca completado, se borra
        await toggleRecordatorio(id, true);
        setReminders((prev) => prev.filter((r) => r.id !== id));
      } else {
        const updated = await toggleRecordatorio(id, false);
        setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 2. Para Acuerdos (NUEVO)
  const handleToggleAcuerdo = async (id: number) => {
    try {
      // Al dar click, mandamos true para que el backend lo borre
      await toggleAcuerdo(id, true);
      // Lo quitamos visualmente de la lista
      setAcuerdos((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error al completar acuerdo:", error);
    }
  };

  // --- LÓGICA DEL MODAL ---
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

  // --- ESTADÍSTICAS ---
  const totalAcuerdos = acuerdos.length;
  const recordatoriosPendientes = reminders.filter((r) => !r.done).length;

  const proximosEventos = [...acuerdos, ...reminders]
    .map((e) => new Date(e.date))
    .filter((d) => d >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => a.getTime() - b.getTime());

  const proximaFecha =
    proximosEventos.length > 0
      ? proximosEventos[0].toLocaleDateString("es-MX", {
          day: "numeric",
          month: "short",
        })
      : "Sin eventos";

  const fechasImportantes = [
    ...acuerdos.map((a) => new Date(a.date)),
    ...reminders.map((r) => new Date(r.date)),
  ];

  return (
    <>
      <Header />
      <div className="w-full overflow-x-hidden bg-gray-50 text-gray-900 min-h-screen pb-10">
        <div className="w-full overflow-hidden">
          <Slider />
        </div>

        <div className="w-full px-4 md:px-6 lg:px-10 py-8">
          {/* WIDGETS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Acuerdos</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {totalAcuerdos}
                </h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
                <ListTodo className="w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Pendientes</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {recordatoriosPendientes}
                </h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Próximo Evento</p>
                <h3 className="text-xl font-bold text-gray-800">
                  {proximaFecha}
                </h3>
              </div>
            </div>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div className="flex flex-wrap gap-6 items-stretch w-full">
            {/* SECCIÓN ACUERDOS */}
            <div className="flex-1 min-w-[350px] bg-white rounded-2xl shadow-md p-6 border border-gray-200 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Acuerdos
                </h2>
                <button
                  onClick={() => openModal("acuerdo")}
                  className="p-2 bg-blue-600 text-black rounded-full hover:bg-blue-700 transition shadow-md"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4 flex-1 max-h-[500px] overflow-y-auto">
                {loading ? (
                  <p>Cargando...</p>
                ) : (
                  acuerdos.map((a) => (
                    <AgreementCard
                      key={a.id}
                      agreement={a}
                      onDelete={handleDeleteAcuerdo}
                      onToggle={() => handleToggleAcuerdo(a.id)} // <--- CONECTADO AQUÍ
                    />
                  ))
                )}
                {!loading && acuerdos.length === 0 && (
                  <p className="text-gray-400 text-center">Sin acuerdos.</p>
                )}
              </div>
            </div>

            {/* SECCIÓN RECORDATORIOS */}
            <div className="flex-1 min-w-[350px] bg-white rounded-2xl shadow-md p-6 border border-gray-200 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Recordatorios & Calendario
                </h2>
                <button
                  onClick={() => openModal("recordatorio")}
                  className="p-2 bg-yellow-500 text-black rounded-full hover:bg-yellow-600 transition shadow-md"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4 flex-1">
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <p>Cargando...</p>
                  ) : (
                    reminders.map((r) => (
                      <ReminderCard
                        key={r.id}
                        reminder={r}
                        onToggle={() => handleToggleReminder(r.id, r.done)}
                        onDelete={handleDeleteRecordatorio}
                      />
                    ))
                  )}
                  {!loading && reminders.length === 0 && (
                    <p className="text-gray-400 text-center">
                      Sin recordatorios.
                    </p>
                  )}
                </div>
                <div className="flex justify-center">
                  <Calendar highlightedDates={fechasImportantes} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === "acuerdo" ? "Nuevo Acuerdo" : "Nuevo Recordatorio"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              required
              placeholder="Escribe un título..."
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg outline-none text-gray-900"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          {modalType === "acuerdo" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                required
                rows={3}
                placeholder="Detalles..."
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg outline-none text-gray-900"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              required
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg outline-none text-gray-900 [color-scheme:light]"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
