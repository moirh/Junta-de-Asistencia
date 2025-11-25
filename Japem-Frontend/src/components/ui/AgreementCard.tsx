import { type FC } from "react";
import { Trash2 } from "lucide-react";

interface Agreement {
  id: number;
  title: string;
  description: string;
  date: string;
}

interface AgreementCardProps {
  agreement: Agreement;
  onDelete?: (id: number) => void;
  onToggle?: () => void; // Nueva propiedad para la palomita
}

export const AgreementCard: FC<AgreementCardProps> = ({ agreement, onDelete, onToggle }) => (
  <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition flex justify-between items-start group">
    
    {/* Contenido del Acuerdo */}
    <div className="flex flex-col gap-2 flex-1 pr-4">
      <h3 className="font-semibold text-gray-800">{agreement.title}</h3>
      <p className="text-sm text-gray-600 line-clamp-2">{agreement.description}</p>
      <span className="text-xs font-medium text-blue-600 bg-blue-50 py-1 px-2 rounded-full w-fit">
        {agreement.date}
      </span>
    </div>

    {/* Botones de Acción */}
    <div className="flex flex-col items-center gap-3 mt-1">
      {/* Palomita (Checkbox) */}
      {onToggle && (
        <input 
          type="checkbox" 
          onChange={onToggle}
          className="w-5 h-5 cursor-pointer accent-blue-600 border-gray-300 rounded focus:ring-blue-500"
          title="Marcar como completado"
        />
      )}

      {/* Botón Eliminar (Basura) */}
      {onDelete && (
        <button 
          onClick={() => onDelete(agreement.id)}
          className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
          title="Eliminar acuerdo"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);