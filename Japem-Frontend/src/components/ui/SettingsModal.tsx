import { useState, useEffect } from "react";
import { 
  User, Shield, Save, Plus, Trash2, Lock, Mail, Loader2, XCircle, AtSign, Settings, Edit2 // <--- 1. Agregado Edit2
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { 
  getUsers, createUser, deleteUser, updateProfile, changePassword, getProfile, updateUser // <--- 2. Agregado updateUser
} from "../../services/settingsService"; 

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'usuarios'>('perfil');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // --- ESTADO PERFIL ---
  const [profileData, setProfileData] = useState({ 
      id: 0, name: '', email: '', username: '', role: '', currentPass: '', newPass: '' 
  });
  
  // --- ESTADO USUARIOS ---
  const [users, setUsers] = useState<any[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null); // <--- 3. Nuevo estado para saber si editamos
  const [newUser, setNewUser] = useState({ 
      name: '', username: '', email: '', password: '', role: '' 
  });

  // --- CARGA INICIAL ---
  useEffect(() => {
    if (isOpen) {
        setActiveTab('perfil'); 
        loadMyProfile();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === 'usuarios' && isOpen) {
        if (profileData.role === 'admin') {
            loadUsersList();
        } else {
            setActiveTab('perfil');
        }
    }
  }, [activeTab, isOpen, profileData.role]);


  const loadMyProfile = async () => {
    setDataLoading(true);
    try {
        const data = await getProfile();
        const roleNormalized = (data.role || 'editor').toLowerCase();
        
        setProfileData(prev => ({ 
            ...prev, 
            ...data, 
            role: roleNormalized 
        }));
        
        localStorage.setItem("user", JSON.stringify(data));
    } catch (e) { console.error(e); } 
    finally { setDataLoading(false); }
  };

  const loadUsersList = async () => {
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : (data.data || []));
    } catch (e) { console.error(e); } 
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      if (profileData.name || profileData.email) {
          await updateProfile({ name: profileData.name, email: profileData.email });
          loadMyProfile(); 
      }
      if (profileData.currentPass && profileData.newPass) {
          await changePassword({ current_password: profileData.currentPass, new_password: profileData.newPass });
          setProfileData(prev => ({ ...prev, currentPass: '', newPass: '' }));
      }
      alert("Perfil actualizado correctamente");
    } catch (e: any) { 
      alert("Error: " + (e.response?.data?.message || "Verifique sus datos"));
    } finally { setLoading(false); }
  };

  // --- 4. LÓGICA UNIFICADA (CREAR / EDITAR) ---
  const handleSaveUser = async () => { // Renombrado de handleCreateUser a handleSaveUser
    // Validación: Si editamos, el password es opcional. Si creamos, es obligatorio.
    if(!newUser.username || !newUser.role || (!editingId && !newUser.password)) return alert("Faltan campos");
    
    setLoading(true);
    try {
      if (editingId) {
          // MODO EDICIÓN
          const updated = await updateUser(editingId, newUser);
          // Actualizamos la lista local mapeando
          setUsers(users.map(u => u.id === editingId ? updated.user : u)); // Asumiendo que backend devuelve { user: ... }
          alert("Usuario actualizado");
      } else {
          // MODO CREACIÓN
          const created = await createUser(newUser);
          setUsers([...users, created]);
      }
      
      // Limpieza
      setShowUserForm(false);
      setEditingId(null);
      setNewUser({ name: '', username: '', email: '', password: '', role: '' });
      loadUsersList(); // Recarga por seguridad
    } catch (e: any) { 
        alert("Error: " + (e.response?.data?.message || "Ocurrió un error"));
    } finally { setLoading(false); }
  };

  // --- 5. FUNCIONES AUXILIARES DE EDICIÓN ---
  const startEditing = (user: any) => {
      setNewUser({
          name: user.name,
          username: user.username,
          email: user.email || '',
          role: user.role,
          password: '' // Contraseña vacía al editar (opcional)
      });
      setEditingId(user.id);
      setShowUserForm(true);
  };

  const cancelForm = () => {
      setShowUserForm(false);
      setEditingId(null);
      setNewUser({ name: '', username: '', email: '', password: '', role: '' });
  };

  const handleDeleteUser = async (id: number) => {
    if (id === profileData.id) return alert("No puedes eliminarte a ti mismo.");
    if(!confirm("¿Eliminar?")) return;
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (e) { console.error(e); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuración del Sistema" size="extraLarge" variant="japem" icon={<Settings />}>
        <div className="flex flex-col lg:flex-row h-[550px] bg-white rounded-b-xl overflow-hidden">
            
            {/* --- SIDEBAR --- */}
            <div className="lg:w-64 bg-[#f9fafb] border-r border-[#e5e7eb] p-4 flex flex-col gap-2">
                <button onClick={() => setActiveTab('perfil')} className={`text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'perfil' ? 'bg-[#719c44] text-white' : 'text-[#817e7e] hover:bg-[#e5e7eb]'}`}>
                    <User size={18} /> Mi Perfil
                </button>

                {profileData.role === 'admin' && (
                    <button onClick={() => setActiveTab('usuarios')} className={`text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'usuarios' ? 'bg-[#719c44] text-white' : 'text-[#817e7e] hover:bg-[#e5e7eb]'}`}>
                        <Shield size={18} /> Usuarios
                    </button>
                )}

                <div className="mt-auto pt-4 border-t border-[#e5e7eb]">
                    <div className="flex items-center gap-2 mb-2 px-2">
                          <div className={`w-2 h-2 rounded-full ${profileData.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                          <span className="text-[10px] font-bold text-[#817e7e] uppercase">{profileData.role}</span>
                    </div>
                    <p className="text-[10px] text-center text-[#c0c6b6] uppercase font-bold tracking-widest">JAPEM v1.2.0</p>
                </div>
            </div>

            {/* --- CONTENIDO --- */}
            <div className="flex-1 p-6 overflow-y-auto">
                {dataLoading ? <div className="flex justify-center h-full items-center"><Loader2 className="animate-spin text-[#719c44]"/></div> : (
                <>
                {/* 1. CONTENIDO PERFIL */}
                {activeTab === 'perfil' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-center gap-6 p-4 bg-[#f9fafb] rounded-2xl border border-[#c0c6b6]/50">
                            <div className="w-20 h-20 rounded-full bg-white border-2 border-[#719c44] p-1 shadow-sm overflow-hidden">
                                <img src={`https://ui-avatars.com/api/?name=${profileData.name}&background=719c44&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-[#353131]">{profileData.name}</h3>
                                <div className="flex items-center gap-1.5 text-sm text-[#817e7e]">
                                    <AtSign size={14} className="text-[#719c44]"/> <span className="font-bold text-[#353131]">{profileData.username}</span>
                                </div>
                                <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-bold border ${profileData.role==='admin'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}`}>
                                    Rol: {profileData.role.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#353131] ml-1">Nombre</label>
                                <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full p-2.5 border border-[#c0c6b6] rounded-xl text-sm outline-none focus:border-[#719c44]" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#353131] ml-1">Correo</label>
                                <input type="email" value={profileData.email || ''} onChange={e => setProfileData({...profileData, email: e.target.value})} className="w-full p-2.5 border border-[#c0c6b6] rounded-xl text-sm outline-none focus:border-[#719c44]" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#353131] ml-1">Contraseña Actual</label>
                                <input type="password" value={profileData.currentPass} onChange={e => setProfileData({...profileData, currentPass: e.target.value})} className="w-full p-2.5 border border-[#c0c6b6] rounded-xl text-sm outline-none focus:border-[#719c44]" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#353131] ml-1">Nueva Contraseña</label>
                                <input type="password" value={profileData.newPass} onChange={e => setProfileData({...profileData, newPass: e.target.value})} className="w-full p-2.5 border border-[#c0c6b6] rounded-xl text-sm outline-none focus:border-[#719c44]" />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-[#c0c6b6]/30">
                            <button onClick={handleSaveProfile} disabled={loading} className="bg-[#719c44] hover:bg-[#5e8239] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2">
                                {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} Guardar
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. CONTENIDO USUARIOS */}
                {activeTab === 'usuarios' && profileData.role === 'admin' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 h-full flex flex-col">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-[#353131]">Gestión de Usuarios</h3>
                            {/* Botón Nuevo / Cancelar */}
                            <button onClick={() => showUserForm ? cancelForm() : setShowUserForm(true)} className="text-xs bg-[#719c44] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                                {showUserForm ? <XCircle size={14}/> : <Plus size={14}/>} {showUserForm ? "Cancelar" : "Nuevo"}
                            </button>
                        </div>
                        
                        {/* FORMULARIO UNIFICADO (CREAR / EDITAR) */}
                        {showUserForm && (
                            <div className="bg-[#f2f5f0] p-4 rounded-xl border border-[#c0c6b6] mb-2">
                                <h4 className="text-xs font-bold text-[#719c44] mb-3 uppercase tracking-wider">{editingId ? "Editar Usuario" : "Nuevo Usuario"}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <input type="text" placeholder="Nombre" className="p-2 border rounded-lg text-sm" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                                    <input type="text" placeholder="Username" className="p-2 border rounded-lg text-sm" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                                    <input type="text" placeholder="Email" className="p-2 border rounded-lg text-sm" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                                    <input type="password" placeholder={editingId ? "Pass (Opcional)" : "Pass (Requerido)"} className="p-2 border rounded-lg text-sm" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                                    <div className="md:col-span-2">
                                        <select className="w-full p-2 border rounded-lg text-sm" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                            <option value="">Seleccionar Rol</option>
                                            <option value="admin">Admin</option>
                                            <option value="editor">Editor</option>
                                            <option value="lector">Lector</option>
                                        </select>
                                    </div>
                                </div>
                                <button onClick={handleSaveUser} disabled={loading} className="w-full bg-[#353131] text-white py-2 rounded-lg text-xs font-bold">
                                    {loading ? "Procesando..." : (editingId ? "Guardar Cambios" : "Registrar")}
                                </button>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto border border-[#c0c6b6]/30 rounded-xl">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#f2f5f0] text-[#817e7e] font-bold text-xs uppercase sticky top-0">
                                    <tr><th className="p-3">Usuario</th><th className="p-3">Rol</th><th className="p-3 text-center">Acción</th></tr>
                                </thead>
                                <tbody className="divide-y divide-[#f2f5f0]">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-[#f9fafb]">
                                            <td className="p-3">
                                                <div className="font-bold">{u.name}</div>
                                                <div className="text-xs text-[#719c44] font-medium">@{u.username}</div>
                                            </td>
                                            <td className="p-3"><span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{u.role}</span></td>
                                            <td className="p-3 text-center">
                                                <div className="flex justify-center gap-2">
                                                    {/* Botón Editar */}
                                                    <button onClick={() => startEditing(u)} className="text-gray-400 hover:text-blue-500" title="Editar">
                                                        <Edit2 size={16}/>
                                                    </button>
                                                    {/* Botón Eliminar */}
                                                    {u.id !== profileData.id && (
                                                        <button onClick={() => handleDeleteUser(u.id)} className="text-gray-400 hover:text-red-500" title="Eliminar">
                                                            <Trash2 size={16}/>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                </>
                )}
            </div>
        </div>
    </Modal>
  );
};