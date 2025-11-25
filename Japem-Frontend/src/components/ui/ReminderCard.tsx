import { type FC } from "react";

interface Reminder {
  id: number;
  title: string;
  date: string;
  done?: boolean; // Propiedad opcional para saber si está hecho
}

// Definimos las props que recibe el componente
interface ReminderCardProps {
  reminder: Reminder;
  onToggle?: () => void; // Nueva prop opcional (función)
}

export const ReminderCard: FC<ReminderCardProps> = ({ reminder, onToggle }) => (
  <div 
    className={`p-3 rounded-lg shadow-md transition flex justify-between items-center
      ${reminder.done ? "bg-green-100 text-green-900" : "bg-yellow-100 text-yellow-900 hover:bg-yellow-200"}
    `}
  >
    <div>
      <h4 className={`font-medium ${reminder.done ? "line-through opacity-70" : ""}`}>
        {reminder.title}
      </h4>
      <span className="text-sm opacity-80">{reminder.date}</span>
    </div>

    {/* Botón/Checkbox para marcar como hecho */}
    {onToggle && (
      <input 
        type="checkbox" 
        checked={!!reminder.done} 
        onChange={onToggle}
        className="w-5 h-5 cursor-pointer accent-blue-600"
      />
    )}
  </div>
);