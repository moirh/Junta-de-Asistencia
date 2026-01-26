import { useState } from "react";
import { 
  User, Database, Shield, Save, Plus, Trash2, 
  List, Tag, Lock, Mail, Camera, Ruler 
} from "lucide-react";
import { Modal } from "../ui/Modal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'catalogos' | 'usuarios'>('perfil');
  const [activeCatalog, setActiveCatalog] = useState<'rubros' | 'categorias' | 'unidades'>('rubros');

  // --- 1. PESTAÑA PERFIL ---
  const ProfileTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        {/* Encabezado del Perfil */}
        <div className="flex items-center gap-6 p-4 bg-[#f9fafb] rounded-2xl border border-[#c0c6b6]/50">
            <div className="relative group cursor-pointer">
                <div className="w-20 h-20 rounded-full bg-white border-2 border-[#719c44] p-1 shadow-sm">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=JapemAdmin" alt="Avatar" className="w-full h-full rounded-full" />
                </div>
                <div className="absolute bottom-0 right-0 bg-[#353131] text-white p-1.5 rounded-full hover:bg-[#719c44] transition-colors">
                    <Camera size={12} />
                </div>
            </div>
            <div>
                <h3 className="font-bold text-lg text-[#353131]">Administrador General</h3>
                <p className="text-sm text-[#817e7e]">admin@japem.gob.mx</p>
                <span className="inline-block mt-2 text-[10px] bg-[#f2f5f0] text-[#719c44] px-2 py-0.5 rounded-full font-bold border border-[#c0c6b6]">
                    Rol: Super Admin
                </span>
            </div>
        </div>

        {/* Formulario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
                <label className="text-xs font-bold text-[#353131] ml-1">Nombre Completo</label>
                <div className="relative">
                    <User size={16} className="absolute left-3 top-3 text-[#c0c6b6]" />
                    <input type="text" defaultValue="Admin JAPEM" className="w-full pl-9 pr-4 py-2.5 border border-[#c0c6b6] rounded-xl text-sm outline-none focus:border-[#719c44] focus:ring-4 focus:ring-[#719c44]/10 transition-all text-[#353131]" />
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold text-[#353131] ml-1">Correo Electrónico</label>
                <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-[#c0c6b6]" />
                    <input type="email" defaultValue="admin@japem.gob.mx" className="w-full pl-9 pr-4 py-2.5 border border-[#c0c6b6] rounded-xl text-sm outline-none focus:border-[#719c44] focus:ring-4 focus:ring-[#719c44]/10 transition-all text-[#353131]" />
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold text-[#353131] ml-1">Contraseña Actual</label>
                <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-[#c0c6b6]" />
                    <input type="password" placeholder="••••••••" className="w-full pl-9 pr-4 py-2.5 border border-[#c0c6b6] rounded-xl text-sm outline-none focus:border-[#719c44] focus:ring-4 focus:ring-[#719c44]/10 transition-all text-[#353131]" />
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-bold text-[#353131] ml-1">Nueva Contraseña</label>
                <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-[#c0c6b6]" />
                    <input type="password" placeholder="••••••••" className="w-full pl-9 pr-4 py-2.5 border border-[#c0c6b6] rounded-xl text-sm outline-none focus:border-[#719c44] focus:ring-4 focus:ring-[#719c44]/10 transition-all text-[#353131]" />
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#c0c6b6]/30">
            <button className="bg-[#719c44] hover:bg-[#5e8239] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-[#719c44]/20 flex items-center gap-2 transition-transform active:scale-95">
                <Save size={18} /> Guardar Perfil
            </button>
        </div>
    </div>
  );

  // --- 2. PESTAÑA CATÁLOGOS ---
  const CatalogsTab = () => {
    const catalogData = {
        rubros: ["Salud", "Educación", "Discapacidad", "Ancianos", "Desarrollo Social"],
        categorias: ["Alimentos", "Medicamentos", "Ropa", "Juguetes", "Mobiliario"],
        unidades: ["PZA", "KG", "LITRO", "CAJA", "PAQUETE", "LOTE"]
    };
    const currentList = catalogData[activeCatalog];

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button onClick={() => setActiveCatalog('rubros')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeCatalog === 'rubros' ? 'bg-[#353131] text-white' : 'bg-[#f2f5f0] text-[#817e7e] hover:bg-[#c0c6b6] hover:text-[#353131]'}`}>
                    <List size={14}/> Rubros IAP
                </button>
                <button onClick={() => setActiveCatalog('categorias')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeCatalog === 'categorias' ? 'bg-[#353131] text-white' : 'bg-[#f2f5f0] text-[#817e7e] hover:bg-[#c0c6b6] hover:text-[#353131]'}`}>
                    <Tag size={14}/> Categorías
                </button>
                <button onClick={() => setActiveCatalog('unidades')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeCatalog === 'unidades' ? 'bg-[#353131] text-white' : 'bg-[#f2f5f0] text-[#817e7e] hover:bg-[#c0c6b6] hover:text-[#353131]'}`}>
                    <Ruler size={14}/> Unidades
                </button>
            </div>

            <div className="bg-[#f9fafb] border border-[#c0c6b6]/50 rounded-xl p-4 flex-1 flex flex-col min-h-0">
                <div className="flex gap-2 mb-4">
                    <input type="text" placeholder={`Agregar a ${activeCatalog}...`} className="flex-1 px-4 py-2.5 border border-[#c0c6b6] rounded-xl text-sm outline-none focus:border-[#719c44] focus:ring-4 focus:ring-[#719c44]/10 text-[#353131]" />
                    <button className="bg-[#719c44] hover:bg-[#5e8239] text-white p-2.5 rounded-xl transition-colors shadow-md"><Plus size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                    {currentList.map((item, idx) => (
                        <div key={idx} className="group flex justify-between items-center bg-white p-3 rounded-xl border border-[#e5e7eb] hover:border-[#719c44] transition-all hover:shadow-sm">
                            <span className="text-sm font-medium text-[#353131] pl-2">{item}</span>
                            <button className="text-[#c0c6b6] hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  };

  // --- 3. PESTAÑA USUARIOS ---
  const UsersTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 h-full flex flex-col">
        <div className="flex justify-between items-center">
            <h3 className="font-bold text-[#353131]">Gestión de Usuarios</h3>
            <button className="text-xs bg-[#719c44] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-[#5e8239] transition">
                <Plus size={14}/> Nuevo
            </button>
        </div>
        <div className="flex-1 overflow-y-auto border border-[#c0c6b6]/30 rounded-xl">
            <table className="w-full text-left text-sm">
                <thead className="bg-[#f2f5f0] text-[#817e7e] font-bold text-xs uppercase sticky top-0">
                    <tr><th className="p-3">Usuario</th><th className="p-3">Rol</th><th className="p-3 text-center">Acción</th></tr>
                </thead>
                <tbody className="divide-y divide-[#f2f5f0]">
                    <tr className="hover:bg-[#f9fafb]">
                        <td className="p-3 font-medium text-[#353131]">admin@japem.gob.mx</td>
                        <td className="p-3"><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-bold text-xs">Admin</span></td>
                        <td className="p-3 text-center text-[#c0c6b6]"><Lock size={14} className="mx-auto"/></td>
                    </tr>
                    <tr className="hover:bg-[#f9fafb]">
                        <td className="p-3 font-medium text-[#353131]">operador@japem.gob.mx</td>
                        <td className="p-3"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold text-xs">Editor</span></td>
                        <td className="p-3 text-center"><button className="text-[#817e7e] hover:text-red-500"><Trash2 size={16} className="mx-auto"/></button></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl flex gap-3 items-start">
            <Shield className="text-yellow-600 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-yellow-800">El rol <strong>Admin</strong> tiene acceso total. Asignar con precaución.</p>
        </div>
    </div>
  );

  return (
    // IMPORTANTE: Asegúrate de que tu componente Modal (ui/Modal.tsx) tenga z-[100]
    <Modal isOpen={isOpen} onClose={onClose} title="Configuración del Sistema" size="extraLarge" variant="japem" icon={<Database />}>
        <div className="flex flex-col lg:flex-row h-[550px] bg-white rounded-b-xl overflow-hidden">
            {/* Sidebar */}
            <div className="lg:w-64 bg-[#f9fafb] border-r border-[#e5e7eb] p-4 flex flex-col gap-2">
                <button onClick={() => setActiveTab('perfil')} className={`text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'perfil' ? 'bg-[#719c44] text-white shadow-md shadow-[#719c44]/20' : 'text-[#817e7e] hover:bg-[#e5e7eb] hover:text-[#353131]'}`}>
                    <User size={18} /> Mi Perfil
                </button>
                <button onClick={() => setActiveTab('catalogos')} className={`text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'catalogos' ? 'bg-[#719c44] text-white shadow-md shadow-[#719c44]/20' : 'text-[#817e7e] hover:bg-[#e5e7eb] hover:text-[#353131]'}`}>
                    <Database size={18} /> Catálogos
                </button>
                <button onClick={() => setActiveTab('usuarios')} className={`text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'usuarios' ? 'bg-[#719c44] text-white shadow-md shadow-[#719c44]/20' : 'text-[#817e7e] hover:bg-[#e5e7eb] hover:text-[#353131]'}`}>
                    <Shield size={18} /> Usuarios
                </button>
                <div className="mt-auto pt-4 border-t border-[#e5e7eb]">
                    <p className="text-[10px] text-center text-[#c0c6b6] uppercase font-bold tracking-widest">JAPEM v1.2.0</p>
                </div>
            </div>
            {/* Contenido */}
            <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'perfil' && <ProfileTab />}
                {activeTab === 'catalogos' && <CatalogsTab />}
                {activeTab === 'usuarios' && <UsersTab />}
            </div>
        </div>
    </Modal>
  );
};