import { useState, useEffect } from "react";
import { Package, ArrowRight, CheckCircle, PackageOpen, Star, ShieldCheck, AlertCircle, Info } from "lucide-react";
import axios from "axios"; 
import { Modal } from "../../components/ui/Modal";

import { getInventario, type ItemInventario } from "../../services/inventarioService";
import { guardarAsignacion } from "../../services/distribucionService";

const API_URL = "http://127.0.0.1:8000/api";

export const EntregasView = () => {
  // --- ESTADOS ---
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemInventario | null>(null);
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [loadingMatch, setLoadingMatch] = useState(false);

  // Estado Modal Confirmación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cantidadAAsignar, setCantidadAAsignar] = useState(0);
  const [iapSeleccionada, setIapSeleccionada] = useState<any | null>(null);

  // --- CARGA INICIAL ---
  useEffect(() => {
    loadInventario();
  }, []);

  const loadInventario = async () => {
    try {
      const data = await getInventario();
      setInventario(data.filter(i => (i.cantidad || 0) > 0));
    } catch (error) {
      console.error("Error cargando inventario", error);
    }
  };

  const handleSelectProducto = async (item: ItemInventario) => {
    setSelectedItem(item);
    setCantidadAAsignar(1);
    setIapSeleccionada(null); 
    setSugerencias([]);
    setLoadingMatch(true);

    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/entregas/sugerencias/${item.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        setSugerencias(response.data);
    } catch (error: any) {
        console.error("Error obteniendo sugerencias:", error);
        if (error.response?.status === 401) {
            alert("Tu sesión ha expirado. Por favor inicia sesión de nuevo.");
        }
    } finally {
        setLoadingMatch(false);
    }
  };

  const handleInitiateAsignacion = (iap: any) => {
    setIapSeleccionada(iap);
    setIsModalOpen(true);
  };

  const handleConfirmAsignacion = async () => {
    if (!selectedItem || !iapSeleccionada) return;

    const stockDisponible = selectedItem.cantidad || 0;
    if (cantidadAAsignar > stockDisponible) {
        alert(`No hay suficiente stock. Disponible: ${stockDisponible}`);
        return;
    }

    try {
      const payload = {
        iap_id: Number(iapSeleccionada.id),
        detalles: [
            {
                inventario_id: Number(selectedItem.id),
                cantidad: Number(cantidadAAsignar)
            }
        ]
      };

      await guardarAsignacion(payload);
      
      setIsModalOpen(false);
      setSelectedItem(null); 
      setSugerencias([]);
      loadInventario();      

    } catch (error: any) {
      console.error("Error completo:", error);
      if (error.response && error.response.data) {
          const serverMessage = error.response.data.message || JSON.stringify(error.response.data);
          alert(`Error (422): ${serverMessage}`);
      } else {
          alert("Error al conectar con el servidor.");
      }
    }
  };

  // Mantenemos colores semánticos para las clasificaciones, pero suavizados
  const getBadgeColor = (clasificacion: string) => {
    if (!clasificacion) return "bg-gray-100 text-gray-600";
    const letra = clasificacion.charAt(0);
    if (letra === 'A') return "bg-[#f2f5f0] text-[#719c44] border-[#c0c6b6]"; // Verde Institucional
    if (letra === 'B') return "bg-blue-50 text-blue-700 border-blue-100";
    if (letra === 'C') return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-gray-50 text-gray-600 border-gray-200";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full animate-fade-in p-6">
      
      {/* IZQUIERDA: INVENTARIO */}
      <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-[#c0c6b6]/30 shadow-sm flex flex-col h-[calc(100vh-140px)]">
        <h3 className="font-bold text-[#353131] flex items-center gap-2 mb-4 border-b border-[#f2f5f0] pb-3">
          <Package className="text-[#719c44]" /> 
          1. Inventario Disponible
        </h3>
        <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar space-y-2">
           {inventario.map((item, index) => (
             <div 
               key={item.id || index}
               onClick={() => handleSelectProducto(item)}
               className={`
                  p-3 rounded-xl border cursor-pointer transition-all duration-200 relative group
                  ${selectedItem?.id === item.id 
                    ? 'border-[#719c44] bg-[#f2f5f0] ring-1 ring-[#719c44]/30 shadow-sm' 
                    : 'border-transparent hover:bg-[#f9fafb] hover:border-[#c0c6b6]/50'}
               `}
             >
               <div className="flex justify-between items-start">
                   <div className="flex-1 pr-2">
                       <p className={`font-bold text-sm line-clamp-1 ${selectedItem?.id === item.id ? 'text-[#353131]' : 'text-[#817e7e]'}`}>
                           {item.nombre_producto}
                       </p>
                       <span className="text-[10px] uppercase tracking-wider text-[#817e7e] font-bold bg-[#f9fafb] px-1.5 py-0.5 rounded border border-[#e5e7eb] mt-1 inline-block">
                         {item.categoria_producto}
                       </span>
                   </div>
                   <span className={`text-xs font-bold px-2 py-1 rounded-lg ${selectedItem?.id === item.id ? 'bg-[#719c44] text-white' : 'bg-[#e5e7eb] text-[#817e7e]'}`}>
                       {item.cantidad} {item.unidad_medida}
                   </span>
               </div>
               
               {/* Indicador de selección */}
               {selectedItem?.id === item.id && (
                   <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 bg-[#719c44] text-white p-1 rounded-full shadow-lg animate-in slide-in-from-left-2 z-10">
                       <ArrowRight size={14} />
                   </div>
               )}
             </div>
           ))}
        </div>
      </div>

      {/* DERECHA: SUGERENCIAS INTELIGENTES */}
      <div className="lg:col-span-8 bg-[#f9fafb] p-6 rounded-2xl border border-dashed border-[#c0c6b6] h-[calc(100vh-140px)] flex flex-col overflow-hidden relative">
        
        {!selectedItem ? (
            <div className="flex flex-col items-center justify-center h-full text-[#817e7e] animate-in zoom-in-95 duration-300">
                <div className="bg-white p-6 rounded-full shadow-sm mb-4 border border-[#f2f5f0]">
                    <PackageOpen size={64} className="text-[#c0c6b6]" />
                </div>
                <h3 className="text-lg font-bold text-[#353131]">Selecciona un producto</h3>
                <p className="text-sm">El sistema analizará el padrón para sugerirte la mejor IAP.</p>
            </div>
        ) : loadingMatch ? (
            <div className="flex flex-col items-center justify-center h-full text-[#719c44] animate-pulse">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#719c44] mb-4"></div>
                <p className="font-medium text-[#353131]">Analizando prioridades y necesidades...</p>
            </div>
        ) : sugerencias.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#817e7e]">
                <AlertCircle size={48} className="text-[#c0c6b6] mb-2"/>
                <p className="font-medium text-[#353131]">No se encontraron IAPs candidatas.</p>
                <p className="text-xs max-w-xs text-center mt-1">Verifica que existan instituciones Activas, Certificadas, con Donataria y Padrón.</p>
            </div>
        ) : (
            <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-end mb-4 bg-white p-4 rounded-xl border border-[#c0c6b6]/30 shadow-sm">
                    <div>
                        <h3 className="text-lg font-bold text-[#353131] flex items-center gap-2">
                            <Star className="text-yellow-500 fill-yellow-500" size={20} />
                            Sugerencias para: <span className="text-[#719c44] uppercase">{selectedItem.nombre_producto}</span>
                        </h3>
                        <p className="text-xs text-[#817e7e] mt-1 flex items-center gap-1">
                            <Info size={12}/> Ordenado por: Clasificación &gt; Historial (0 donativos) &gt; Necesidad
                        </p>
                    </div>
                </div>

                <div className="bg-white border border-[#c0c6b6]/30 rounded-xl overflow-hidden shadow-sm flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-[#f2f5f0] text-[#353131] text-xs uppercase font-bold sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 w-16 text-center text-[#719c44]">Rank</th>
                                <th className="p-4">Institución</th>
                                <th className="p-4 text-center">Nivel</th>
                                <th className="p-4 text-center">Historial</th>
                                <th className="p-4">Motivos</th>
                                <th className="p-4 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f2f5f0]">
                            {sugerencias.map((iap, index) => (
                                <tr key={iap.id} className={`group hover:bg-[#f2f5f0] transition-colors ${index === 0 ? 'bg-[#fffff0]' : ''}`}>
                                    <td className="p-4 text-center font-bold text-[#817e7e]">
                                        {index === 0 ? <span className="text-xl drop-shadow-sm">🥇</span> : 
                                         index === 1 ? <span className="text-xl drop-shadow-sm">🥈</span> : 
                                         index === 2 ? <span className="text-xl drop-shadow-sm">🥉</span> : 
                                         `#${index + 1}`}
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold text-[#353131] text-sm">{iap.nombre_iap}</p>
                                        <p className="text-[10px] text-[#817e7e] mt-0.5 uppercase">
                                            Nec. Primaria: <span className="font-medium text-[#719c44]">{iap.necesidad_primaria || "N/A"}</span>
                                        </p>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getBadgeColor(iap.clasificacion)}`}>
                                            {iap.clasificacion || "S/C"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {iap.veces_donado === 0 ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f2f5f0] text-[#719c44] text-[10px] font-bold border border-[#c0c6b6]/50">
                                                <CheckCircle size={10} /> Nuevo
                                            </span>
                                        ) : (
                                            <span className="text-[#817e7e] text-xs font-medium">
                                                {iap.veces_donado}x
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {iap.razones.map((razon: string, i: number) => (
                                                <span key={i} className="text-[10px] text-[#5e6e52] flex items-center gap-1 bg-[#f9fafb] border border-[#c0c6b6] px-2 py-0.5 rounded-full">
                                                    <ShieldCheck size={10} className="text-[#719c44]" />
                                                    {razon}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => handleInitiateAsignacion(iap)}
                                            className="bg-[#719c44] hover:bg-[#5e8239] text-white text-xs px-4 py-2 rounded-lg font-bold transition-all transform active:scale-95 shadow-md hover:shadow-lg opacity-0 group-hover:opacity-100 flex items-center gap-1 mx-auto"
                                        >
                                            Asignar <ArrowRight size={12}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>

      {/* MODAL CONFIRMACIÓN */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirmar Salida de Almacén" variant="japem">
        <div className="space-y-6 p-2">
            <div className="bg-[#f2f5f0] p-5 rounded-xl border border-[#c0c6b6] flex justify-between items-center shadow-sm">
                <div>
                    <p className="text-xs text-[#719c44] font-bold uppercase mb-1 flex items-center gap-1"><ShieldCheck size={12}/> Se entregará a:</p>
                    <p className="text-lg font-bold text-[#353131] leading-tight">{iapSeleccionada?.nombre_iap}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-[#719c44] font-bold uppercase mb-1">Producto:</p>
                    <p className="text-sm font-bold text-[#353131]">{selectedItem?.nombre_producto}</p>
                </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-[#e5e7eb]">
                <label className="block text-sm font-bold text-[#353131] mb-2">Cantidad a Entregar ({selectedItem?.unidad_medida})</label>
                <div className="flex items-center gap-4">
                    <input 
                        type="number" 
                        min="1"
                        max={selectedItem?.cantidad}
                        value={cantidadAAsignar}
                        onChange={(e) => setCantidadAAsignar(Number(e.target.value))}
                        className="flex-1 p-3 border-2 border-[#c0c6b6] rounded-xl font-bold text-2xl text-center text-[#353131] focus:border-[#719c44] outline-none transition-colors bg-[#f9fafb]"
                        autoFocus
                    />
                    <div className="text-right text-xs text-[#817e7e] font-medium min-w-[80px]">
                        Disponible:<br/>
                        <span className="text-lg font-bold text-[#719c44]">{selectedItem?.cantidad}</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleConfirmAsignacion}
                className="w-full bg-[#719c44] hover:bg-[#5e8239] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#719c44]/30 flex justify-center items-center gap-2 transform active:scale-95 transition-all"
            >
                <CheckCircle size={20} /> Confirmar y Generar Vale
            </button>
        </div>
      </Modal>

    </div>
  );
};