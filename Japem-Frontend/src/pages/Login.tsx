import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Estado de carga visual
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Simulación de delay para ver la animación de carga (opcional)
      // await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await axios.post("http://localhost:8000/api/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`;
      
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Usuario o contraseña incorrectos");
      // Efecto visual de error (sacudida) se maneja con clases CSS si se desea
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full h-screen relative overflow-hidden bg-gradient-to-br from-colorPrimarioJAPEM to-colorSecundarioJAPEM font-inter">
      <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
        
        {/* PANEL IZQUIERDO: Imagen Institucional (Solo Desktop) */}
        {/* Usamos tu imagen Japem.jpeg como fondo visual */}
        <div className="hidden lg:block lg:col-span-7 xl:col-span-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/30 z-10"></div> {/* Overlay oscuro */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-110"
            style={{ backgroundImage: "url('/Japem.jpeg')" }}
          ></div>
          <div className="relative z-20 h-full flex flex-col justify-center px-12 text-white">
            <h1 className="text-5xl font-bold mb-4 drop-shadow-lg animate-fade-in-up">
              Juntos hacemos<br/>la diferencia
            </h1>
            <p className="text-xl text-gray-200 max-w-lg animate-fade-in-up delay-1">
              Plataforma de gestión para la Asistencia Privada del Estado de México.
            </p>
          </div>
        </div>

        {/* PANEL DERECHO: Formulario */}
        <div className="col-span-1 lg:col-span-5 xl:col-span-4 relative flex items-center justify-center h-full bg-white/95 backdrop-blur-xl shadow-2xl lg:rounded-l-3xl">
          <div className="w-full max-w-md px-8 py-10">
            
            {/* Logo y Encabezado */}
            <div className="text-center mb-10 animate-fade-in-up">
              <img
                src="/LogoVerde.jpg"
                alt="Logo JAPEM"
                className="h-20 mx-auto mb-4 object-contain drop-shadow-md hover:scale-105 transition-transform"
              />
              <h2 className="text-3xl font-extrabold text-colorPrimarioJAPEM mb-2">
                Bienvenido
              </h2>
              <p className="text-gray-500 font-medium">Ingrese sus credenciales de acceso</p>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r shadow-sm animate-shake flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="form-field delay-1">
                <label className="block text-sm font-bold text-colorPrimarioJAPEM mb-2 ml-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-colorPrimarioJAPEM transition-all duration-300 shadow-sm"
                    placeholder="usuario@japem.gob.mx"
                    required
                  />
                </div>
              </div>

              <div className="form-field delay-2">
                <label className="block text-sm font-bold text-colorPrimarioJAPEM mb-2 ml-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-colorPrimarioJAPEM transition-all duration-300 shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="form-field delay-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-colorPrimarioJAPEM to-[#048066] text-white font-bold rounded-xl shadow-lg hover:shadow-colorPrimarioJAPEM/40 hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-colorPrimarioJAPEM disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Ingresando...
                    </div>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-xs text-gray-400 animate-fade-in-up delay-3">
              <p>&copy; 2025 JAPEM. Dirección General de Desarrollo Institucional.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};