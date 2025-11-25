import { useEffect, useState } from "react";
import { Header } from "../components/layout/Header";
import { Slider } from "../components/ui/Slider";
import { AgreementCard } from "../components/ui/AgreementCard";
import { ReminderCard } from "../components/ui/ReminderCard";
import { Calendar } from "../components/ui/Calendar";
import { Modal } from "../components/ui/Modal"; // <--- Importamos el Modal
import { Plus } from "lucide-react"; // <--- Icono de más

import {
  getAcuerdos,
  getRecordatorios,
  toggleRecordatorio,
  createAcuerdo, // <--- Nuevas funciones
  createRecordatorio, // <--- Nuevas funciones
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

  // Estados para controlar el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"acuerdo" | "recordatorio" | null>(
    null
  );

  // Estados para los formularios (inputs)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0], // Fecha de hoy por defecto
  });

  // Cargar datos iniciales
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

  // Abrir Modal
  const openModal = (type: "acuerdo" | "recordatorio") => {
    setModalType(type);
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    }); // Reset form
    setIsModalOpen(true);
  };

  // Manejar el envío del formulario (Guardar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === "acuerdo") {
        await createAcuerdo(formData);
      } else {
        // Recordatorio no necesita descripción, pero enviamos lo que hay
        await createRecordatorio({
          title: formData.title,
          date: formData.date,
        });
      }

      // Si todo sale bien: cerramos modal y recargamos datos
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Error al guardar. Revisa la consola.");
      console.error(error);
    }
  };

  const handleToggleReminder = async (id: number, currentStatus: boolean) => {
    try {
      const updated = await toggleRecordatorio(id, !currentStatus);
      setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (error) {
      console.error(error);
    }
  };

  const fechasImportantes = [
    ...acuerdos.map((a) => new Date(a.date)),
    ...reminders.map((r) => new Date(r.date)),
  ];

  return (
    <>
      <Header />
      <div className="w-full overflow-x-hidden bg-gray-50 text-gray-900 min-h-screen">
        <div className="w-full overflow-hidden">
          <Slider />
        </div>

        <div className="w-full px-4 md:px-6 lg:px-10 py-10">
          <div className="flex flex-wrap gap-6 items-stretch w-full">
            {/* --- SECCIÓN ACUERDOS --- */}
            <div className="flex-1 min-w-[350px] bg-white rounded-2xl shadow-md p-6 border border-gray-200 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Acuerdos
                </h2>
                <button
                  onClick={() => openModal("acuerdo")}
                  className="p-2 bg-blue-600 text-black rounded-full hover:bg-blue-700 transition shadow-md"
                  title="Nuevo Acuerdo"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 flex-1 max-h-[500px] overflow-y-auto">
                {loading ? (
                  <p>Cargando...</p>
                ) : (
                  acuerdos.map((a) => (
                    <AgreementCard key={a.id} agreement={a} />
                  ))
                )}
                {!loading && acuerdos.length === 0 && (
                  <p className="text-gray-400 text-center">Sin acuerdos.</p>
                )}
              </div>
            </div>

            {/* --- SECCIÓN RECORDATORIOS --- */}
            <div className="flex-1 min-w-[350px] bg-white rounded-2xl shadow-md p-6 border border-gray-200 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Recordatorios & Calendario
                </h2>
                <button
                  onClick={() => openModal("recordatorio")}
                  className="p-2 bg-yellow-500 text-black rounded-full hover:bg-yellow-600 transition shadow-md"
                  title="Nuevo Recordatorio"
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
      {/* --- MODAL FORMULARIO --- */}
      // ... (resto del código igual)
      {/* --- MODAL FORMULARIO --- */}
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
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
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
                placeholder="Detalles del acuerdo..."
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
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

            {/* CAMBIO AQUÍ: Agregamos '[color-scheme:light]' para forzar el icono oscuro */}
            <input
              type="date"
              required
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 [color-scheme:light]"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-black py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm flex justify-center items-center gap-2"
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
