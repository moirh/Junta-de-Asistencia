import { useState, useEffect } from "react";
import { 
  User, Shield, Save, Plus, Trash2, Loader2, X, AtSign, Settings, Edit2, Lock, Mail 
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { 
  getUsers, createUser, deleteUser, updateProfile, changePassword, getProfile, updateUser 
} from "../../services/settingsService"; 
import Swal from 'sweetalert2'; 

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

  // --- PERMISOS ---
  const role = profileData.role || ''; 
  const isSuperAdmin = role === 'superadmin';
  const isAdmin = role === 'admin';
  const canViewUsers = isSuperAdmin || isAdmin;
  const canCreateUser = isSuperAdmin;
  const canDeleteUser = isSuperAdmin;

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
            ...prev, ...data, role: roleNormalized, currentPass: '', newPass: '' 
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
        confirmButtonColor: '#719c44'
      });
    } catch (e: any) { 
      Swal.fire({
        title: 'Error',
        text: e.response?.data?.message || "Verifique sus datos.",
        icon: 'error',
        confirmButtonColor: '#353131'
      });
    } finally { setLoading(false); }
  };

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
          const updated = await updateUser(editingId, newUser);
          setUsers(users.map(u => u.id === editingId ? (updated.user || updated) : u)); 
          Swal.fire({ title: '¡Usuario Actualizado!', icon: 'success', confirmButtonColor: '#719c44', timer: 1500, showConfirmButton: false });
      } else {
          const created = await createUser(newUser);
          setUsers([...users, (created.user || created)]);
          Swal.fire({ title: '¡Usuario Creado!', icon: 'success', confirmButtonColor: '#719c44', timer: 1500, showConfirmButton: false });
      }
      cancelForm();
      loadUsersList(); 
    } catch (e: any) { 
        Swal.fire({ title: 'Error', text: e.response?.data?.message || "Error al procesar.", icon: 'error', confirmButtonColor: '#353131' });
    } finally { setLoading(false); }
  };

  const startEditing = (user: any) => {
      setNewUser({
          name: user.name || '',
          username: user.username || '',
          email: user.email || '',
          role: user.role || 'lector',
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
    if (!canDeleteUser) return Swal.fire('Acceso Denegado', 'Solo el Superadmin puede eliminar.', 'error');
    if (id === profileData.id) return Swal.fire('Acción no permitida', 'No puedes eliminarte a ti mismo.', 'warning');

    const result = await Swal.fire({
        title: '¿Eliminar usuario?',
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Eliminar'
    });

    if (result.isConfirmed) {
        try {
            await deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
            Swal.fire({ title: 'Eliminado', icon: 'success', confirmButtonColor: '#719c44', timer: 1500, showConfirmButton: false });
        } catch (e) { 
            console.error(e);
            Swal.fire('Error', 'No se pudo eliminar.', 'error');
        }
    }
  };

  const getRoleBadge = (roleName: string) => {
      const style = roleName === 'superadmin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                    roleName === 'admin' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    roleName === 'editor' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                    'bg-gray-100 text-gray-600 border-gray-200';
      return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${style}`}>
              {roleName}
          </span>
      );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuración del Sistema" size="extraLarge" variant="japem" icon={<Settings />}>
        <div className="flex flex-col lg:flex-row h-[600px] bg-white rounded-b-xl overflow-hidden">
            
            {/* === SIDEBAR === */}
            <div className="lg:w-64 bg-gray-50 border-r border-gray-200 p-5 flex flex-col gap-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2">Cuenta</p>
                <button 
                    onClick={() => setActiveTab('perfil')} 
                    className={`text-left px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-all duration-200 ${activeTab === 'perfil' ? 'bg-white text-[#719c44] shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                >
                    <User size={18} strokeWidth={2} /> Mi Perfil
                </button>

                {canViewUsers && (
                    <>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4 ml-2">Administración</p>
                        <button 
                            onClick={() => setActiveTab('usuarios')} 
                            className={`text-left px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-3 transition-all duration-200 ${activeTab === 'usuarios' ? 'bg-white text-[#719c44] shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                        >
                            <Shield size={18} strokeWidth={2} /> Usuarios
                        </button>
                    </>
                )}

                <div className="mt-auto pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-3 px-2">
                          <div className="w-8 h-8 rounded-full bg-[#719c44]/10 flex items-center justify-center text-[#719c44]">
                             <User size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 truncate">{profileData.username || 'Usuario'}</p>
                              <p className="text-[10px] text-gray-500 uppercase font-bold">{profileData.role || 'Lector'}</p>
                          </div>
                    </div>
                </div>
            </div>

            {/* === CONTENIDO PRINCIPAL === */}
            <div className="flex-1 bg-white relative overflow-hidden flex flex-col">
                
                {/* Loader Overlay */}
                {dataLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
                        <Loader2 className="animate-spin text-[#719c44] mb-2" size={32}/>
                        <p className="text-sm text-gray-500 font-medium">Cargando información...</p>
                    </div>
                )}

                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    
                    {/* --- PESTAÑA PERFIL --- */}
                    {!dataLoading && activeTab === 'perfil' && (
                        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                                <div className="relative group cursor-pointer">
                                    <div className="w-24 h-24 rounded-full p-1 border-2 border-dashed border-[#719c44]/50 group-hover:border-[#719c44] transition-all">
                                        <img src={`https://ui-avatars.com/api/?name=${profileData.name || 'User'}&background=719c44&color=fff&size=128`} alt="Avatar" className="w-full h-full rounded-full object-cover shadow-sm" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-gray-100 text-gray-500">
                                        <Edit2 size={12}/>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{profileData.name}</h2>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                                        <Mail size={14}/> {profileData.email}
                                    </div>
                                    <div className="mt-3">
                                        {getRoleBadge(profileData.role)}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nombre Completo</label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#719c44] transition-colors" size={18}/>
                                            <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} 
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#719c44]/20 focus:border-[#719c44] transition-all" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Correo Electrónico</label>
                                        <div className="relative group">
                                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#719c44] transition-colors" size={18}/>
                                            <input type="email" value={profileData.email || ''} onChange={e => setProfileData({...profileData, email: e.target.value})} 
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#719c44]/20 focus:border-[#719c44] transition-all" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 pb-2">
                                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
                                        <Shield size={16} className="text-[#719c44]"/> Seguridad
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Contraseña Actual</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#719c44] transition-colors" size={18}/>
                                                <input type="password" value={profileData.currentPass} onChange={e => setProfileData({...profileData, currentPass: e.target.value})} placeholder="••••••••"
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#719c44]/20 focus:border-[#719c44] transition-all" 
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nueva Contraseña</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#719c44] transition-colors" size={18}/>
                                                <input type="password" value={profileData.newPass} onChange={e => setProfileData({...profileData, newPass: e.target.value})} placeholder="••••••••"
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#719c44]/20 focus:border-[#719c44] transition-all" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6">
                                    <button onClick={handleSaveProfile} disabled={loading} 
                                        className="cursor-pointer bg-[#719c44] hover:bg-[#5e8239] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#719c44]/30 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {loading ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} Guardar Cambios
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- PESTAÑA USUARIOS --- */}
                    {!dataLoading && activeTab === 'usuarios' && canViewUsers && (
                        <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Directorio de Usuarios</h3>
                                    <p className="text-sm text-gray-500">Administra los accesos a la plataforma.</p>
                                </div>
                                {canCreateUser && !showUserForm && (
                                    <button onClick={() => setShowUserForm(true)} className="cursor-pointer bg-[#353131] hover:bg-black text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95">
                                        <Plus size={16}/> Nuevo Usuario
                                    </button>
                                )}
                            </div>
                            
                            {showUserForm && (
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xl mb-6 relative animate-in slide-in-from-top-4 ring-1 ring-black/5">
                                    <button onClick={cancelForm} className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"><X size={20}/></button>
                                    
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="p-2 bg-[#719c44]/10 rounded-lg text-[#719c44]">
                                            {editingId ? <Edit2 size={20}/> : <User size={20}/>}
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-800">{editingId ? "Editar Usuario" : "Registrar Nuevo Usuario"}</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Nombre</label>
                                            <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#719c44] outline-none transition-all" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Usuario</label>
                                            <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#719c44] outline-none transition-all" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                            <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#719c44] outline-none transition-all" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Contraseña {editingId && <span className="text-gray-400 normal-case font-normal">(Opcional)</span>}</label>
                                            <input type="password" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-[#719c44] outline-none transition-all" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                                        </div>
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Rol de Acceso</label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {['lector', 'editor', 'admin', 'superadmin'].map((r) => (
                                                    <label key={r} className={`cursor-pointer border rounded-xl p-3 text-center text-sm font-medium transition-all ${newUser.role === r ? 'border-[#719c44] bg-[#f2f5f0] text-[#719c44]' : 'border-gray-200 hover:border-gray-300'}`}>
                                                        <input type="radio" name="role" value={r} checked={newUser.role === r} onChange={e => setNewUser({...newUser, role: e.target.value})} className="hidden"/>
                                                        {r.charAt(0).toUpperCase() + r.slice(1)}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button onClick={cancelForm} className="cursor-pointer px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-all">Cancelar</button>
                                        <button onClick={handleSaveUser} disabled={loading} className="cursor-pointer bg-[#719c44] hover:bg-[#5e8239] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-[#719c44]/30 transition-all active:scale-95">
                                            {loading ? "Guardando..." : (editingId ? "Guardar Cambios" : "Crear Usuario")}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col bg-white">
                                <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <div className="col-span-5">Usuario</div>
                                    <div className="col-span-4">Rol</div>
                                    <div className="col-span-3 text-right">Acciones</div>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-100">
                                    {users.map((u) => (
                                        <div key={u.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors group">
                                            <div className="col-span-5 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold border border-gray-200">
                                                    {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 text-sm">{u.name}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1"><AtSign size={10}/> {u.username}</p>
                                                </div>
                                            </div>
                                            <div className="col-span-4">
                                                {getRoleBadge(u.role)}
                                            </div>
                                            <div className="col-span-3 flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEditing(u)} className="cursor-pointer p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                                                    <Edit2 size={16}/>
                                                </button>
                                                {canDeleteUser && u.id !== profileData.id && (
                                                    <button onClick={() => handleDeleteUser(u.id)} className="cursor-pointer p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Eliminar">
                                                        <Trash2 size={16}/>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </Modal>
  );
};