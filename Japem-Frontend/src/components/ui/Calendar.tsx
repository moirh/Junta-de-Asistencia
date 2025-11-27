import { useState, type FC } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// Definimos el tipo de evento que puede recibir el calendario
export interface CalendarEvent {
  date: string;  // Formato 'YYYY-MM-DD'
  title: string;
  type: 'acuerdo' | 'recordatorio';
}

interface CalendarProps {
  events?: CalendarEvent[]; // Ahora recibimos eventos completos, no solo fechas
}

export const Calendar: FC<CalendarProps> = ({ events = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("es-MX", { month: "long" }) || "";
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    setShowTooltip(true);
  };

  const closeTooltip = () => setShowTooltip(false);

  // Filtra los eventos del día seleccionado
  const getEventsForDay = (day: number) => {
    // Creamos el string de fecha local 'YYYY-MM-DD' para comparar
    // Ojo: esto asume que las fechas en 'events' vienen en formato 'YYYY-MM-DD' local
    const dateStr = new Date(year, month, day).toLocaleDateString('en-CA'); // 'en-CA' da formato ISO YYYY-MM-DD
    return events.filter(e => e.date === dateStr);
  };

  // Verifica si un día tiene eventos para poner el puntito
  const hasEvent = (day: number) => {
    return getEventsForDay(day).length > 0;
  };

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="relative bg-white rounded-2xl shadow-md border border-green-200 p-6 w-full transition-all">
      <div className="flex items-center justify-center mb-4">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-blue-100 transition">
          <ChevronLeft className="w-4 h-4 text-green-600" />
        </button>
        <h3 className="text-lg font-semibold capitalize text-green-700 mx-4">
          {monthName} {year}
        </h3>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-blue-100 transition">
          <ChevronRight className="w-4 h-4 text-green-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-sm font-semibold mb-2 text-green-600">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center py-1">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 text-gray-800">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
          const isSelected = selectedDay === day;
          const dayHasEvents = hasEvent(day);

          return (
            <div
              key={day}
              onClick={() => handleSelectDay(day)}
              className={`
                relative aspect-square flex items-center justify-center rounded-lg border text-sm font-medium cursor-pointer transition-all shadow-sm
                ${isToday ? "bg-green-500 text-white border-green-600 shadow-md scale-105" : 
                  isSelected ? "bg-green-200 text-green-800 border-green-300 scale-105" : 
                  "bg-green-50 text-green-900 border-green-100 hover:bg-green-200 hover:border-green-300"}
              `}
            >
              {day}
              {dayHasEvents && !isToday && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              )}
              {dayHasEvents && isToday && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-white rounded-full"></span>
              )}
            </div>
          );
        })}
      </div>

      {/* --- TOOLTIP MEJORADO --- */}
      {showTooltip && selectedDay && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-green-200 rounded-xl shadow-2xl p-4 w-72 text-center z-50 animate-fade-in">
          <div className="flex justify-end">
            <button onClick={closeTooltip} className="text-gray-400 hover:text-gray-600 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <h4 className="text-green-800 font-semibold mb-2 border-b border-gray-100 pb-2">
            {selectedDay} de {monthName}
          </h4>
          
          <div className="max-h-40 overflow-y-auto text-left space-y-2">
            {selectedEvents.length > 0 ? (
              selectedEvents.map((evt, idx) => (
                <div key={idx} className={`text-xs p-2 rounded border ${evt.type === 'acuerdo' ? 'bg-blue-50 border-blue-100 text-green-700' : 'bg-green-50 border-green-100 text-green-800'}`}>
                  <strong>{evt.type === 'acuerdo' ? 'Acuerdo:' : 'Recordatorio:'}</strong> {evt.title}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 py-2 text-center">No hay pendientes para este día.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};