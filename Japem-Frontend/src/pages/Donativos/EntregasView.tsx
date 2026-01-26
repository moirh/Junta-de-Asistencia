import { useState, useEffect } from "react";
import { Package, ArrowRight, Share2, CheckCircle, AlertCircle } from "lucide-react";
import { Modal } from "../../components/ui/Modal";

// Asegúrate de que estas rutas existan
import { getInventario, type ItemInventario } from "../../services/inventarioService";
import { getSugerenciasMatch, guardarAsignacion } from "../../services/distribucionService";
import { type Iap } from "../../services/iapService";

export const EntregasView = () => {
  // Estado Inventario
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemInventario | null>(null);
  
  // Estado Match
  const [sugerencias, setSugerencias] = useState<Iap[]>([]);
  const [loadingMatch, setLoadingMatch] = useState(false);

  // Estado Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cantidadAAsignar, setCantidadAAsignar] = useState(0);
  const [iapSeleccionada, setIapSeleccionada] = useState<Iap | null>(null);

  useEffect(() => {
    loadInventario();
  }, []);

  const loadInventario = async () => {
    try {
      const data = await getInventario();
      // Filtramos productos con stock positivo
      setInventario(data.filter(i => (i.cantidad || 0) > 0));
    } catch (error) {
      console.error("Error cargando inventario", error);
    }
  };

  const handleSelectProducto = async (item: ItemInventario) => {
    setSelectedItem(item);
    setCantidadAAsignar(1);
    setLoadingMatch(true);
    setSugerencias([]);
    
    try {
      const matches = await getSugerenciasMatch(item.nombre_producto);
      setSugerencias(matches);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMatch(false);
    }
  };

  const handleInitiateAsignacion = (iap: Iap) => {
    setIapSeleccionada(iap);
    setIsModalOpen(true);
  };

  const handleConfirmAsignacion = async () => {
    if (!selectedItem || !iapSeleccionada) return;

    // Validación de Stock
    const stockDisponible = selectedItem.cantidad || 0;
    if (cantidadAAsignar > stockDisponible) {
        alert(`No hay suficiente stock. Disponible: ${stockDisponible}`);
        return;
    }

    try {
      // Preparamos el objeto para enviar
      // IMPORTANTE: Aseguramos que sean números con Number()
      const payload = {
        iap_id: Number(iapSeleccionada.id),
        detalles: [
            {
                inventario_id: Number(selectedItem.id),
                cantidad: Number(cantidadAAsignar)
            }
        ]
      };

      console.log("Enviando payload:", payload); // Para depurar en consola

      await guardarAsignacion(payload);
      
      // Éxito
      alert("¡Asignación guardada correctamente!");
      setIsModalOpen(false);
      setSugerencias([]);
      setSelectedItem(null);
      loadInventario(); 

    } catch (error: any) {
      console.error("Error completo:", error);
      
      // DIAGNÓSTICO DEL ERROR 422
      if (error.response && error.response.data) {
          console.log("Detalles del error backend:", error.response.data);
          // Intentamos mostrar el mensaje específico del servidor si existe
          const serverMessage = error.response.data.message || JSON.stringify(error.response.data);
          alert(`Error de validación (422): ${serverMessage}`);
      } else {
          alert("Error al conectar con el servidor. Revisa la consola.");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full animate-fade-in">
      
      {/* IZQUIERDA: INVENTARIO */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col h-[600px]">
        <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
          <Package className="text-blue-600" /> 
          1. Selecciona un Producto
        </h3>
        <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
           {inventario.map((item, index) => (
             <div 
               // SOLUCIÓN KEY: Usamos item.id O el index como respaldo si el id viene null
               key={item.id || index}
               onClick={() => handleSelectProducto(item)}
               className={`p-3 mb-2 rounded-lg border cursor-pointer transition-all hover:shadow-md flex justify-between items-center
                   ${selectedItem?.id === item.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'border-gray-100 hover:bg-gray-50'}`}
             >
               <div>
                   <p className="font-bold text-gray-800 text-sm">{item.nombre_producto}</p>
                   <p className="text-xs text-gray-500">{item.categoria_producto}</p>
               </div>
               <div className="text-right">
                   <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                       Stock: {item.cantidad}
                   </span>
               </div>
             </div>
           ))}
        </div>
      </div>

      {/* DERECHA: MATCH */}
      <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-gray-300 relative h-[600px] flex flex-col">
        <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
          <Share2 className="text-purple-600" /> 
          2. Sugerencias de Asignación
        </h3>

        {!selectedItem ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ArrowRight size={48} className="mb-2 opacity-20" />
                <p>Selecciona un producto para ver coincidencias</p>
            </div>
        ) : loadingMatch ? (
            <div className="flex flex-col items-center justify-center h-full text-purple-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                <p className="text-sm">Buscando IAPs...</p>
            </div>
        ) : sugerencias.length === 0 ? (
            <div className="p-4 bg-white border border-yellow-200 text-yellow-700 rounded-lg text-center mt-10">
                <AlertCircle className="mx-auto mb-2" />
                <p className="font-bold">Sin coincidencias directas</p>
                <p className="text-sm">Ninguna IAP solicita "{selectedItem.nombre_producto}" explícitamente.</p>
            </div>
        ) : (
            <div className="overflow-y-auto flex-1 space-y-3 pr-2">
                {sugerencias.map((iap, index) => (
                    <div 
                        // SOLUCIÓN KEY: Respaldo con index
                        key={iap.id || index} 
                        className="bg-white p-4 rounded-xl border hover:border-purple-300 transition shadow-sm"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">{iap.nombre_iap}</h4>
                                <p className="text-xs text-gray-500 mt-1">Necesita: {iap.necesidad_primaria}</p>
                            </div>
                            <button 
                                onClick={() => handleInitiateAsignacion(iap)}
                                className="bg-white text-purple-600 border border-purple-200 hover:bg-purple-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                            >
                                Asignar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirmar Asignación">
        <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg text-sm border border-blue-100">
                <p>Producto: <b className="text-blue-700">{selectedItem?.nombre_producto}</b></p>
                <p>Beneficiario: <b className="text-purple-700">{iapSeleccionada?.nombre_iap}</b></p>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Cantidad</label>
                <input 
                    type="number" 
                    min="1"
                    max={selectedItem?.cantidad}
                    value={cantidadAAsignar}
                    onChange={(e) => setCantidadAAsignar(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg font-bold text-lg"
                />
            </div>
            <button 
                onClick={handleConfirmAsignacion}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2"
            >
                <CheckCircle size={20} /> Confirmar
            </button>
        </div>
      </Modal>

    </div>
  );
};