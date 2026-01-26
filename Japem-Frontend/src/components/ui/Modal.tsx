import { type FC, type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom"; // IMPORTANTE: Importamos esto
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "normal" | "large" | "extraLarge";
  variant?: "simple" | "japem" | "danger";
  icon?: ReactNode; 
}

export const Modal: FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = "normal", 
  variant = "japem", 
  icon 
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimate, setIsAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true); 
      const timer = setTimeout(() => setIsAnimate(true), 50); 
      // Bloquear scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
      return () => clearTimeout(timer);
    } else {
      setIsAnimate(false); 
      const timer = setTimeout(() => {
        setIsMounted(false);
        // Restaurar scroll al cerrar
        document.body.style.overflow = 'unset';
      }, 300); 
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isMounted) return null;

  const widthClasses = {
    normal: "max-w-md",
    large: "max-w-4xl", 
    extraLarge: "max-w-7xl",
  };

  const headerStyles = {
    simple: {
      container: "bg-white border-b border-[#c0c6b6] text-[#353131]",
      closeBtn: "text-[#817e7e] hover:bg-[#f2f5f0] hover:text-[#353131]",
      iconBg: "bg-[#f2f5f0] text-[#719c44]"
    },
    japem: { 
      container: "bg-gradient-to-r from-[#719c44] to-[#8eb563] text-white shadow-md",
      closeBtn: "text-white/80 hover:bg-white/20 hover:text-white",
      iconBg: "bg-white/20 text-white backdrop-blur-sm"
    },
    danger: {
      container: "bg-red-50 border-b border-red-100 text-red-800",
      closeBtn: "text-red-400 hover:bg-red-100 hover:text-red-600",
      iconBg: "bg-red-100 text-red-600"
    },
    purple: { 
      container: "bg-gradient-to-r from-[#719c44] to-[#8eb563] text-white shadow-md",
      closeBtn: "text-white/80 hover:bg-white/20 hover:text-white",
      iconBg: "bg-white/20 text-white backdrop-blur-sm"
    }
  };

  // @ts-ignore
  const activeStyle = headerStyles[variant] || headerStyles.japem;

  // USAMOS createPortal PARA RENDERIZAR FUERA DE LA JERARQUÍA DEL HEADER
  return createPortal(
    <div 
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center p-4 
        bg-[#353131]/60 backdrop-blur-sm 
        transition-opacity duration-300 ease-out
        ${isAnimate ? "opacity-100" : "opacity-0"} 
      `}
    >
      <div 
        className={`
          bg-white rounded-2xl shadow-2xl w-full ${widthClasses[size]} 
          max-h-[95vh] flex flex-col overflow-hidden ring-1 ring-black/5
          transform transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)
          ${isAnimate ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-8"}
        `}
      >
        <div className={`flex justify-between items-center p-5 shrink-0 ${activeStyle.container}`}>
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`p-2 rounded-lg ${activeStyle.iconBg} shadow-sm`}>
                {icon}
              </div>
            )}
            <h3 className="text-xl font-bold leading-tight tracking-tight">{title}</h3>
          </div>

          <button 
            onClick={onClose} 
            className={`p-2 rounded-full transition-all duration-300 transform hover:rotate-90 ${activeStyle.closeBtn}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-0 custom-scrollbar bg-[#f9fafb]">
          <div className="p-6">
             {children}
          </div>
        </div>
      </div>
    </div>,
    document.body // Este es el truco: Renderizamos directamente en el <body>
  );
};