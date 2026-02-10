import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// 1. IMPORTAR ICONOS
import { Eye, EyeOff } from "lucide-react"; 

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // 2. ESTADO PARA VISIBILIDAD DE CONTRASEÑA
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://192.168.1.90:8000/api/login", {
        username, 
        password,
      });

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`;
      
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Usuario o contraseña incorrectos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full h-screen relative overflow-hidden bg-[#f3f4f6] font-inter">
      <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
        
        {/* PANEL IZQUIERDO: Imagen */}
        <div className="hidden lg:block lg:col-span-7 xl:col-span-8 relative overflow-hidden">
          {/* Overlays */}
          <div className="absolute inset-0 bg-[#353131]/20 z-10 mix-blend-multiply"></div> 
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent z-10"></div>
          
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[30s] hover:scale-110"
            style={{ backgroundImage: "url('/Login2.webp')" }}
          ></div>

          {/* CONTENIDO DE TEXTO - Arriba a la Izquierda */}
          <div className="relative z-20 p-12 h-full flex flex-col justify-start pt-24">
            <h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow-xl leading-none animate-fade-in-up">
              Juntos hacemos<br/>la diferencia
            </h1>
          </div>
        </div>

        {/* PANEL DERECHO: Formulario */}
        <div className="col-span-1 lg:col-span-5 xl:col-span-4 relative flex flex-col h-full bg-white shadow-2xl lg:border-l border-[#c0c6b6]/20">
          
          <div className="flex-1 flex items-center justify-center px-8 py-10">
            <div className="w-full max-w-md">
              
              {/* Logo y Encabezado */}
              <div className="text-center mb-10 animate-fade-in-up">
                <img
                  src="/LogoVerde.jpg"
                  alt="Logo JAPEM"
                  className="h-24 mx-auto mb-6 object-contain hover:scale-105 transition-transform duration-300"
                />
                <h2 className="text-3xl font-extrabold text-[#719c44] mb-2 tracking-tight">
                  Bienvenido
                </h2>
                <p className="text-[#817e7e] font-medium text-sm">Ingrese sus credenciales para acceder al panel.</p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-3 animate-shake">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* CAMPO: USUARIO */}
                <div className="form-field delay-1">
                  <label className="block text-xs font-bold text-[#353131] mb-1.5 ml-1 uppercase tracking-wide">
                    Nombre de Usuario
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#f9fafb] border-2 border-[#e5e7eb] rounded-xl text-[#353131] placeholder-[#c0c6b6] focus:outline-none focus:bg-white focus:border-[#719c44] focus:ring-4 focus:ring-[#719c44]/10 transition-all duration-300"
                      placeholder="Ej. admin.japem"
                      required
                    />
                  </div>
                </div>

                {/* CAMPO: CONTRASEÑA CON OJO */}
                <div className="form-field delay-2">
                  <label className="block text-xs font-bold text-[#353131] mb-1.5 ml-1 uppercase tracking-wide">
                    Contraseña
                  </label>
                  
                  {/* Contenedor relativo para posicionar el icono */}
                  <div className="relative">
                    <input
                      // 3. CAMBIO DE TIPO DINÁMICO
                      type={showPassword ? "text" : "password"}
                      
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      
                      // Agregamos 'pr-12' (padding right) para que el texto no choque con el icono
                      className="w-full px-4 py-3.5 pr-12 bg-[#f9fafb] border-2 border-[#e5e7eb] rounded-xl text-[#353131] placeholder-[#c0c6b6] focus:outline-none focus:bg-white focus:border-[#719c44] focus:ring-4 focus:ring-[#719c44]/10 transition-all duration-300"
                      placeholder="••••••••"
                      required
                    />

                    {/* 4. BOTÓN DE VER LA CONTRASEÑA */}
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c0c6b6] hover:text-[#719c44] transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-100"
                        title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    >
                        {showPassword ? (
                            <EyeOff size={20} />
                        ) : (
                            <Eye size={20} />
                        )}
                    </button>
                  </div>
                </div>

                {/* BOTÓN SUBMIT */}
                <div className="form-field delay-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 bg-[#719c44] hover:bg-[#5e8239] text-white font-bold rounded-xl shadow-lg shadow-[#719c44]/30 hover:shadow-[#719c44]/50 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#719c44] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Ingresando...</span>
                      </>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Footer del Panel Derecho */}
          <div className="px-8 py-5 bg-[#f9fafb] border-t border-[#e5e7eb] text-center animate-fade-in-up delay-300">
            <div className="flex flex-col items-center gap-2">
                <span className="inline-block bg-[#e5e7eb] text-[#817e7e] px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
                    SIACE v1.2.0
                </span>
                
                <p className="text-xs text-[#c0c6b6] font-medium">
                  &copy; Junta de Asistencia Privada del Estado de México. <br /> Moises Ruiz Hernández
                </p>
                <div className="flex justify-center gap-4 mt-1">
                  <a href="#" className="text-[10px] text-[#817e7e] hover:text-[#719c44] font-bold transition-colors uppercase tracking-wide">Aviso de Privacidad</a>
                  <span className="text-[10px] text-[#c0c6b6]">•</span>
                  <a href="#" className="text-[10px] text-[#817e7e] hover:text-[#719c44] font-bold transition-colors uppercase tracking-wide">Soporte Técnico</a>
                </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};