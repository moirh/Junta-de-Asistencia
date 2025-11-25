import { useState, type FC } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// 1. Definimos la interfaz de las props
interface CalendarProps {
  highlightedDates?: Date[]; 
}

// 2. Recibimos la prop en el componente
export const Calendar: FC<CalendarProps> = ({ highlightedDates = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Aseguramos que monthName sea string por si falla toLocaleString en algunos entornos
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

  // Helper para verificar si un día específico tiene evento
  const hasEvent = (day: number) => {
    return highlightedDates.some(d => 
      d.getDate() === day && 
      d.getMonth() === month && 
      d.getFullYear() === year
    );
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-md border border-blue-200 p-6 w-full transition-all">
      {/* Encabezado */}
      <div className="flex items-center justify-center mb-4">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-blue-100 transition">
          <ChevronLeft className="w-4 h-4 text-blue-600" />
        </button>

        <h3 className="text-lg font-semibold capitalize text-blue-700 mx-4">
          {monthName} {year}
        </h3>

        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-blue-100 transition">
          <ChevronRight className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 text-sm font-semibold mb-2 text-blue-600">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-2 text-gray-800">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const isToday = 
            today.getFullYear() === year && 
            today.getMonth() === month && 
            today.getDate() === day;
            
          const isSelected = selectedDay === day;
          const isHighlighted = hasEvent(day); // Verificamos si hay evento

          return (
            <div
              key={day}
              onClick={() => handleSelectDay(day)}
              className={`
                relative aspect-square flex items-center justify-center rounded-lg border text-sm font-medium cursor-pointer transition-all shadow-sm
                ${isToday 
                  ? "bg-blue-500 text-white border-blue-600 shadow-md scale-105" 
                  : isSelected 
                  ? "bg-blue-200 text-blue-800 border-blue-300 scale-105" 
                  : "bg-blue-50 text-blue-900 border-blue-100 hover:bg-blue-200 hover:border-blue-300"}
              `}
            >
              {day}
              
              {/* Indicador visual (puntito) si hay evento */}
              {isHighlighted && !isToday && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              )}
              {isHighlighted && isToday && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-white rounded-full"></span>
              )}
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {showTooltip && selectedDay && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-blue-200 rounded-xl shadow-xl p-4 w-64 text-center z-50 animate-fade-in">
          <div className="flex justify-end">
            <button onClick={closeTooltip} className="text-gray-400 hover:text-gray-600 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <h4 className="text-blue-800 font-semibold mb-2">
            {selectedDay} de {monthName} {year}
          </h4>
          <p className="text-sm text-gray-600">
            {hasEvent(selectedDay) 
              ? "📅 Hay eventos programados para este día." 
              : "No hay recordatorios para este día."}
          </p>
        </div>
      )}
    </div>
  );
};