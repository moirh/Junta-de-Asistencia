import { type FC } from "react";
import { Trash2, Bell, Clock, CheckSquare } from "lucide-react";

interface Reminder {
  id: number;
  title: string;
  date: string;
  done?: boolean;
}

interface ReminderCardProps {
  reminder: Reminder;
  onToggle?: () => void;
  onDelete?: (id: number) => void; 
}

export const ReminderCard: FC<ReminderCardProps> = ({ reminder, onToggle, onDelete }) => (
  <div 
    className={`
      group p-4 rounded-xl border transition-all duration-500 hover:-translate-y-1 relative overflow-hidden
      ${reminder.done 
        ? "bg-[#f9fafb] border-[#e5e7eb] opacity-60" 
        : "bg-white border-[#c0c6b6] shadow-sm hover:shadow-md hover:shadow-[#c0c6b6]/40"
      }
    `}
  >
    {/* Barra lateral de estado: Gris Institucional si activo, Gris claro si hecho */}
    <div className={`absolute left-0 top-0 bottom-0 w-1 ${reminder.done ? 'bg-[#c0c6b6]' : 'bg-[#817e7e]'}`}></div>

    <div className="flex items-center justify-between gap-3 pl-2">
      
      {/* Icono y Contenido */}
      <div className="flex items-center gap-3 flex-1 overflow-hidden">
        <div className={`p-2 rounded-lg ${reminder.done ? 'bg-[#e5e7eb] text-[#817e7e]' : 'bg-[#f2f5f0] text-[#817e7e]'}`}>
            <Bell size={20} className={reminder.done ? "" : "fill-current"} />
        </div>
        
        <div className="flex-1 min-w-0">
            <h4 className={`font-bold text-sm truncate ${reminder.done ? "line-through text-[#817e7e]" : "text-[#353131]"}`}>
                {reminder.title}
            </h4>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-[#817e7e]">
                <Clock size={12} />
                <span>{reminder.date}</span>
            </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        {onToggle && (
            <button 
                onClick={onToggle}
                className={`
                    cursor-pointer p-1.5 rounded-md transition-colors
                    ${reminder.done 
                        ? 'text-[#719c44] bg-[#f2f5f0] hover:bg-[#e2e8de]' // Verde Institucional al completar
                        : 'text-[#c0c6b6] hover:text-[#719c44] hover:bg-[#f2f5f0]'
                    }
                `}
                title={reminder.done ? "Marcar como pendiente" : "Marcar como realizado"}
            >
                <CheckSquare size={18} />
            </button>
        )}

        {onDelete && (
            <button 
                onClick={() => onDelete(reminder.id)}
                className="cursor-pointer p-1.5 text-[#c0c6b6] hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                title="Eliminar recordatorio"
            >
                <Trash2 size={18} />
            </button>
        )}
      </div>
    </div>
  </div>
);