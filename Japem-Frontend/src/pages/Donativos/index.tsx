import { useState } from "react";
import DonantesTable from "./DonantesTable";
import { DonativosTable } from "./DonativosTable";
import { IapTable } from "../Iap/IapTable"; 
import { EntregasView } from "./EntregasView";
import { InventarioTable } from "./InventarioTable"; 
import { Entrega } from "./Entrega";
import { HandHeart, Users, Building2, Package, Share2, Truck } from "lucide-react";

export const Donativos = () => {
  const [activeTab, setActiveTab] = useState<"donantes" | "donativos" | "iaps" | "distribucion" | "entrega" | "inventario">("donantes");

  return (
    // p-2 para reducir el espacio superior como pediste antes
    <div className="min-h-screen bg-gray-50 p-2 font-inter animate-fade-in-up">
      <div className="w-full mx-auto">
        
        {/* Encabezado */}
        <div className="mb-2 text-center">
          <h1 className="text-3xl font-extrabold text-colorPrimarioJAPEM tracking-tight">
            Gestión de Recursos
          </h1>
        </div>

        {/* TABS DE NAVEGACIÓN 
            Agregué 'cursor-pointer' a todos los botones
        */}
        <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 w-fit mb-4 mx-auto">
          
          <button 
            onClick={() => setActiveTab("donantes")} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${activeTab === "donantes" ? "bg-[#719c44] text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <Users size={16} /> Donantes
          </button>

          <button 
            onClick={() => setActiveTab("donativos")} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${activeTab === "donativos" ? "bg-[#719c44] text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <HandHeart size={16} /> Entradas
          </button>

          <button 
            onClick={() => setActiveTab("iaps")} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${activeTab === "iaps" ? "bg-[#719c44] text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <Building2 size={16} /> Instituciones
          </button>

          <button 
            onClick={() => setActiveTab("distribucion")} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${activeTab === "distribucion" ? "bg-[#719c44] text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <Share2 size={16} /> Distribución
          </button>

          <button 
            onClick={() => setActiveTab("entrega")} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${activeTab === "entrega" ? "bg-[#719c44] text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}
          >
            <Truck size={16} /> Entrega
          </button>

          <button 
            onClick={() => setActiveTab("inventario")} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${activeTab === "inventario" ? "bg-[#719c44] text-white shadow" : "text-gray-500 hover:bg-gray-50"}`}
          >
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