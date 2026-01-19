import { type FC, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  // Agregamos la propiedad 'size' opcional
  size?: "normal" | "large" | "extraLarge";
}

export const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children, size = "normal" }) => {
  if (!isOpen) return null;

  // Mapa de tamaños: Aquí definimos qué tan ancho es cada opción
  const widthClasses = {
    normal: "max-w-md",       // Pequeño (Para confirmaciones, mensajes simples)
    large: "max-w-2xl",       // Mediano
    extraLarge: "max-w-7xl",  // ¡GIGANTE! (Perfecto para tu tabla de productos)
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 transition-all">
      
      {/* Usamos 'widthClasses[size]' en lugar de 'max-w-md' fijo */}
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${widthClasses[size]} max-h-[90vh] flex flex-col overflow-hidden animate-fade-in border border-gray-100`}>
        
        {/* Encabezado */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white shrink-0">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Contenido (Con scroll si es muy alto) */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};