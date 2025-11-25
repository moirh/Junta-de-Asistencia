import { type FC } from "react";
import { Trash2 } from "lucide-react";

interface Reminder {
  id: number;
  title: string;
  date: string;
  done?: boolean;
}

interface ReminderCardProps {
  reminder: Reminder;
  onToggle?: () => void;
  onDelete?: (id: number) => void; // Nueva prop
}

export const ReminderCard: FC<ReminderCardProps> = ({ reminder, onToggle, onDelete }) => (
  <div 
    className={`p-3 rounded-lg shadow-md transition flex justify-between items-center group
      ${reminder.done ? "bg-green-50 border border-green-200 text-green-900" : "bg-yellow-50 border border-yellow-200 text-yellow-900 hover:bg-yellow-100"}
    `}
  >
    <div className="flex-1">
      <h4 className={`font-medium ${reminder.done ? "line-through opacity-70" : ""}`}>
        {reminder.title}
      </h4>
      <span className="text-xs opacity-80">{reminder.date}</span>
    </div>

    <div className="flex items-center gap-3">
      {/* Botón Eliminar */}
      {onDelete && (
        <button 
          onClick={() => onDelete(reminder.id)}
          className="text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {onToggle && (
        <input 
          type="checkbox" 
          checked={!!reminder.done} 
          onChange={onToggle}
          className="w-5 h-5 cursor-pointer accent-blue-600"
        />
      )}
    </div>
  </div>
);