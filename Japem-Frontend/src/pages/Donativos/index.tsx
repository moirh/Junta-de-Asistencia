import { useState } from "react";
import { DonantesTable } from "./DonantesTable";
import { DonativosTable } from "./DonativosTable";
import { HandHeart, Users } from "lucide-react"; // Asegúrate de tener estos iconos o usa texto si no

export const Donativos = () => {
  const [activeTab, setActiveTab] = useState<"donantes" | "donativos">("donantes");

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-inter animate-fade-in-up">
      <div className="max-w-7xl mx-auto">
        
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-colorPrimarioJAPEM tracking-tight">
            Gestión de Donativos
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Administra los donantes y el registro de donativos recibidos.
          </p>
        </div>

        {/* Tabs de Navegación */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit mb-8">
          <button
            onClick={() => setActiveTab("donantes")}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
              activeTab === "donantes"
                ? "bg-colorPrimarioJAPEM text-black shadow-md"
                : "text-gray-500 hover:text-colorPrimarioJAPEM hover:bg-gray-50"
            }`}
          >
            <Users className="w-4 h-4" />
            Donantes
          </button>
          <button
            onClick={() => setActiveTab("donativos")}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
              activeTab === "donativos"
                ? "bg-colorPrimarioJAPEM text-black shadow-md"
                : "text-gray-500 hover:text-colorPrimarioJAPEM hover:bg-gray-50"
            }`}
          >
            <HandHeart className="w-4 h-4" />
            Donativos
          </button>
        </div>

        {/* Contenido con transición */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 lg:p-8 animate-fade-in-up delay-100">
          {activeTab === "donantes" ? <DonantesTable /> : <DonativosTable />}
        </div>
      </div>
    </div>
  );
};