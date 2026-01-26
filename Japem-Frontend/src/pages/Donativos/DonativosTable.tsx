import { useState, useEffect } from "react";
import { 
  Plus, Eye, User, Package, HandHeart, Trash2, Box, Tag, 
  Calendar, CheckCircle, Barcode, AlertTriangle, Layers, 
  Ruler, Clock, List, Hash 
} from "lucide-react";
import { Table } from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { getDonativos, createDonativo } from "../../services/donativosService";
import { getDonantes } from "../../services/donantesService";
import { getInventario } from "../../services/inventarioService";
import type { Donativo, Donante } from "../../types";

interface ProductoReferencia {
  nombre: string;
  clave_sat: string;
  categoria: string;
  unidad_medida: string;
}

export const DonativosTable = () => {
  const [donativos, setDonativos] = useState<Donativo[]>([]);
  const [donantes, setDonantes] = useState<Donante[]>([]);
  
  const [catalogoReferencias, setCatalogoReferencias] = useState<ProductoReferencia[]>([]); 
  const [loading, setLoading] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDonativo, setSelectedDonativo] = useState<Donativo | null>(null);

  const initialFormState = {
    donante_id: 0,
    fecha_donativo: new Date().toISOString().split('T')[0],
    folio_donativo: "",
    monto_total_deducible: 0,
    observaciones: "",
    detalles: [] as any[]
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchData();
  }, []);

  // --- 1. CARGA DE DATOS Y CONSTRUCCIÓN DE CATÁLOGO ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [donativosData, donantesData, inventarioData] = await Promise.all([
        getDonativos(),
        getDonantes(),
        getInventario()
      ]);
      setDonativos(Array.isArray(donativosData) ? donativosData : []);
      setDonantes(Array.isArray(donantesData) ? donantesData : []);
      
      // --- LÓGICA CORREGIDA PARA EL CATÁLOGO ---
      const mapaUnicos = new Map();

      // Función auxiliar para registrar productos en el mapa
      const registrarProducto = (nombre: string, item: any) => {
         if (!nombre) return;
         // Si ya existe, no lo sobrescribimos (priorizamos el inventario actual si existe)
         if (!mapaUnicos.has(nombre)) {
            mapaUnicos.set(nombre, {
               nombre: nombre,
               clave_sat: item.clave_sat ? String(item.clave_sat) : "",
               categoria: item.categoria_producto || "",
               unidad_medida: item.unidad_medida || item.clave_unidad || "PZA"
            });
         }
      };

      // 1. PRIMERO: Agregamos lo que hay en INVENTARIO (Stock > 0)
      if (Array.isArray(inventarioData)) {
        inventarioData.forEach((item: any) => {
           registrarProducto(item.nombre_producto, item);
        });
      }

      // 2. SEGUNDO (CORRECCIÓN): Agregamos el HISTÓRICO de donativos
      // Esto asegura que si "Arroz" ya no está en inventario, se recupere de aquí.
      if (Array.isArray(donativosData)) {
         donativosData.forEach((d: any) => {
            if (d.detalles && Array.isArray(d.detalles)) {
               d.detalles.forEach((det: any) => {
                  registrarProducto(det.nombre_producto, det);
               });
            }
         });
      }
      
      const referencias = Array.from(mapaUnicos.values()).sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
      setCatalogoReferencias(referencias);

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
          monto_deducible_total: 0,
          isManual: false 
        }
      ]
    });
  };

  const toggleInputMode = (index: number) => {
    const newDetalles = [...formData.detalles];
    newDetalles[index].isManual = !newDetalles[index].isManual;
    if (newDetalles[index].isManual) {
        newDetalles[index].nombre_producto = "";
        newDetalles[index].clave_sat = "";
    }
    setFormData({ ...formData, detalles: newDetalles });
  };

  const removeProductoRow = (index: number) => {
    const newDetalles = [...formData.detalles];
    newDetalles.splice(index, 1);
    setFormData({ ...formData, detalles: newDetalles });
  };

  // --- 2. MANEJO DE CAMBIOS ---
  const handleProductChange = (index: number, field: string, value: any) => {
    const newDetalles = [...formData.detalles];
    newDetalles[index][field] = value;

    if (field === "nombre_producto" && !newDetalles[index].isManual) {
        const productoEncontrado = catalogoReferencias.find(p => p.nombre === value);
        if (productoEncontrado) {
            newDetalles[index].clave_sat = productoEncontrado.clave_sat || "";
            if (productoEncontrado.categoria) newDetalles[index].categoria_producto = productoEncontrado.categoria;
            if (productoEncontrado.unidad_medida) newDetalles[index].clave_unidad = productoEncontrado.unidad_medida;
        }
    }

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
      
      {/* HEADER */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#353131] flex items-center justify-center gap-2">
             <HandHeart className="text-[#719c44]" size={28} />
             Registro de Entradas
          </h1>
          <p className="text-[#817e7e] mt-1">Gestiona los donativos recibidos e inventario.</p>
        </div>
        
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="group bg-[#719c44] hover:bg-[#5e8239] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:shadow-xl shadow-[#719c44]/30 font-bold transition-all duration-300 ease-out transform hover:scale-105 active:scale-95"
          >
            <Plus size={20} className="transition-transform duration-500 group-hover:rotate-180" />
            <span className="hidden sm:inline">Registrar Entrada</span>
          </button>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-[#c0c6b6]/30 animate-pulse">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#719c44] mb-4"></div>
           <p className="text-[#817e7e] font-medium">Cargando registros...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl shadow-[#c0c6b6]/20 border border-[#c0c6b6]/30 overflow-hidden">
          <Table
            data={donativos}
            columns={columns}
            renderCell={(key, value, row) => {
              if (key === "fecha_donativo") return <div className="flex justify-center items-center gap-2 text-[#353131]"><Calendar size={16} className="text-[#719c44]" /><span className="capitalize">{new Date(value).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}</span></div>;
              if (key === "donante") return <div className="font-semibold text-[#353131] text-center">{row.donante?.razon_social || "Desconocido"}</div>;
              if (key === "detalles") {
                const detalles = row.detalles || [];
                const primeros = detalles.slice(0, 2);
                const resto = detalles.length - 2;
                return (
                  <div className="text-sm">
                    {primeros.map((d, i) => (
                      <div key={i} className="flex items-center gap-1 text-[#817e7e] mb-0.5">
                        <Box size={12} className="text-[#c0c6b6]"/>
                        <span className="font-medium text-[#353131]">{d.nombre_producto}</span>
                        <span className="text-[#817e7e] text-xs">({d.cantidad} {d.clave_unidad || d.clave_unidad})</span>
                      </div>
                    ))}
                    {resto > 0 && <span className="text-xs text-[#719c44] font-semibold">+ {resto} productos más...</span>}
                  </div>
                );
              }
              if (key === "monto_total_deducible") return <div className="flex justify-center"><span className="bg-[#f2f5f0] text-[#719c44] px-3 py-1 rounded-full font-bold text-sm border border-[#c0c6b6]">${Number(value).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>;
              if (key === "id") return <div className="flex justify-center"><button onClick={() => { setSelectedDonativo(row); setIsViewModalOpen(true); }} className="flex items-center gap-2 text-[#817e7e] hover:text-[#719c44] hover:bg-[#f2f5f0] px-3 py-1.5 rounded-lg transition-all transform hover:scale-105 font-medium text-sm"><Eye size={18} /> Ver Detalles</button></div>;
              return <div className="text-center">{value}</div>;
            }}
          />
        </div>
      )}

      {/* --- MODAL DE REGISTRO --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Entrada" size="extraLarge" variant="japem" icon={<HandHeart />}>
        <form onSubmit={handleSave} className="space-y-8 p-1">
          
          <div className="bg-[#f2f5f0] p-6 rounded-2xl border border-[#c0c6b6]">
            <h3 className="text-sm font-extrabold text-[#719c44] uppercase tracking-wide flex items-center gap-2 mb-4"><User size={18} /> Información del Donante</h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 space-y-1.5">
                <label className="text-sm font-bold text-[#353131]">Seleccionar Donante *</label>
                <select required className="w-full p-3 border border-[#c0c6b6] rounded-xl focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none bg-white text-[#353131]" value={formData.donante_id} onChange={(e) => setFormData({ ...formData, donante_id: Number(e.target.value) })}>
                  <option value={0}>-- Seleccionar Donante --</option>
                  {donantes.map((d) => <option key={d.id} value={d.id}>{d.razon_social}</option>)}
                </select>
              </div>
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-sm font-bold text-[#353131]">Fecha Recepción *</label>
                <input type="date" required className="w-full p-3 border border-[#c0c6b6] rounded-xl focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none text-[#353131]" value={formData.fecha_donativo} onChange={(e) => setFormData({ ...formData, fecha_donativo: e.target.value })} />
              </div>
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-sm font-bold text-[#353131]">Notas / Observaciones</label>
                <input type="text" className="w-full p-3 border border-[#c0c6b6] rounded-xl focus:ring-4 focus:ring-[#719c44]/20 focus:border-[#719c44] outline-none text-[#353131]" placeholder="Ej. Entregado por chofer..." value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-[#817e7e] uppercase tracking-wide flex items-center gap-2"><Package size={18} /> Inventario a Ingresar</h3>
              <button type="button" onClick={addProductoRow} className="flex items-center gap-2 bg-[#f2f5f0] hover:bg-[#c0c6b6] text-[#353131] px-5 py-2 rounded-xl transition-all font-bold text-sm hover:scale-105 active:scale-95 border border-[#c0c6b6]"><Plus size={16} /> Agregar Fila</button>
            </div>

            {formData.detalles.map((detalle, index) => {
              const showExpiry = needsExpiration(detalle.categoria_producto || "");
              const productosFiltrados = catalogoReferencias.filter(p => 
                 !detalle.categoria_producto || detalle.categoria_producto === "0" || p.categoria === detalle.categoria_producto
              );

              return (
                <div key={index} className="bg-white p-5 rounded-2xl border border-[#c0c6b6] shadow-sm relative group animate-in slide-in-from-bottom-2 mb-4">
                  <button type="button" onClick={() => removeProductoRow(index)} className="absolute top-4 right-4 text-[#c0c6b6] hover:text-red-500 transition-colors"><Trash2 size={20} /></button>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4 items-start">
                    
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs font-bold text-[#817e7e] uppercase flex items-center gap-1"><Tag size={12} /> Categoría</label>
                      <select className="w-full p-2.5 bg-[#f9fafb] border border-[#c0c6b6] rounded-lg text-sm uppercase focus:bg-white focus:ring-2 focus:ring-[#719c44] outline-none text-[#353131]" 
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
                      <label className="text-xs font-bold text-[#719c44] uppercase flex items-center gap-1"><Box size={12} /> Producto Específico</label>
                      <div className="flex gap-2">
                        {!detalle.isManual ? (
                            <select 
                                className="w-full p-2.5 bg-[#f2f5f0] border border-[#c0c6b6] rounded-lg text-sm font-bold text-[#353131] uppercase focus:border-[#719c44] outline-none"
                                value={detalle.nombre_producto} 
                                onChange={(e) => handleProductChange(index, "nombre_producto", e.target.value)}
                            >
                                <option value="">-- Buscar Producto --</option>
                                {productosFiltrados.map((prod, i) => (
                                    <option key={i} value={prod.nombre}>{prod.nombre}</option>
                                ))}
                            </select>
                        ) : (
                            <input 
                                type="text" 
                                placeholder="Nuevo producto..." 
                                className="w-full p-2.5 border-2 border-[#c0c6b6] rounded-lg text-sm font-bold text-[#353131] uppercase focus:border-[#719c44] outline-none animate-fade-in" 
                                value={detalle.nombre_producto} 
                                onChange={(e) => handleProductChange(index, "nombre_producto", e.target.value)} 
                                autoFocus
                            />
                        )}
                        <button 
                            type="button"
                            onClick={() => toggleInputMode(index)}
                            className={`p-2.5 rounded-lg border transition-all ${detalle.isManual ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300' : 'bg-[#719c44] text-white hover:bg-[#5e8239] border-[#719c44]'}`}
                            title={detalle.isManual ? "Ver lista existente" : "Agregar nuevo producto"}
                        >
                            {detalle.isManual ? <List size={18} /> : <Plus size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs font-bold text-[#817e7e] uppercase flex items-center gap-1"><Barcode size={12} /> Clave SAT</label>
                      <input type="text" placeholder="Ej. 10101502" 
                        className={`w-full p-2.5 border border-[#c0c6b6] rounded-lg text-sm font-mono uppercase focus:bg-white focus:ring-2 focus:ring-[#719c44] outline-none text-[#353131] ${!detalle.isManual ? 'bg-[#f9fafb] text-gray-500' : 'bg-white'}`}
                        value={detalle.clave_sat || ""} onChange={(e) => handleProductChange(index, "clave_sat", e.target.value)} 
                        readOnly={!detalle.isManual} 
                      />
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs font-bold text-[#817e7e] uppercase flex items-center gap-1"><AlertTriangle size={12} /> Estado</label>
                      <select className="w-full p-2.5 border border-[#c0c6b6] rounded-lg text-sm focus:ring-2 focus:ring-[#719c44] outline-none bg-white text-[#353131]"
                        value={detalle.estado || "Nuevo"} onChange={(e) => handleProductChange(index, "estado", e.target.value)}>
                        <option value="Nuevo">Nuevo</option>
                        <option value="Buen Estado">Buen Estado</option>
                      </select>
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs font-bold text-[#817e7e] uppercase flex items-center gap-1"><Layers size={12} /> Modalidad</label>
                      <select className="w-full p-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white text-[#353131]" value={detalle.modalidad || ""} onChange={(e) => handleProductChange(index, "modalidad", e.target.value)}>
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
                      <label className="text-xs font-bold text-[#817e7e] uppercase flex items-center gap-1"><Ruler size={12} /> Unidad de Medida</label>
                      <select className="w-full p-2.5 border border-[#c0c6b6] rounded-lg text-sm bg-white text-[#353131]" value={detalle.clave_unidad || ""} onChange={(e) => handleProductChange(index, "clave_unidad", e.target.value)}>
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
                        <input type="date" className="w-full p-2.5 border border-red-200 bg-red-50 rounded-lg text-sm focus:ring-2 focus:ring-red-500 text-[#353131]" value={detalle.fecha_caducidad || ""} onChange={(e) => handleProductChange(index, "fecha_caducidad", e.target.value)} />
                      </div>
                    ) : <div className="hidden md:block md:col-span-3"></div>}

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-[#719c44] uppercase flex items-center gap-1"><Hash size={12} /> Cantidad</label>
                      <input 
                        type="number" 
                        min="1" 
                        className="w-full p-2.5 bg-[#f2f5f0] border border-[#c0c6b6] rounded-lg text-sm font-bold text-center text-[#353131]" 
                        value={detalle.cantidad === 0 ? "" : detalle.cantidad} 
                        onChange={(e) => handleProductChange(index, "cantidad", e.target.value === "" ? 0 : Number(e.target.value))} 
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-[#817e7e] uppercase">P. Unitario</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="w-full p-2.5 border border-[#c0c6b6] rounded-lg text-sm text-[#353131]" 
                        value={detalle.precio_unitario_deducible === 0 ? "" : detalle.precio_unitario_deducible} 
                        onChange={(e) => handleProductChange(index, "precio_unitario_deducible", e.target.value === "" ? 0 : Number(e.target.value))} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sticky bottom-0 bg-white pt-4 border-t border-[#c0c6b6]/30 flex justify-end gap-3 z-20">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-[#817e7e] bg-[#f9fafb] hover:bg-[#f2f5f0] rounded-xl font-bold transition-colors">Cancelar</button>
            <button type="submit" className="px-8 py-3 bg-[#719c44] hover:bg-[#5e8239] text-white font-bold rounded-xl shadow-lg shadow-[#719c44]/30 transition-transform transform active:scale-95 flex items-center gap-2"><CheckCircle size={20} /> Guardar Entrada</button>
          </div>
        </form>
      </Modal>

      {/* --- MODAL DETALLES --- */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalle Completo del Donativo" size="extraLarge" variant="japem">
         {selectedDonativo && (
          <div className="space-y-8 p-1">
            <div className="bg-[#f2f5f0] p-5 rounded-2xl border border-[#c0c6b6] grid grid-cols-2 md:grid-cols-4 gap-4 shadow-sm">
               <div><p className="text-xs text-[#817e7e] uppercase font-bold">Donante</p><p className="text-sm font-bold text-[#353131]">{selectedDonativo.donante?.razon_social}</p></div>
               <div><p className="text-xs text-[#817e7e] uppercase font-bold">Fecha</p><p className="text-sm font-medium text-[#719c44]">{new Date(selectedDonativo.fecha_donativo).toLocaleDateString("es-MX", {dateStyle: 'long'})}</p></div>
               <div><p className="text-xs text-[#817e7e] uppercase font-bold">Total Deducible</p><p className="text-sm font-bold text-[#719c44]">${Number(selectedDonativo.monto_total_deducible).toLocaleString()}</p></div>
               <div><p className="text-xs text-[#817e7e] uppercase font-bold">Observaciones</p><p className="text-xs text-[#817e7e] italic">{selectedDonativo.observaciones || "Sin observaciones"}</p></div>
            </div>
            
            {/* Lista de productos en detalle */}
            <div className="border border-[#c0c6b6]/50 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#f9fafb] text-[#817e7e] font-bold uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">Producto</th>
                            <th className="px-4 py-3">Cant.</th>
                            <th className="px-4 py-3">Unidad</th>
                            <th className="px-4 py-3">P. Unit</th>
                            <th className="px-4 py-3">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f2f5f0]">
                        {selectedDonativo.detalles?.map((det:any, idx:number) => (
                            <tr key={idx} className="hover:bg-[#f2f5f0]">
                                <td className="px-4 py-3 font-medium text-[#353131]">{det.nombre_producto}</td>
                                <td className="px-4 py-3 text-[#353131]">{det.cantidad}</td>
                                <td className="px-4 py-3 text-xs text-[#817e7e]">{det.clave_unidad}</td>
                                <td className="px-4 py-3 text-[#353131]">${Number(det.precio_unitario_deducible).toLocaleString()}</td>
                                <td className="px-4 py-3 font-bold text-[#719c44]">${(Number(det.cantidad) * Number(det.precio_unitario_deducible)).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button onClick={() => setIsViewModalOpen(false)} className="w-full py-3 bg-[#f9fafb] hover:bg-[#f2f5f0] text-[#353131] font-bold rounded-xl transition transform active:scale-95 border border-[#c0c6b6]/30">Cerrar Detalle</button>
          </div>
         )}
      </Modal>
    </div>
  );
};