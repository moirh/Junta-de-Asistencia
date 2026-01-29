import { useState, type FC, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Handshake, Bell, Calendar as CalendarIcon } from "lucide-react";

export interface CalendarEvent {
  date: string;  // Formato 'YYYY-MM-DD'
  title: string;
  type: 'acuerdo' | 'recordatorio';
}

interface CalendarProps {
  events?: CalendarEvent[];
}

export const Calendar: FC<CalendarProps> = ({ events = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const daysOfWeek = ["D", "L", "M", "M", "J", "V", "S"];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("es-MX", { month: "long" });
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = new Date();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleSelectDay = (day: number) => {
    if (selectedDay === day && showTooltip) {
        setShowTooltip(false);
        setSelectedDay(null);
    } else {
        setSelectedDay(day);
        setShowTooltip(true);
    }
  };

  const getEventsForDay = (day: number) => {
    const dateObj = new Date(year, month, day);
    const yearStr = dateObj.getFullYear();
    const monthStr = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dayStr = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
    
    return events.filter(e => e.date === dateStr);
  };

  const getDayMarkers = (day: number) => {
    const dayEvents = getEventsForDay(day);
    const hasAcuerdo = dayEvents.some(e => e.type === 'acuerdo');
    const hasRecordatorio = dayEvents.some(e => e.type === 'recordatorio');
    return { hasAcuerdo, hasRecordatorio };
  };

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-[#c0c6b6]/30 p-5 w-full h-full flex flex-col">
      
      {/* HEADER DEL CALENDARIO */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold capitalize text-[#353131] flex items-center gap-2">
           <span className="bg-[#f2f5f0] text-[#719c44] p-1.5 rounded-lg border border-[#c0c6b6]/30">
             <CalendarIcon size={18}/>
           </span>
           {monthName} <span className="text-[#817e7e] font-normal">{year}</span>
        </h3>
        <div className="flex gap-1">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[#f2f5f0] text-[#817e7e] hover:text-[#719c44] transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[#f2f5f0] text-[#817e7e] hover:text-[#719c44] transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* DÍAS DE LA SEMANA */}
      <div className="grid grid-cols-7 mb-2">
        {daysOfWeek.map((day, i) => (
          <div key={i} className="text-center text-xs font-bold text-[#c0c6b6] uppercase tracking-wide py-1">
            {day}
          </div>
        ))}
      </div>

      {/* GRID DE DÍAS */}
      <div className="grid grid-cols-7 gap-1 lg:gap-2 flex-1 relative">
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
          const isSelected = selectedDay === day && showTooltip;
          const { hasAcuerdo, hasRecordatorio } = getDayMarkers(day);

          return (
            <div
              key={day}
              onClick={() => handleSelectDay(day)}
              className={`
                relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-bold cursor-pointer transition-all duration-200
                ${isToday 
                    ? "bg-[#719c44] text-white shadow-lg shadow-[#719c44]/20 scale-105 z-10" 
                    : isSelected 
                        ? "bg-[#f2f5f0] text-[#719c44] ring-2 ring-[#719c44] ring-inset" 
                        : "hover:bg-[#f2f5f0] text-[#353131]"
                }
              `}
            >
              <span>{day}</span>
              
              {/* INDICADORES DE EVENTOS */}
              <div className="flex gap-0.5 mt-1 h-1.5">
                {hasAcuerdo && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-[#719c44]'}`}></span>
                )}
                {hasRecordatorio && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : 'bg-orange-500'}`}></span>
                )}
              </div>
            </div>
          );
        })}

        {/* --- TOOLTIP FLOTANTE (ESTILO INSTITUCIONAL) --- */}
        {showTooltip && selectedDay && (
            <div 
                ref={tooltipRef}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 z-20 animate-in zoom-in-95 duration-200"
            >
                <div className="bg-white/98 backdrop-blur-md border border-[#c0c6b6]/50 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5">
                    
                    {/* Header Tooltip */}
                    <div className="bg-[#f2f5f0] px-4 py-3 border-b border-[#c0c6b6]/30 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-[#353131]">
                            {selectedDay} de <span className="capitalize">{monthName}</span>
                        </h4>
                        <button onClick={() => setShowTooltip(false)} className="text-[#c0c6b6] hover:text-red-500 transition">
                            <X size={14} />
                        </button>
                    </div>

                    {/* Lista de Eventos */}
                    <div className="max-h-48 overflow-y-auto p-2 custom-scrollbar">
                        {selectedEvents.length > 0 ? (
                            <div className="space-y-2">
                                {selectedEvents.map((evt, idx) => (
                                    <div key={idx} className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                                        evt.type === 'acuerdo' 
                                            ? 'bg-[#f2f5f0] border-[#c0c6b6]/30' 
                                            : 'bg-orange-50 border-orange-100'
                                    }`}>
                                        <div className={`mt-0.5 ${evt.type === 'acuerdo' ? 'text-[#719c44]' : 'text-orange-500'}`}>
                                            {evt.type === 'acuerdo' ? <Handshake size={14}/> : <Bell size={14}/>}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-[10px] font-bold uppercase tracking-wider ${evt.type === 'acuerdo' ? 'text-[#719c44]' : 'text-orange-800'}`}>
                                                {evt.type === 'acuerdo' ? 'Acuerdo' : 'Recordatorio'}
                                            </p>
                                            <p className="text-xs text-[#353131] font-medium leading-snug break-words">{evt.title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-6 text-center text-[#c0c6b6] flex flex-col items-center">
                                <CalendarIcon size={24} className="mb-2 opacity-20"/>
                                <p className="text-xs font-medium">Sin eventos programados</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};