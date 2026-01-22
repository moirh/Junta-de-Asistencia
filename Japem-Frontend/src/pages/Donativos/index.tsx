import { useState } from "react";
import DonantesTable from "./DonantesTable";
import { DonativosTable } from "./DonativosTable";
import { IapTable } from "../Iap/IapTable"; 
import { EntregasView } from "./EntregasView";
import { InventarioTable } from "./InventarioTable"; 
import { Entrega } from "./Entrega";
import { HandHeart, Users, Building2, Package, Share2, Truck } from "lucide-react";
export const Donativos = () => {
  // Ahora tenemos 4 tabs
  const [activeTab, setActiveTab] = useState<"donantes" | "donativos" | "iaps" | "distribucion" | "entrega" | "inventario">("donantes");

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-inter animate-fade-in-up">
      <div className="w-full mx-auto">
        
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-colorPrimarioJAPEM tracking-tight">
            Gestión de Recursos
          </h1>
        </div>

        {/* Tabs de Navegación (4 Botones) */}
        <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 w-fit mb-8 mx-auto">
          
          <button onClick={() => setActiveTab("donantes")} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "donantes" ? "bg-colorPrimarioJAPEM text-black shadow" : "text-gray-500 hover:bg-gray-50"}`}>
            <Users size={16} /> Donantes
          </button>

          <button onClick={() => setActiveTab("donativos")} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "donativos" ? "bg-colorPrimarioJAPEM text-black shadow" : "text-gray-500 hover:bg-gray-50"}`}>
            <HandHeart size={16} /> Entradas
          </button>

          <button onClick={() => setActiveTab("iaps")} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "iaps" ? "bg-colorPrimarioJAPEM text-black shadow" : "text-gray-500 hover:bg-gray-50"}`}>
            <Building2 size={16} /> Instituciones
          </button>

          {/* BOTÓN NUEVO: DISTRIBUCIÓN */}
          <button onClick={() => setActiveTab("distribucion")} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "distribucion" ? "bg-purple-600 text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}>
            <Share2 size={16} /> Distribución
          </button>

          <button onClick={() => setActiveTab("entrega")} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "entrega" ? "bg-purple-600 text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}>
            <Truck size={16} /> Entrega
          </button>

          <button onClick={() => setActiveTab("inventario")} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "inventario" ? "bg-purple-600 text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}>
            <Package size={16} /> Inventario
          </button>

        </div>

        {/* Contenido */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 lg:p-8 animate-fade-in-up delay-100 min-h-[500px]">
          {activeTab === "donantes" && <DonantesTable />}
          {activeTab === "donativos" && <DonativosTable />}
          {activeTab === "iaps" && <IapTable />}
          {activeTab === "distribucion" && <EntregasView />} 
          {activeTab === "entrega" && <Entrega />}
          {activeTab === "inventario" && <InventarioTable />}
        </div>
        
      </div>
    </div>
  );
};