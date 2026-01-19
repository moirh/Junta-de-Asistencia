import { useState, useEffect } from "react";
import { Package, ArrowRight, Truck, CheckCircle, AlertCircle } from "lucide-react";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
// Importamos los servicios que ya creamos
import { getInventario, type ItemInventario } from "../../services/inventarioService";
import { getSugerenciasMatch, realizarEntrega } from "../../services/entregasService";
import { type Iap } from "../../services/iapService";

export const EntregasView = () => {
  // Estado para el Inventario (Izquierda)
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemInventario | null>(null);
  
  // Estado para el Match (Derecha)
  const [sugerencias, setSugerencias] = useState<Iap[]>([]);
  const [loadingMatch, setLoadingMatch] = useState(false);

  // Estado para confirmar entrega
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cantidadAEntregar, setCantidadAEntregar] = useState(0);
  const [iapSeleccionada, setIapSeleccionada] = useState<Iap | null>(null);

  useEffect(() => {
    loadInventario();
  }, []);

  const loadInventario = async () => {
    const data = await getInventario();
    // Solo mostramos lo que tiene stock positivo
    setInventario(data.filter(i => i.stock_actual > 0));
  };

  // 1. Cuando el usuario selecciona un producto del inventario...
  const handleSelectProducto = async (item: ItemInventario) => {
    setSelectedItem(item);
    setCantidadAEntregar(1); // Reset cantidad
    setLoadingMatch(true);
    
    try {
      // 2. ...Llamamos al ALGORITMO DE MATCH
      const matches = await getSugerenciasMatch(item.nombre_producto);
      setSugerencias(matches);
    } catch (error) {
      console.error("Error buscando match", error);
    } finally {
      setLoadingMatch(false);
    }
  };

  // 3. Preparar la entrega
  const handleInitiateEntrega = (iap: Iap) => {
    setIapSeleccionada(iap);
    setIsModalOpen(true);
  };

  // 4. Confirmar y guardar en BD
  const handleConfirmEntrega = async () => {
    if (!selectedItem || !iapSeleccionada) return;

    if (cantidadAEntregar > selectedItem.stock_actual) {
        alert("No tienes suficiente stock");
        return;
    }

    try {
      await realizarEntrega({
        iap_id: iapSeleccionada.id!,
        detalles: [
            {
                nombre_producto: selectedItem.nombre_producto,
                cantidad: cantidadAEntregar
            }
        ]
      });
      
      alert("¡Entrega realizada con éxito!");
      setIsModalOpen(false);
      setSugerencias([]);
      setSelectedItem(null);
      loadInventario(); // Recargamos para ver stock actualizado
    } catch (error) {
      console.error(error);
      alert("Error al registrar la entrega");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      
      {/* PANEL IZQUIERDO: INVENTARIO (OFERTA) */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
          <Package className="text-blue-600" /> 
          1. Selecciona un Producto
        </h3>
        <div className="overflow-y-auto max-h-[500px]">
           {inventario.map((item, idx) => (
             <div 
                key={idx}
                onClick={() => handleSelectProducto(item)}
                className={`p-3 mb-2 rounded-lg border cursor-pointer transition-all hover:shadow-md flex justify-between items-center
                    ${selectedItem?.nombre_producto === item.nombre_producto ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200'}`}
             >
                <div>
                    <p className="font-bold text-gray-800">{item.nombre_producto}</p>
                    <p className="text-xs text-gray-500">{item.categoria_producto}</p>
                </div>
                <div className="text-right">
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                        Stock: {item.stock_actual}
                    </span>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* PANEL DERECHO: MATCH (DEMANDA) */}
      <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-gray-300 relative">
        <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
          <Truck className="text-purple-600" /> 
          2. Sugerencias de Asignación (Match)
        </h3>

        {!selectedItem ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <ArrowRight size={48} className="mb-2 opacity-20" />
                <p>Selecciona un producto de la izquierda para ver quién lo necesita.</p>
            </div>
        ) : loadingMatch ? (
            <div className="text-center py-10">Buscando IAPs compatibles...</div>
        ) : sugerencias.length === 0 ? (
            <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg flex gap-2">
                <AlertCircle />
                <p>No hay IAPs que pidan explícitamente "{selectedItem.nombre_producto}".</p>
            </div>
        ) : (
            <div className="space-y-3">
                <p className="text-sm text-purple-700 font-medium mb-2">
                    Encontramos {sugerencias.length} instituciones candidatas:
                </p>
                {sugerencias.map((iap) => (
                    <div key={iap.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-purple-300 transition">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-gray-800">{iap.nombre_iap}</h4>
                                <div className="flex gap-1 mt-1">
                                    {iap.es_certificada && <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">Certificada</span>}
                                    {iap.tiene_donataria_autorizada && <span className="text-[10px] bg-purple-100 text-purple-700 px-1 rounded">Donataria</span>}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Necesita: <b className="text-gray-700">{iap.necesidad_primaria}</b>
                                </p>
                            </div>
                            <button 
                                onClick={() => handleInitiateEntrega(iap)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow"
                            >
                                Asignar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirmar Entrega">
        <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p>Vas a entregar: <b className="text-blue-700">{selectedItem?.nombre_producto}</b></p>
                <p>A la institución: <b className="text-purple-700">{iapSeleccionada?.nombre_iap}</b></p>
                <p className="text-gray-500 text-xs mt-1">Stock disponible: {selectedItem?.stock_actual}</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad a entregar</label>
                <input 
                    type="number" 
                    min="1"
                    max={selectedItem?.stock_actual}
                    value={cantidadAEntregar}
                    onChange={(e) => setCantidadAEntregar(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg font-bold text-lg"
                />
            </div>

            <button 
                onClick={handleConfirmEntrega}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2 mt-4"
            >
                <CheckCircle size={20} /> Confirmar Salida
            </button>
        </div>
      </Modal>

    </div>
  );
};