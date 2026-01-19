import { useState, useEffect } from "react";
import { Plus, Eye, User, Package, Trash2, CheckCircle, Barcode, Calendar, DollarSign, Box, Tag, Layers, Hash } from "lucide-react";
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

  // Estado inicial del formulario
  const initialFormState = {
    donante_id: 0,
    fecha_donativo: new Date().toISOString().split('T')[0],
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

    // Auto-cálculos
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.donante_id === 0) {
      alert("Por favor selecciona un donante");
      return;
    }
    if (formData.detalles.length === 0) {
      alert("Debes agregar al menos un producto");
      return;
    }

    try {
      const totalGlobal = formData.detalles.reduce((sum, item) => sum + (item.monto_deducible_total || 0), 0);
      await createDonativo({ ...formData, monto_total_deducible: totalGlobal }); 
      setIsModalOpen(false);
      setFormData(initialFormState);
      fetchData();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar el donativo.");
    }
  };

  const columns = [
    { key: "fecha_donativo" as keyof Donativo, label: "Fecha" },
    { key: "donante" as keyof Donativo, label: "Donante" },
    { key: "observaciones" as keyof Donativo, label: "Observaciones" },
    { key: "categoria_producto" as keyof Donativo, label: "Categoria"},
    { key: "monto_total_deducible" as keyof Donativo, label: "Monto Total" },
    { key: "id" as keyof Donativo, label: "Acciones" },
  ];

  return (
    <div className="p-6 animate-fade-in relative">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Registro de Entradas</h2>
          <p className="text-gray-500 mt-1">Gestiona los donativos recibidos y actualiza tu inventario.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center gap-2 transform active:scale-95"
        >
          <Plus size={20} />
          Nuevo Donativo
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
           <p className="text-gray-400 font-medium">Cargando registros...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
          <Table
            data={donativos}
            columns={columns}
            renderCell={(key, value, row) => {
              if (key === "fecha_donativo") {
                return (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={16} className="text-purple-400" />
                    <span className="capitalize">
                      {new Date(value).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </div>
                );
              }
              if (key === "donante") {
                return (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs">
                        {row.donante?.razon_social?.substring(0,2).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-700">
                      {row.donante?.razon_social || "Desconocido"}
                    </span>
                  </div>
                );
              }
              if (key === "monto_total_deducible") {
                return (
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold text-sm border border-green-100">
                    ${Number(value).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                );
              }
              if (key === "id") {
                return (
                  <button
                    onClick={() => { setSelectedDonativo(row); setIsViewModalOpen(true); }}
                    className="flex items-center gap-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm"
                  >
                    <Eye size={18} /> Ver Detalles
                  </button>
                );
              }
              return value;
            }}
          />
        </div>
      )}

      {/* --- MODAL DE REGISTRO (CON TAMAÑO GIGANTE) --- */}
      <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title="Registrar Entrada"
          size="extraLarge" 
      >
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* SECCIÓN 1: DATOS DEL DONANTE (Horizontal) */}
          <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
            <h3 className="text-sm font-extrabold text-purple-800 uppercase tracking-wide flex items-center gap-2 mb-4">
              <User size={18} /> Información del Donante
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Donante ocupa 5 columnas */}
              <div className="md:col-span-5 space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Seleccionar Donante *</label>
                <select
                  required
                  className="w-full p-3 border border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-200 outline-none bg-white"
                  value={formData.donante_id}
                  onChange={(e) => setFormData({ ...formData, donante_id: Number(e.target.value) })}
                >
                  <option value={0}>-- Buscar en el padrón --</option>
                  {donantes.map((d) => (
                    <option key={d.id} value={d.id}>{d.razon_social} ({d.rfc})</option>
                  ))}
                </select>
              </div>

              {/* Fecha ocupa 3 columnas */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Fecha Recepción *</label>
                <div className="relative">
                    <input
                    type="date"
                    required
                    className="w-full p-3 pl-10 border border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-200 outline-none"
                    value={formData.fecha_donativo}
                    onChange={(e) => setFormData({ ...formData, fecha_donativo: e.target.value })}
                    />
                    <Calendar className="absolute left-3 top-3.5 text-purple-400" size={18} />
                </div>
              </div>

              {/* Observaciones ocupa 4 columnas */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Notas / Observaciones</label>
                <input
                  type="text"
                  className="w-full p-3 border border-purple-200 rounded-xl focus:ring-4 focus:ring-purple-200 outline-none"
                  placeholder="Ej. Entregado por chofer..."
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: PRODUCTOS (TABLA GRANDE) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                <Package size={18} /> Inventario a Ingresar
              </h3>
              <button
                type="button"
                onClick={addProductoRow}
                className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-5 py-2 rounded-xl transition-all font-bold text-sm"
              >
                <Plus size={16} /> 
                Agregar Fila
              </button>
            </div>

            {formData.detalles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                <Package size={48} className="mb-2 opacity-20" />
                <p>No hay productos en esta entrada.</p>
              </div>
            )}

            {formData.detalles.map((detalle, index) => (
              <div key={index} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative group animate-in slide-in-from-bottom-2 mb-4">
                
                <button
                  type="button"
                  onClick={() => removeProductoRow(index)}
                  className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                  title="Eliminar fila"
                >
                  <Trash2 size={20} />
                </button>

                {/* --- GRID DE 12 COLUMNAS (ESPACIOSO) --- */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4 items-start">
                  
                  {/* FILA 1: CATEGORÍA (3) | PRODUCTO (6) | CLAVE SAT (3) */}
                  
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                       <Tag size={12} /> Categoría
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. ALIMENTOS"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm uppercase focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      value={detalle.categoria_producto}
                      onChange={(e) => handleProductChange(index, "categoria_producto", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-6 space-y-1">
                    <label className="text-xs font-bold text-purple-700 uppercase flex items-center gap-1">
                       <Box size={12} /> Producto Específico (Nombre)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. ARROZ BOLSA 1KG"
                      className="w-full p-2.5 border-2 border-purple-100 rounded-lg text-sm font-bold text-gray-800 uppercase focus:border-purple-500 outline-none transition-all"
                      value={detalle.nombre_producto}
                      onChange={(e) => handleProductChange(index, "nombre_producto", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-3 space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                       <Barcode size={12} /> Clave SAT
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 10101502"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono uppercase focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                      value={detalle.clave_sat || ""}
                      onChange={(e) => handleProductChange(index, "clave_sat", e.target.value)}
                    />
                  </div>

                  {/* FILA 2: MODALIDAD (3) | UNIDAD (2) | CANTIDAD (2) | UNITARIO (2) | SUBTOTAL (3) */}

                  <div className="md:col-span-3 space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                       <Layers size={12} /> Modalidad
                    </label>
                    <input
                        type="text"
                        placeholder="Ej. ESPECIE"
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        value={detalle.modalidad || ""}
                        onChange={(e) => handleProductChange(index, "modalidad", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Unidad</label>
                    <input
                      type="text"
                      placeholder="PZA/KG"
                      className="w-full p-2.5 border border-gray-200 rounded-lg text-sm uppercase focus:ring-2 focus:ring-purple-500 outline-none"
                      value={detalle.clave_unidad || ""}
                      onChange={(e) => handleProductChange(index, "clave_unidad", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-purple-700 uppercase flex items-center gap-1">
                        <Hash size={12} /> Cantidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full p-2.5 bg-purple-50 border border-purple-200 rounded-lg text-sm font-bold text-center focus:ring-2 focus:ring-purple-500 outline-none"
                      value={detalle.cantidad}
                      onChange={(e) => handleProductChange(index, "cantidad", e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">P. Unitario</label>
                    <div className="relative">
                        <span className="absolute left-2 top-2.5 text-gray-400 text-xs">$</span>
                        <input
                        type="number"
                        step="0.01"
                        className="w-full p-2.5 pl-5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        value={detalle.precio_unitario_deducible || 0}
                        onChange={(e) => handleProductChange(index, "precio_unitario_deducible", e.target.value)}
                        />
                    </div>
                  </div>

                  <div className="md:col-span-3 space-y-1">
                     <label className="text-xs font-bold text-gray-400 uppercase text-right block">Subtotal</label>
                     <div className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-end gap-1 text-green-700 font-bold text-lg">
                        <DollarSign size={16} />
                        {(Number(detalle.cantidad) * Number(detalle.precio_unitario_deducible || 0)).toFixed(2)}
                     </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-100 flex justify-end gap-3 z-20">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition-transform transform active:scale-95 flex items-center gap-2"
            >
              <CheckCircle size={20} />
              Guardar Entrada
            </button>
          </div>
        </form>
      </Modal>

      {/* --- MODAL 2: VER DETALLES --- */}
      <Modal 
          isOpen={isViewModalOpen} 
          onClose={() => setIsViewModalOpen(false)} 
          title="Detalles del Donativo"
          size="extraLarge"
      >
         {selectedDonativo && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
               <div>
                 <p className="text-xs text-gray-500 uppercase font-bold">Donante</p>
                 <p className="text-lg font-bold text-gray-800">{selectedDonativo.donante?.razon_social}</p>
               </div>
               <div className="text-right">
                 <p className="text-xs text-gray-500 uppercase font-bold">Fecha Recepción</p>
                 <p className="text-lg font-medium text-purple-700">
                    {new Date(selectedDonativo.fecha_donativo).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" })}
                 </p>
               </div>
            </div>

            <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                        <tr>
                            <th className="p-3 text-left">Producto</th>
                            <th className="p-3 text-center">Cant.</th>
                            <th className="p-3 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {selectedDonativo.detalles.map((d, i) => (
                            <tr key={i}>
                                <td className="p-3">
                                    <div className="font-bold text-gray-800">{d.nombre_producto}</div>
                                    <div className="text-xs text-gray-400">{d.clave_sat} • {d.categoria_producto}</div>
                                </td>
                                <td className="p-3 text-center font-medium bg-gray-50">{d.cantidad}</td>
                                <td className="p-3 text-right font-mono text-gray-600">${Number(d.monto_deducible_total).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-purple-50">
                        <tr>
                            <td colSpan={2} className="p-3 text-right font-bold text-purple-800 uppercase text-xs">Total General</td>
                            <td className="p-3 text-right font-bold text-purple-700 text-lg">${Number(selectedDonativo.monto_total_deducible).toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <button onClick={() => setIsViewModalOpen(false)} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition">Cerrar</button>
          </div>
         )}
      </Modal>
    </div>
  );
};