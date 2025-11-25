import { useEffect, useState } from "react";
import { Header } from "../components/layout/Header";
import { Slider } from "../components/ui/Slider";
import { AgreementCard } from "../components/ui/AgreementCard";
import { ReminderCard } from "../components/ui/ReminderCard";
import { Calendar } from "../components/ui/Calendar";
// Importamos las funciones para pedir datos al backend
import { getAcuerdos, getRecordatorios, toggleRecordatorio } from "../services/dashboardService";

// Definimos los tipos de datos para TypeScript (opcional pero recomendado)
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
  // Estados para guardar la información que viene de la Base de Datos
  const [acuerdos, setAcuerdos] = useState<Agreement[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect: Se ejecuta una sola vez al cargar la página
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Hacemos las dos peticiones en paralelo
        const [acuerdosData, remindersData] = await Promise.all([
          getAcuerdos(),
          getRecordatorios()
        ]);
        
        setAcuerdos(acuerdosData);
        setReminders(remindersData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para marcar un recordatorio como completado/pendiente
  const handleToggleReminder = async (id: number, currentStatus: boolean) => {
    try {
      const updatedReminder = await toggleRecordatorio(id, !currentStatus);
      // Actualizamos el estado local para que se refleje el cambio visualmente
      setReminders(prev => prev.map(r => r.id === id ? updatedReminder : r));
    } catch (error) {
      console.error("Error actualizando recordatorio", error);
    }
  };

  // Generamos la lista de fechas para resaltar en el Calendario
  // Convertimos las fechas string 'YYYY-MM-DD' a objetos Date
  const fechasImportantes = [
    ...acuerdos.map(a => new Date(a.date)),
    ...reminders.map(r => new Date(r.date))
  ];

  return (
    <>
      <Header />

      <div className="w-full overflow-x-hidden bg-gray-50 text-gray-900">
        {/* Slider de ancho completo */}
        <div className="w-full overflow-hidden">
          <Slider />
        </div>

        {/* Contenedor principal tipo dashboard */}
        <div className="w-full px-4 md:px-6 lg:px-10 py-10">
          <div className="flex flex-wrap gap-6 items-stretch w-full">
            
            {/* Recuadro 1: Acuerdos */}
            <div className="flex-1 min-w-[350px] bg-white rounded-2xl shadow-md p-6 border border-gray-200 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Acuerdos</h2>
                {/* Podrías agregar un botón aquí para "Nuevo Acuerdo" */}
              </div>
              
              <div className="space-y-4 flex-1">
                {loading ? (
                  <p className="text-gray-500 text-center">Cargando acuerdos...</p>
                ) : acuerdos.length > 0 ? (
                  acuerdos.map((a) => (
                    <AgreementCard 
                      key={a.id} 
                      agreement={a} 
                    />
                  ))
                ) : (
                  <p className="text-gray-400 text-sm text-center mt-4">No hay acuerdos próximos.</p>
                )}
              </div>
            </div>

            {/* Recuadro 2: Recordatorios & Calendario */}
            <div className="flex-1 min-w-[350px] bg-white rounded-2xl shadow-md p-6 border border-gray-200 flex flex-col">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Recordatorios & Calendario
              </h2>
              <div className="grid md:grid-cols-2 gap-4 flex-1">
                
                {/* Lista de Recordatorios */}
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-gray-500 text-sm">Cargando...</p>
                  ) : reminders.length > 0 ? (
                    reminders.map((r) => (
                      <ReminderCard 
                        key={r.id} 
                        reminder={r}
                        // Asumiendo que tu ReminderCard puede recibir una función onClick
                        onToggle={() => handleToggleReminder(r.id, r.done)}
                      />
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">Sin recordatorios pendientes.</p>
                  )}
                </div>

                {/* Calendario con fechas resaltadas */}
                <div className="flex justify-center">
                    <Calendar highlightedDates={fechasImportantes} />
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}