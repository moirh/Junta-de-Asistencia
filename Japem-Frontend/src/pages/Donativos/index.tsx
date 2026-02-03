import { useState, useEffect } from "react";
import DonantesTable from "./DonantesTable";
import { DonativosTable } from "./DonativosTable";
import { IapTable } from "../Iap/IapTable"; 
import { EntregasView } from "./EntregasView";
import { InventarioTable } from "./InventarioTable"; 
import { Entrega } from "./Entrega";
import { HandHeart, Users, Building2, Package, Share2, Truck } from "lucide-react";

export const Donativos = () => {
  const [activeTab, setActiveTab] = useState<"donantes" | "donativos" | "iaps" | "distribucion" | "entrega" | "inventario">("donantes");

  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    // --- LÓGICA ROBUSTA DE RECUPERACIÓN DE ROL ---
    
    // 1. Intentamos leer la llave directa 'role'
    let storedRole = localStorage.getItem('role');

    // 2. Si no existe, intentamos leer dentro del objeto 'user' (común en logins de Laravel/Sanctum)
    if (!storedRole) {
        const userStored = localStorage.getItem('user');
        if (userStored) {
            try {
                const userObj = JSON.parse(userStored);
                // Accedemos a la propiedad role dentro del objeto user
                storedRole = userObj.role || userObj.user?.role; 
            } catch (error) {
                console.error("Error al parsear el usuario del storage", error);
            }
        }
    }

    // 3. DEBUG: Abre la consola (F12) para confirmar que ahora sí dice "admin"
    console.log("Rol final detectado en Donativos.tsx:", storedRole);

    // 4. Si después de todo sigue null, asignamos 'lector' por seguridad
    setUserRole(storedRole || 'lector');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-2 font-inter animate-fade-in-up">
      <div className="w-full mx-auto">
        
        {/* Encabezado */}
        <div className="mb-2 text-center">
          <h1 className="text-3xl font-extrabold text-colorPrimarioJAPEM tracking-tight">
            Gestión de Recursos
          </h1>
        </div>

        {/* TABS DE NAVEGACIÓN */}
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
          {activeTab === "donantes" && <DonantesTable userRole={userRole} />}
          
          {/* AQUÍ SE PASA EL ROL CORRECTO AHORA */}
          {activeTab === "donativos" && <DonativosTable userRole={userRole} />}
          
          {activeTab === "iaps" && <IapTable userRole={userRole} />}
          {activeTab === "distribucion" && <EntregasView userRole={userRole} />} 
          {activeTab === "entrega" && <Entrega userRole={userRole} />}
          {activeTab === "inventario" && <InventarioTable userRole={userRole} />}
        </div>
        
      </div>
    </div>
  );
};