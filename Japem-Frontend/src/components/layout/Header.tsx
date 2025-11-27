import type { FC } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Settings, LogOut, User } from "lucide-react";
import axios from "axios";

export const Header: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const linkClass = (path: string) =>
    `transition-colors ${
      location.pathname === path
        ? "text-green-700 font-semibold"
        : "text-black hover:text-green-600"
    }`;

  const handleLogout = async () => {
    try {
      if (token) {
        // Intentar invalidar token en backend
        await axios.post(
          "http://localhost:8000/api/logout",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (error) {
      console.error("Error cerrando sesión", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white z-50 shadow-sm">
      <div className="w-full flex justify-between items-center px-4 py-3">
        <div className="flex items-center space-x-2 ml-0">
          <img src="/Logo.png" alt="Logo" className="h-8 w-8 object-contain" />
          <h1 className="text-gray-700 font-medium text-sm tracking-wide">
            Junta de Asistencia Privada del Estado de México
          </h1>
        </div>

        <nav className="flex space-x-6 text-sm">
          <Link to="/" className={linkClass("/")}>
            Inicio
          </Link>
          {token && (
            <>
              <Link to="/donativos" className={linkClass("/donativos")}>
                Donativos
              </Link>
             {/*} <Link to="/archivo" className={linkClass("/archivo")}>
                Archivo
              </Link>
              <Link to="/contabilidad" className={linkClass("/contabilidad")}>
                Contabilidad
              </Link>*/}
            </>
          )}
        </nav>

        <div className="flex items-center space-x-3">
          {token ? (
            <>
              <button className="p-2 rounded-full bg-transparent hover:bg-blue-100 transition">
                <Bell className="w-5 h-5 text-black stroke-2" />
              </button>
              <button className="p-2 rounded-full bg-transparent hover:bg-pink-100 transition">
                <Settings className="w-5 h-5 text-black stroke-2" />
              </button>
              <div className="h-6 w-px bg-gray-300 mx-2"></div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-transparent hover:bg-red-100 text-black transition flex items-center gap-2"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5 stroke-2" />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 px-3 py-2 rounded hover:bg-blue-50 transition"
            >
              <User className="w-4 h-4" />
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
