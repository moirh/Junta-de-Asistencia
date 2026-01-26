import { useState, useEffect } from "react";
import { Plus, Eye, User, Package, HandHeart, Trash2, CheckCircle, Barcode, Calendar,Box, Tag, Layers, Hash, AlertTriangle, Clock, Ruler } from "lucide-react";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { getDonativos, createDonativo } from "../../services/donativosService";
import { getDonantes } from "../../services/donantesService";
import type { Donativo, Donante } from "../../types";

export const DonativosTable = () => {
  const [donativos, setDonativos] = useState<Donativo[]>([]);
  const [donantes, setDonantes] = useState<Donante[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDonativo, setSelectedDonativo] = useState<Donativo | null>(null);

  const initialFormState = {
  donante_id: 0,
  fecha_donativo: new Date().toISOString().split('T')[0],
  folio_donativo: "", // <--- AGREGAR ESTO
  monto_total_deducible: 0,
  observaciones: "",
  detalles: [] as any[]
};
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donativosData, donantesData] = await Promise.all([
        getDonativos(),
        getDonantes()
      ]);
      setDonativos(Array.isArray(donativosData) ? donativosData : []);
      setDonantes(Array.isArray(donantesData) ? donantesData : []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const addProductoRow = () => {
    setFormData({
      ...formData,
      detalles: [
        ...formData.detalles,
        {
          clave_sat: "",
          categoria_producto: "",
          nombre_producto: "",
          estado: "Nuevo",
          fecha_caducidad: "",
          modalidad: "",
          clave_unidad: "",
          cantidad: 1,
          precio_venta_unitario: 0,
          precio_venta_total: 0,
          precio_unitario_deducible: 0,
          monto_deducible_total: 0
        }
      ]
    });
  };

  const removeProductoRow = (index: number) => {
    const newDetalles = [...formData.detalles];
    newDetalles.splice(index, 1);
    setFormData({ ...formData, detalles: newDetalles });
  };

  const handleProductChange = (index: number, field: string, value: any) => {
    const newDetalles = [...formData.detalles];
    newDetalles[index][field] = value;

    if (field === 'cantidad' || field === 'precio_venta_unitario') {
      const cant = Number(newDetalles[index].cantidad) || 0;
      const price = Number(newDetalles[index].precio_venta_unitario) || 0;
      newDetalles[index].precio_venta_total = cant * price;
    }
    
    if (field === 'cantidad' || field === 'precio_unitario_deducible') {
      const cant = Number(newDetalles[index].cantidad) || 0;
      const price = Number(newDetalles[index].precio_unitario_deducible) || 0;
      newDetalles[index].monto_deducible_total = cant * price;
    }

    setFormData({ ...formData, detalles: newDetalles });
  };

  const needsExpiration = (categoria: string) => {
    const cat = categoria.toUpperCase();
    return cat.includes("ALIMENT") || cat.includes("MEDICAMENT") || cat.includes("FARMACIA") || cat.includes("PERECEDERO");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.donante_id === 0) { alert("Selecciona un donante"); return; }
    if (formData.detalles.length === 0) { alert("Agrega al menos un producto"); return; }

    try {
      const totalGlobal = formData.detalles.reduce((sum, item) => sum + (item.monto_deducible_total || 0), 0);
      await createDonativo({ ...formData, monto_total_deducible: totalGlobal }); 
      setIsModalOpen(false);
      setFormData(initialFormState);
      fetchData();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar.");
    }
  };


  const columns = [
    { key: "fecha_donativo" as keyof Donativo, label: "Fecha" },
    { key: "donante" as keyof Donativo, label: "Donante" },
    { key: "detalles" as keyof Donativo, label: "Productos (Resumen)" }, 
    { key: "monto_total_deducible" as keyof Donativo, label: "Monto Total" },
    { key: "id" as keyof Donativo, label: "Acciones" },
  ]; 

  return (
    <div className="p-6 animate-fade-in relative w-full max-w-full">
      {/* --- HEADER CORREGIDO --- */}
      {/* 'relative' permite que el botón se posicione absolutamente respecto a este div */}
      <div className="relative flex items-center justify-center mb-8">
        
        {/* 1. TÍTULO EN EL CENTRO */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <HandHeart className="text-purple-600" size={28} />
            Registro de Donativos
          </h1>
          <p className="text-gray-500 mt-1">Gestiona los donativos recibidos e inventario.</p>
        </div>

        {/* 2. BOTÓN PEGADO A LA DERECHA */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg font-bold transform active:scale-95"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nuevo Donante</span>
          </button>
        </div>

      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
           <p className="text-gray-400 font-medium animate-pulse">Cargando registros...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
          <Table
            data={donativos}
            columns={columns}
            renderCell={(key, value, row) => {
              if (key === "fecha_donativo") return <div className="flex items-center gap-2 text-gray-700"><Calendar size={16} className="text-purple-400" /><span className="capitalize">{new Date(value).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</span></div>;
              if (key === "donante") return <span className="font-semibold text-gray-700">{row.donante?.razon_social || "Desconocido"}</span>;
              
              // --- RENDERIZADO DEL RESUMEN DE PRODUCTOS ---
              if (key === "detalles") {
                const detalles = row.detalles || [];
                // Mostramos los primeros 2 productos y un contador si hay más
                const primeros = detalles.slice(0, 2);
                const resto = detalles.length - 2;
                return (
                  <div className="text-sm">
                    {primeros.map((d, i) => (
                      <div key={i} className="flex items-center gap-1 text-gray-600 mb-0.5">
                        <Box size={12} className="text-purple-400"/>
                        <span className="font-medium text-gray-800">{d.nombre_producto}</span>
                        <span className="text-gray-400 text-xs">({d.cantidad} {d.clave_unidad || d.clave_unidad})</span>
                      </div>
                    ))}
                    {resto > 0 && <span className="text-xs text-purple-600 font-semibold">+ {resto} productos más...</span>}
                  </div>
                );
              }

              if (key === "monto_total_deducible") return <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold text-sm border border-green-100">${Number(value).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>;
              if (key === "id") return <button onClick={() => { setSelectedDonativo(row); setIsViewModalOpen(true); }} className="flex items-center gap-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm"><Eye size={18} /> Ver Detalles</button>;
              return value;
            }}
          />
        </div>
      )}

      {/* --- MODAL DE REGISTRO --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Entrada" size="extraLarge">
        <form onSubmit={handleSave} className="space-y-8">
          {/* ... (Esta parte del formulario se mantiene igual que en tu código, solo asegúrate de que esté aquí) ... */}
          {/* DATOS DEL DONANTE */}
          <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
            <h3 className="text-sm font-extrabold text-purple-800 uppercase tracking-wide flex items-center gap-2 mb-4"><User size={18} /> Información del Donante</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Seleccionar Donante *</label>
                <select required className="w-full p-3 border border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-200 outline-none bg-white" value={formData.donante_id} onChange={(e) => setFormData({ ...formData, donante_id: Number(e.target.value) })}>
                  <option value={0}>-- Seleccionar Donante --</option>
                  {donantes.map((d) => <option key={d.id} value={d.id}>{d.razon_social}</option>)}
                </select>
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Fecha Recepción *</label>
                <input type="date" required className="w-full p-3 border border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-200 outline-none" value={formData.fecha_donativo} onChange={(e) => setFormData({ ...formData, fecha_donativo: e.target.value })} />
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Notas / Observaciones</label>
                <input type="text" className="w-full p-3 border border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-200 outline-none" placeholder="Ej. Entregado por chofer..." value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} />
              </div>
            </div>
          </div>

          {/* PRODUCTOS */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-gray-600 uppercase tracking-wide flex items-center gap-2"><Package size={18} /> Inventario a Ingresar</h3>
              <button type="button" onClick={addProductoRow} className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-5 py-2 rounded-xl transition-all font-bold text-sm"><Plus size={16} /> Agregar Fila</button>
            </div>

            {formData.detalles.map((detalle, index) => {
              const showExpiry = needsExpiration(detalle.categoria_producto || "");

              return (
                <div key={index} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative group animate-in slide-in-from-bottom-2 mb-4">
                  <button type="button" onClick={() => removeProductoRow(index)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4 items-start">
                    
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Tag size={12} /> Categoría</label>
                      <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm uppercase focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" 
                        value={detalle.categoria_producto} onChange={(e) => handleProductChange(index, "categoria_producto", e.target.value)}>
                        <option value={0}>-- Seleccionar --</option>
                        <option value="Alimentos">Alimentos</option>
                        <option value="Medicamentos">Medicamentos</option>
                        <option value="Ropa">Ropa</option>
                        <option value="Juguetes">Juguetes</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                        <option value="Otros">Otros</option>
                      </select>
                    </div>

                    <div className="md:col-span-6 space-y-1">
                      <label className="text-xs font-bold text-purple-700 uppercase flex items-center gap-1"><Box size={12} /> Producto Específico</label>
                      <input type="text" placeholder="Ej. ARROZ" className="w-full p-2.5 border-2 border-purple-100 rounded-lg text-sm font-bold text-gray-800 uppercase focus:border-purple-500 outline-none" 
                        value={detalle.nombre_producto} onChange={(e) => handleProductChange(index, "nombre_producto", e.target.value)} />
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Barcode size={12} /> Clave SAT</label>
                      <input type="text" placeholder="Ej. 10101502" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono uppercase focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none" 
                        value={detalle.clave_sat || ""} onChange={(e) => handleProductChange(index, "clave_sat", e.target.value)} />
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><AlertTriangle size={12} /> Estado</label>
                      <select className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                        value={detalle.estado || "Nuevo"} onChange={(e) => handleProductChange(index, "estado", e.target.value)}>
                        <option value="Nuevo">Nuevo</option>
                        <option value="Buen Estado">Buen Estado</option>
                      </select>
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Layers size={12} /> Modalidad</label>
                      <select className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                        value={detalle.modalidad || ""} onChange={(e) => handleProductChange(index, "modalidad", e.target.value)}>
                        <option value={0}>-- Seleccionar --</option>
                        <option value="Redondeo directo IAP">Redondeo directo IAP</option>
                        <option value="Servicio directo Japem">Servicio directo Japem</option>
                        <option value="Recurso directo IAP">Recurso directo IAP</option>
                        <option value="Especie directo IAP">Especie directo IAP</option>
                        <option value="Talento directo IAP">Talento directo IAP</option>  
                        <option value="Redondeo vía Japem">Redondeo vía Japem</option>  
                        <option value="Servicio vía Japem">Servicio vía Japem</option>  
                        <option value="Recurso vía Japem">Recurso vía Japem</option>  
                        <option value="Especie vía Japem">Especie vía Japem</option>  
                        <option value="Talento vía Japem">Talento vía Japem</option>  
                      </select>
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Ruler size={12} /> Unidad de Medida</label>
                      <select className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                        value={detalle.clave_unidad || ""} onChange={(e) => handleProductChange(index, "clave_unidad", e.target.value)}>
                        <option value="PZA">PZA</option>
                        <option value="KG">KG</option>
                        <option value="CAJA">CAJA</option>
                        <option value="BOLSA">BOLSA</option>
                        <option value="PAQUETE">PAQUETE</option>
                        <option value="KIT">KIT</option>
                        <option value="TARIMA">TARIMA</option>
                        <option value="PERSONAS">PERSONAS</option>
                        <option value="PROYECTO">PROYECTO</option>
                        <option value="LITRO">LITRO</option>
                        <option value="BIDÓN">BIDÓN</option>
                        <option value="ROLLO">ROLLO</option>
                        <option value="ANIMAL">ANIMAL</option>
                        <option value="PAR">PAR</option>
                      </select>
                    </div>

                    {showExpiry ? (
                      <div className="md:col-span-3 space-y-1 animate-fade-in">
                        <label className="text-xs font-bold text-red-500 uppercase flex items-center gap-1"><Clock size={12} /> Caducidad *</label>
                        <input type="date" className="w-full p-2.5 border border-red-200 bg-red-50 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none" 
                          value={detalle.fecha_caducidad || ""} onChange={(e) => handleProductChange(index, "fecha_caducidad", e.target.value)} />
                      </div>
                    ) : (
                      <div className="hidden md:block md:col-span-3"></div> 
                    )}

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-purple-700 uppercase flex items-center gap-1"><Hash size={12} /> Cantidad</label>
                      <input type="number" min="1" className="w-full p-2.5 bg-purple-50 border border-purple-200 rounded-lg text-sm font-bold text-center focus:ring-2 focus:ring-purple-500 outline-none" 
                        value={detalle.cantidad} onChange={(e) => handleProductChange(index, "cantidad", e.target.value)} />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">P. Unitario</label>
                      <input type="number" step="0.01" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm" 
                        value={detalle.precio_unitario_deducible || 0} onChange={(e) => handleProductChange(index, "precio_unitario_deducible", e.target.value)} />
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-100 flex justify-end gap-3 z-20">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors">Cancelar</button>
            <button type="submit" className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition-transform transform active:scale-95 flex items-center gap-2"><CheckCircle size={20} /> Guardar Entrada</button>
          </div>
        </form>
      </Modal>

      {/* --- 2. MODAL DETALLES EXPANDIDO (MOSTRAR TODO) --- */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalle Completo del Donativo" size="extraLarge">
         {selectedDonativo && (
          <div className="space-y-8">
            {/* Header Resumen */}
            <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100 grid grid-cols-2 md:grid-cols-4 gap-4">
               <div><p className="text-xs text-gray-500 uppercase font-bold">Donante</p><p className="text-sm font-bold text-gray-800">{selectedDonativo.donante?.razon_social}</p></div>
               <div><p className="text-xs text-gray-500 uppercase font-bold">Fecha</p><p className="text-sm font-medium text-purple-700">{new Date(selectedDonativo.fecha_donativo).toLocaleDateString("es-MX", {dateStyle: 'long'})}</p></div>
               <div><p className="text-xs text-gray-500 uppercase font-bold">Total Deducible</p><p className="text-sm font-bold text-green-600">${Number(selectedDonativo.monto_total_deducible).toLocaleString()}</p></div>
               <div><p className="text-xs text-gray-500 uppercase font-bold">Observaciones</p><p className="text-xs text-gray-600 italic">{selectedDonativo.observaciones || "Sin observaciones"}</p></div>
            </div>

            <button onClick={() => setIsViewModalOpen(false)} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">Cerrar Detalle</button>
          </div>
         )}
      </Modal>
    </div>
  );
};