import { useState, useRef, useEffect, type FC } from "react";
import { createPortal } from "react-dom"; 
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Bell, Settings, LogOut, User, X, Info, 
  CheckCircle, AlertTriangle, AlertCircle, Eye, EyeOff, Calendar, Package
} from "lucide-react";
import axios from "axios";

// Servicios
import { getAcuerdos, getRecordatorios } from "../../services/dashboardService";
import { getInventario } from "../../services/inventarioService";

// Modal
import { SettingsModal } from "../ui/SettingsModal";

// --- TIPOS ---
type NotificationType = 'info' | 'success' | 'warning' | 'danger';

interface Notification {
  id: number;
  originId: number;
  type: NotificationType;
  title: string;
  content: string;
  time: string;
}

// --- UTILIDADES ---
const formatDateLocal = (dateString: string) => {
  if (!dateString) return "";
  const parts = dateString.split("-"); 
  if (parts.length < 3) return dateString;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
};

// --- COMPONENTE NOTIFICACIÓN INDIVIDUAL ---
const NotificationItem = ({ notif, onDismiss }: { notif: Notification; onDismiss: (id: number) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const styles = {
    info: { bg: "bg-blue-50 border-blue-100", iconColor: "text-blue-600", icon: <Info size={16} /> },
    success: { bg: "bg-[#f2f5f0] border-[#c0c6b6]", iconColor: "text-[#719c44]", icon: <CheckCircle size={16} /> },
    warning: { bg: "bg-amber-50 border-amber-100", iconColor: "text-amber-600", icon: <AlertTriangle size={16} /> },
    danger: { bg: "bg-red-50 border-red-100", iconColor: "text-red-600", icon: <AlertCircle size={16} /> }
  };

  const style = styles[notif.type] || styles.info;

  return (
    <div className={`p-3 mb-2 rounded-xl border ${style.bg} transition-all animate-in slide-in-from-right-2`}>
      <div className="flex justify-between items-start gap-3">
        <div className={`mt-0.5 ${style.iconColor} shrink-0`}>{style.icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-[#353131] leading-tight">{notif.title}</h4>
          <span className="text-[10px] text-[#817e7e] flex items-center gap-1 mt-1 font-medium">
             {notif.title.includes('Rotación') ? <Package size={10}/> : <Calendar size={10}/>} 
             {notif.time}
          </span>
          
          <div className={`text-xs text-[#353131]/80 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
            {notif.content}
          </div>

          {notif.content && (
            <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} 
                className="cursor-pointer text-[10px] font-bold text-[#719c44] flex items-center gap-1 mt-1.5 hover:underline focus:outline-none"
            >
                {isExpanded ? <><EyeOff size={10} /> Ver menos</> : <><Eye size={10} /> Ver más</>}
            </button>
          )}
        </div>
        <button onClick={() => onDismiss(notif.id)} className="cursor-pointer text-[#c0c6b6] hover:text-red-400 transition shrink-0 p-1 hover:bg-white/50 rounded-full">
            <X size={14} />
        </button>
      </div>
    </div>
  );
};

// --- HEADER PRINCIPAL ---
export const Header: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    if (token) cargarNotificaciones();
  }, [token]);

  // Lógica de carga completa
  const cargarNotificaciones = async () => {
    setLoadingNotifs(true);
    try {
        const [acuerdosData, recordatoriosData, inventarioData] = await Promise.all([
            getAcuerdos(),
            getRecordatorios(),
            getInventario()
        ]);

        const nuevasNotificaciones: Notification[] = [];
        let idCounter = 1;

        // 1. Alertas de Inventario (Rotación Crítica)
        if (Array.isArray(inventarioData)) {
            inventarioData.forEach((item: any) => {
                const dias = item.dias_en_almacen || 0; 
                if (dias >= 25) {
                    nuevasNotificaciones.push({
                        id: idCounter++, originId: item.id, type: 'danger',
                        title: `Rotación Crítica: ${item.nombre_producto}`,
                        content: `Lleva ${dias} días en almacén. Requiere salida prioritaria.`, 
                        time: 'Alerta Stock'
                    });
                }
            });
        }

        // 2. Recordatorios Pendientes
        if (Array.isArray(recordatoriosData)) {
            recordatoriosData.forEach((rec: any) => {
                if (!rec.done) {
                    const fecha = formatDateLocal(rec.date);
                    nuevasNotificaciones.push({
                        id: idCounter++, originId: rec.id, type: 'warning',
                        title: `Recordatorio: ${rec.title}`, 
                        content: `Tienes este pendiente programado para el ${fecha}.`, 
                        time: fecha
                    });
                }
            });
        }

        // 3. Acuerdos Activos (¡RESTABLECIDO!)
        if (Array.isArray(acuerdosData)) {
            acuerdosData.forEach((acu: any) => {
                const fecha = formatDateLocal(acu.date);
                nuevasNotificaciones.push({
                    id: idCounter++, originId: acu.id, type: 'info',
                    title: `Acuerdo: ${acu.title}`, 
                    content: acu.description || "Sin descripción adicional.", 
                    time: `Vence: ${fecha}`
                });
            });
        }

        // Ordenar por severidad: Peligro -> Advertencia -> Info
        const orden = { danger: 0, warning: 1, info: 2, success: 3 };
        nuevasNotificaciones.sort((a, b) => (orden[a.type] || 99) - (orden[b.type] || 99));

        setNotifications(nuevasNotificaciones);

    } catch (error) { 
        console.error("Error al cargar notificaciones:", error); 
    } finally { 
        setLoadingNotifs(false); 
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dismissNotification = (id: number) => setNotifications(prev => prev.filter(n => n.id !== id));

  const linkClass = (path: string) => `transition-all duration-200 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 ${location.pathname === path ? "bg-[#719c44] text-white shadow-md shadow-[#719c44]/20" : "text-[#353131] hover:bg-[#f2f5f0] hover:text-[#719c44]"}`;

  const handleLogout = async () => {
    try {
      if (token) await axios.post("http://localhost:8000/api/logout", {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) { console.error(error); } 
    finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <>
      {createPortal(
        <header className="fixed top-0 left-0 w-full bg-white/100 z-[60] shadow-md border-b border-[#c0c6b6]/30 backdrop-blur-sm">
            <div className="w-full flex justify-between items-center px-6 py-3">
                <div className="flex items-center space-x-2">
                    <img src="/LogoVerde.jpg" alt="Logo" className="h-10 w-auto object-contain" />
                </div>

                <nav className="hidden md:flex space-x-2">
                    <Link to="/" className={linkClass("/")}>Inicio</Link>
                    {token && (
                        <>
                            <Link to="/donativos" className={linkClass("/donativos")}>Donativos</Link>
                        </>
                    )}
                </nav>

                <div className="flex items-center space-x-3">
                    {token ? (
                        <>
                            <div className="relative" ref={notifRef}>
                                <button 
                                    onClick={() => setIsNotifOpen(!isNotifOpen)} 
                                    className={`cursor-pointer p-2 rounded-full transition relative ${isNotifOpen ? 'bg-[#f2f5f0] text-[#719c44]' : 'bg-transparent hover:bg-[#f2f5f0] text-[#353131]'}`}
                                >
                                    <Bell className="w-5 h-5 stroke-2" />
                                    {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
                                </button>
                                {isNotifOpen && (
                                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#c0c6b6]/50 overflow-hidden z-[70] animate-in zoom-in-95 origin-top-right">
                                        <div className="bg-[#f9fafb] px-4 py-3 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-[#353131] text-sm">Notificaciones</h3>
                                                <span className="bg-[#719c44] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                    {notifications.length}
                                                </span>
                                            </div>
                                            <button onClick={() => setNotifications([])} className="cursor-pointer text-[10px] text-[#817e7e] hover:text-[#719c44] underline font-medium">Limpiar todo</button>
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto p-3 custom-scrollbar bg-white">
                                            {loadingNotifs ? (
                                                <p className="text-center py-4 text-xs text-[#817e7e]">Cargando...</p>
                                            ) : notifications.length === 0 ? (
                                                <p className="text-center py-8 text-xs text-[#817e7e] opacity-60">¡Todo al día!</p>
                                            ) : (
                                                notifications.map(n => <NotificationItem key={n.id} notif={n} onDismiss={dismissNotification} />)
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button onClick={() => setIsConfigOpen(true)} className="cursor-pointer p-2 rounded-full bg-transparent hover:bg-[#f2f5f0] text-[#353131] hover:text-[#719c44] transition">
                                <Settings className="w-5 h-5 stroke-2" />
                            </button>

                            <div className="h-6 w-px bg-[#c0c6b6] mx-2"></div>

                            <button onClick={handleLogout} className="cursor-pointer p-2 rounded-full bg-transparent hover:bg-red-50 text-[#353131] hover:text-red-500 transition flex items-center gap-2" title="Cerrar Sesión">
                                <LogOut className="w-5 h-5 stroke-2" />
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="cursor-pointer flex items-center gap-2 text-sm font-medium text-[#719c44] hover:text-[#5e8239] px-3 py-2 rounded hover:bg-[#f2f5f0] transition">
                            <User className="w-4 h-4" /> Iniciar Sesión
                        </Link>
                    )}
                </div>
            </div>
        </header>,
        document.body
      )}

      <div className="h-[65px] w-full"></div>

      <SettingsModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
      />
    </>
  );
};