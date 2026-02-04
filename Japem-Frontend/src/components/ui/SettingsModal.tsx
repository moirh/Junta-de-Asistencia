import { useState, useEffect } from "react";
import { 
  User, Shield, Save, Plus, Trash2, Loader2, XCircle, AtSign, Settings, Edit2 
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { 
  getUsers, createUser, deleteUser, updateProfile, changePassword, getProfile, updateUser 
} from "../../services/settingsService"; 
import Swal from 'sweetalert2'; // <--- Importamos SweetAlert

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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newUser, setNewUser] = useState({ 
      name: '', username: '', email: '', password: '', role: '' 
  });

  // --- DEFINICIÓN DE PERMISOS (RBAC) ---
  const role = profileData.role; 
  const isSuperAdmin = role === 'superadmin';
  const isAdmin = role === 'admin';
  
  const canViewUsers = isSuperAdmin || isAdmin;
  const canCreateUser = isSuperAdmin;
  const canDeleteUser = isSuperAdmin;

  // --- CARGA INICIAL ---
  useEffect(() => {
    if (isOpen) {
        setActiveTab('perfil'); 
        loadMyProfile();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === 'usuarios' && isOpen) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentRole = profileData.role || storedUser.role;

        if (currentRole !== 'admin' && currentRole !== 'superadmin') {
            setActiveTab('perfil');
        } else {
            loadUsersList();
        }
    }
  }, [activeTab, isOpen, profileData.role]);


  const loadMyProfile = async () => {
    setDataLoading(true);
    try {
        const data = await getProfile();
        const roleNormalized = (data.role || 'lector').toLowerCase(); 
        
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
      
      Swal.fire({
        title: '¡Perfil Actualizado!',
        text: 'Tus datos se han guardado correctamente.',
        icon: 'success',
        confirmButtonColor: '#719c44',
        confirmButtonText: 'Aceptar'
      });

    } catch (e: any) { 
      Swal.fire({
        title: 'Error',
        text: e.response?.data?.message || "Verifique sus datos e intente nuevamente.",
        icon: 'error',
        confirmButtonColor: '#353131'
      });
    } finally { setLoading(false); }
  };

  // --- LÓGICA UNIFICADA (CREAR / EDITAR) ---
  const handleSaveUser = async () => { 
    if(!newUser.username || !newUser.role || (!editingId && !newUser.password)) {
        Swal.fire('Campos incompletos', 'Por favor llena todos los campos obligatorios.', 'warning');
        return;
    }
    
    if (!editingId && !canCreateUser) {
        Swal.fire('Acceso Denegado', 'Solo el Superadmin puede crear usuarios.', 'error');
        return;
    }
    
    setLoading(true);
    try {
      if (editingId) {
          // EDITAR
          const updated = await updateUser(editingId, newUser);
          setUsers(users.map(u => u.id === editingId ? updated.user : u)); 
          
          Swal.fire({
            title: '¡Usuario Actualizado!',
            text: 'Los cambios se guardaron exitosamente.',
            icon: 'success',
            confirmButtonColor: '#719c44'
          });

      } else {
          // CREAR
          const created = await createUser(newUser);
          setUsers([...users, created]);

          Swal.fire({
            title: '¡Usuario Creado!',
            text: 'El nuevo usuario ha sido registrado.',
            icon: 'success',
            confirmButtonColor: '#719c44'
          });
      }
      
      setShowUserForm(false);
      setEditingId(null);
      setNewUser({ name: '', username: '', email: '', password: '', role: '' });
      loadUsersList(); 
    } catch (e: any) { 
        Swal.fire({
            title: 'Error',
            text: e.response?.data?.message || "Ocurrió un error al procesar la solicitud.",
            icon: 'error',
            confirmButtonColor: '#353131'
        });
    } finally { setLoading(false); }
  };

  const startEditing = (user: any) => {
      setNewUser({
          name: user.name,
          username: user.username,
          email: user.email || '',
          role: user.role,
          password: '' 
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
    if (!canDeleteUser) {
        Swal.fire('Acceso Denegado', 'Solo el Superadmin puede eliminar usuarios.', 'error');
        return;
    }

    if (id === profileData.id) {
        Swal.fire('Acción no permitida', 'No puedes eliminarte a ti mismo.', 'warning');
        return;
    }

    // Confirmación con SweetAlert
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "El usuario será eliminado permanentemente y perderá el acceso.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            await deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
            
            Swal.fire({
                title: '¡Eliminado!',
                text: 'El usuario ha sido eliminado correctamente.',
                icon: 'success',
                confirmButtonColor: '#719c44'
            });

        } catch (e) { 
            console.error(e);
            Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
        }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuración del Sistema" size="extraLarge" variant="japem" icon={<Settings />}>
        <div className="flex flex-col lg:flex-row h-[550px] bg-white rounded-b-xl overflow-hidden">
            
            {/* --- SIDEBAR --- */}
            <div className="lg:w-64 bg-[#f9fafb] border-r border-[#e5e7eb] p-4 flex flex-col gap-2">
                <button onClick={() => setActiveTab('perfil')} className={`text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'perfil' ? 'bg-[#719c44] text-white' : 'text-[#817e7e] hover:bg-[#e5e7eb]'}`}>
                    <User size={18} /> Mi Perfil
                </button>

                {canViewUsers && (
                    <button onClick={() => setActiveTab('usuarios')} className={`text-left px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'usuarios' ? 'bg-[#719c44] text-white' : 'text-[#817e7e] hover:bg-[#e5e7eb]'}`}>
                        <Shield size={18} /> Usuarios
                    </button>
                )}

                <div className="mt-auto pt-4 border-t border-[#e5e7eb]">
                    <div className="flex items-center gap-2 mb-2 px-2">
                          <div className={`w-2 h-2 rounded-full ${isSuperAdmin ? 'bg-purple-600' : 'bg-blue-500'}`}></div>
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
                                <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-bold border ${isSuperAdmin?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}`}>
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
                            <button onClick={handleSaveProfile} disabled={loading} className="cursor-pointer bg-[#719c44] hover:bg-[#5e8239] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition transform active:scale-95">
                                {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} Guardar
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. CONTENIDO USUARIOS */}
                {activeTab === 'usuarios' && canViewUsers && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 h-full flex flex-col">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-[#353131]">Gestión de Usuarios</h3>
                            
                            {canCreateUser && (
                                <button onClick={() => showUserForm ? cancelForm() : setShowUserForm(true)} className="cursor-pointer text-xs bg-[#719c44] hover:bg-[#5e8239] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition shadow-md">
                                    {showUserForm ? <XCircle size={14}/> : <Plus size={14}/>} {showUserForm ? "Cancelar" : "Nuevo"}
                                </button>
                            )}
                        </div>
                        
                        {showUserForm && (
                            <div className="bg-[#f2f5f0] p-4 rounded-xl border border-[#c0c6b6] mb-2 shadow-sm animate-in slide-in-from-top-2">
                                <h4 className="text-xs font-bold text-[#719c44] mb-3 uppercase tracking-wider">{editingId ? "Editar Usuario" : "Nuevo Usuario"}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <input type="text" placeholder="Nombre" className="p-2 border rounded-lg text-sm" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                                    <input type="text" placeholder="Username" className="p-2 border rounded-lg text-sm" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                                    <input type="text" placeholder="Email" className="p-2 border rounded-lg text-sm" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                                    <input type="password" placeholder={editingId ? "Pass (Opcional)" : "Pass (Requerido)"} className="p-2 border rounded-lg text-sm" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                                    <div className="md:col-span-2">
                                        <select className="w-full p-2 border rounded-lg text-sm bg-white" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                            <option value="">Seleccionar Rol</option>
                                            <option value="superadmin">Superadmin</option>
                                            <option value="admin">Admin</option>
                                            <option value="editor">Editor</option>
                                            <option value="lector">Lector</option>
                                        </select>
                                    </div>
                                </div>
                                <button onClick={handleSaveUser} disabled={loading} className="cursor-pointer w-full bg-[#353131] hover:bg-black text-white py-2 rounded-lg text-xs font-bold transition">
                                    {loading ? "Procesando..." : (editingId ? "Guardar Cambios" : "Registrar")}
                                </button>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto border border-[#c0c6b6]/30 rounded-xl custom-scrollbar">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#f2f5f0] text-[#817e7e] font-bold text-xs uppercase sticky top-0">
                                    <tr><th className="p-3">Usuario</th><th className="p-3">Rol</th><th className="p-3 text-center">Acción</th></tr>
                                </thead>
                                <tbody className="divide-y divide-[#f2f5f0]">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-[#f9fafb] transition-colors">
                                            <td className="p-3">
                                                <div className="font-bold text-[#353131]">{u.name}</div>
                                                <div className="text-xs text-[#719c44] font-medium">@{u.username}</div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                                    ${u.role === 'superadmin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-gray-100 border border-gray-200 text-gray-600'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => startEditing(u)} className="cursor-pointer text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded transition" title="Editar">
                                                        <Edit2 size={16}/>
                                                    </button>
                                                    
                                                    {canDeleteUser && u.id !== profileData.id && (
                                                        <button onClick={() => handleDeleteUser(u.id)} className="cursor-pointer text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition" title="Eliminar">
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