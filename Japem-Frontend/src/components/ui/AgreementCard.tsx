import { type FC } from "react";
import { Trash2, Handshake, Calendar, CheckCircle } from "lucide-react";

interface Agreement {
  id: number;
  title: string;
  description: string;
  date: string;
}

interface AgreementCardProps {
  agreement: Agreement;
  onDelete?: (id: number) => void;
  onToggle?: () => void;
}

export const AgreementCard: FC<AgreementCardProps> = ({ agreement, onDelete, onToggle }) => (
  <div className="group bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-emerald-100 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
    
    {/* Decoración de fondo sutil */}
    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>

    <div className="flex items-start gap-4 relative z-10">
      
      {/* Icono Principal */}
      <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
        <Handshake size={24} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-800 text-lg truncate pr-2">{agreement.title}</h3>
            
            {/* Botón Eliminar (Aparece con el grupo) */}
            {onDelete && (
                <button 
                onClick={() => onDelete(agreement.id)}
                className="cursor-pointer text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                title="Eliminar acuerdo"
                >
                <Trash2 size={18} />
                </button>
            )}
        </div>

        <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            {agreement.description}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
            {/* Etiqueta de Fecha */}
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-lg">
                <Calendar size={14} />
                {agreement.date}
            </span>

            {/* Checkbox de Completar */}
            {onToggle && (
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 hover:text-emerald-600 transition-colors">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity font-medium">Completar</span>
                    <div className="relative">
                        <input 
                            type="checkbox" 
                            onChange={onToggle}
                            className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer"
                        />
                        <CheckCircle size={14} className="absolute top-0.5 left-0.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                    </div>
                </label>
            )}
        </div>
      </div>
    </div>
  </div>
);